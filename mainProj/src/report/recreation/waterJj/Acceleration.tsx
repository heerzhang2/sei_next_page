import * as React from "react";
import {CCellUnit, InternalItemProps,RepLink } from "@/report/common/base";
import {calcAverageArrObj, } from "@/common/tool";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {ClearableSelect, CollapsibleFormSection} from "@/components/chub";
import {Card, CardContent, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea} from "@/components/ui";
import { BlobInputList,SuffixInput,} from "@/components/chub";
import {Input,} from "@/components/ui";
import {clcOptions} from "@/report/common/ActionMapItem";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";

export const config加速度=[ ['加空载','空载'],['加满载','满载'],['加偏载','偏载'],['加他况','其他载荷工况'] ];
export const tail加速度=<div className="text-[0.75rem] leading-[1.3]">
    注：<br/>
    （1）设计加速度未涉及的工况无需检测；<br/>
    （2）设计加速度在不同乘坐位置之间有明显差异时，应选择不少于三处位置进行测试，在本表中备注栏中填写其余位置说明及测试结果且对加速度区域进行综合判定。
</div>;

interface Props  extends InternalItemProps{
    sseq: number;
    stnum?: number;      //每个项目有3次的测试
}
export const itemA加速 = ['加速备注','加测位','加风速','加采频', '加速设值','加速试果','加速区域','设计加速','加速结论'];
config加速度.forEach(([name,title], i:number)=>{
    itemA加速.push(name+'',  name+'r');
});
const AxyzNm = ['a', 'b', 'c', 'd', 'e', 'f'];
const AxyzCfg=[ ['a','Ax.max'],['b','Ax.min'],['c','Ay.max'],['d','Ay.min'],['e','Az.max'],['f','Az.min'] ];

export const Acceleration = ({ children, show, alone = true, redId, nestMd, label, rep,stnum=3 }: Props) => {
    const { storage } = useStorage()
    // 1. 创建动态 schema
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        // 添加普通字段
        itemA加速.forEach((namecfg) => {
            schemaFields[namecfg] = z.string().optional()
        })
        const schemaTab = {} as any
        AxyzNm.forEach((field) => {
            schemaTab[field] = z.string().optional()
        })
        // 添加表格字段
        config加速度.forEach(([name,_]) => {
            schemaFields[name] = z.array(z.object(schemaTab))
        })
        schemaFields["加速试果"]= z.object(schemaTab)
        schemaFields["加速设值"]= z.object(schemaTab)
        return z.object(schemaFields)
    }, [])
    // 2. 计算默认值
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        // 初始化普通字段
        itemA加速.forEach((name) => {
            fields[name] = storage[name] ?? ""
        })
        // 初始化表格字段
        config加速度.forEach(([name]) => {
            // 从storage中获取数据，如果没有则创建3行空数据
            const tableData = storage[name] || []
            // 确保每个表格都有3行数据
            const rows = []
            for (let i = 0; i < stnum; i++) {
                const row = tableData[i] || {}
                const newRow = {} as any
                // 确保每行都有所有字段
                AxyzNm.forEach((field) => {
                    newRow[field] = row[field] || ""
                })
                rows.push(newRow)
            }
            fields[name] = rows
        })
        // 初始化嵌套对象字段
        fields["加速试果"] = storage["加速试果"] || {}
        fields["加速设值"] = storage["加速设值"] || {}
        // 确保嵌套对象有所有必要的字段
        AxyzNm.forEach((field) => {
            if (!fields["加速试果"][field]) fields["加速试果"][field] = ""
            if (!fields["加速设值"][field]) fields["加速设值"][field] = ""
        })
        return fields
    }, [storage])
    // 3. 定义数组字段配置
    const arrayFields = React.useMemo(() => {
        return config加速度.map(([name]) => {
            // 创建每个字段的空模板
            const itemTemplate = {} as any
            AxyzNm.forEach((field) => {
                itemTemplate[field] = ""
            })
            return {
                name,
                itemTemplate,
            }
        })
    }, [])

    const regions = Array.from({ length: 5 }, (_, i) => (`区域${i + 1}` ));
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            // 确保每个表格都有3行
            config加速度.forEach(([name]) => {
                const tableArray = arrays![name]
                if (tableArray) {
                    const currentLength = tableArray.fields.length
                    if (currentLength < stnum) {
                        // 如果少于3行，添加到3行
                        const template = {} as any
                        AxyzNm.forEach((field) => {
                            template[field] = ""
                        })

                        for (let i = currentLength; i < stnum; i++) {
                            tableArray.append(template)
                        }
                    } else if (currentLength > stnum) {
                        // 如果多于3行，删除多余的
                        for (let i = currentLength - 1; i >= stnum; i--) {
                            tableArray.remove(i)
                        }
                    }
                }
            })
            return (
                <>
                    <div className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                        <FormField
                            key={"加测位"}
                            control={form.control}
                            name={"加测位"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>测试位置</FormLabel>
                                    <FormControl className="w-full mr-1">
                                        <BlobInputList rows={2}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            key={"加风速"}
                            control={form.control}
                            name={"加风速"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>风速</FormLabel>
                                    <FormControl className="w-full mr-1">
                                        <SuffixInput  unit={"m/s"}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            key={"加采频"}
                            control={form.control}
                            name={"加采频"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>采样频率</FormLabel>
                                    <FormControl className="w-full">
                                        <SuffixInput  unit={"Hz"}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <span>按测量工况分4个项目: 加速度A，单位（g）{'>>'}</span>
                    <Tabs defaultValue={config加速度[0][0]} className="w-full ">
                        <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${config加速度.length}, 1fr)` }}>
                            {config加速度.map(([name, title]) => (
                                <TabsTrigger key={name} value={name}>
                                    {title}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {config加速度.map(([name, title]) => {
                            const tableArray = arrays![name]
                            const currentTableData = form.watch(name)
                            // console.log(`当前 ${title} 表格数据:`, currentTableData)
                            const avv = AxyzNm.map((tag, t: number) => calcAverageArrObj(currentTableData, (row) => row?.[tag], 1, stnum));
                            return (
                                <TabsContent key={name} value={name} >
                                    <Card className="bg-transparent border-dashed py-1">
                                        <CardHeader>
                                            <CardTitle>{title} 加速度测量</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {tableArray?.fields.map((item: any, index: number) => (
                                                <Card key={item.id} className="p-4 mb-4">
                                                    <CardContent className="p-0 space-y-4">
                                                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                                                            {AxyzCfg.map(([field, fieldTitle]) => (
                                                                <FormField
                                                                    key={field}
                                                                    control={form.control}
                                                                    name={`${name}.${index}.${field}`}
                                                                    render={({ field: formField }) => (
                                                                        <FormItem>
                                                                            <FormLabel>{`次数 ${index + 1} ${fieldTitle}`}</FormLabel>
                                                                            <FormControl>
                                                                                <Input {...formField} placeholder={`请输入${fieldTitle}`} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            <span>{title}-平均值：Ax.max= {avv[0]} ,Ax.min= {avv[1]} ,Ay.max= {avv[2]} ,Ay.min= {avv[3]} ,Az.max= {avv[4]} ,Az.min= {avv[5]} ;</span>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )
                        })}
                    </Tabs>
                    <Card className="bg-transparent border-dashed py-1">
                        <CardHeader>
                            <CardTitle>判定部分</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1">
                            <div className="flex flex-row gap-1">
                                <div>
                                    <h4 className="text-lg font-medium mb-4">测试结果:</h4>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {AxyzCfg.map(([field, fieldTitle]) => (
                                            <div key={field} className="flex items-center gap-1">
                                                <span>{fieldTitle}</span>
                                                <FormField
                                                    control={form.control}
                                                    name={`加速试果.${field}`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="mb-0">
                                                            <FormControl>
                                                                <Input
                                                                    {...formField}
                                                                    className="w-28"
                                                                    size={5}
                                                                    style={{ display: "inline-flex", width: "unset" }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium mb-4">设计值:</h4>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {AxyzCfg.map(([field, fieldTitle]) => (
                                            <div key={field} className="flex items-center gap-1">
                                                <span>{fieldTitle}</span>
                                                <FormField
                                                    control={form.control}
                                                    name={`加速设值.${field}`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="mb-0">
                                                            <FormControl>
                                                                <Input
                                                                    {...formField}
                                                                    className="w-28"
                                                                    size={5}
                                                                    style={{ display: "inline-flex", width: "unset" }}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                        <FormField
                            key={"加速区域"}
                            control={form.control}
                            name={"加速区域"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>加速度区域</FormLabel>
                                    <FormControl className="w-full mr-1">
                                        <BlobInputList rows={2} datalist={regions} {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            key={"设计加速"}
                            control={form.control}
                            name={"设计加速"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>设计加速度区域</FormLabel>
                                    <FormControl className="w-full mr-1">
                                        <BlobInputList rows={2}  {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            key={"加速结论"}
                            control={form.control}
                            name={"加速结论"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>结果判定</FormLabel>
                                    <FormControl>
                                        <ClearableSelect
                                            field={field}
                                            options={clcOptions}
                                            onClear={() => {form.setValue("加速结论", "")}}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="加速备注"
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel>备注：</FormLabel>
                                    <FormControl className="w-full h-24">
                                        <Textarea rows={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {children ?? tail加速度}
                </>
            )
        },
        [children, ],
    )
    const { render, } = useFormFramework({schema, defaultValues, contentRendererFactory, arrayFields, rep})
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render()}
        </CollapsibleFormSection>
    )
}


export const AccelerationVw = ({children, orc, rep, label, stnum = 3}:
                               { orc: any, rep: any, label: any, children?: any, stnum?: number }
) => {
    return <>
        <h2 className="text-2xl mt-4">{label}</h2>
        <FlexibleTable id={'Acceleration'} columnWidths={ ["13%", "44%", "10%", "%"] } className="text-sm">
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    <TableRow>
                        <CCell>测试位置</CCell>
                        <CCell colSpan={3}>{orc?.加测位}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>风速</CCell>
                        <CCellUnit unit={'m/s'}>{orc?.加风速}</CCellUnit>
                        <CCell>采样频率</CCell>
                        <CCellUnit unit={'Hz'}>{orc?.加采频}</CCellUnit>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={ ["13%", "9%", "13%", "13%", "13%", "13%", "%", "13%"] } className="text-sm">
            <TableHeader>
                <TableRow><CCell rowSpan={3}>测量工况</CCell><CCell rowSpan={3}>测量次数</CCell><CCell
                    colSpan={6}>加速度A（g）</CCell></TableRow>
                <TableRow><CCell colSpan={2}>Ax</CCell><CCell colSpan={2}>Ay</CCell><CCell
                    colSpan={2}>Az</CCell></TableRow>
                <TableRow><CCell>max</CCell><CCell>min</CCell><CCell>max</CCell><CCell>min</CCell><CCell>max</CCell><CCell>min</CCell></TableRow>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    {config加速度.map(([name, title], t: number) => {
                        const avv = AxyzNm.map((tag, k: number) => calcAverageArrObj(orc?.[name], (row) => row?.[tag], 1, stnum));
                        return <React.Fragment key={t}>
                            {(new Array(stnum)).fill(null).map((_, d: number) => {
                                const o = orc?.[name]?.[d];
                                return <TableRow key={d}>
                                    {0 === d && <CCell rowSpan={stnum + 1}>{title}</CCell>}
                                    <CCell>{d + 1}</CCell>
                                    <CCell>{o?.a}</CCell><CCell>{o?.b}</CCell>
                                    <CCell>{o?.c}</CCell><CCell>{o?.d}</CCell>
                                    <CCell>{o?.e}</CCell><CCell>{o?.f}</CCell>
                                </TableRow>
                            })}
                            <TableRow><CCell>平均值</CCell>
                                {AxyzNm.map((_, h: number) => <CCell key={h}>{avv[h]}</CCell>)}
                            </TableRow>
                        </React.Fragment>;
                    })}
                    <TableRow><CCell colSpan={2}>测试结果</CCell>
                        {AxyzNm.map((tag, h: number) => <CCell key={h}>{orc?.加速试果?.[tag]}</CCell>)}
                    </TableRow>
                    <TableRow><CCell colSpan={2}>设计值</CCell>
                        {AxyzNm.map((tag, h: number) => <CCell key={h}>{orc?.加速设值?.[tag]}</CCell>)}
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={ ["10.1%", "44%", "14.1%", "%"] } className="text-sm border border-gray-700">
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    <TableRow>
                        <CCell>加速度区域</CCell><CCell>{orc?.加速区域}</CCell>
                        <CCell>设计加速度区域</CCell><CCell>{orc?.设计加速}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>结果判定</CCell><CCell colSpan={3} className="text-lg">{orc?.加速结论 || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>备注</CCell>
                        <TableCell split={true} colSpan={3}>
                            <div className="text-sm min-h-4 whitespace-pre-wrap">{orc?.加速备注 || '／'}</div>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        {children ?? tail加速度}
    </>;
};
