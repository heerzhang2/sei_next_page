"use client"
import React, {useCallback ,useState } from "react"
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {type InternalItemProps, RepLink} from "@/report/common/base";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import { useFormFramework} from "@/report/hook/useFormFramework";
import {FootMensLine, } from "@/report/common/view";
import {
    Alert, AlertTitle,
    Badge, Button,
    Card,
    CardContent, CardFooter, CardHeader, CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, Input, Label,
    Separator,
    Switch,
    Textarea
} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, InputDatalist} from "@/components/chub";
import {OmniPref, useOmnipotentPref, useOmniPrefTitle} from "@/report/hook/useOmnipotentPref";
import {cn} from "@/lib/utils";
import {SmartTruncatedText} from "@/components/smart-truncated-text";
import {AlertCircleIcon, Edit, Plus, Trash2, X} from "lucide-react";
import {CustomSwitch} from "@/components/shub";

function CustomSwitch4() {
    const [checked, setChecked] = useState(false);

    const handleToggle = () => {
        setChecked(!checked);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                data-state={checked ? "checked" : "unchecked"}
                value="on"
                data-slot="switch"
                className="peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-[25px] w-[42px] [&>span]:h-[21px] [&>span]:w-[21px] [&>span]:data-[state=checked]:translate-x-[17px]"
                id="do"
                onClick={handleToggle}
            >
        <span
            data-state={checked ? "checked" : "unchecked"}
            data-slot="switch-thumb"
            className="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        />
            </button>
            <input
                aria-hidden="true"
                tabIndex="-1"
                type="checkbox"
                value="on"
                checked={checked}
                onChange={handleToggle}
                style={{
                    transform: 'translateX(-100%)',
                    position: 'absolute',
                    pointerEvents: 'none',
                    opacity: 0,
                    margin: '0px',
                    width: '42px',
                    height: '25px'
                }}
            />
        </div>
    );
}


const setConfig宏观 =(orc:any,edit:boolean)=> [
    ['道布置', [{t: '结构检验', s: 5},], '管道布置',],


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

export const Accessories = ({
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
                                    <div className="space-y-0.5">

                                        {/* 新增按钮和表单 */}
                                        <div className="pt-4 border-t">
                                            <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
                                                <CardHeader className="pb-0">
                                                    <CardTitle>新增目录项</CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-1 px-2">

                                                    <div className="grid grid-cols-2 @5xl:grid-cols-4 gap-1">
                                                        <div className="flex items-center space-x-2">
                                                            <CustomSwitch checked={false} onChange={function(value: boolean): void {
                                                                throw new Error("Function not implemented.");
                                                            } } />

                                                            <Label htmlFor="do" className="text-sm select-text">
                                                                有做该项目
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {/*<Switch id="na"*/}
                                                            {/*        checked={  false}*/}
                                                            {/*        onCheckedChange={(checked) => 0}*/}
                                                            {/*        className="h-[25px] w-[42px] [&>span]:h-[21px] [&>span]:w-[21px] [&>span]:data-[state=checked]:translate-x-[17px]"*/}
                                                            {/*/>*/}
                                                            <Label htmlFor="na" className="text-sm select-text">
                                                                不在目录中显示
                                                            </Label>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end space-x-2 pt-4 border-t">
                                                    <Button variant="outline" >
                                                            <X className="w-4 h-4 mr-2" />
                                                            取消
                                                        </Button>
                                                        <Button >确认当前项</Button>
                                                    </div>

                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
{/*                                    <FormField
                                        key={`${name}.V`}
                                        control={form.control}
                                        name={`${name}.V`}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                <FormLabel className="select-text">是否在校验有效期内</FormLabel>
                                                <FormControl  className="">
                                                    <Switch   {...field}  />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />*/}

                                </div>
                            </div>
                        })}
                        <Separator className="my-2"/>

                    </CardContent>
                </Card>
                {children}
            </>
        )
    }, [titNode, children])

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            目录或附页表的编辑器
                            <Badge variant="secondary">共   项</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-0.5">
                            {content}

                            {/* 新增按钮和表单 */}
                            <div className="pt-4 border-t">

                                    <Button size="sm"   className="w-full max-w-32">
                                        <Plus className="w-4 h-4 mr-2" />
                                        新增目录项
                                    </Button>

                            </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <strong>字段说明：</strong>
                            </p>
                            <ul className="@md:columns-2 list-disc list-inside space-y-1 ml-4">
                                <li>
                                    <strong>显示名称：</strong>附录显示名称
                                </li>
                                <li>
                                    <strong>目录显示题目：</strong>该分项在报告目录中的文本显示题目
                                </li>
                                <li>
                                    <strong>有做吗：</strong>默认包含的分项报告
                                </li>
                                <li>
                                    <strong>不在附页：</strong>不在结论报告附页中出现，但出现在目录中
                                </li>
                                <li>
                                    <strong>仅记录目录：</strong>仅出现在原始记录目录中
                                </li>
                                <li>
                                    <strong>证书类型：</strong>证书类型的项目
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">
                        <div>
                          <span className="text-sm">
                            有些是不在附页中体现的但却在目录中有的其页号需设定。想清空所有项目（分项）和目录的配置（谨慎使用！）
                          </span>
                            <Button size="sm"  >
                                重新初始化
                            </Button>
                        </div>

                    </CardFooter>
                </Card>
                {children}
            </div>

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

export const AccessoriesVw = ({orc, rep, children,config=setConfig宏观 }: ViewProps) => {
    return <PrintReserveLeast reserve="6rem"
            title={<>
                    <h2 id='Accessories' className="block text-center leading-[0.9] text-3xl font-normal mt-4">安全附件与仪表检验报告</h2>
                    <div className="flex justify-between text-sm">
                        <span>单位内部编号：{orc.单位内部编号}</span>
                        <span className="@3xl:mr-4"></span>
                    </div>
                </>}
    >
        <FlexibleTable  columnWidths={["14%","%","15%","9%","15%","4%","25%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={'Accessories'}>
                    <TableRow>
                        <CCell rowSpan={3}>安全阀检验</CCell>
                        <CCell>校验记录编号</CCell><CCell colSpan={5}>{orc?.安阀检?.s || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>数量</CCell><CCell colSpan={3}>{orc?.安阀检?.s || '／'}</CCell><CCell>个</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>是否在校验有效期内</CCell><CCell>( {('是'===orc?.安阀检?.Y)? '√' : orc?.安阀检?.Y? '':'／'} )是</CCell>
                        <CCell></CCell><CCell>( {('否'===orc?.安阀检?.Y)? '√' : orc?.安阀检?.Y? '':'／'} )否</CCell>
                            <CCell colSpan={2}></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>是否在校验有效期内</CCell><CCell>( {('是'===orc?.安阀检?.Y)? '√' : orc?.安阀检?.Y? '':'／'} )是</CCell>
                        <CCell></CCell><CCell>( {('否'===orc?.安阀检?.Y)? '√' : orc?.安阀检?.Y? '':'／'} )否</CCell>
                          <CCell></CCell><CCell>( {'是'===orc?.安阀检?.IS && '√'} )无检定要求</CCell>
                    </TableRow>
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
