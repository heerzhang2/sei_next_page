"use client"
import React, {Suspense, } from 'react';
import {useStorage} from "@/report/StorageContext";
import {ReportFirstPageHeadNmaNmbm} from "@/report/common/head";
import {JumpTab} from "@/report/common/JumpTab";
import {落款单位地址} from "@/report/common/rarelyVary";

/**单独一份的独立流转分项报告
* */
export function SingeSubRep({rep, children}: {
    rep: any,
    children:  any
}) {
    const {storage, subrType: modType,  parrepfs } = useStorage()
    console.log("SingeSubRep 位置=storage=", storage)
    const localIdx = storage?.[`_${modType}`] ?? [];
    return (
        <Suspense>
            <div className="not-print:my-4">
                <div className="print:h-screen">
                    {ReportFirstPageHeadNmaNmbm({rep })}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <div>
                            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`}>
                                <h1 className="text-3xl text-center print:mt-6">可独立流转的分项报告</h1>
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
                            parOrc: parrepfs
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
            {localIdx.map((seq: number, k: number) => {
                const subStore=storage?.[`_${modType}_${seq}`];
                return (<div key={k}>
                        {React.cloneElement(children, {
                            redId: seq,
                            key: k,
                            orc: subStore,
                            parOrc: storage
                        })}
                </div>)
            })}
            {subreps.map(({node: subrep}:any, i: number) => {
                const dat =subrep?.data&&JSON.parse(subrep?.data);
                const sIdx = dat?.[`_${modType}`] ?? [];
                return (<div key={i}>
                    {sIdx.map((seq: number, k: number) => {
                        const subStore=dat?.[`_${modType}_${seq}`];
                        return (
                            React.cloneElement(children, {
                                redId: seq,
                                subrid: subrep?.id,
                                key: i+"_"+k,
                                orc: subStore,
                                parOrc: storage
                            })
                        )
                    })}
                </div>)
            })}
        </Suspense>
    )
}
