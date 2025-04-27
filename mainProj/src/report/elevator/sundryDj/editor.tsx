/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,  Table, TableBody, TableRow, CCell, BlobInputList,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {ClearableSelect, CollapsibleFormSection} from "@/components/chub";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {
    Card,
    CardContent, CardFooter,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, Input, Select, Button,
    SelectTrigger, SelectContent, SelectValue, SelectItem
} from "@/components/ui";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface SiteConditionSundProps  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    //检验条件 较为通用地配置模式：
    config: any[];    //有配置模式的 : 表对象的默认取值；
}
export const 现场条件选 = [
    { label: "符合", value: "√" },
    { label: "不符合", value: "×" },
]
/**检验条件：表格一样。
 * 表单useForm毛病【特别注意】form.setValue(`.${fields.length-1}.`,)name={`.${fields.length-1}.`}的索引序号需有效序号,新增按钮{ fields.length>0 &&隐藏编辑器，否则自动乱加空行导致后续报错。append前直接编辑导致空行。
 * */
export const SiteConditionSund = ({ children, show, alone = true, config, label, rep}: SiteConditionSundProps) => {
    const { storage } = useStorage()
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([_t,{f:field,N}]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaTab["d"] = z.string()
        schemaFields["检验条件"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["检验条件"] =storage?.检验条件 || []
        return fields
    }, [storage])
    const arrayFields =React.useMemo(() => {
        const itemTemplate = {d: ""} as any
        config.forEach(([_t,{f:field,N}]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"检验条件", itemTemplate,} ]
    }, [])
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const { fields, append, remove } = arrays?.["检验条件"] || {};
            const tableData = form.watch("检验条件") || [];

            return (
                <>
                    {config.map(([title,{f:field,N:descnode}]: any, i: number) => <React.Fragment key={i}>{descnode}<br/></React.Fragment>)}
                    <hr/>
                    <div>现场检验条件确认结果的记录:
                        <Table css={{borderCollapse: 'collapse'}} tight miniw={800}>
                            <TableBody>
                                <TableRow>
                                    <CCell>确认日期</CCell>
                                    {config.map(([title,{f:field}]: any, i: number) => <CCell key={i}>{title}</CCell>)}
                                </TableRow>
                                {storage?.检验条件?.map((obj: any, i: number) => {
                                    return <TableRow key={i}>
                                        <CCell>{obj?.d}</CCell>
                                        {config.map(([title,{f:field}]: any, j: number) => <CCell key={j}>{obj?.[field] || ''}</CCell>)}
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <>新增检查确认时间=＞</>
                    <div>
                        <Card className="py-1">
                            <CardHeader>
                                <CardTitle>编辑区</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-4">
                            {/* 新增选择器和编辑区 */}
                    <div className="mt-4 space-y-4">
                        <Select
                            value={selectedIndex?.toString()}
                            onValueChange={(v) => {
                                const index = v ? Number(v) : null;
                                setSelectedIndex(index);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="选择要编辑的行" />
                            </SelectTrigger>
                            <SelectContent>
                                {storage?.检验条件?.map((row: any, index: number) => (
                                    <SelectItem key={index} value={index.toString()}>行 {index + 1} (日期: {row.d || '未设置'})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedIndex !== null && (
<>
                                <FormField
                                    control={form.control}
                                    name={`检验条件.${selectedIndex}.d`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>检验日期</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    placeholder="选择日期"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 其他配置字段 */}
                                {config.map(([title, { f: tag, N: desc }]) => (
                                    <FormField
                                        key={tag}
                                        control={form.control}
                                        name={`检验条件.${selectedIndex}.${tag}`}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                <FormLabel>{desc}</FormLabel>
                                                <FormControl>
                                                    <ClearableSelect
                                                        field={field}
                                                        options={现场条件选}
                                                        onClear={() => form.setValue(`检验条件.${selectedIndex}.${tag}`, "")}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            if (selectedIndex !== null && arrays?.['检验条件']) {
                                                arrays['检验条件'].remove(selectedIndex);
                                                setSelectedIndex(null);
                                            }
                                        }}
                                    >
                                        删除该行
                                    </Button>
                                </div>
</>
                        )}

                    </div>
                </CardContent>

                            <CardFooter className="flex justify-end space-x-4 border-t p-6">
                                {/* 原有的新增按钮保持不变 */}
                                <Button
                                    className="mt-4"
                                    onClick={(e) => {
                                        const template = { d: "" };
                                        config.forEach(([_, { f: field }]) => {
                                            template[field] = "";
                                        });
                                        append(template);
                                        setSelectedIndex(fields.length)
                                        e.preventDefault();
                                    }}
                                >
                                    新增一条
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    {children ? children:
                        <>注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。</>
                    }
                </>
            );
        },
        [selectedIndex, storage, config,children,setSelectedIndex]
    );

    const { render,form,arrayControls } = useFormFramework({schema, defaultValues, contentRendererFactory,arrayFields, rep})
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render()}
    </CollapsibleFormSection>;
}

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label: string;
    nos?: string;
    titles: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    // config?: any[];    //有配置模式的 : 表对象的默认取值；
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
}

export const itemA技术见证=['大备注','见证资'];
/**通用见证材料3项的： 只剩下了一个： 六、备注；
 * */
export const WitnessSound=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,titles,memolist,witnlist}:Props, ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证, );
        const {inp, setInp} = useItemInputControl({ ref });
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd}
                                    alone={alone} label={label!}>
            { (children as any[])?.[0] && <>
                {(children as any[])?.[0]}
                <hr/>
             </>
            }
            <Text variant="h5">
                {titles[0]}
            </Text>
            <BlobInputList value={inp?.见证资 || ''} rows={4}
                           onListChange={v => setInp({...inp, 见证资: v || undefined})}
                           datalist={witnlist}
            />
            <hr/>
            <Text variant="h5">
                {titles[1]}
            </Text>
            <BlobInputList value={inp?.大备注 || ''} rows={7}
                           onListChange={v => setInp({...inp, 大备注: v || undefined})}
                           datalist={memolist}
            />
            {(children as any[])?.[1]}
        </InspectRecordLayout>;
    });
