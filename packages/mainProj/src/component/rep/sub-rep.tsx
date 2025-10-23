"use client"
import React, { Suspense, useEffect, useState } from "react"
import { useStorage } from "@/report/StorageContext"
import { JumpTab } from "@/report/common/JumpTab"
import { 独立流转分项 } from "@/report/common/rarelyVary"
import { findNodeIndex } from "@/report/hook/useSubRepController"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

/**单独一份的独立流转分项报告; 更为特殊的可重复分项；
 * 打印也没考虑：单独去打印可独立流转的分项报告的。
 * */
export function SingeSubRep({
                                rep,
                                subrid,
                                children,
                                title,
                            }: {
    rep: any
    subrid: string
    children: any
    title: string
}) {
    const { storage, subrType: modType, parrepfs } = useStorage()
    // console.log("SingeSubRep 位置=storage=", storage)
    const localIdx = storage?.[`_${modType}`] ?? []
    //同一种子报告的相对排序位置：
    const subrepidx = React.useMemo(() => {
        const flsReps = rep?.isp?.reps?.edges?.filter(({ node: srep }: any) => {
            return srep?.modeltype === modType
        })
        const ifind = findNodeIndex(flsReps, subrid)
        return ifind ?? 0
    }, [subrid, modType, rep])
    //可以考虑：加上控制折叠显示的使能按钮，全部折叠上可折叠的区域。传递参数给children；
    return (
        <Suspense>
            <div className="not-print:my-4">
                {独立流转分项()}
                <div className="not-print:my-4">
                    <JumpTab
                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?subrid=${subrid}&modelkey=${modType}`}
                    >
                        <div className="block pt-2 print:hidden">{"<<"} 可独立流转分项报告</div>
                    </JumpTab>
                </div>
                {localIdx.map((seq: number, k: number) => {
                    const subStore = storage?.[`_${modType}_${seq}`] || {}
                    const hash = "_" + modType + "_" + (subrepidx + 1) + "-" + seq
                    return (
                        <div key={k} id={hash}>
                            {React.cloneElement(children, {
                                redId: seq,
                                key: k,
                                orc: subStore,
                                parOrc: parrepfs,
                                apxid: `-${k + 1}`,
                                useh2: k === 0,
                            })}
                        </div>
                    )
                })}
                {localIdx.length <= 0 && <strong className="text-center mt-8 text-xl">{title}-分项报告，还未有任何内容</strong>}
            </div>
        </Suspense>
    )
}

/**多子报告的：
 * 这个组件只能在主报告的语境中使用的，但不能用于可流转分项子报告的！
 * 普通的不可独立流转可重复分项的 modType 不要和公用模板类型代码冲突：
 * 假设是主报告里面内置的 可重复分项个数只有一个的，那麽默认直接显示出来不折叠了。
 * */
export default function SubRep({
                                   rep,
                                   modType,
                                   children,
                                   title,
                                   collapse,
                               }: {
    rep: any
    modType: string
    children: any
    title: string
    collapse?: boolean
}) {
    const { storage, parrepfs } = useStorage()
    const localIdx = storage?.[`_${modType}`] ?? []
    const subreps = React.useMemo(() => {
        const flsReps = rep?.isp?.reps?.edges?.filter(({ node: srep }: any) => {
            return srep?.modeltype === modType
        })
        return flsReps ?? []
    }, [modType, rep])

    const [subrepDataMap, setSubrepDataMap] = useState<Record<string, any>>({})

    useEffect(() => {
        const loadSubrepData = async () => {
            const dataMap: Record<string, any> = {}

            for (const { node: subrep } of subreps) {
                if (subrep?.id) {
                    try {
                        // Try to load modified data from IndexedDB
                        const restored = await indexedDBStorage.load(rep?.id, subrep.id)

                        if (restored && restored.metadata?.modified && restored.storage) {
                            // Use modified data from IndexedDB
                            console.log("[SubRep] Using modified data from IndexedDB for subrep:", subrep.id)
                            dataMap[subrep.id] = restored.storage
                        } else {
                            // Fall back to original data from database
                            const dat = subrep?.data && JSON.parse(subrep?.data)
                            dataMap[subrep.id] = dat
                        }
                    } catch (error) {
                        console.error("[SubRep] Failed to load data for subrep:", subrep.id, error)
                        // Fall back to original data on error
                        const dat = subrep?.data && JSON.parse(subrep?.data)
                        dataMap[subrep.id] = dat
                    }
                }
            }

            setSubrepDataMap(dataMap)
        }

        if (subreps.length > 0) {
            loadSubrepData()
        }
    }, [subreps, rep?.id])

    return (
        <div id={`_${modType}_`}>
            {localIdx?.length > 0 ? (
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?modelkey=${modType}`}>
                    <div className="block pt-2 print:hidden">
                        {title}的分项形式子报告 {">"}
                    </div>
                </JumpTab>
            ) : (
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?modelkey=${modType}`}>
                    <div className="block p-4 text-2xl font-bold print:hidden">
                        新增加：{title}的分项 {">"}
                    </div>
                </JumpTab>
            )}
            {localIdx.map((seq: number, k: number) => {
                const subStore = storage?.[`_${modType}_${seq}`] || {}
                //区分若没有任一个独立流转分项的情况：
                const head = subreps.length > 0 ? "1" : ""
                const apxid = localIdx?.length > 1 ? head + `-${k + 1}` : ""
                const hash = "_" + modType + "_1-" + seq //本地id固定都有_1的；
                const needCollapse = collapse || localIdx?.length > 1
                return (
                    <div key={k} id={hash}>
                        {React.cloneElement(children, {
                            //存储用的标签。
                            redId: seq,
                            key: k,
                            orc: subStore,
                            parOrc: storage,
                            //页面路由定位+报告排序序号：id={"_THICK_MS_"+apxid}
                            apxid,
                            useh2: k === 0,
                            unfold: k === 0 && !needCollapse,
                        })}
                    </div>
                )
            })}
            {subreps.map(({ node: subrep }: any, i: number) => {
                const dat = subrepDataMap[subrep?.id] || (subrep?.data && JSON.parse(subrep?.data))
                const sIdx = dat?.[`_${modType}`] ?? []
                return (
                    <div key={i}>
                        <JumpTab
                            href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/_Controller?subrid=${subrep?.id}&modelkey=${modType}`}
                        >
                            <div className="block p-4 text-2xl font-bold print:hidden">报告的独立流转分项 {">>"}</div>
                        </JumpTab>
                        {sIdx.map((seq: number, k: number) => {
                            const subStore = dat?.[`_${modType}_${seq}`] || {}
                            //独立流转分项：前缀基数都要显示出，不管是否只有唯一一个的。
                            const ihead = localIdx?.length > 0 ? i + 2 : i + 1
                            const apxid = ihead + `-${k + 1}`
                            const hash = "_" + modType + "_" + ihead + "-" + seq
                            return (
                                <div key={k} id={hash}>
                                    {React.cloneElement(children, {
                                        redId: seq,
                                        subrid: subrep?.id,
                                        key: i + "_" + k,
                                        orc: subStore,
                                        parOrc: storage,
                                        apxid,
                                        useh2: k === 0,
                                    })}
                                </div>
                            )
                        })}
                        {sIdx.length <= 0 && <strong className="text-center mt-8 text-xl">{title}-分项报告，还未有任何内容</strong>}
                    </div>
                )
            })}
        </div>
    )
}

// 子报告配置映射； modType:避免用整数键（或可转换为整数的字符串）;
export interface SubReportConfig {
    //项目列表中的名称：
    catKey: string // 用于 mapFxian.get() 的键
    //报告里面的提示信息： 默认的=catKey
    title?: string
    //模板入口
    component: React.ComponentType<{
        orc?: any
        rep: any
        subrid?: string
        printMode?: boolean
    }>
    //必须折叠，不允许自动展开的。
    collapse?: boolean
    cat: { title: string; url: string }[]
}
