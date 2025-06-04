"use client"

import React, { Suspense } from 'react';
import {useQuery, gql} from '@urql/next';
import {useStorage} from "@/report/StorageContext";

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
        id, modeltype, modelversion, tzFields,link{rep,ori},
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
    if (fetching) return <div>加载中...</div>
    if (error) return <div>错误: {error.message}</div>
    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if (!report) return null
    return (
        <Suspense>
            {children}
        </Suspense>
    )
}

export default function ReportData({
                                       repId,children
                                   }: {
    repId: string,
    children: React.ReactNode
}) {
    console.log("ReportData: repId=",repId);
    return (
        <Suspense>
            <CommonReportData repId={repId} >
                {children}
            </CommonReportData>
        </Suspense>
    )
}
