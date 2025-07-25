"use client"
import React, {} from "react"
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow} from "@/components/flexible-table";
import {type InternalItemProps, RepLink} from "@/report/common/base";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import { useFormFramework} from "@/report/hook/useFormFramework";
import {Card, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea} from "@/components/ui";
import {
    BlobInputList,
    ClearableSelect,
    CollapsibleFormSection,
    InputDatalist, InputSimplelist
} from "@/components/chub";
import {OmniPref, useOmnipotentPref, useOmniPrefTitle} from "@/report/hook/useOmnipotentPref";
import {customPrefI} from "@/report/common/pressure";
import {clcOptions} from "@/report/common/ActionMapItem";
import {FormHybridSelect, FormSwitch} from "@/components/shub";

const setConfig结论 =(orc:any,edit:boolean)=> [
    ['资料审查', [{}], '资料审查'],
    ['宏观检验', [{}], '宏观检验'],
    ['壁厚测定', [{}], '壁厚测定'],
    ['强度校核', [{}],'耐压强度校核'],
    ['磁粉检测', [{}], '磁粉检测'],
    ['渗透检测', [{}], '渗透检测'],
    ['射线检测', [{}], '射线检测' ],
    ['超声检测', [{}],'超声波检测'],
    ['光谱分析', [{}],'光谱分析',],
    ['硬度测定', [{}],'硬度测定' ],
    ['金相分析', [{}],'金相分析' ],
    ['泄漏试验', [{}],'泄漏试验'],
    ['安附件检', [{}],'安全附件与仪表检验'],
    ['耐压试验', [{}],'耐压试验'],
    ...customPrefI('结论它', 7, orc, edit),
] as OmniPref[];

const specificationOptions = ["DN50 PN16", "DN80 PN25", "基本符合要求", "DN150 PN25",
    `sdfsdf符合要dsf
    会讲故事的方法关键时刻的方法
    士大夫地方`,
    "DN200 PN16"]
const 检验结果选=['符合要求','基本符合要求','不符合要求'];
export const 等级评定选=['1级','2级','3级','4级',
    "DN50 PN16", "DN80 PN25", "基本符合要求", "DN150 PN25",
    `sdf的方法sdf符合要dsf本符sdf符合要dsf本合要
    会讲sdf符合要dsf本故事的bbbb方法本333333符合要关键时刻9945354 345435的方法sdf符合要dsf本
    士大夫sdf符合要dsf本的方法地方`,"基本符合0要求", "DN150 P0N25","基本8符合要求", "DN1580 PN25",
    "DN200 PN16"
];
interface Props extends InternalItemProps {
    config?: (orc:any,edit:boolean)=>OmniPref[]
}
export const itemA结论附: string[] = ['宏观结果'];
const itemE检验项 =setConfig结论(undefined,true);
itemE检验项.forEach(([name, ], i: number) => {
    itemA结论附.push(name);
});
//【避免交叉耦合】不用再和"Projects": []表去混合做存储了。用单项的独立存储可直接定位更好。从旧的ProjectList分离出来：
export const ConcAppendix = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = setConfig结论,
                                }: Props) => {
    const { storage, } = useStorage()
    const configN = React.useMemo(() => {
        return config(storage,true)
    }, [storage,config])
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
        return z.object(schemaFields)
    }, [configN])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        configN.forEach(([name, _pf, _it, _, _5]) => {
            fields[name] = storage[name] ?? {}
        })
        return fields
    }, [storage,configN])
    const { render, form, } = useFormFramework({schema, defaultValues, rep,})
    const titNode=useOmniPrefTitle({config:configN,});
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardContent className="px-1">
                        {configN.map(([name, _pf, _it, unit,_5], i: number) => {
                            const canAdd=name.startsWith('结论它') && name!=="结论它1"? (!!storage[configN[i - 1]?.[0]]?.T) :true;
                            if(!canAdd)  return null;
                            return <div key={i} className="mb-2">
                                {titNode[i]}&nbsp;
                                <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                                    {name.startsWith('结论它') && <FormField control={form.control} name={`${name}.T`}
                                               render={({ field }) => (
                                                   <FormItem className="pt-2 w-full break-inside-avoid">
                                                       <FormLabel className="select-text">检验项目的标题</FormLabel>
                                                       <FormControl className="w-full mr-1">
                                                           <BlobInputList rows={2}  {...field} />
                                                       </FormControl>
                                                       <FormMessage />
                                                   </FormItem>
                                               )}
                                    />}
                                    <FormField name={`${name}.r`} control={form.control} render={({ field }) => (
                                        <FormHybridSelect field={field} label='检验结果' options={检验结果选} autoComplete="on"/>
                                    )}/>
                                    <FormField
                                        control={form.control}
                                        name={`${name}.c`}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                <FormLabel className="select-text">安全状况等级:</FormLabel>
                                                <FormControl className="w-full">
                                                    <BlobInputList datalist={等级评定选} {...field} rows={2} autoComplete={`${name}.c`} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
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
    return <>
        <CCell>{orc?.[name]?.r ?? '／'}</CCell>
        <CCell>{orc?.[name]?.c ?? '／'}</CCell>
        <CCell>{orc?.[name]?.m ?? '／'}</CCell>
    </>
}
interface ViewProps {
    orc: any
    rep: any
    children?: React.ReactNode
    config?: (orc:any,edit:boolean)=>OmniPref[]
}

export const ConcAppendixVw = ({orc, rep, children,config=setConfig结论 }: ViewProps) => {
    const configN = React.useMemo(() => {
        return config(orc,false)
    }, [orc])
    const [render ]=useOmnipotentPref({orc, config: configN, tag: 'ConcAppendix', tailRender, pcols:0});
    return <PrintReserveLeast reserve="6rem"
            title={<>
                    <h2 id='ConcAppendix' className="block text-center leading-[0.9] text-3xl font-normal mt-4 mb-2">工业管道定期检验结论报告附页</h2>
                </>}
    >
        <FlexibleTable  columnWidths={["3.5%", "16%", "29%", "13%", "%"]} className="text-sm border-collapse">
            <TableHeader>
                <TableRow>
                    <CCell className="text-xs leading-[1] p-0">序号</CCell>
                    <CCell>检验项目</CCell><CCell>检验结果</CCell>
                    <CCell className="text-xs leading-[1] p-0">安全状况等级</CCell><CCell>备注</CCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={'ConcAppendix'}>
                    {render}
                </RepLink>
            </TableBody>
        </FlexibleTable>
    </PrintReserveLeast>
}
