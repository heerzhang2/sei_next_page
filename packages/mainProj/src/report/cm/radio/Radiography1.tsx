"use client"
import * as React from "react"
import {CollapsibleFormSection, InputDatalist, SuffixInput,} from "@/components/chub"
import {Card, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage, Separator,} from "@/components/ui"
import { initFormTable, useFormFramework, } from "@/report/hook/useFormFramework"
import { type InternalItemProps, RepLink, type RepVwProps } from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import {FootMensLine,} from "@/report/common/view"
import {ImageComponent} from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import {z} from "zod"
import type { UseFormReturn } from "react-hook-form"
import {useThreeColumnSubr} from "@/report/hook/useThreeColumnSubr";
import {three2TwoColumn} from "@/report/common/survey";

/*
{Array.from({ length: 4 - data.length }).map((_, idx) => (
    <td key={`empty-${field.key}-${idx}`} className="py-3 px-4 bg-gray-50"> / </td>
))}
* */
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
        <FlexibleTable id={'RadoInstrument_'+redId} columnWidths={ JSON.parse(parOrc?._tblFixed??'[]') } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"RadoInstrument"} subrid={subrid} redId={redId}>
                    {upperNode}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'RadoWorkpiece_'+redId} columnWidths={ ["11.2%","25%","9%","17%","10.9%","%"] } className="text-sm border-collapse">
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoWorkpiece?original=1${apds}${apdr}#RadoWorkpiece_${redId}`}>
                    <TableRow>
                        <CCell rowSpan={2}>序号</CCell><CCell rowSpan={2}>检测部位</CCell><CCell rowSpan={2}>试件规格</CCell>
                        <CCell colSpan={2}>设计材质</CCell>
                        <CCell rowSpan={2}>检查数量</CCell><CCell rowSpan={2}>分析结果</CCell>
                    </TableRow>
                    <TableRow><CCell>母材</CCell><CCell>焊材</CCell></TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoWorkpiece?original=1${apds}${apdr}#RadoWorkpiece_${redId}`}>
                    { config射线件1.map(([orgDesc,nameObj,cb]: any, i:number)=> {
                        const {n: name} = nameObj as NameFiledAs;
                        const desc = typeof orgDesc === 'string' ? orgDesc : orgDesc?.view;         //这个view 和 text分别针对是报告和编辑器的标题
                        return <React.Fragment key={i}>
                            <TableRow key={i}>
                                <CCell key={0}>{desc}</CCell>
                                {Array.from({length: 4}).map(( _,  w:number) => {
                                    return <CCell key={w+1} colSpan={(w===1 ||w===2)? 2:1}>{orc?.工件表?.[w]?.[name]??'／'}</CCell>;
                                }) }
                            </TableRow>
                        </React.Fragment>;
                    }) }


                    {orc?.工件表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            {config射线工件.map(([_1, tag, _3], k: number) => {
                                return (
                                    <CCell key={k} className="break-all text-sm">
                                        {o?.[tag] || "／"}
                                    </CCell>
                                )
                            })}
                        </TableRow>
                    ))}
                    {!(orc?.工件表?.length > 0)  && (
                        <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                    )}
                </JumpTab>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'RadoEvaluation_'+redId} columnWidths={ ["11.2%","25%","9%","17%","10.9%","%"] } className="text-sm border-collapse">
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoEvaluation?original=1${apds}${apdr}#RadoEvaluation_${redId}`}>
                    <TableRow>
                        <CCell rowSpan={2}>序号</CCell><CCell rowSpan={2}>检测部位</CCell><CCell rowSpan={2}>试件规格</CCell>
                        <CCell colSpan={2}>设计材质</CCell>
                        <CCell rowSpan={2}>检查数量</CCell><CCell rowSpan={2}>分析结果</CCell>
                    </TableRow>
                    <TableRow><CCell>母材</CCell><CCell>焊材</CCell></TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/RadoEvaluation?original=1${apds}${apdr}#RadoEvaluation_${redId}`}>
                    {orc?.部位表?.map((o: any, i: React.Key) => (
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
                    {!(orc?.部位表?.length > 0)  && (
                        <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                    )}
                </JumpTab>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["%"]}>
            <TableBody>
                <TableRow id={'RadoDiagram_'+redId}  className="border border-gray-700">
                    <TableCell  className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"RadoDiagram"} subrid={subrid} redId={redId}>
                            <div className="text-sm">测点位置示意图：&nbsp;
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
        <FootMensLine  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
        />
    </>

  return (
    <PrintReserveLeast reserve="6rem"
        title={
            <>
                <TComponent className="text-2xl text-center mt-4">
                    {title}
                    <span className="text-base">{apxid}</span>
                </TComponent>
                <span className="block text-center text-xs">FJB/JK 1047-0-2018</span>
                <div className="flex justify-between">
                    <span className="text-sm">单位内部编号：{orc.单位内部编号}</span>
                    <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                </div>
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
/**固定行数的表格， 报告上面可能像特性表那样地行列做倒置。 表格不能增加删除的，各行排序不能变的。表的字段数多，表的行数少而固定的。
 * 类比改款的配置方式;   '规格尺寸(mm)' ；尽量不用类型t:'n'宽度编辑框不能用w来控制。
 * */
export const model工件 = [
    ['工件编号', {n:'n',w:10} ], [{view:'规格尺寸(mm)',text:'规格尺寸'}, {n:'g',w:22,u:'mm'} ], ['材 质', {n:'c',w:8} ],
    ['透照方式', {n:'tz',w:12,t:'l',l:透照方式选} ], [{view:'焦距:F(mm)',text:'焦距:F'}, {n:'F',w:13,u:'mm'} ],
    //中间被通用的固定字段”管电压：“分开了：
    [{view:'曝光时间(min)',text:'曝光时间'}, {n:'b', w:1,u:'min'} ], ['像质指数', {n:'X',w:5} ],
    [{view:'焊缝长度(mm)',text:'焊缝长度'}, {n:'L', w:4,u:'mm'} ], [{view:'一次透照长度(mm)',text:'一次透照长度'}, {n:'Y', w:8,u:'mm'} ],
    [{view:'焊口总数量(个)',text:'焊口总数量'}, {n:'K', w:2,u:'个'} ], [{view:'检测数量(个)',text:'检测数量'}, {n:'T', w:1,u:'个'} ],
    [{view:'拍片数量(张)',text:'拍片数量'}, {n:'s', w:1,u:'张'} ], ['合格级别', {n:'C',w:5,t:'l',l:合格级别选} ],
    ['要求检测比例', {n:'P', w:1,u:'%'} ], ['实际检测比例', {n:'p', w:2,u:'%'} ]
];
const config射线工件=[['工件编号','n',90],
    ['规格尺寸(mm)','g',90], ['材 质','c',60],
    ['透照方式','T',70,{l:透照方式选}], ['焦距:F(mm)','F',70],
    ['曝光时间(min)','b',60], ['像质指数','X',50],
    ['焊缝长度(mm)','L',60], ['一次透照长度(mm)','Y',80],
    ['焊口总数量(个)','K',70], ['检测数量(个)','s',60],
    ['拍片数量(张)','p',70], ['合格级别','C',60,{l:合格级别选}],
    ['要求检测比例','d',60,{u:'%'}], ['实际检测比例','A',60,{u:'%'}]
] as Each_ZdSetting[];
const config射线件1= model工件.slice(0,5);
const config射线件2= model工件.slice(5);

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

const 焊材选=['20','不明'];
export const config评定=[['序号','n',80],['检测部位','B',180],['试件规格','G',90],
    ['母材','c',70,{t:'l',l:焊材选}],
    ['焊材','h',70,{t:'l',l:焊材选}], ['检查数量','s',55],
    ['分析结果','r',90, {t:'l',l:['符合要求']} ]
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
        schemaFields["部位表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "部位表", config)
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        return [{ name: "部位表", itemTemplate:{} }]
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
        table: "部位表",
        onConfirm,
        externalData: subStore,
        defFixedLay: true,
        headview,
        pageSize: 10,
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
    {title: "射线检测测点位置图", url: "#RadoDiagram"},
    {title: "射线检测分析结果表", url: "#RadoEvaluation"},
];

export const rado示说选=['见光谱检测附图。',
];
