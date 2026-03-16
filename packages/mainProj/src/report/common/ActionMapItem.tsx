"use client"

import React, {} from "react"
import { z as zod } from "zod"
import { useStorage } from "@/report/StorageContext"
import {
    BlobInputList,
    ClearableSelect,
    CollapsibleFormSection,
    InputDatalist,
    MemoDateInput,
    MemoDatesInput,
} from "@/components/chub"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from "@/components/ui"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { RecordOmniArea } from "./omni"
import type { Column_Setting } from "./useFormatOmni"
import { useFormFramework } from "@/report/hook/useFormFramework"

/**字体显示问题，改变"合格""不合格"的存储字节：不兼容了； 结论非法√
 第一代版本的{ label: "合格", value: "√" },     但在web开源字体显示像平方根符号的。
 修改成 value: "✔" },   "\u2714" },
 第一版的{ label: "不合格", value: "×" },
 修改成 value: "✘" },   "\u2718" },
 设备台账后端存储多数还是"/"而不是"／"的 应该来自用户输入的，并非代码生成的。  标记为"／"打印显示更好看点。
 */
export const clcOptions = [
    { label: "合格", value: "\u2714" },
    { label: "见证确认", value: "▽" },
    { label: "无此项", value: "／" },
    { label: "不合格", value: "\u2718" },
    { label: "无法检测", value: "△" },
]

//推荐 name={`${namepr}.${n}` as any}
//检验项目的标准化展示组件, 多了2列"工作见证，确认方式"
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    //报告对象
    rep: any
    editAreasConf: RecordOmniArea[]
    /**单一个路由可编辑区域对应的 一部分项目列表的 配置*/
    index: number
    show?: boolean
    alone?: boolean
    ref?: any
    // refWidth?: number;
    /**后面两个参数：定制 ，确认日期字段 有些项目需要拆分为两个日期输入的情况；
     * */
    // custST?: (area:RecordOmniArea,par:any,fields:any)=>any;

    //确认 字段的：确认日期 需要拆分为两个日期输入
    // sureCB?: ({inp,setInp,config,tago,addMemo,icname} :any)=>React.ReactNode;
    /** '资料确认描述或存在问题描述' 输入框的可选择的列表文本。
     * */
    sureList?: string[]
    //是否需确认日期录入， 默认自拆分项目只有一个日期的。
    sureD?: boolean
    editIts: Column_Setting[]
}
/**机电impressionismAs项目列表形式的 编辑器：
 * 编辑区：【单一个index=？编辑区域的】 全部项目。  当前editAreasConf[index]是可以动态的。
 * @param show
 * @param editAreasConf
 * @param index
 * @param editIts   支持是可变的情况: 可能外部需要注入动态的输入列表情况：
 const witnessNos =React.useMemo(() => {
 return storage.见证表?.map((a:any, i:number) => a && a.no);
 }, [storage.见证表]);
 *  _M`];      //备注; _Z`];      //工作见证; _S`];      //确认日期
 * 若想orc?._Oitems用户输入的文本有格式化换行效果等，只能在记录编辑的2个解析器这里特殊对待来做。？特殊标记，特定标签的tag '_其它'+i。<br/>替换\n;
 * refWidth：抛弃不用了？ 没必要用LineColumn布局，直接多列的做。
 * @param rep 报告对象
 * */
export const ActionMapItem = ({
                                  show = false,
                                  // alone = true,
                                  editAreasConf,
                                  index,
                                  // sureList,
                                  editIts,
                                  // sureD,
                                  rep,
                              }: Props) => {
    const config = editAreasConf[index]
    // 动态合并基础schema和动态字段fullSchema:不能假如表单中不存在但是验证报错的字段，否则提交不会出错全都没提示的。
    // const fullSchema = z.object({
    //     // fullName: z.string().min(2, { message: "姓名至少需要2个字符" }),
    //     // email: z.string().email({ message: "请输入有效的电子邮件地址" }),
    //     // department: z.string().min(1, { message: "请选择一个部门的" }),
    //     // bio: z.string().optional(),
    //     // 急联人: z.boolean().refine((val) => val === true, {
    //     //     message: "您必须同意条款和条件",
    //     // }),
    //     // price: z.string().optional(),
    //     // // 中文字段名示例
    //     // 测试字段1: z.string().optional(),
    //     乘人结构: z.string().optional(),
    //     乘人结构_D: z.string().optional(),
    // })
    // 创建动态 schema
    const fullSchema = React.useMemo(() => {
        const schemaFields = {} as any
        config.items?.forEach((tago, i) => {
            editIts?.forEach(({ n, x, m, t, l, z }: Column_Setting, en: number) => {
                if (n === null) return
                else if (!m) {
                    if (tago.name) {
                        if (n === "") schemaFields[tago.name] = zod.string().optional()
                        else schemaFields[`${tago.name}_` + n] = zod.string().optional()
                    }
                } else {
                    if (!tago.nconcl) {
                        const mergeName = tago.mergName ?? tago.name
                        if (mergeName) {
                            schemaFields[`${mergeName}_` + n] = zod.string().optional()
                        }
                    }
                }
            })
        })
        return zod.object(schemaFields)
    }, [config, editIts])
    const { storage } = useStorage()
    //初始化区块组件的inp对象，只包含局部小范围的字段数。
    //【避免重置按钮无法正常切换显示】必须都要初始化空值情形的：storage[name] ?? ""；
    //汇总结论那一列除外：【规矩】结论是生成的就没有存储。 {[rskey] : subStorage}= storage; setInp(getInpFilter(rskey? (subStorage||{}) : storage));
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        config.items?.forEach((tago, i) => {
            editIts?.forEach(({ n, x, m, t, l, z }: Column_Setting, en: number) => {
                if (n === null) return
                else if (!m) {
                    if (tago.name) {
                        if (n === "") fields[tago.name] = storage[tago.name] ?? ""
                        else fields[`${tago.name}_` + n] = storage[`${tago.name}_` + n] ?? ""
                    }
                } else {
                    if (!tago.nconcl) {
                        const mergeName = tago.mergName ?? tago.name
                        if (mergeName) {
                            fields[`${mergeName}_` + n] = storage[`${mergeName}_` + n] ?? ""
                        }
                    }
                }
            })
        })
        return fields
    }, [config, editIts, storage])

    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            //假如分项报告情况：原来inp:,setInp：是针对局部的存储做修改的。
            //支持 t类型：'',B,l,d,C,S;
            const innerRender = (idx: number, namepr: string, label?: string) => {
                const { n, x, m, t, l, z } = editIts[idx]
                if (t === "d")
                    return (
                        <FormField
                            key={`${namepr}_` + n}
                            control={form.control}
                            name={(`${namepr}_` + n) as any}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">{label ?? x}</FormLabel>
                                    <FormControl className="w-full">
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                else if (t === "B")
                    return (
                        <FormField
                            key={`${namepr}_` + n}
                            control={form.control}
                            name={(`${namepr}_` + n) as any}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">{label ?? x}</FormLabel>
                                    <FormControl className="w-full">
                                        <BlobInputList datalist={l} rows={z ?? 2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                else if (t === "l" && l)
                    return (
                        <FormField
                            key={`${namepr}_` + n}
                            control={form.control}
                            name={(`${namepr}_` + n) as any}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">{label ?? x}</FormLabel>
                                    <FormControl className="w-full">
                                        <InputDatalist datalist={l} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                else if (t === "C")
                    return (
                        <FormField
                            key={`${namepr}_` + n}
                            control={form.control}
                            name={(`${namepr}_` + n) as any}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">{label ?? x}</FormLabel>
                                    <FormControl>
                                        <MemoDateInput {...field} width="14rem" rows={z ?? 2} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                else if (t === "S")
                    return (
                        <FormField
                            key={`${namepr}_` + n}
                            control={form.control}
                            name={(`${namepr}_` + n) as any}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">{label ?? x}</FormLabel>
                                    <FormControl>
                                        <MemoDatesInput {...field} rows={z ?? 2} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                else
                    return (
                        <FormField
                            key={`${namepr}_` + n}
                            control={form.control}
                            name={(`${namepr}_` + n) as any}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">{label ?? x}</FormLabel>
                                    <FormControl className="w-full">
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
            }

            const htmlTxts = [] as any[]
            //允许本编辑区的配置继承来自前面的编辑区。反方向去搜索配置。【前提】最低一级或者第四级别必然做配置的。 x y z可能省略配置。editAreasConf[0]第一个必然会配置全套的。
            //【不同点】允许相等检验项目栏目编码串的，直接融合正在编辑的项目区域显示。
            for (let wf = 0; wf < config.items?.length; ) {
                const tago = config.items[wf]
                //连续跟随的几个项目是否 ？多个具有相同的项目编码串 alikeSize=相同的个数 项目栏目编码串判定一摸一样横跨剩下几个行的；
                if (tago) {
                    let mergLastEt = tago //归并区的最后一行
                    if (tago.offset) {
                        mergLastEt = config.items[wf + tago.offset]
                    }
                    if (!mergLastEt) throw new Error(`或没最后一行配置`)
                    const icname = mergLastEt.mergName ?? mergLastEt.name
                    if (!tago.nconcl && !icname) throw new Error(`或没最后一行配置名`)
                    // let mergeName=mergLastEt.mergName;      //itemMergReverseSearch(config, wf); 相反反向的 搜寻存储字段
                    let labelStr = "" as string
                    if (tago.name) {
                        //优先采用的recap  tips  nos
                        if (tago.nconcl && tago.recap && typeof tago.recap === "string") {
                            if (tago.tips && tago.tips.length < tago.recap.length)
                                labelStr = tago.tips //太多了文字！
                            else labelStr = tago.recap as string
                        } else {
                            //正式默认都只会显示一个合并项目，没有显示拆分项目的： 自拆分的合并，也不好直接用recap。
                            // if(!tago.nconcl && !tago.tips && tago.recap && typeof tago.recap==='string')
                            //     labelStr=tago.recap;
                            // else
                            labelStr = tago.tips ? tago.tips : tago.nos ? tago.nos + "-结果" : "检验结果"
                        }
                    }
                    const addMemo = (tago.name && !tago.nconcl) || (tago.mergName && !tago.nconcl)
                    //注意 ?? 只能对null undefined有反应，对于 '' 以及 0 都是不会测试成功的。 所以 '' 不能用来替代undefined的位置。
                    // const mergLabel=mergLastEt.mergLabel??mergLastEt.mergNos??tago.tips??(typeof tago.recap==='string'? tago.recap:null)??tago.nos;
                    //前半部分的 必须使用这个方式添加nodes;否则<LineColumn >无法穿透。
                    const headNoLabel = tago.nos
                        ? `${tago.pre || ""}${tago.iclas || ""}${tago.nos}`
                        : `${mergLastEt.pre || ""}${mergLastEt.iclas || ""}${mergLastEt.mergNos ?? mergLastEt.nos}`
                    const rowHead = (
                        <div key={wf} className="mt-4 @container">
                            {tago === mergLastEt && mergLastEt.name === undefined ? null : (
                                <div className="flex justify-around">
                                    <h6>{headNoLabel}</h6>
                                    <h6>
                                        {tago.rec?.big}&nbsp;&nbsp;{tago.rec?.seco}
                                    </h6>
                                    <h6>
                                        {tago.rec?.third}&nbsp;&nbsp;{tago.rec?.four}
                                    </h6>
                                </div>
                            )}
                            <div className="flex justify-around">
                                {typeof tago.desc === "string" ? <h5>{tago.desc}</h5> : tago.desc}
                            </div>
                            <hr />
                            <div className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                                {tago.name &&
                                    editIts.map(({ n, x, m, t, l, z }: Column_Setting, i: number) => {
                                        if (n === null) return null
                                        else if (n === "") {
                                            if (l) {
                                                return (
                                                    <FormField
                                                        key={tago.name!}
                                                        control={form.control}
                                                        name={tago.name! as any}
                                                        render={({ field }) => (
                                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                                <FormLabel className="select-text">{labelStr}</FormLabel>
                                                                <FormControl>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="选择其中一项" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {l.map((item, i: number) => {
                                                                                return (
                                                                                    <SelectItem key={i} value={item}>
                                                                                        {item}
                                                                                    </SelectItem>
                                                                                )
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )
                                            }
                                            return (
                                                <FormField
                                                    key={tago.name!}
                                                    control={form.control}
                                                    name={tago.name! as any}
                                                    render={({ field }) => (
                                                        <FormItem className="pt-2 w-full break-inside-avoid">
                                                            <FormLabel className="select-text">{labelStr}</FormLabel>
                                                            <FormControl>
                                                                <ClearableSelect
                                                                    field={field}
                                                                    options={clcOptions}
                                                                    placeholder="选单项的结论"
                                                                    onClear={() => {
                                                                        // 清除选择的值
                                                                        form.setValue(tago.name! as any, "")
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )
                                        } else if (!m) {
                                            return innerRender(i, tago.name!, undefined)
                                        }
                                        return null
                                    })}
                                {addMemo &&
                                    editIts.map(({ n, x, m, t, l, z }: Column_Setting, i: number) => {
                                        if (n === null) return null
                                        else if (m) {
                                            const label = `${tago.mergNos ?? tago.nos ?? ""}` + x
                                            return innerRender(i, icname!, label)
                                        }
                                        return null
                                    })}
                            </div>
                        </div>
                    )

                    htmlTxts.push(rowHead)
                }
                wf += 1
            }
            return htmlTxts
        },
        [config, editIts],
    )

    const { render } = useFormFramework({ schema: fullSchema, defaultValues, contentRendererFactory, rep })
    return (
        <CollapsibleFormSection title={`${config.name ?? config.tag}`} defaultOpen={show}>
            {render(null)}
        </CollapsibleFormSection>
    )
}
