"use client"
import { useMultiTableForm } from "./useMultiTableForm"
import { CollapsibleFormSection } from "@/components/chub"

export default  function UsageMultiTableHook() {
    // 配置常量
    const config加速度 = [
        ["加空载", "空载"],
        ["加满载", "满载"],
        ["加偏载", "偏载"],
        ["加他况", "其他载荷工况"],
    ]

    const AxyzNm = ["a", "b", "c", "d", "e", "f"]
    const AxyzCfg = [
        ["a", "X方向"],
        ["b", "Y方向"],
        ["c", "Z方向"],
        ["d", "合成加速度"],
        ["e", "测点位置"],
        ["f", "备注"],
    ]

    const itemA加速 = ["加速备注"]

    // 使用多表格表单hook
    const { renderTableLayout } = useMultiTableForm({
        config: config加速度,
        fieldConfig: AxyzCfg,
        fieldNames: AxyzNm,
        textFields: itemA加速,
        rep: { id: "example-id" },
    })

    return (
        <CollapsibleFormSection title="加速度测量表单" defaultOpen={true}>
            {renderTableLayout()}
        </CollapsibleFormSection>
    )
}
