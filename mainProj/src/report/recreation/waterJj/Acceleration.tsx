/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, CCell, Table, TableBody, TableRow, TableHead, Cell,  LineColumn,
} from "customize-easy-ui-component";
import {CCellUnit, InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {calcAverageArrObj, objNestSet, tableSetInp} from "../../../common/tool";
import {RepLink} from "../../common/base";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {usePrefixDataEdit} from "@/report/hook/usePrefixData";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {ClearableSelect, CollapsibleFormSection} from "@/components/chub";
import {Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea} from "@/components/ui";
import { BlobInputList,InputDatalist,SuffixInput,} from "@/components/chub";
import {Input, Switch} from "@/components/ui";
import {clcOptions} from "@/report/common/ActionMapItem";


export const config加速度=[ ['加空载','空载'],['加满载','满载'],['加偏载','偏载'],['加他况','其他载荷工况'] ];
export const tail加速度= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：<br/>
    （1）设计加速度未涉及的工况无需检测；<br/>
    （2）设计加速度在不同乘坐位置之间有明显差异时，应选择不少于三处位置进行测试，在本表中备注栏中填写其余位置说明及测试结果且对加速度区域进行综合判定。
</Text>;

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
    // 创建动态 schema
    const fullSchema = React.useMemo(() => {
        const schemaFields = {} as any
        itemA加速.forEach((namecfg) => {
            schemaFields[namecfg] = z.string().optional()
        })
        config加速度.forEach(([name, title]) => {
            const schemaTab = {} as any
            AxyzCfg.forEach(([tag,title]) => {
                schemaTab[tag] = z.string().optional()
            })
            schemaFields[name] = z.array(
                z.object(schemaTab),
            )
        })
        return z.object(schemaFields)
    }, [])
    // 计算默认值
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        itemA加速.forEach((name) => {
            fields[name] = storage[name] ?? ""
        })


        return fields
    }, [storage])
    // 3. 定义数组字段配置
    const arrayFields = [
        {
            name: "加速备注",
            itemTemplate: { 'a': "" },
        },
    ]

    const regions = Array.from({ length: 5 }, (_, i) => (`区域${i + 1}` ));
    const contentRendererFactory = React.useCallback(
        (form: any, arrays: Record<string, any>) => {
            // 获取设备列表的数组控制器
            const deviceListArray = arrays["加速备注"]
            return (
                <>
                    <h5>{label}</h5>
                    <div className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                        <FormField
                            key={"加测位"}
                            control={form.control}
                            name={"加测位"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>测试位置</FormLabel>
                                    <FormControl className="w-full">
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
                                    <FormControl className="w-full">
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
                    <h5>按测量工况分4个项目: 加速度A，单位（g）{'>>'}</h5>
                    {/* 数组对象字段 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <FormLabel>设备列表</FormLabel>
                            <Button type="button" variant="outline" size="sm" onClick={() => deviceListArray.append({ tag: "" })}>
                                添加设备
                            </Button>
                        </div>

                        {deviceListArray.fields.map((item: any, index: number) => (
                            <div key={item.id} className="flex items-end gap-2">
                                <FormField
                                    control={form.control}
                                    name={`设备列表.${index}.tag`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="sr-only">设备 {index + 1}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={`设备 ${index + 1} 标签`} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => deviceListArray.remove(index)}>
                                    删除
                                </Button>
                            </div>
                        ))}
                    </div>











                    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                        <FormField
                            key={"加速区域"}
                            control={form.control}
                            name={"加速区域"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel>加速度区域</FormLabel>
                                    <FormControl className="w-full">
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
                                    <FormControl className="w-full">
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
                            key={"加速备注"}
                            control={form.control}
                            name={"加速备注"}
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel>备注：</FormLabel>
                                    <FormControl  className="w-full">
                                        <Textarea rows={4}  {...field} />
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
    // const { render } = useFormFramework({schema: fullSchema,defaultValues,contentRendererFactory,rep})
    const { render } = useFormFramework({
        schema: fullSchema,
        defaultValues,
        contentRendererFactory,
        arrayFields,
        rep,
    })
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
        <div css={{"@media print": {paddingBottom: '4rem', pageBreakInside: 'avoid'}}}>
            <Text variant="h4" css={{marginTop: '1rem',}}>{label}</Text>
        </div>
        <Table id={'Acceleration'} fixed={ ["13%", "44%", "10%", "%"] }
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-4rem'}}} tight miniw={800}>
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
        </Table>
        <div css={{"@media print": {paddingBottom: '7rem', pageBreakInside: 'avoid'}}}/>
        <Table fixed={ ["13%", "9%", "13%", "13%", "13%", "13%", "%", "13%"] }
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-7rem'}}} tight miniw={800}>
            <TableHead>
                <TableRow><CCell rowSpan={3}>测量工况</CCell><CCell rowSpan={3}>测量次数</CCell><CCell
                    colSpan={6}>加速度A（g）</CCell></TableRow>
                <TableRow><CCell colSpan={2}>Ax</CCell><CCell colSpan={2}>Ay</CCell><CCell
                    colSpan={2}>Az</CCell></TableRow>
                <TableRow><CCell>max</CCell><CCell>min</CCell><CCell>max</CCell><CCell>min</CCell><CCell>max</CCell><CCell>min</CCell></TableRow>
            </TableHead>
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
        </Table>
        <Table fixed={ ["10.1%", "44%", "14.1%", "%"] } css={{borderCollapse: 'collapse', }} tight miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    <TableRow>
                        <CCell>加速度区域</CCell><CCell>{orc?.加速区域}</CCell>
                        <CCell>设计加速度区域</CCell><CCell>{orc?.设计加速}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>结果判定</CCell><CCell colSpan={3}>{orc?.加速结论 || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell split={true} colSpan={3}>
                            <div css={{whiteSpace: 'pre-wrap'}}><Text>{orc?.加速备注 || '／'}</Text></div>
                        </Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {children ?? tail加速度}
    </>;
};
