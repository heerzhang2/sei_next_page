"use client"
import * as React from "react"
import {CollapsibleFormSection, InputDatalist, SuffixInput,} from "@/components/chub"
import {Card, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui"
import { initFormTable, useFormFramework, } from "@/report/hook/useFormFramework"
import {CCellUnit, type InternalItemProps, RepLink, type RepVwProps} from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import {CfootMensLine, } from "@/report/common/view"
import {ImageComponent} from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import {z} from "zod"
import type { UseFormReturn } from "react-hook-form"
import {useThreeColumnSubr} from "@/report/hook/useThreeColumnSubr";
import {three2TwoColumn} from "@/report/common/survey";

const Items射线源=[{t:'管电压：',n:'管压',u:'KV'},{t:'源活度',n:'源活',u:'Ci'},{t:'管电流',n:'管电',u:'mA'}];
//实际有点像特性表的做法：再做分解为4个工件的组合在一块的。
export const RadiographyVw = ({
                              orc,
                              rep,
                              title = "射线检测报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const [upperNode] = useThreeColumnSubr({config: config射线测仪, orc, parentOrc: parOrc, slash: true})
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    const render=()=><>
        <FlexibleTable id={'RadoInstrument_'+redId} columnWidths={ ["11.2%","24%","9%","18%","10.9%","%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"RadoInstrument"} subrid={subrid} redId={redId}>
                    {upperNode}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'RadoWorkpiece_'+redId} columnWidths={ ["15.3%","%","9%","12%","12%","9%","21%"] } className="text-sm border-collapse">
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoWorkpiece?original=1${apds}${apdr}#RadoWorkpiece_${redId}`}>
                    { config射线件1.map(([title,name,_]: any, i:number)=> {
                        return <TableRow key={i}>
                                <CCell>{title}</CCell>
                                {Array.from({length: 4}).map(( _,  w:number) => {
                                    return <CCell key={w+1} colSpan={(w===1 ||w===2)? 2:1}>{orc?.工件表?.[w]?.[name]??'／'}</CCell>;
                                }) }
                            </TableRow>;
                    }) }
                    <TableRow>
                        { Items射线源.map(({t,n,u}, i:number)=> {
                            return <React.Fragment key={i}>
                                <CCell>{t}</CCell><CCellUnit colSpan={1===i? 2:1} unit={u}>{orc?.[n]??'／'}</CCellUnit>
                            </React.Fragment>;
                        })}
                    </TableRow>
                    { config射线件2.map(([title,name,_]: any, i:number)=> {
                        return <TableRow key={i}>
                            <CCell><span className={cn(i===3? "text-xs" : "")}>{title}</span></CCell>
                            {Array.from({length: 4}).map(( _,  w:number) => {
                                return <CCell key={w+1} colSpan={(w===1 ||w===2)? 2:1}>{orc?.工件表?.[w]?.[name]??'／'}</CCell>;
                            }) }
                        </TableRow>;
                    }) }
                </JumpTab>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["%"]}>
            <TableBody>
                <TableRow id={'RadoDiagram_'+redId}  className="border border-gray-700">
                    <TableCell  className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"RadoDiagram"} subrid={subrid} redId={redId}>
                            <div className="text-sm">检测部位（布片示意图）：&nbsp;
                                {orc?.点图说明 && <span className="whitespace-pre-wrap">{orc.点图说明 || "／"}</span>}
                                {!(orc?._FILE_S部位?.length > 0) && !orc?.点图说明 && (
                                    <span className="block m-4 text-xl text-center">空的，进入上传吧</span>
                                )}
                            </div>
                        </RepLink>
                        {orc?._FILE_S部位?.map(({ name, url }: any, i: number) => {
                            return (
                                <div key={i} className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">
                                    {i > 0 && <hr className="my-[1px] border-blue-900"/>}
                                    <JumpTab
                                        key={i}
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
                                    >
                                        <div className="flex justify-around items-center my-0.5">
                                            {url && (
                                                <ImageComponent
                                                    src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${url}`}
                                                    alt={url || "图片"}
                                                    className={cn(
                                                        "w-auto h-auto",
                                                        i > 0 ? "print:max-h-[calc(100vh-2.5rem)]" : "print:max-h-[calc(100vh-5.9rem)]",
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </JumpTab>
                                </div>
                            )
                        })}
                    </TableCell>
                </TableRow>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'RadoEvaluation_'+redId} columnWidths={ ["11.2%","16%","17%","19.6%","9%","%"] } className="text-sm border-collapse">
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoEvaluation?original=1${apds}${apdr}#RadoEvaluation_${redId}`}>
                    <TableRow><CCell colSpan={6}><span className={"text-xs"}>射 线 检 测 底 片 评 定 表</span></CCell></TableRow>
                    <TableRow><CCell>底片编号</CCell><CCell className={"text-xs"}>一次透照长度(mm)</CCell>
                        <CCell>缺陷位置</CCell><CCell>缺陷性质及尺寸(mm)</CCell>
                        <CCell>评定级别</CCell><CCell>备 注</CCell></TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoEvaluation?original=1${apds}${apdr}#RadoEvaluation_${redId}`}>
                    {orc?.评定表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            {config评定.map(([_1, tag, _3], k: number) => {
                                return (
                                    <CCell key={k} className="break-all text-sm">
                                        {o?.[tag] || "／"}
                                    </CCell>
                                )
                            })}
                        </TableRow>
                    ))}
                    {!(orc?.评定表?.length > 0)  && (
                        <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                    )}
                </JumpTab>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'RadoConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"RadoConclusion"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <p>检测结果：</p>
                            <span className="block indent-[2rem] text-left">{orc.结果 || '／'}</span>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <CfootMensLine cap="检测" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
        />
    </>

  return (
    <PrintReserveLeast reserve="6rem"
        title={
            <>
                <TComponent className="text-2xl text-center mt-4 mb-1">
                    {title}
                    <span className="text-base">{apxid}</span>
                </TComponent>
            </>
    }>
        {unfold ? render() :
            <CollapseFx printMode={printMode} subrid={subrid}>
                {render()}
            </CollapseFx>
        }
    </PrintReserveLeast>
    )
}

const 透照技术选=['单胶片' ];
const 源种类选=['X射线' ];
const 增感方式选=['铅箔' ];
const 检测技术等级=['AB级' ];
const render技等级={
    view:(orc:any)=>{
        return <span className={"text-xs"}>检测技术等级</span>
    },
    t: '检测技术等级',
};
const config射线测仪 = [
    [['设备名称', '_$设备名称'], ['设备编号', {n:'设备编',t:'B'}] ],
    [['焊接方法', '焊接法'], ['坡口型式', '坡口型'] ],
    [['检测时机',{n:'检时机',l:['外观检查后']}], ['热处理状态', '热处理']],
    [['检测标准', {n:'检标准',l:['NB/T47013.2-2015']}], ['透照技术', {n:'透照',t:'l',l:透照技术选}]],
    [['源种类', {n:'源种',t:'l',l:源种类选}], ['增感方式', {n:'增感',t:'l',l:增感方式选}]],
    [['仪器型号', '仪器型'], ['仪器编号', '仪器号'], ['焦点尺寸', '焦尺']],
    [['胶片牌号', '片牌'], ['胶片类别', '片类'], ['胶片规格', '片规']],
    [[render技等级, {n:'技等级',t:'l',l:检测技术等级} ], ['底片黑度', '底黑'], ['像质计型号', '像质型']],
    [['冲洗方式', {n:'冲洗式',l:['手动']}], ['显影温度', '影温'], ['显影时间', '影时']],
];
export const config射线仪概 = three2TwoColumn(config射线测仪);

const 合格级别选=['Ⅰ级' ];
const 透照方式选=['双壁单影'];
const config射线工件=[ ['工件编号','n',90],
    ['规格尺寸(mm)','g',90], ['材 质','c',60],
    ['透照方式','T',70,{l:透照方式选}], ['焦距:F(mm)','F',70],
    ['曝光时间(min)','b',60], ['像质指数','X',50],
    ['焊缝长度(mm)','L',60], ['一次透照长度(mm)','Y',80],
    ['焊口总数量(个)','K',70], ['检测数量(个)','s',60],
    ['拍片数量(张)','p',70], ['合格级别','C',60,{l:合格级别选}],
    ['要求检测比例','d',60,{u:'%'}], ['实际检测比例','A',60,{u:'%'}]
] as Each_ZdSetting[];
const config射线件1= config射线工件.slice(0,5);
const config射线件2= config射线工件.slice(5);

interface EvaluationProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}

export const RadoWorkpiece = ({
                                   children,
                                   show,
                                   label,
                                   rep,
                                   config = config射线工件,
                                   subrid,
                                   redId,modType
                               }: OptcEvaluationProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["工件表"] = z.array(z.object(schemaTab))
        schemaFields['管压'] = z.string().optional()
        schemaFields['源活'] = z.string().optional()
        schemaFields.管电 = z.string().optional()
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "工件表", config)
        fields['管压'] = subStore?.['管压'] ?? ""
        fields['源活'] = subStore?.['源活'] ?? ""
        fields.管电 = subStore?.管电 ?? ""
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        return [{ name: "工件表", itemTemplate:{} }]
    }, [])
    const headview = <h5>{label}：</h5>
    const tailview = <strong className="block text-center">最多只能录入4个工件或4行记录</strong>
    const onConfirm = useCallback((form: UseFormReturn<any, any, any>) => handleConfirm(), [])
    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType: modType,
    })
    const [nestRenderer] = useTableEdit({
        form,
        arrayControls,
        config: config,
        table: "工件表",
        onConfirm,
        externalData: subStore,
        defFixedLay: true,
        headview,
        pageSize: 4,
        pageSizeOptions:[4],
        tailview
    })
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardContent className="px-1">
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                            <FormField name={`管压`} control={form.control}
                                       render={({ field }) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid col-span-1">
                                               <FormLabel className="select-text">管电压:</FormLabel>
                                               <FormControl className="w-full">
                                                   <InputDatalist datalist={["180/190"]} unit="KV" {...field} autoComplete="on"/>
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                  )}/>
                            <FormField name={"源活"} control={form.control}
                                render={({ field }) => (
                                    <FormItem className="pt-2 w-full break-inside-avoid col-span-1">
                                        <FormLabel className="select-text">源活度:</FormLabel>
                                        <FormControl className="w-full">
                                            <SuffixInput  unit={"Ci"}  {...field}  />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            <FormField name={"管电"} control={form.control}
                                       render={({ field }) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid col-span-1">
                                               <FormLabel className="select-text">管电流:</FormLabel>
                                               <FormControl className="w-full">
                                                   <SuffixInput unit="mA"  {...field}  />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                )}/>
                        </div>
                    </CardContent>
                </Card>
                <Card className="py-1 gap-1">
                    <CardContent className="px-1">{nestRenderer}</CardContent>
                </Card>
                {children}
            </>
        )
    }, [form, children, nestRenderer])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

const config评定=[['底片编号','n',60], ['一次透照长度(mm)','l',80],
    ['缺陷位置','f',65, {l:['0位','70-80mm']}],
    ['缺陷性质及尺寸(mm)','s',130, {l:['未焊透/整条','圆形缺陷/5点','未焊透/20mm']}],
    ['评定级别','C',55, {l:['Ⅳ级','Ⅲ级','Ⅱ级','Ⅰ级']}],
    ['备 注','m',95, {l:['H≈0.6','H≈1.0','位置受限','Ф159×4.5H≈0.6']}]
] as Each_ZdSetting[];

export const RadoEvaluation = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config评定,
                                    subrid,
                                    redId,modType
                                }: EvaluationProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["评定表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "评定表", config)
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        return [{ name: "评定表", itemTemplate:{} }]
    }, [])
    const headview = <h5>{label}：</h5>
    const onConfirm = useCallback((form: UseFormReturn<any, any, any>) => handleConfirm(), [])
    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType: modType,
    })
    const [nestRenderer] = useTableEdit({
        form,
        arrayControls,
        config: config,
        table: "评定表",
        onConfirm,
        externalData: subStore,
        defFixedLay: true,
        headview,
        pageSize: 20,
    })
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardContent className="px-1">{nestRenderer}</CardContent>
                </Card>
                {children}
            </>
        )
    }, [form, children, nestRenderer])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

export const cat_Rado=[
    {title: "射线检测-工件编号", url: "#RadoWorkpiece"},
    {title: "射线检测底片评定表", url: "#RadoEvaluation"},
];

export const rado示说选=[`1、该装置管道焊接接头射线检测抽查部位见管道单线图所示。
2、备注中H为缺陷自身高度。`,
];

export const rado结果选=[`该装置各管道焊接接头经射线检测抽查，发现存在未焊透和气孔等缺陷，和 2020 年 3 月（报告编号：
SM2020FDC00004）定期检验相比未见异常。根据TSG D7005-2018《压力管道定期检验规则－工业管道》第
3.2.6.2（4）条和3.2.4条进行评级，安全状况等级评为 3 级。`,
];

