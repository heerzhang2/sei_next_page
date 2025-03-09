"use client"

import Link from 'next/link';
import React, { Suspense } from 'react';
import {useQuery, gql, UrqlProvider} from '@urql/next';
// import {getSsr, urqlClient} from "@/auth/urql";
import {ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
import {useStorage} from "@/report/StorageContext";


//片段不能像Relay那样的能做独立形式的定义了！必须每个请求都定义； "Validation error (UndefinedFragment@[getReport]) : Undefined fragment 'pageReportIsp'"
// const RepIspQuery=gql` `;
export const ReportQuery = gql`
    query pagegetReportQuery($id: ID! ) {
        getReport(id: $id) {
            id,version,
            data
            snapshot
            modeltype,modelversion
            isp{id, no}
            ...pageReportIsp
        }
    }
    fragment pageReportIsp on Report
    {
        id, modeltype, modelversion, tzFields,
        isp {
            id, no, report{id},
            dev{id cod},bsType,
            reps {
                edges {
                    node {
                        id, modeltype, modelversion,data,
                        stm{id,sta,
                            authr{ id, username, person {id, name} },
                            reviewer{ id, username, person {id, name} }
                        }
                    }
                },
            },
            ispMen { id, username, person {id, name} },
            checkMen { id, username, person {id, name} }
            ispu{id agency{id,apno,bjtel,bjurl},name},
            bus{id,
                pipus{id crDate code rno name start stop nxtd1 nxtd2 leng level lay safe svp pa}
            }
        }
    }
`;

/*async/await is not yet supported in Client Components, only Server Components.
params: Promise<{ repId: string }>      ; await params;
* */
function CommonReportData({ repId,children       }:
         {  repId:  string, children: React.ReactNode}
) {
    // KQcbgDF9RO21DsI92H3tTVJlcG9ydA

    // const { repId } = React.use(params);  // await params
    // const post = await getPost(repId)
    // const data ={};
    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } });

    // const router = useRouter();
    // console.log("graphql->authUser", data);
    const {getReport: report} = result?.data;
    console.log("CommonReportData: report=",report);
    const {storage, setStorage} =useStorage();
    //特别注意：RecordEditorMain.tsx 也有初始化代码，需要俩个代码setStorage确保一致性。
    console.log("左边页面的OriginalRecordMainInner",storage,"routeData",);
    React.useEffect(() => {
        const  dat =report&&report.data&&JSON.parse(report.data);
        const  snap =report&&report.snapshot&&JSON.parse(report.snapshot);
        //JPA互斥锁 _version 同时保存一份到了data区域,保存数据需要回传后端的。
        if(dat)   setStorage({...dat, ...snap, _version: report?.version});       //台账基础信息优先采信
        else   setStorage({ ...snap, _version: report?.version});
        console.log("【id切换】才会执行的：左边页面的-Relay3query获取后进的-",dat,"snap",snap);        //点击不同的编辑区块链接跳转后这个竟然没有再去运行！！
    }, [report, setStorage]);
    if(report && !report.snapshot) return (
        <React.Fragment>
            {
                `该报告的基础信息未赋值`
            }
        </React.Fragment>
    );
    if(!report)  return null;

    //【暂时】snapshot还未加入的;
    return (
        <Suspense>
            {/*<p>数据的和 {report?.data}</p>*/}

            {children}
            {/*<ReportView source={report?.data} verId={'1'} rep={report}/>*/}
        </Suspense>
    )
}


/*async/await is not yet supported in Client Components, only Server Components.
params: Promise<{ repId: string }>      ; await params;
【服务端SSR】？这个部分，影响client缓存? RSC必要性哪。
* */
export default function ReportData({
                                       repId,children
                                   }: {
    repId: string,
    children: React.ReactNode
}) {
    // const { repId } = React.use(params);  // await params   // params: Promise<{ repId: string }>
    console.log("ReportData: repId=",repId);
    return (
        <Suspense>
          <CommonReportData repId={repId} >
            {children}
          </CommonReportData>
        </Suspense>
    )
}

// export function ReportDataOld({
//                                   params,
//                               }: {
//     params: Promise<{ repId: string }>
// }) {
//     const { repId } = React.use(params);  // await params
//
//     return (
//         <article>
//             <Suspense>
//                 <CommonReportData repId={repId as string} />
//             </Suspense>
//             {/*<PostList repId={repId}/>*/}
//         </article>
//     )
// }



/*
最有可能的未来是，人工智能成为 Next.js 生态系统中的一个强大工具，而非完全取代它。开发者将使用人工智能来加速开发，同时依赖 Next.js 提供结构、优化和生产就绪的功能。
包 @ai-sdk/react ；
* */
