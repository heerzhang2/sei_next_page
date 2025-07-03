"use client"
import React, {Suspense, } from 'react';
import {useStorage} from "@/report/StorageContext";
import {ReportFirstPageHeadNmaNmbm} from "@/report/common/head";
import {JumpTab} from "@/report/common/JumpTab";
import {落款单位地址} from "@/report/common/rarelyVary";

/**单独一份的独立流转分项报告;
 * 打印也没考虑：单独去打印可独立流转的分项报告的。
* */
export function SingeSubRep({rep,subrid,children}: {
    rep: any,
    subrid: string,
    children:  any
}) {
    const {storage, subrType: modType,  parrepfs } = useStorage()
    console.log("SingeSubRep 位置=storage=", storage)
    const localIdx = storage?.[`_${modType}`] ?? [];
    //可以考虑：加上控制折叠显示的使能按钮，全部折叠上可折叠的区域。传递参数给children；
    return (
        <Suspense>
            <div className="not-print:my-4">
                <div className="print:h-screen">
                    {ReportFirstPageHeadNmaNmbm({rep })}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <div>
                            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?subrid=${subrid}&modelkey=${modType}`}>
                                <div className="block pt-2 print:hidden">可独立流转分项报告 {'>'}</div>
                            </JumpTab>
                            <span className="block text-center text-sm print:mt-4"> （ FJB/GB 10082-0-2021 ）</span>
                        </div>
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                {localIdx.map((seq: number, k: number) => {
                    const subStore=storage?.[`_${modType}_${seq}`];
                    return (<div key={k}>
                        {React.cloneElement(children, {
                            redId: seq,
                            key: k,
                            orc: subStore,
                            parOrc: parrepfs,
                            apxid: `-${seq}`,
                            useh2: k===0,
                        })}
                    </div>)
                })}
            </div>
        </Suspense>
    )
}

/**多子报告的：
 * 这个组件只能在主报告的语境中使用的，但不能用于可流转分项子报告的！
* */
export default function SubRep({
               rep, modType,children
               }: {
    rep: any,
    modType: string,
    children: any
}) {
    const {storage, parrepfs} =useStorage();
    const localIdx = storage?.[`_${modType}`] ?? [];
    const subreps = React.useMemo(() => {
        const flsReps =rep?.isp?.reps?.edges?.filter(({node: srep}: any) => {
            return srep?.modeltype===modType
        })
        return flsReps ?? []
    }, [modType, rep])
    return (
        <Suspense>
            { localIdx?.length > 0 &&
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?modelkey=${modType}`}>
                    <div className="block pt-2 print:hidden">报告的分项形式子报告 {'>'}</div>
                </JumpTab>
            }
            {localIdx.map((seq: number, k: number) => {
                const subStore=storage?.[`_${modType}_${seq}`];
                const head=subreps.length > 0? '1' : '';
                return (<div key={k}>
                        {React.cloneElement(children, {
                            redId: seq,
                            key: k,
                            orc: subStore,
                            parOrc: storage,
                            apxid:  head+`-${seq}`,
                            useh2: k===0,
                        })}
                </div>)
            })}
            {subreps.map(({node: subrep}:any, i: number) => {
                const dat =subrep?.data&&JSON.parse(subrep?.data);
                const sIdx = dat?.[`_${modType}`] ?? [];
                return (<div key={i}>
                    <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?subrid=${subrep?.id}&modelkey=${modType}`}>
                        <div className="block pt-2 print:hidden">报告的独立流转分项 {'>'}</div>
                    </JumpTab>
                    {sIdx.map((seq: number, k: number) => {
                        const subStore=dat?.[`_${modType}_${seq}`];
                        const ihead=localIdx?.length > 0? i+2 : i+1;
                        return (
                            React.cloneElement(children, {
                                redId: seq,
                                subrid: subrep?.id,
                                key: i+"_"+k,
                                orc: subStore,
                                parOrc: storage,
                                apxid:  ihead+`-${seq}`,
                                useh2: k===0,
                            })
                        )
                    })}
                </div>)
            })}
        </Suspense>
    )
}
