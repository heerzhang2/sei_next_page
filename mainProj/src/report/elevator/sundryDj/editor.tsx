/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea, Input, Button, useTheme, Table, TableBody, TableRow, CCell, LineColumn, InputLine, SuffixInput, ButtonRefComp, BlobInputList,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectPair, SelectValDescPair, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {tableSetInp} from "../../../common/tool";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {ClearableSelect, CollapsibleFormSection} from "@/components/chub";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {config加速度, itemA加速} from "@/report/recreation/waterJj/Acceleration";
import {config测点表, itemA应变应力} from "@/report/recreation/waterJj/StrainStress";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
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
const itemA现场 = ['检验条件'];
/**类似通用的二维表格，但有不同点：必须有一个关键字段唯一性判定；互动流程稍微有差别。适合小数量数据集合。 aDateObj直接倒手...inp;同一个对象参考inp?.检验条件?.find()。
 * 允许children=空格，这样不显示尾部 注： 哪一行： <SiteConditionSund config={tItems现场} label={'附录B：现场检测条件确认'}> </SiteConditionSund>),
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
        //【不初始化"测点表"】 没报错？ arrayFields里面有做等效功能。
        return fields
    }, [storage])
    const arrayFields =React.useMemo(() => {
        // 创建每个字段的空模板
        const itemTemplate = {d: ""} as any
        // itemTemplate["d"]= ""
        config.forEach(([_t,{f:field,N}]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"检验条件", itemTemplate,} ]
    }, [])

    // const [floor, setFloor] = React.useState<string | null>(null);
    // const cindex= storage?.检验条件?.findIndex((t: any) => t.d === floor);
    // const dateBlurRef = React.useRef(null);
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const { fields, append, remove, move } = arrays?.["检验条件"] || {}
            // const tableArray = arrays!["检验条件"]
            const tableData = form.watch("检验条件") || []
            // const tabledArr = form.watch?.(table) || []
            const membersum = tableData?.length

        return <>
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
                        <CardTitle> 度测量</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Card className="p-4 mb-4">
                            <Button className="mt-4"
                                    onClick={(e) => {
                                        const template = {d: ""} as any
                                        config.forEach(([_,{f:field,}]) => {
                                                template[field] = ""
                                        })
                                        append(template)
                                        e.preventDefault()
                                    }}
                            >
                             新增一条
                            </Button>
                            { fields.length>0 &&
                                <CardContent className="p-0 space-y-4">
                                    {`次数 ${fields.length }:  ;;${membersum}`}
                                    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                                        <FormField control={form.control}
                                                   name={`检验条件.${fields.length-1}.d`}
                                                   render={({ field }) => (
                                                       <FormItem>
                                                           <FormLabel>检验日期</FormLabel>
                                                           <FormControl>
                                                               <Input type="date" {...field} placeholder={`首先设置当前日期`} />
                                                           </FormControl>
                                                           <FormMessage />
                                                       </FormItem>
                                                   )}
                                        />
                                        {config.map(([title,{f:field,N:desc}]) => (
                                            <FormField key={field} control={form.control}
                                                       name={`检验条件.${fields.length-1}.${field}`}
                                                       render={({ field }) => (
                                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                                               <FormLabel>{desc}</FormLabel>
                                                               <FormControl>
                                                                   <ClearableSelect
                                                                       field={field}
                                                                       options={现场条件选}
                                                                       onClear={() => {form.setValue(`检验条件.${fields.length}.${field}`, "")}}
                                                                   />
                                                               </FormControl>
                                                               <FormMessage />
                                                           </FormItem>
                                                       )}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            }
                        </Card>
                        <Text variant="h6">dfgfdqqqq;</Text>

                    </CardContent>
                </Card>

{/*                {config.map(([title,{f:field}]: any, j: number) =>
                    <InputLine key={j} label={title+`(${floor})`}>
                        <SelectPair value={inp?.检验条件?.[cindex]?.[field] || ''} dlist={现场条件选}
                                    onChange={e => floor && tableSetInp('检验条件',cindex, inp,setInp,field,e.currentTarget.value||undefined)}
                        />
                    </InputLine>
                )}
                <ButtonRefComp disabled={cindex>=0 || !floor} ref={dateBlurRef}
                               onPress={() => setInp({
                                   ...inp,
                                   检验条件: (inp?.检验条件 ? [...inp?.检验条件, {d: floor}] : [{d: floor}])
                               })}
                >新增</ButtonRefComp>
                <Button disabled={cindex<0 || !floor}
                        css={{marginTop: theme.spaces.sm}} size="sm"
                        onPress={() => floor && tableSetInp('检验条件',cindex, inp,setInp,undefined,undefined,true)}
                >刪除</Button>*/}
            </div>
            {children ? children:
                <>注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。</>
            }
        </>
        },
        [children, storage,config],
    )
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
