"use client"
import * as React from "react";
import Uppy, {State} from "@uppy/core";
import {DashboardModal } from "@uppy/react";
import Tus from "@uppy/tus";
// import Webcam from "@uppy/webcam";
import useOssDeleteFileMutation from "../../hooks/useOssDeleteFileMutation";
// import '@uppy/core/dist/style.min.css';
// import '@uppy/dashboard/dist/style.min.css';
// import '@uppy/webcam/dist/style.min.css';
import { getAuthToken, refreshAuthToken } from '@/lib/auth-token';
import {Button} from "@/components/ui";
// import Image from "next/image"
// import {ImageComponent} from "@/components/shub";
import {ImageComponentNatural} from "@/components/natural";

/**【uppy复用】
 *官方文档  https://uppy.io/docs/uppy/
 *URQL一般请求是用authorization: Bearer 给后端token的。
 * */
//new实例：自带状态存储的；    不是React组件管理的。
const uppy =new Uppy({id:'Report', restrictions:{maxNumberOfFiles: 2,}})
    .use(Tus, { endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/uploadTUS/`, withCredentials:true,
        async onBeforeRequest(req) {
            const token = await getAuthToken();
            if (token) {
                req.setHeader('Authorization', `Bearer ${token}`);
            }
        },
        async onAfterResponse(req, res) {
            if (res.getStatus() === 401) {
                await refreshAuthToken();
                uppy.info("刷新token");
            }
            let url =req.getURL();
            let value =res.getHeader("Tus2minIoUrl");       //对TUS协议还要自定义扩展的包头Tus2minIoUrl
            var occur = value?.indexOf("DO NOT TRY:");      //扩充包头含义。
            if(occur===0) {
                uppy.info("不要重试，报错" + value, "error", 999000);
                uppy.pauseAll();
            }else{
                let steob={} as any;
                steob[url]=value;
                uppy.setState({ ...steob});      //做关联映射TUS的id==>MinIO的下载链接。
            }
        }
    });
//.use(Webcam)

export type FileStore = {
    name: string;
    url: string;
};

//【注意】必须用uppy.getState()来做配合; 而不能用React.useState<any[]>( storeObj as any[]);且下面handleUpSuccess回调无法提取外部的storeObj等状态变量取值都是空的。
//加限制 restrictions:{maxFileSize: 6000,maxNumberOfFiles: 1, allowedFileTypes:['image/*', '.jpg', '.jpeg', '.png', '.gif']}
/**针对报告的 嵌入式的 文件上传。 针对与报告的 文件上传对象： #通常情形没必要用useUppyUploadM来替代;
 * @param repId 分布式对象存储系统靠这个 rep ID来关联业务系统关系数据库的。
 * @param field  inp?.[field]? 存储上传后的文件对象信息对应inp字段。 _FILE_为前缀的； 数据=可能是{}单个的，也可能多为文件形式[{ }, ]？
 * @param maxFile 设计上的最多文件个数【maxFile决定了file保存是数组还是对象】最多传几个文件； 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @param maxSize  每一个文件大小最大 多少 MB 兆B单位。
 * 删除旧文件：关联的 rep+ repId必须的！
 * @param liveDays  该文件要求存储保留天数。 报告应该保留天数估计> 20年吧。
 * @param onFinish [可选参数] #立刻生效给context 避免 事务性的缺失。 【上传任务完成】保存回调。 可能有多个的已经上传的文件！若删除多文件其中一个文件的onFinish参数file是剩下的文件数组。
 *  参数 onFinish?的回调类型:(file:any,del:boolean)=>void；
 * @param storeObj 对象或数组， 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @return {} 节点DOM
 * 【局限性】一个编辑器页面内不能放置多个useUppyUpload来做上传，因为uppy全局变量？，必须独立？ 走类似的useUppyUploadM。
 * */
export function useUppyUpload({ repId, storeObj, maxFile=1,liveDays=2,maxSize=3,onFinish }
    : {repId: string, storeObj:FileStore|FileStore[], maxFile?:number,
         liveDays?:number,maxSize?:number, onFinish?:(file:any,del:boolean)=>void,}
) {
    const [openUppy, setOpenUppy] = React.useState(false);
    //实际本次发起上传的活动允许的可上传文件数还会更少：扣除已经有的数量。
    //或者 storeObj instanceof Array ?
    if(storeObj){
        if(Array.isArray(storeObj)){
            if(maxFile<=1)  throw new Error(`存储非法${maxFile}`);
        }else{
            if(maxFile>1)  throw new Error(`存储非法${maxFile}`);
        }
    }
    let storeObj1=storeObj as FileStore;           //编译报错！
    let storeObj2=storeObj as FileStore[];
    const thisMaxFiles=maxFile>1? (maxFile - (storeObj2?.length|0)) : 1;
    // const [infiles, setInfiles] = React.useState<any[]>( storeObj as any[]);  不能使用：会导致重复了
    uppy.setState({ oldfiles: maxFile>1? storeObj :undefined });      //多个文件存储的才需要，

    React.useEffect(() => {
        uppy.setMeta({rep: repId, liveDays});
    }, [repId,liveDays]);
    //【上传应答】结束时刻回调，报错 unnecessary dependency: 'uppy'
    const handleUpSuccess = React.useCallback((result: { successful: any[]; }) => {
        let newUppsta=uppy.getState();
        const more= result.successful.map(up => {
            return {name: up.name, url: newUppsta[up.uploadURL], type: up.type}
        });
        //本次活动实际上还允许分成几次操作上传的，都算一个独立上传的活动，只要uppy状态没有切换，还没有关闭卸载uppy组件的都是相同的一个独立活动。
        const newarr=[ ...more];
        // const newarr=[...(infiles||[]), ...more];
        // setInfiles(newarr);
        const cntfile=newarr.length;
        if(cntfile>0){
            setOpenUppy(false);
            //可能一次上传活动就能有多个文件。  这一次独立活动 汇总上传的文件，但是不包本组件加载状态后的扩参数storeObj进来已经就存在的文件。
            const newfile=newarr?.map(({name,url}, i) => {
                return  {name,url}
            });
            // console.log("onFinis忙要执行",result.successful,"row=", row,"newfile",newfile);
            if(onFinish){
                if(1===maxFile) onFinish(newfile?.[0] || undefined, false);
                else{
                    const { oldfiles }=newUppsta;
                    console.log("onFinis忙要执行oldfiles=",oldfiles,"newfile",newfile);
                    //【操蛋了，可惜】在这个位置获取storeObj2  infiles storeObj全都是未定义的，！！只能外部去麻烦加了
                    let megerd = [...(oldfiles as any[] ?? []), ...(newfile as any[])];
                    onFinish(megerd, false);
                }
            }
        }
        //【注意】这个依赖项必须加上 onFinish 否则导致onFinish()执行时实际上回调函数参数inp数据为null；
    }, [maxFile,onFinish]);
    /// }, [infiles, maxFile,onFinish,setInfiles]);

    React.useEffect(() => {
        uppy.setOptions({
            restrictions: { maxNumberOfFiles: thisMaxFiles, maxFileSize: maxSize*1024*1024 },
            locale: {
                strings: {
                    cancel: '还是取消',
                },
            },
        });
        //uppy.on('complete', handleUpSuccess);
    }, [thisMaxFiles,maxSize]);

    // @ts-ignore
    uppy.on('complete', handleUpSuccess);

    //参数arIndex：回调时刻制定了 从哪一个文件index来触发删除后调用的。
    const whenDeleted= (reult: any,arIndex:number) => {
        if('成功'===reult || '不存在'===reult){
            if(1===maxFile){
                onFinish && onFinish(undefined, true);
            }
            else{
                storeObj2?.splice(arIndex,1);        //添加或删除数组中的元素。会改变原始数组。
                onFinish && onFinish(storeObj2, true);
            }
        }
    };
    const {call:delOssFileFunc,}= useOssDeleteFileMutation(whenDeleted);
    // const handleDelete = () => {
    //     delOssFileFunc(url, i, 'rep', repId)
    // }
    // Images with "fill" always use position absolute - it cannot be modified.
    //单一文件情况的：<DashboardModal
    //         uppy={uppy}
    //         open={open}
    //         onRequestClose={this.handleClose}
    //       />
    const handleClose = () => {
        setOpenUppy(!openUppy);
        // e.preventDefault()
    }

    if(1===maxFile) {
        const onlyOne=(<>
        {openUppy?  <DashboardModal uppy={uppy} open={openUppy} plugins={['Webcam']} onRequestClose={handleClose}/>
            :
            storeObj1?.url?
                <ImageComponentNatural src={`${process.env.NEXT_PUBLIC_OSS_ENDP}${storeObj1.url}` || "/placeholder.svg"}
                            alt={storeObj1?.url || "图片"} />
                : null
/*            <div className="flex justify-around items-center">
                <div className="">
                    <Image width={300} height={200}
                        src={imageUrl || "/placeholder.svg"}
                        alt={storeObj1?.url || "图片"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain h-auto max-h-[14cm] print:max-h-[26cm] print:max-w-[705px] lg:max-h-[18cm]"
                        unoptimized     //为不优化，避免配置 remotePatterns
                       style={{
                           objectFit: 'contain',
                       }}
                    />
                </div>
            </div>*/
        }
          <div className="text-center">
          {
                storeObj1?.url?  <Button  size="sm"
                                          onClick={(e) =>{
                                              delOssFileFunc(storeObj1?.url,0,'rep',repId);
                                              e.preventDefault()
                                          }}
                        >旧的先刪除</Button>
                   :
                    <Button  size="sm"
                             onClick={(e) =>{
                                setOpenUppy(!openUppy);
                                e.preventDefault()
                            }}
                    >{openUppy? '关闭上传':'开启上传'}</Button>
            }
        </div>
     </>);

      return  [ onlyOne ];
    }
    else if(maxFile>1) {
        //允许有多个文件情况：类似 _FILE_部位 ； 多个文件存储的  _FILE_S部位 单一文件
        const manyMore = (<>
            <div className="text-center">
                {
                    storeObj2?.map(({name, url}: any, i: number) => {
                        return <div key={i}>
                            {i > 0 && <hr/>}
                            <div className="flex justify-around items-center">
                                {url && (
                                    <img
                                        src={process.env.NEXT_PUBLIC_OSS_ENDP + url || "/placeholder.svg"}
                                        alt={url}
                                        className="max-h-[14cm] w-full print:max-h-[26cm] print:max-w-[705px] lg:max-h-[18cm] lg:w-auto"
                                    />
                                )}
                            </div>
                            <Button type="button" variant="outline"
                                    onClick={(e) =>{
                                        delOssFileFunc(url, i, "rep", repId)
                                        e.preventDefault()
                                    } }>
                                旧的刪除
                            </Button>
                        </div>
                    })
                }
            </div>
            <div className="text-center">
                {openUppy && <Dashboard uppy={uppy} plugins={['Webcam']}/>}
                <Button size="sm"
                        disabled={!openUppy && thisMaxFiles <= 0}
                        onClick={(e) => {
                            setOpenUppy(!openUppy);
                            e.preventDefault()
                        }}
                >{openUppy ? '关闭上传' : '开启上传'}</Button>
            </div>
        </>);

        return [manyMore];
    } else return [];
}
