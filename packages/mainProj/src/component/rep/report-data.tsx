"use client"

import React, {Suspense} from 'react';
import {useQuery, gql} from '@urql/next';
import {useStorage} from "@/report/StorageContext";
import Link from "next/link";
import {useSearchParams} from "next/navigation";

export interface ReportParams {
    repId: string
    action?: string
}

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
        link { rep ori },
        isp {
            id, no, report{id},
            dev{id cod},bsType,
            reps {
                edges {
                    node {
                        id, modeltype, data,version,
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

function CommonReportData({ repId,children       }:
                          {  repId:  string, children: React.ReactNode}
) {
    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        requestPolicy: 'cache-and-network',
    })
    const { data, fetching, error } = result
    const { getReport: report } = data || {}
    const {setStorage} =useStorage();
    //服务器也运行的console.log("左边页面的OriginalRecordMainInner",storage,"routeData",);
    React.useEffect(() => {
        const  snap =report&&report.snapshot&&JSON.parse(report.snapshot);
        const  dat =report&&report.data&&JSON.parse(report.data);
        //JPA互斥锁 _version 同时保存一份到了data区域,保存数据需要回传后端的。  snapshot【只有经过一次】保存才能复制进入data字段，否则不变。
        if(dat)   setStorage({...dat, ...snap, _version: report?.version});       //台账基础信息优先采信
        else   setStorage({ ...snap, _version: report?.version});
        console.log("每次保存都会更新",dat,"snap",snap);        //点击不同的编辑区块链接跳转后这个竟然没有再去运行！！
    }, [report, setStorage]);
    if (fetching) return <div>加载中...</div>
    if (error) return <div>报告取数据错: {error.message}</div>
    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if (!report) return  <div className="content-center text-center h-screen w-screen">
            <Link href="/">没有找到该份报告，返回首页</Link>
        </div>;
    return (
        <Suspense>
            {children}
        </Suspense>
    )
}

export const ReportSubQuery = gql`
    query pagegetReportQuery($id: ID! ) {
        getReport(id: $id) {
            id,version,data,modeltype
        }
    }
`;

/**独立流转分项需要同步显示，避免主报告不能刷新子报告的新数据。
 * 直接查询子报告的数据，替换子报告数据修改部分。
* */
function CommonReportDataSub({ repId, subrid, children       }:
           {  repId:  string, subrid:  string, children: React.ReactNode}
) {
    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        requestPolicy: 'cache-and-network',
    })
    const { data, fetching, error } = result;
    const { getReport: report } = data || {}
    //独立流转的分项报告：  独立分项报告反而需附加一个查询。因为上面主查询不会因子报告保存做立刻更新的。
    const [resultSub] = useQuery({
        query: ReportSubQuery,
        variables: { id: subrid },
        requestPolicy: 'cache-and-network',
    })
    const { data:dataSub, fetching:fetchingSub, error:errorSub } = resultSub;
    const { getReport: reportSub } = dataSub || {}
    const {setStorage, setSubrType, setParrepfs} =useStorage();
    //服务器也运行的console.log("左边页面的OriginalRecordMainInner",storage,"routeData",);
    React.useEffect(() => {
        const  snap =report&&report.snapshot&&JSON.parse(report.snapshot);
        if(reportSub){
            const  subdat =reportSub.data&&JSON.parse(reportSub.data);
            //不是主报告分项的： 不需要设备台账的字段。
            if(subdat)   setStorage({...subdat,  _version: reportSub?.version});       //台账基础信息优先采信
            else   setStorage({  _version: reportSub?.version});
            setSubrType(reportSub.modeltype)
            console.log("每次保存CommonReportDataSub", subdat);   //点击不同的编辑区块链接跳转后这个竟然没有再去运行！！
        }
        const  dat =report&&report.data&&JSON.parse(report.data);
        //JPA互斥锁 _version 同时保存一份到了data区域,保存数据需要回传后端的。  snapshot【只有经过一次】保存才能复制进入data字段，否则不变。
        if(reportSub){
            if(dat)   setParrepfs({...dat, ...snap, _version: report?.version});
            else   setParrepfs({ ...snap, _version: report?.version});
        }
    }, [reportSub, report, setStorage,setParrepfs]);
    if (fetching || fetchingSub) return <div>加载中...</div>
    if (error || errorSub) return <div>报告取数据错: {error?.message} {errorSub?.message}</div>
    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if(!report) return  <div className="content-center text-center h-screen w-screen">
        <Link href="/">没有找到该份报告，返回首页</Link>
    </div>;
    if(!reportSub) return  <div className="content-center text-center h-screen w-screen">
        <Link href="/">没有该独立流转子报告，返回首页</Link>
    </div>;
    return (
        <Suspense>
            {children}
        </Suspense>
    )
}

/**支持：子报告编辑情形需要单独展示子报告，不涉及主报告显示的模式。
* */
export default function ReportData({
                                       repId,children
                                   }: {
    repId: string,
    children: React.ReactNode
}) {
    const searchParams = useSearchParams()
    const subrid = searchParams!.get("subrid")
    if(subrid)  return (
        <Suspense>
            <CommonReportDataSub repId={repId} subrid={subrid}>
                {children}
            </CommonReportDataSub>
        </Suspense>
    )
    else return (
        <Suspense>
            <CommonReportData repId={repId} >
                {children}
            </CommonReportData>
        </Suspense>
    )
}
