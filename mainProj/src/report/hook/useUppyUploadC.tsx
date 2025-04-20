/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Button, useTheme,} from "customize-easy-ui-component";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Webcam from "@uppy/webcam";
import useOssDeleteFileMutation from "../../hooks/useOssDeleteFileMutation";
import {Dashboard} from "@uppy/react";
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import {useCallback} from "react";

/**一个页面容下多个上传的独立管理位置。 按规定预备多个上传、多个文件位置的。 #但不是一个上传入口上传多文件做法。
 * 但useUppyUploadM耦合到了表格存储，删除一张图片会连带删除表格相应图片那一行存储。 useUppyUpload一个页面无法支持多个上传入口位置的。
 * 且useUppyUploadC()不支持上传多张图;
 * useUppyUpload单一个上传入口的多个文件增加也可独立删除单个文件的。
 * @param repId 分布式对象存储系统靠这个 rep ID来关联业务系统关系数据库的。
 * @param storeObj : 文件存储字段对象 {url: ？};  table, field='_FILE_',
 * @param row  那一个行的索引: 空表默认=0。【】每次上传唯一一个文件，而且针对特定row存储固定行位置。
 * @param maxSize  每一个文件大小最大 多少 MB 兆B单位。
 * 删除旧文件：关联的 rep+ repId必须的！
 * @param onFinish 立刻生效给context 避免 事务性的缺失。 【上传任务完成】保存回调。
 * @param liveDays  该文件要求存储保留天数。 报告应该保留天数估计> 20年吧。
 * @param idPref    idPref+row 需要作为关键字，不然Uppy管理上冲突！
 * @return {} 节点DOM
 * */
export function useUppyUploadC({repId, storeObj, row,liveDays=2,maxSize=5,idPref='Report', onFinish }
            : {repId: string, storeObj:any, row:number, liveDays?:number,maxSize?:number,idPref?:string,
                         onFinish:(row:number,file:any,del:boolean)=>void  }
) {
    //若采用uppy.setState({ forRow: row });来做虽然可以区分保存，可是界面上的内容不能自动·切换清理旧的状态，感觉古怪。
    const theme= useTheme();
    //连续切换和上传的只能这样。多个 new Uppy() ;
    //【避免冲突关键点！】new Uppy id= 需要建立一对一，每一行row重建uppy实例。 ”idPref+row“作为关键字。
    const [uppy,setUppy] = React.useState( new Uppy({id: idPref+row,
          restrictions:{maxNumberOfFiles: 2,}})
    );
    //【状态外移】本来Uppy是可以自己管理的，这里模式无法走它的内部状态，只能自己附加了。
    const [fileurls,setFileurls] = React.useState<any>();
    const [openUppy, setOpenUppy] = React.useState(false);
    const [infiles, setInfiles] = React.useState<any[]>();

    React.useEffect(() => {
        //还需要 重建实例：     旧的被抛弃掉！
        setUppy(() => createUppy(idPref+row));
        setOpenUppy(false);
        setInfiles([]);     //多个row切换的 组件uppy 重新new实例的，infiles遗留下去的。影响下一次的上传。
        //依赖不能加的 ??createUppy,  循环了 依赖项：
    }, [row, setUppy,idPref,setOpenUppy,setInfiles]);
    // console.log("u主入口的seEffect=",uppy.getID(),"fileurls=",fileurls,"row=",row,"tusID",tusID,"infiles=",infiles);

    const onAfterResponse = React.useCallback(async (req: { getURL: () => any; }, res: { getHeader: (arg0: string) => any; }) => {
        let url =req.getURL();
        let value =res.getHeader("Tus2minIoUrl");       //对TUS协议还要自定义扩展的包头Tus2minIoUrl
        var occur = value?.indexOf("DO NOT TRY:");      //扩充包头含义。
        if(occur===0) {
            uppy.info("不要重试，报错" + value, "error", 999000);
            uppy.pauseAll();
        }else{
            let steob={ } as any;
            steob[url]=value;
            // console.log("切黄onAfterResponse=",uppy.getID(),"steob=",steob,"row=",row);
            await  uppy.setState({ ...steob});      //做关联映射TUS的id==>MinIO的下载链接。
            //只能单独一个文件的，不是一次几个文件的回调。
            await  setFileurls({...fileurls, ...steob});
        }
    }, [uppy,fileurls,setFileurls]);

    const createUppy = useCallback(
        (userId: string) => {
            return new Uppy({id: userId, restrictions:{maxNumberOfFiles: 2,}})
                .use(Tus, { endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/uploadTUS/`, withCredentials:true,
                    onAfterResponse: onAfterResponse,
                }).use(Webcam);
        },
        //这里不能加上 依赖项uppy；
        [onAfterResponse]
    );

    React.useEffect(() => {
        uppy.setMeta({rep: repId, liveDays});
    }, [repId,liveDays,uppy]);

    //报错 unnecessary dependency: 'uppy' ；[注意]这个回调若报错的，上传看似失败，实际OSS文件已经传完准备好了。
    const handleUpSuccess = React.useCallback((result: { successful: any[]; }) => {
        let newUppsta=uppy.getState();
            // let newUppsta=fileurls  as any;
        if(!fileurls)   return;
            // console.log("切黄handleUpSuccess=",uppy.getID(),"getState=",uppy.getState(),"row=",row);
        const more= result.successful.map(up => {
            // console.log("切黄handSuploadURL=",up.uploadURL,"newUppsta=",newUppsta[up.uploadURL],"row=",row,"fileurls",fileurls![up.uploadURL]);
            return {name: up.name, url: newUppsta[up.uploadURL], type: up.type, uploadURL: up.uploadURL}
        });
        const newarr=[...(infiles||[]), ...more];
        setInfiles(newarr);
        const cntfile=newarr.length;
        if(cntfile>0){
            if(!(newarr?.[cntfile-1]?.url)){
                return;
            }
            setOpenUppy(false);
            const newfile=newarr?.map(({name,url}, i) => {
                return  (i<1)&&{name,url}
            });
            // console.log("onFinis忙要执行",result.successful,"row=", row,"newfile",newfile);
            //if(!inp)    return; 竟然还没有准备inp？ 【问题大】handleUpSuccess会执行多次，多个组件混淆。
            onFinish(row,newfile?.[cntfile-1] || undefined, false);
        }
        ///循环 依赖 死循环  ,uppy？？
    }, [infiles, row,fileurls, uppy, onFinish, setInfiles]);

    uppy.setOptions({
        restrictions: { maxNumberOfFiles: 1, maxFileSize: maxSize*1024*1024 },
        locale: {
            strings: {
                cancel: '还是取消',
            },
        },
    });

    React.useEffect(() => {
        // @ts-ignore
        uppy.on('complete', handleUpSuccess);
        // uppy.addPostProcessor(resourceArrvieed);     //太早了 比handleUpSuccess还早去执行
        //下面这个却是：还没有真正上传完成的回调啊。
        //uppy.on('upload-success', handleUpSuccess2h);
    }, [uppy, handleUpSuccess,onAfterResponse]);

    //【绕道了】原本uppy.setState({ ...steob});就能够在handleUpSuccess执行时提取状态找出steob的，可惜这个做法下面无法成功？？
    React.useEffect(() => {
        if(!fileurls)   return;
        // let newUppsta=uppy.getState();
        // console.log("副作用执行 uppy=",newUppsta,fileurls,"fileotusID",fileurls&&fileurls![tusID!], tusID,"infiles",infiles);
        //针对当前一个的文件：（若支持多文件一次结束回调的可能会出现多个的，当前tusID却无法1对多啊！）；onAfterResponse回调也不支持。
        const cntFile=infiles?.length || 0;
        if(cntFile>0){
            const newfile=infiles?.map(({name,url,uploadURL}, i) => {
                return  {name, url: url??(fileurls[uploadURL]) }
            });
            // console.log("onFinis忙要执行 88row=", row,"newfile",newfile);
            //约束：只能上传一个文件的；算最后那个
            const fileobj=newfile?.[cntFile-1] || undefined;
            if(fileobj && !(fileobj.url)){
                uppy.info("报错,url为空，可能后端空间满" , "error", 999000);
                uppy.pauseAll();
            }else{
                onFinish(row,fileobj, false);
                setOpenUppy(false);
            }
            setFileurls(undefined);
            // setTusID(undefined);
        }
        //旧的依赖 tusID,
    }, [fileurls, row, infiles,onFinish, uppy]);

    //【删除回调】参数arIndex：回调时刻制定了 从哪一个文件index来触发删除后调用的。 因为都是一个文件情况的：所以arIndex===0
    const whenDeleted= (reult: any,arIndex:number) => {
        if('成功'===reult || '不存在'===reult){
            // const newobj={...inp?.[table]?.[row], [field]: undefined};
            // tableSetInp(table, row, inp, setInp, field, newobj);
            onFinish(row, null, true);
        }
    };
    const {call:delOssFileFunc,doing:delOssing,result:delOssRs,called:delOssCald,reset:delOssRest}= useOssDeleteFileMutation(whenDeleted);
    //未支持 单1个上传的入口 就能上传多个文件的。
    //单一文件情况的：
    const onlyOne=(<>
        {openUppy?  <Dashboard uppy={uppy} plugins={['Webcam']} />
            :
            <div css={{display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                { storeObj?.url &&
                    <img src={process.env.NEXT_PUBLIC_OSS_ENDP+storeObj?.url} alt={storeObj?.url}
                         css={{
                             maxHeight: '14cm',   //在这个元素的上一级元素可以自己加一个固定高度值，就像一张纸打印的应该多高的取值。这个用固定高度会导致图片自动的横竖比例不均衡压缩=会变形啊！24cm是纸张大约最多高度=报告最大图片高。
                             maxWidth: '-webkit-fill-available',
                             "@media print": {maxHeight: '26cm', maxWidth: '705px'},         //对A4纸张竖版的高度26cm基本都是图片整张纸，这里没考虑多个图片在宽度方向上的并排布局：可用软件合并。
                             [theme.mediaQueries.lg]: {maxHeight: '18cm', maxWidth: undefined}           //普通图片+大屏幕限制高度才是关键的。
                         }}
                    />
                }
            </div>
        }
        <div css={{ textAlign: 'center',margin: theme.spaces.md}}>
            {
                storeObj?.url?  <Button css={{ marginTop: theme.spaces.sm }} size="sm"
                                        onPress={() =>delOssFileFunc(storeObj?.url,0,'rep',repId) }
                    >旧的先刪除</Button>
                    :
                    <>
                        <Button css={{ marginTop: theme.spaces.sm }} size="sm"
                                onPress={() =>{
                                    setOpenUppy(!openUppy);
                                }}
                        >{openUppy? '关闭上传':'开启上传'}</Button>
                        <Button css={{ marginTop: theme.spaces.sm }} size="sm"  disabled={!infiles?.[0]}
                                onPress={ () => {
                                    setOpenUppy(false);
                                    const newfile=infiles?.map(({name,url}, i) => {
                                        return  (i<1)&&{name,url}
                                    });
                                    onFinish(row, newfile?.[0] || undefined, false);
                                }}
                        >文件输入确认</Button>
                    </>
            }
        </div>
    </>);
    return  [ onlyOne ];
}
