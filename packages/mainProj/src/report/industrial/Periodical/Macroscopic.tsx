"use client"
import React, {useCallback} from "react"
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {ReportFirstPageHeadCyCert} from "@/report/common/head";
import {JumpTab} from "@/report/common/JumpTab";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";
import {config证书概要} from "@/report/power/boilInstall/orcBase";
import {type InternalItemProps, RepLink} from "@/report/common/base";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {CollapseFx} from "@/report/common/collapse";
import {Each_ZdSetting, useTableEdit} from "@/report/hook/use-table-edit";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {initFormTable, useFormFramework} from "@/report/hook/useFormFramework";
import {tail测仪器} from "@/report/common/view";
import type {UseFormReturn} from "react-hook-form";
import {Card, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, InputDatalist} from "@/components/chub";
import {config部位汇总} from "@/report/cm/thickm/ThickMs1";
import {itemA应变应力} from "@/report/recreation/waterJj/StrainStress";
import {OmniPref, useOmnipotentPref, useOmniPrefTitle} from "@/report/hook/useOmnipotentPref";
import {cn} from "@/lib/utils";

const setConfig宏观 =(orc:any,edit:boolean)=> [
    ['道布置', [{t: '结构检验', s: 2},], '管道布置',],
    ['支吊架', [{}], '支吊架',],

    ['宏其它', [{t: '其他', },], <span className={cn(edit? "text-base" : "text-sm")}>{orc?.宏其它?.T??''}</span> ],
] as OmniPref[];
export const item宏观检验o = [['道布置', {t: '管道布置', pr: '结构检验', span: 5},],
    ['支吊架', {t: '支吊架',},],
    ['膨胀节', {t: '膨胀节',},],
    ['开孔补', {t: '开孔补强',},],
    ['排放装', {t: '排放装置设置',},],
    ['焊口错', {t: '焊缝对口错边量', pr: '几何尺寸检验', span: 3}],
    ['咬边', {t: '咬边',}],
    ['焊余高', {t: '焊缝余高'}],
    ['道标志', {t: '管道标志', pr: '外观检验', span: 6}],
    ['电弧灼', {t: '管道组成件及其焊缝的腐蚀、裂纹、泄漏、鼓包、变形、机械接触损伤、过热、电弧灼伤'}],
    ['承件变', {t: '管道支承件变形、开裂'}],
    ['排堵塞', {t: '排放（疏水、排污）装置的堵塞、腐蚀、沉积物'}],
    ['腐层破', {t: '防腐层的破损、剥落'}],
    ['热层腐', {t: '隔热层破损、脱落、潮湿以及隔热层下的腐蚀和裂纹等'}],
    ['宏其他', {pr: '其他', span: 1}, true]];

const 检验结果选=['符合要求','基本符合要求','不符合要求'];
export const 等级评定选=['1级','2级','3级','4级'];
interface Props extends InternalItemProps {
    config?: (orc:any,edit:boolean)=>OmniPref[]
}

export const Macroscopic = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = setConfig宏观,
                                }: Props) => {
    const { storage, } = useStorage()
    const configN = React.useMemo(() => {
        return config(storage,true)
    }, [storage,config])
    //useFormFramework实际上schemaFields可以不用定义:无校验了
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        // config.forEach(([t, field, s, o, park]) => {
        //     schemaTab[field] = z.string().optional()
        // })
        schemaTab['T'] = z.string().optional()
        schemaTab['m'] = z.string().optional()
        schemaFields['宏其它']= z.object(schemaTab)

        // schemaFields["部位表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        configN.forEach(([name, _pf, _it, _, _5]) => {
            fields[name] = storage[name] ?? {}
        })
        // fields['宏其它'] = storage['宏其它'] ?? {}
        return fields
    }, [storage,configN])
    const arrayFields = React.useMemo(() => {
        const itemTemplate = {} as any
        return [ ]
    }, [])

    const headview = <h5>{label}：</h5>
    const tailview = <>{tail测仪器}</>
    const onConfirm = useCallback((form: UseFormReturn<any, any, any>) => handleConfirm(), [])
    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep,
    })
    const titNode=useOmniPrefTitle({config:configN,});
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardContent className="px-1">
                        {configN.map(([name, _pf, _it, unit,_5], i: number) => {
                            return <div key={i} className="mb-2">
                                {titNode[i]}&nbsp;
                                <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                                    {name==='宏其它' && <FormField control={form.control} name={"宏其它.T"}
                                                                   render={({ field }) => (
                                                                       <FormItem className="pt-2 w-full break-inside-avoid">
                                                                           <FormLabel className="select-text">检验项目的附加叙述标题</FormLabel>
                                                                           <FormControl className="w-full mr-1">
                                                                               <BlobInputList rows={2}  {...field}  />
                                                                           </FormControl>
                                                                           <FormMessage />
                                                                       </FormItem>
                                                                   )}
                                    />}
                                    <FormField
                                        key={`${name}.r`}
                                        control={form.control}
                                        name={`${name}.r`}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                <FormLabel className="select-text">检验结果:</FormLabel>
                                                <FormControl className="w-full">
                                                    <InputDatalist  datalist={检验结果选}  {...field}  />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        key={`${name}.m`}
                                        control={form.control}
                                        name={`${name}.m`}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                                <FormLabel className="select-text">备注:</FormLabel>
                                                <FormControl  className="w-full">
                                                    <Textarea rows={2}  {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        key={`${name}.c`}
                                        control={form.control}
                                        name={`${name}.c`}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                <FormLabel className="select-text">等级评定:</FormLabel>
                                                <FormControl className="w-full">
                                                    <InputDatalist  datalist={等级评定选}  {...field}  />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        })}
                    </CardContent>
                </Card>
                {children}
            </>
        )
    }, [titNode, children])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

const tailRender = (orc: any, name: string, i: number, unit: any) => {
    const nneedbig = orc?.[name]?.r?.length >= 3 || (!orc?.[name]?.r);
    return <>
        <CCell><span className={cn(nneedbig ? "text-base" : "",)}>
                     {orc?.[name]?.r ?? '／'}</span></CCell>
        <CCell>{orc?.[name]?.m ?? '／'}</CCell>
        <CCell>{orc?.[name]?.c ?? '／'}</CCell>
    </>;
}
interface ViewProps {
    orc: any
    rep: any
    children?: React.ReactNode
    config?: (orc:any,edit:boolean)=>OmniPref[]
}

export const MacroscopicVw = ({orc, rep, children,config=setConfig宏观 }: ViewProps) => {
    // const renderUpper=usePrefixDataTable({config: config证书概要, orc, rep, slash:true});
    const configN = React.useMemo(() => {
        return config(orc,false)
    }, [orc])
    const [renderUpper ]=useOmnipotentPref({orc, config: configN, tag: 'XmbIspItms', tailRender, pcols:1, noNo:false, unitCel:false});

    return  <PrintReserveLeast
        reserve="6rem"
        title={
            <>
                <h2 className="block text-center leading-[0.9] text-3xl font-normal">特种MacroscopicVw证书</h2>
                <span className="text-center mb-0 block text-xl">（锅炉）</span>
                <div>
                    <div className="flex justify-between">
                        &nbsp;
                        <span className="flex flex-row-reverse mr-8 text-base">证书编号：{rep.isp?.no}</span>
                    </div>

                </div>
                <span className="block text-center text-xs">FJB/JK 1050-0-2022</span>
                <div className="flex justify-between">
                    &nbsp;
                    <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                </div>
            </>
        }
    >
        <FlexibleTable  columnWidths={["3.5%", "6%", "20%", "13%", "%", "8%"]} className="text-sm border-collapse">
            <TableHeader>
                <TableRow>
                    <CCell className="text-xs">序号</CCell>
                    <CCell colSpan={2}>检 验 项 目</CCell><CCell>检验结果</CCell><CCell>备注</CCell><CCell>等级评定</CCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={'Macroscopic'}>
                    {renderUpper}
                </RepLink>
                <RepLink rep={rep} tag='CertMemo'>
                    <TableRow>
                        <TableCell colSpan={6} className="border border-gray-700">
                            说ee明：<br/>
                            <div className="min-h-[6rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem] overflow-auto">
                                {orc?.宏其它?.T || '／'}
                            </div>
                        </TableCell>
                    </TableRow>
                </RepLink>
                <TableRow>
                    <TableCell colSpan={6} className="border border-gray-700 border-collapse !p-0">
                        <FlexibleTable className="border-none text-sm w-full h-full border-collapse" columnWidths={["24%", "41%", "7%", "%"]}>
                            <TableBody>
                                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Conclusion#Conclusion`}>
                                    {(orc?.检验结论 === '符合要求' || orc?.检验结论 === '基本符合要求') && <TableRow className="border-none">
                                        <TableCell className="text-indent-[2rem]" colSpan={4}>
                                            按照《中华人民共和国特种设备安全法》、《特种设备安全监察条例》的规定，该锅炉的安装经我机构监督检验，
                                            安全性能符合《锅炉安全技术规程》的要求，特发此证书。
                                        </TableCell>
                                    </TableRow>
                                    }
                                    <TableRow className="border-none">
                                        <TableCell className="text-sm text-right">监 检：</TableCell>
                                        <TableCell>
                                            {orc.检验人IDs}
                                        </TableCell>
                                        <TableCell className="text-sm">日期：</TableCell>
                                        <TableCell className="h-12">
                                            {orc?.检验日期 ?? '／'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none">
                                        <TableCell className="text-sm text-right">审 核：</TableCell>
                                        <TableCell>
                                        </TableCell>
                                        <TableCell className="text-sm">日期：</TableCell>
                                        <TableCell className="h-10">
                                            2025-06-19
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none">
                                        <TableCell className="text-sm text-right">批 准：</TableCell>
                                        <TableCell>
                                        </TableCell>
                                        <TableCell className="text-sm">日期：</TableCell>
                                        <TableCell className="h-10">
                                            2025-06-19
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none">
                                        <TableCell className="text-sm text-right">监检机构：</TableCell>
                                        <TableCell colSpan={2}>
                                            {rep?.isp?.ispu?.name}
                                        </TableCell>
                                        <TableCell className="h-10">
                                            （监督检验机构检验专用章）
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none">
                                        <TableCell className="text-sx text-right">监督检验机构核准证号：</TableCell>
                                        <TableCell colSpan={2}>
                                            {rep?.isp?.ispu?.agency?.apno}
                                        </TableCell>
                                        <TableCell className="h-10">
                                            2025-06-19
                                        </TableCell>
                                    </TableRow>
                                </JumpTab>
                            </TableBody>
                        </FlexibleTable>
                    </TableCell>
                </TableRow>
            </TableBody>
        </FlexibleTable>
    </PrintReserveLeast>
}

