/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Text, Input, TextArea, InputLine, LineColumn, useTheme, Table, TableBody, TableRow, CCell, Cell, TableHead,
} from "customize-easy-ui-component";
import {
    CCellUnit, InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useInputControlSure,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {Each_ZdSetting, tabSuffixCb, useTableEditor} from "../../hook/useRepTableEditor";
import {useStorage} from "../../StorageContext";
import {useUppyUpload} from "../../hook/useUppyUpload";
import {ClearableSelect, CollapsibleFormSection} from "@/components/chub";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, Textarea
} from "@/components/ui";
import {config加速度, itemA加速, tail加速度} from "@/report/recreation/waterJj/Acceleration";
import {z} from "zod";
import { BlobInputList,SuffixInput,} from "@/components/chub";
import {clcOptions} from "@/report/common/ActionMapItem";
import {ImageComponent} from "@/components/shub";

export const tail应变= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注： 1、所测应力值为试验载荷产生的应力，不含自重产生的应力。<br/>
    2、“+”表示测点位置结构受拉，“-”表示测点位置结构受压。
</Text>;

export const config测点表=[['应变值','μ',100,{u:'με'}],['应力值','M',100,{u:'MPa'}],
] as Each_ZdSetting[];

//不管sensit与否，都加上存储字段名 ‘应变片#型/灵’ 。
export const itemA应变应力=['应仪器型','应变片型','应变片灵','应天气','应温度','应料参E','应料参μ','应试工况','测点表','_FILE_测点','测点示意','危应第','应变设计','应变结论','应变备注'];
interface Props  extends InternalItemProps{
    //文字上稍微一点的差别： 灵敏
    sensit?: boolean;
}
export const StrainStress = ({ children, show, alone = true, redId, nestMd, label, rep,sensit }: Props) => {
    const {storage,setStorage,modified,setModified} =useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        // 添加普通字段
        itemA应变应力.forEach((name) => {
            //这个字段 _FILE_测点：是专用组件处理设置的，直接修改storage，必须排除在form之外。
            if(name!=="_FILE_测点")
                schemaFields[name] = z.string().optional()
        })
        const schemaTab = {} as any
        config测点表.forEach(([t,field,s,o,park]) => {
            schemaTab[field] = z.string().optional()
        })
        // 添加表格字段
        schemaFields["测点表"]= z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        // 初始化普通字段
        itemA应变应力.forEach((name) => {
            if(name!=="_FILE_测点")
                fields[name] = storage[name] ?? ""
        })
        //【不初始化"测点表"】 没报错？ arrayFields里面有做等效功能。
        return fields
    }, [storage])

    const arrayFields =React.useMemo(() => {
        // 创建每个字段的空模板
        const itemTemplate = {} as any
        config测点表.forEach(([t,field,s,o,park]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"测点表", itemTemplate,} ]
    }, [])

        const theme = useTheme();
        const headview=<h5>
            测试点:按照一行2字段录入： 应变值（με）, 应力值（MPa）;
        </h5>;

        const [nestRendererFactory]=useTableEditor({headview, config: config测点表, table:'测点表',defFixedLay:true});
        const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
            setStorage({...storage, '_FILE_测点': upfile});
            !modified && setModified(true);
        }, [storage, modified,setStorage,setModified]);
        const [uploadDom]=useUppyUpload({ repId:rep?.id!,
            maxFile:1, onFinish, storeObj: storage?._FILE_测点 ,liveDays:10
        });

        const config=[['应变片型号','应仪器型',undefined,30],
            ['应变片'+(sensit?'灵敏度':'型式'),'应变片'+(sensit?'灵':'型'),undefined,25],
            ['天气情况','应天气',undefined,35],['温度','应温度','℃'],['材料参数E','应料参E'],['材料参数GPa μ','应料参μ']
        ];

        const contentRendererFactory = React.useCallback(
            (form: any, arrays?: Record<string, any>) => {

                return (
                    <>
                        <div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                            { config.map(([title,field,unit,size]:any, i:number) => {
                                return <div key={i} css={{ display: 'flex',alignItems:'center',
                                    [theme.mediaQueries.md]: {marginLeft: '1rem'}
                                }}>
                                    <FormField key={i} control={form.control} name={field}
                                        render={({ field }) => (
                                            <FormItem className="pt-2 w-full break-inside-avoid">
                                                <FormLabel>{title}</FormLabel>
                                                <FormControl className="w-full">
                                                    <SuffixInput  unit={unit}  {...field}  size={size!} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>;
                            }) }
                        </div>
                        <Card className="py-1 gap-1">
                            <CardHeader>
                                <CardTitle>测试：</CardTitle>
                            </CardHeader>
                            <CardContent className="px-1">
                                <FormField
                                    control={form.control}
                                    name="应试工况"
                                    render={({ field }) => (
                                        <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                            <FormLabel>测试工况</FormLabel>
                                            <FormControl className="w-full h-24">
                                                <Textarea rows={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {nestRendererFactory(form, arrays)}
                            </CardContent>
                        </Card>
                        <FormField control={form.control} name={'测点示意'}
                                   render={({ field }) => (
                                       <FormItem>
                                           <FormLabel>测点示意图-说明</FormLabel>
                                           <FormControl className="w-full h-40 @md:h-20">
                                               <Textarea rows={2} {...field}  placeholder={`测点示意图`}/>
                                           </FormControl>
                                           <FormMessage />
                                       </FormItem>
                                   )}
                        />
                       测点示意图：
                       {uploadDom}
                        <Card className="py-1 mb-2 gap-2">
                            <CardHeader>
                                <CardTitle>测试结果：</CardTitle>
                            </CardHeader>
                            <CardContent className="px-1">
                                <div className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                                    <FormField control={form.control} name={'危应第'}
                                               render={({ field: formField }) => (
                                                   <FormItem>
                                                       <FormLabel>{(sensit?'最大应力值测试点':'最危险应力点')+'为测点：'}</FormLabel>
                                                       <FormControl>
                                                           <Input {...formField} placeholder={`请输入测点`} />
                                                       </FormControl>
                                                       <FormMessage />
                                                   </FormItem>
                                               )}
                                    />
                                    <FormField control={form.control} name={"应变设计"}
                                               render={({ field }) => (
                                                   <FormItem className="pt-2 w-full break-inside-avoid">
                                                       <FormLabel>设计值=</FormLabel>
                                                       <FormControl className="w-full">
                                                           <BlobInputList rows={2}  {...field}  />
                                                       </FormControl>
                                                       <FormMessage />
                                                   </FormItem>
                                               )}
                                    />
                                    <FormField control={form.control} name={"应变结论"}
                                               render={({ field }) => (
                                                   <FormItem className="pt-2 w-full break-inside-avoid">
                                                       <FormLabel>结果判定</FormLabel>
                                                       <FormControl>
                                                           <ClearableSelect field={field} options={clcOptions} onClear={() => {form.setValue("应变结论", "")}}/>
                                                       </FormControl>
                                                       <FormMessage />
                                                   </FormItem>
                                               )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <FormField
                            control={form.control}
                            name="应变备注"
                            render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel>备注：</FormLabel>
                                    <FormControl className="w-full h-24">
                                        <Textarea rows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {children ?? tail应变}
                    </>
                )
            },
            [children,nestRendererFactory ],
        )
        const { render,form,arrayControls } = useFormFramework({schema, defaultValues, contentRendererFactory,arrayFields, rep})
        return  <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render()}
        </CollapsibleFormSection>;
};

/**应变应力测试
 * @property sensit: 一点文字差别
 * */
export const StrainStressVw= ({orc, rep, label,sensit} :{orc:any, rep:any, label:any,sensit?:boolean}
) => {
    const theme = useTheme();
    const rowsc=Math.ceil(orc?.测点表?.length/2) || 0;        //最多抵达行个数
    //因“测点1 2”列的并不在config字段，无法上const [renderRows,]=useRep2hTableViewer(config测点表, '测点表', orc,true,true,true);
    return <>
        <div  css={{"@media print": {paddingBottom: '5rem', pageBreakInside: 'avoid'}} }>
            <Text variant="h4" css={{marginTop: '1rem',}}>{label}</Text>
        </div>
        <Table id={'StrainStress'} fixed={ ["8.2%","3%","39%","11%","%"] }
               css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-5rem'}} }  tight  miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'StrainStress'}>
                    <TableRow>
                        <CCell colSpan={2}>应变片型号</CCell>
                        <CCell>{orc?.应仪器型}</CCell>
                        <CCell>{'应变片'+(sensit?'灵敏度':'型式')}</CCell>
                        <CCell>{orc?.['应变片'+(sensit?'灵':'型')]}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={2}>天气情况</CCell>
                        <CCell>{orc?.应天气}</CCell>
                        <CCell>温度</CCell>
                        <CCellUnit unit={'℃'}>{orc?.应温度}</CCellUnit>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={2}>材料参数</CCell>
                        <CCell>E={orc?.应料参E}</CCell>
                        <CCell>GPa &nbsp;&nbsp; μ=</CCell>
                        <CCell>{orc?.应料参μ}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测试工况</CCell>
                        <Cell colSpan={4}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.应试工况}
                        </div></Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        <Table fixed={ ["10%","20%","20%","10%","20%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell>测试点</CCell>
                    <CCell>应变值（με）</CCell>
                    <CCell>应力值（MPa）</CCell>
                    <CCell>测试点</CCell>
                    <CCell>应变值（με）</CCell>
                    <CCell>应力值（MPa）</CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'StrainStress'}>
                    { (new Array(rowsc)).fill(null).map((_, i:number) => {
                        return <TableRow key={i}>
                            { [1,2].map((raft, g:number) => {
                                return <React.Fragment key={g}>
                                    <CCell>{i*2+g<orc?.测点表?.length && '测点'+(i*2+raft) }</CCell>
                                    <CCell>{orc?.测点表?.[i*2+g]?.μ}</CCell>
                                    <CCell>{orc?.测点表?.[i*2+g]?.M}</CCell>
                                </React.Fragment>;
                            }) }
                        </TableRow>;
                    }) }
                </RepLink>
            </TableBody>
        </Table>
        <Table fixed={ ["10%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'StrainStress'}>
                    <TableRow>
                        <Cell colSpan={2} css={ {"@media print": { height: undefined },  padding: 0,} }>
                            测点示意图：&nbsp;{orc?.测点示意}
                            <div css={{display: 'flex',justifyContent: 'space-around',alignItems: 'center', margin: '1px 0' }}>
                                { orc?._FILE_测点?.url &&
                                    <ImageComponent src={process.env.NEXT_PUBLIC_OSS_ENDP+orc?._FILE_测点?.url || "/placeholder.svg"}
                                                alt={orc?._FILE_测点?.url || "图片"} />
                                }
                            </div>
                        </Cell>
                    </TableRow>
                    <TableRow>
                        <CCell>测试结果</CCell>
                        <Cell>{(sensit?'最大应力值测试点':'最危险应力点')+'为测点'}（ {orc?.危应第} ）</Cell>
                    </TableRow>
                    <TableRow>
                        <CCell>设计值</CCell>
                        <CCell>{orc?.应变设计}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>结果判定</CCell>
                        <CCell>{orc?.应变结论 || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.应变备注 || '／'}
                        </div></Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {tail应变}
    </>;
};
