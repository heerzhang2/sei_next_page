import { Camunda8,  } from '@camunda8/sdk'
import axios from "axios"
import dotenv from "dotenv"
import {deleteDirWithRm, FileUploader} from "./local-uploader";
import type {ConfigRoot, FileTransform} from "page2pdf_server/src";
import {MaybeTimeDuration} from "typed-duration";
import {RestJob} from "@camunda8/sdk/dist/c8/lib/C8Dto";
import {IProcessVariables, JobCompletionInterfaceRest} from "@camunda8/sdk/dist/zeebe/types";

const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config()
// Camunda 8 连接配置
const camundaConfig = {
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION === "true",
}

//[文档] https://camunda.github.io/camunda-8-js-sdk/#oauth
//https://docs.camunda.io/docs/next/self-managed/setup/deploy/local/manual/
// https://docs.camunda.io/docs/guides/getting-started-java-spring/
// 创建Zeebe客户端  https://www.npmjs.com/package/@camunda8/sdk  需要Node服务端环境运行的；
const c8 = new Camunda8(camundaConfig as any)
console.log(`当前camundaConfig:`, camundaConfig);
const restClient = c8.getCamundaRestClient()     // 8.6.0 New REST API

// PDF服务的URL
const PDF_SERVICE_URL = "http://localhost:9389/api/pdf"
// 启动Worker
async function startWorker() {
   const zbWorker= restClient.createJobWorker({
        type: "pdf-generation-task",
        worker: "urlToPdfTask",
        maxJobsToActivate: 1,
       //重启可能，设置太长了导致：接受新任务有延迟的。
        timeout: 20*60*1000,
        jobHandler: urlToPdfTask
    });

    async function urlToPdfTask(job: RestJob & JobCompletionInterfaceRest<IProcessVariables>) {
    try {
      const prjob= job.variables?.pdfJob as unknown as ConfigRoot<FileTransform>;
      // 发送HTTP请求到PDF服务
      console.log(`[新的流程] 发起转换请求${PDF_SERVICE_URL}`)
      const response = await axios.post(PDF_SERVICE_URL, prjob)
      const {message: ack, data:desc} =response.data
      const {result, dir} =desc
      //处理响应【考虑功能添加点】 转换pdf本地文件路径 +电子盖章 +然后上传到OSS 文件访问路径
      console.log("转换应答:", response.data?.data?.dir)
      //成功response=: { status: 200, message: 'OK', data: { result: 'Success',dir } }    文件预先定义的==系统安装的路径：C:\page2pdf-server\pdfs +/files【0】.out/
      const finish= result==="Success";
      if(!finish || !dir)
          return job.fail({errorMessage:`转换pdf失败: ${result}`, retries: 0});
      const filepath= dir+"/"+ prjob?.name +".pdf";
        //可能+步骤2： +水印,电子盖章;
        //步骤3： 然后上传到OSS 文件访问路径;
      //不经过java后端服务器做代理上传的，那样要再多一次复制。直接上传到OSS集群。
      const uploader = new FileUploader({
          large_file_threshold: 10 * 1024 * 1024,            //设置大文件阈值 (10MB)，走分块上传模式
          bucketName: process.env.MINIO_BUCKETNAME!,
          lockMode: "COMPLIANCE",
      });
        // 设置元数据
        const metaData = {
            'Content-Type': 'application/pdf',
            'X-Amz-Meta-Author': job.variables?.Author,
            'X-Amz-Meta-Rep': job.variables?.repId
        } as any;
        //【这里不能加的】 前缀会改成X-Amz-Meta-  等于无效啊。X-Amz-Meta-X-Amz-Object-Lock-Mode  X-Amz-Meta-X-Amz-Object-Lock-Retain-Until-Date
        metaData["X-Amz-Object-Lock-Retain-Until-Date"] = job.variables?.expiration;
      const ossObjId= await uploader.ossUpload(filepath, metaData);
      //最可读的链接 http://127.0.0.1:9000/ywmast/ +ossObjId（202506/0315/xxx-）
        if(!ossObjId){
            throw new Error(`OSS上传失败,${filepath}`);
        }
      await deleteDirWithRm(dir);
      //完成job并返回结果：
      return job.complete({
          result: true,
          ossId: ossObjId,
          // processedAt: new Date().toISOString(),
        })
    } catch (error) {
      console.error("urlToPdfTask:", error)
      // 如果出错，标记job为失败
      return job.fail({errorMessage:`urlToPdfTask: ${error}`, retryBackOff: 5*60*1000});
    }
  }
  console.log(`启动Worker线程: pdf-generation-task`)
}

// 处理进程退出
process.on("SIGTERM", async () => {
  console.log("Shutting down...")
  process.exit(0)
})

//【毛病】一台电脑可能多个的本服务进程一起跑啊。
//单台机器仅启动一个服务; 锁文件路径（根据系统选择临时目录）
const lockFilePath = path.join(os.tmpdir(), 'camunda-worker-node-service.lock');

// 检查 PID 是否存在的函数
function checkPidValidity(pid: number) {
    return new Promise((resolve, reject) => {
        let command;
        if (os.platform() === 'win32') {
            // Windows 使用 tasklist 或 PowerShell
            command = `tasklist /FI "PID eq ${pid}" 2>&1`;
        } else {
            // Linux/macOS 使用 ps 命令
            command = `ps -p ${pid} -o pid= 2>&1`;
        }

        exec(command, (error: any, stdout: string, stderr: any) => {
            if (error) {
                // 命令执行出错（如权限不足）
                resolve(false);
                return;
            }

            // 判断输出是否包含 PID
            const pidExists = stdout.trim() === pid.toString();
            resolve(pidExists);
        });
    });
}

// 示例：启动服务时检查锁文件
const pid = process.pid;

function getProcessInfo(pid: number) {
    return new Promise((resolve) => {
        const command = os.platform() === 'win32'
            ? `wmic process where ProcessId=${pid} get Name,ExecutablePath`
            : `ps -p ${pid} -o comm=`;

        exec(command, (error: any, stdout: string) => {
            resolve(stdout.trim());
        });
    });
}
// 检查现有锁文件
if (fs.existsSync(lockFilePath)) {
    const existingPid = parseInt(fs.readFileSync(lockFilePath, 'utf8'), 10);
    checkPidValidity(existingPid).then((isValid) => {
        if (isValid) {
            getProcessInfo(existingPid).then((info) => {
                console.log(`已有进程运行中,进程信息: ${info}，PID: ${existingPid}`);
            });
            // console.log(`已有进程运行中，PID: ${existingPid}`);
            process.exit(1);
        } else {
            console.log(`检测到残留锁文件，PID: ${existingPid} 已失效，继续启动...`);
            fs.unlinkSync(lockFilePath);
        }
    });
}

// 写入新锁文件
fs.writeFileSync(lockFilePath, pid.toString());

// 监听进程退出事件清理锁文件
process.on('exit', () => {
    if (fs.existsSync(lockFilePath)) {
        fs.unlinkSync(lockFilePath);
    }
});

// 业务逻辑...
console.log('服务 camunda-worker-node-service 已启动，PID:', pid);


// 启动Worker
startWorker().catch((err) => {
  console.error("Failed to start worker:", err)
  process.exit(1)
})
