"use client"
import { gql, useMutation } from 'urql';
import {toast} from "sonner";

/**删除minIO文件： 真的删掉 ’成功‘ 若不存在该文件返回： '不存在'；
* */
const mutation = gql`
  mutation useOssDeleteFileMutation($file: String!,$key: String,$value: String) {
    ossDeleteFile(file: $file,key: $key,value:$value)
  }
`;

/** devs[] 可支持多个批量关联多个设备台账id。
 * 多个入口：都可能添加任务或给任务添加设备或只是改任务参数。 toast支持链接转移
 * */
export default function useOssDeleteFileMutation(callback: (resp: any,arIndex:number) => void) {
  const [updateResult, ossDeleteFile] = useMutation(mutation)
  const onSubmit = (file:string,arIndex:number,key?:string,value?:string) => {
    ossDeleteFile({
      file,
      key,
      value,
    }).then((result) => {
      console.log("useOssDeleteFileMutation=应答=", result)

      if (result.error) {
        // 使用 sonner 的 toast.error 显示错误
        toast.error("保存失败", {
          description: result.error.toString(),
        })
        console.log("Oh no!", result.error)
      } else {
        // 使用 sonner 的 toast.success 显示成功消息
        toast.success("OSS服务器", {
          description: "文件删除",
        })
        const {ossDeleteFile: ack }=result?.data
        callback(ack,arIndex);
      }
    })
  }
  return {call: onSubmit};
}
