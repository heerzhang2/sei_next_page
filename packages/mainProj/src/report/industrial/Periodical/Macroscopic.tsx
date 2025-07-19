"use client"
import React, {useCallback} from "react"
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {type InternalItemProps, RepLink} from "@/report/common/base";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import { useFormFramework} from "@/report/hook/useFormFramework";
import {FootMensLine, } from "@/report/common/view";
import {Card, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage, Separator, Textarea} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, InputDatalist} from "@/components/chub";
import {OmniPref, useOmnipotentPref, useOmniPrefTitle} from "@/report/hook/useOmnipotentPref";
import {cn} from "@/lib/utils";

const setConfig宏观 =(orc:any,edit:boolean)=> [
    ['道布置', [{t: '结构检验', s: 5},], '管道布置',],
    ['支吊架', [{}], '支吊架',],
    ['膨胀节', [{}], '膨胀节',],
    ['开孔补', [{}],'开孔补强',],
    ['排放装', [{}], '排放装置设置',],
    ['焊口错', [{t: '几何尺寸检验', s: 3},], '焊缝对口错边量',],
    ['咬边', [{}], '咬边',],
    ['焊余高', [{}], '焊缝余高' ],
    ['道标志', [{t: '外观检验', s: 6},], '管道标志',],
    ['电弧灼', [{}], '管道组成件及其焊缝的腐蚀、裂纹、泄漏、鼓包、变形、机械接触损伤、过热、电弧灼伤' ],
    ['承件变', [{}],'管道支承件变形、开裂' ],
    ['排堵塞', [{}],'排放（疏水、排污）装置的堵塞、腐蚀、沉积物',],
    ['腐层破', [{}],'防腐层的破损、剥落' ],
    ['热层腐', [{}],'隔热层破损、脱落、潮湿以及隔热层下的腐蚀和裂纹等' ],
    ['宏其它', [{t: '其他', },], <span className={cn(edit? "text-base" : "text-sm")}>{orc?.宏其它?.T ??'／'}</span> ],
] as OmniPref[];

const 检验结果选=['符合要求','基本符合要求','不符合要求'];
export const 等级评定选=['1级','2级','3级','4级'];
interface Props extends InternalItemProps {
    config?: (orc:any,edit:boolean)=>OmniPref[]
}
export const itemA宏观检验: string[] = ['宏观结果'];
const itemE检验项 =setConfig宏观(undefined,true);
itemE检验项.forEach(([name, ], i: number) => {
    itemA宏观检验.push(name);
});

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
    //useFormFramework实际上schemaFields可以不用定义:无校验了，且也无法重置！
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        schemaTab['T'] = z.string().optional()
        schemaTab['r'] = z.string().optional()
        schemaTab['m'] = z.string().optional()
        schemaTab['c'] = z.string().optional()
        configN.forEach(([name, ]) => {
            schemaFields[name]= z.object(schemaTab)
        })
        schemaFields.宏观结果= z.string().optional()
        return z.object(schemaFields)
    }, [configN])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        configN.forEach(([name, _pf, _it, _, _5]) => {
            fields[name] = storage[name] ?? {}
        })
        fields.宏观结果= storage.宏观结果 ?? "";
        return fields
    }, [storage,configN])
    const arrayFields = React.useMemo(() => {
        const itemTemplate = {} as any
        return [ ]
    }, [])
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
                        <Separator className="my-2"/>
                        <FormField
                            key={`宏观结果`}
                            control={form.control}
                            name={`宏观结果`}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel className="select-text block">
                                        <span className="text-base">检验结果：</span>表中检验项目备注无法说明清楚的，可在本栏中进一步将缺陷（问题）情况描述清楚
                                    </FormLabel>
                                    <FormControl  className="w-full">
                                        <Textarea rows={2}  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
    return <>
        <CCell>{orc?.[name]?.r ?? '／'}</CCell>
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
    const configN = React.useMemo(() => {
        return config(orc,false)
    }, [orc])
    const [render ]=useOmnipotentPref({orc, config: configN, tag: 'Macroscopic', tailRender, pcols:1, noNo:false, unitCel:false});
    return <PrintReserveLeast reserve="6rem"
            title={<>
                    <h2 id='Macroscopic' className="block text-center leading-[0.9] text-3xl font-normal mt-4">工业管道宏观检验报告</h2>
                    <div className="flex justify-between text-sm">
                        <span>单位内部编号：{orc.单位内部编号}</span>
                        <span className="@3xl:mr-4"></span>
                    </div>
                </>}
    >
        <FlexibleTable  columnWidths={["3.5%", "6%", "29%", "13%", "%", "8%"]} className="text-sm border-collapse">
            <TableHeader>
                <TableRow>
                    <CCell className="text-xs leading-[1] p-0">序号</CCell>
                    <CCell colSpan={2}>检 验 项 目</CCell><CCell>检验结果</CCell><CCell>备注</CCell>
                    <CCell className="text-xs leading-[1] p-0">等级评定</CCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={'Macroscopic'}>
                    {render}
                    <TableRow>
                        <TableCell colSpan={6} className="border border-gray-700">
                            结果：表中检验项目备注无法说明清楚的，可在本栏中进一步将缺陷（问题）情况描述清楚。<br/>
                            <div className="min-h-[4rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem] overflow-auto">
                                {orc?.宏观结果 || '／'}
                            </div>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FootMensLine />
    </PrintReserveLeast>
}
