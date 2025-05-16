import * as React from "react";
import {useCallback} from "react";
import {InternalItemProps} from "./base";
import {useStorage} from "../StorageContext";
import {RecordInputConfig} from "./config";
import {itemResultUnqualifiedOmni, useItemsMapOmni} from "./omni";
import {undefined, z} from "zod";
import {Button, Card, CardContent, CardFooter, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {BlobInputList, CollapsibleFormSection, CommonSelect, FormSelectField} from "@/components/chub";
import {clcOptions} from "@/report/common/ActionMapItem";
import {Each_ZdSetting, useTableEdit} from "@/report/hook/use-table-edit";
import type {UseFormReturn} from "react-hook-form";
import {Table} from "@/components/ui/table";
import {CCell, TableBody, TableRow} from "@/components/flexible-table";

// import {特殊项目编码} from "../elevator/Supervision/FormatOriginal";

export interface EditorProps  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的 : 表对象的默认取值；
}


export const config复检表=[['类别','c',30],['编号','no',84],['不合格内容','b',150],['复检结果','rs',50,{t:'s',l:clcOptions}],
    ['复检日期','d',65,{t:'D'}]] as Each_ZdSetting[];


export interface ItemRecheckResultProps  extends InternalItemProps{
    label: string;
    noCB?: (no:string,et:RecordInputConfig)=>string;
    /**配置检验项目列表的对象。 初始化函数setup的返回值要求：   【注意】“Item”是必须的属性名字。
     * interface SetupItemAreaRouteResult{
     *     Item: any[];
     * }
    * */
    setup: ({verId, repId, theme} :{verId:string, repId:string,theme:any}) => { [key: string]: any[] };
}

/**机电检验项目列表情况下的， 复检的原始记录  常见的不合格编辑器 机电类常见的
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数
 * */
// export const ItemRecheckResult=
//     React.forwardRef((
//         { children, show ,alone=true,repId,verId,label,noCB,setup}:ItemRecheckResultProps,  ref
//     ) => {
//       const theme= useTheme();
//       const impressionismAs =React.useMemo(() => {
//         return setup({verId:verId!, repId:repId!, theme});
//       }, [verId, repId,setup, theme]);
//       const getInpFilter = React.useCallback((par: any) => {
//         const {unq} =par||{};
//         return {unq};
//       }, []);
//       const {inp, setInp} = useItemInputControl({ ref });
//       const {storage, setStorage} =React.useContext(EditStorageContext) as any;
//       const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedSsm(storage, impressionismAs?.Item,{noCB: noCB }),
//           [storage,impressionismAs?.Item,noCB]);
//       const headview=<Text variant="h5">
//         {label}
//       </Text>;
//       //不是真的默认不变的不能用  defaultV:默认复检表,
//       const [renderTab]=useTableEdit({inp, setInp,  headview,
//         config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
//       return (
//           <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
//                                alone={alone}  label={label} column={0}>
//             <Button intent='primary' onPress={() =>{
//               let arrUnq=itemResultUnqualifiedSsm(storage, impressionismAs?.Item,{noCB: noCB });
//               // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
//               setStorage({...storage, unq:arrUnq});
//             }}
//             >依据记录来初始化本表默认值</Button>但不能重复初始化！
//             <hr/>
//             {renderTab}
//           </InspectRecordLayout>
//       );
//     } );

//多个测量的子项目项目配置： _fxArr.map(({n,t,u}: any, k:number)=>
export interface SubMeasuresConfig{
    n: string;
    t: string;
    u: string;
}
interface ObservationMeasureProps  extends InternalItemProps{
    label: string;
    /**自定义开头 DOM */
    headview?: React.ReactNode;
    /**自定义尾部 DOM */
    tailview?: React.ReactNode;
    /**【通常测量项目遇见的情况】看解析配置的代码；config.map(([_fxArr:SubMeasuresConfig[], tag,iclas,fxno,node]: any, i:number)=> ；_fxArr[]可多个子项目；
     * 项目编号 ，类别，分项码，render检验内容与要求， [{检测项目,单位,观测名字，}] 观测名字首字段+o v r ；但是第11项目特殊：省略”间距“；
     * */
    config: any[][];
}
/**可复用的； 观测测量项目 ;     举例如下的：
 const config观测数据=[
 [[{n:'减油温',t:'温度',u:'℃'}],'3.4','',undefined,<Text>传动部件啮合状态良好，减速箱油温不得超过85℃：</Text>],
 [[{n:'井间距',t:'距离',u:'m'}],'8.8A','',undefined,<Text>井道内表面与轿厢地坎、轿门或门框的间距：</Text>],
 ];
 * */
// export const ObservationMeasure=
//     React.forwardRef((
//         { children, show ,alone=true,refWidth,label,config,headview,tailview}:ObservationMeasureProps,  ref
//     ) => {
//         const [itemObservation, itemObservationA] =React.useMemo(() => {
//             const item观测机房 : string[]=[];
//             const itemA观测机房 : string[]=[];
//             config.forEach(([_fxArr,_] : any, i:number)=> {
//                 if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
//                 const itrsName=_fxArr[0]?.n + 'r';
//                 _fxArr.forEach(({n,}: any, k:number)=> {
//                     item观测机房.push(n);
//                 });
//                 itemA观测机房.push(itrsName);
//             });
//             return [item观测机房, itemA观测机房];
//         }, [config]);
//         const [getInpFilter]=useMeasureInpFilter(itemObservation, itemObservationA, );        //hook死循环
//         const {inp, setInp} = useItemInputControl({ ref });
//         return (
//             <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
//                                  alone={alone}  label={label}>
//                 {headview? headview :<>
//                     {label}<br/>
//                     </>
//                 }
//                 {
//                     //【极特殊】并非是通常的数组，正常数组的元素应当是对等的数据类型，反观这里：元素类型不一样，顺序至关重要，数组个数固定约定好的，实际应该是对象的{}简化版本变形来的。
//                     config.map(([_fxArr,tag,iclas,fxno,node]: any, i:number)=> {
//                         if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
//                         const itrsName=_fxArr[0]?.n + 'r';     //结论存储在第一个分项目开头的字段
//                         return  <React.Fragment key={i}>
//                             <Text variant="h5">
//                                 {iclas} {tag} {fxno}：
//                             </Text>
//                             { typeof node === "string"?
//                                 <Text>{node}</Text>
//                                 :
//                                 node
//                             }
//                             <LineColumn  column={4} >
//                                 {   _fxArr.map(({n,t,u}: SubMeasuresConfig, k:number)=> {
//                                     return <React.Fragment key={k} >
//                                         { measurementRender(t, n, u, inp, setInp) }
//                                     </React.Fragment>;
//                                 })
//                                 }
//                                 <InputLine label={`${tag} ${fxno??''}结果判定:`} key={i}>
//                                     <SelectHookfork value={ inp?.[itrsName] ||''}
//                                                     onChange={e => setInp({ ...inp, [itrsName]: e.currentTarget.value||undefined}) }/>
//                                 </InputLine>
//                             </LineColumn>
//                         </React.Fragment>;
//                     })
//                 }
//                 { tailview }
//             </InspectRecordLayout>
//         );
//     } );

/**机电检验项目列表情况下的， 复检的原始记录  常见的不合格编辑器 机电类常见的
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数
 * */
// export const ItemRecheckOmni=
//     React.forwardRef((
//         { children, show ,alone=true,repId,verId,label,setup}:ItemRecheckResultProps,  ref
//     ) => {
//         // const theme= useTheme();
//         const impressionismAs =React.useMemo(() => {
//             return setup({verId:verId!, repId:repId!, theme});
//         }, [verId, repId,setup, theme]);
//         const getInpFilter = React.useCallback((par: any) => {
//             const {unq} =par||{};
//             return {unq};
//         }, []);
//         const {inp, setInp} = useItemInputControl({ ref });
//         const {storage, setStorage} =React.useContext(EditStorageContext) as any;
//         const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
//             [storage,impressionismAs?.Item]);
//         const headview=<h2>
//             {label}
//         </h2>;
//         //不是真的默认不变的不能用  defaultV:默认复检表,
//         const [renderTab]=useTableEdit({inp, setInp,  headview,
//             config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
//         return (
//             <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
//                                  alone={alone}  label={label} column={0}>
//                 <Button onClick={() =>{
//                     let arrUnq=itemResultUnqualifiedOmni(storage, impressionismAs?.Item,);
//                     // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
//                     setStorage({...storage, unq:arrUnq});
//                 }}
//                 >依据记录来初始化本表默认值</Button>但不能重复初始化！
//                 <hr/>
//                 {renderTab}
//             </InspectRecordLayout>
//         );
//     } );

export interface ItemRecheckOmniRProps  extends InternalItemProps{
    label: string;
    noCB?: (no:string,et:RecordInputConfig)=>string;
    /**配置检验项目列表的对象。 初始化函数setup的返回值要求：   【注意】“Item”是必须的属性名字。
     * interface SetupItemAreaRouteResult{
     *     Item: any[];
     * }
     * */
    setup: ({rep, orc} :{rep:any,orc?:any}) => { [key: string]: any[] };
}
/**机电检验项目列表情况下的， 复检的原始记录  常见的不合格编辑器 机电类常见的
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数： setup注入不一致了！
 * */
// export const ItemRecheckOmniR=
//     React.forwardRef((
//         { children, show ,alone=true,repId,verId,label,setup,rep}:ItemRecheckOmniRProps,  ref
//     ) => {
//         const theme= useTheme();
//         const impressionismAs =React.useMemo(() => {
//             return setup({rep, theme});
//         }, [rep, setup, theme]);
//         const getInpFilter = React.useCallback((par: any) => {
//             const {unq} =par||{};
//             return {unq};
//         }, []);
//         const {inp, setInp} = useItemInputControl({ ref });
//         const {storage, setStorage} =React.useContext(EditStorageContext) as any;
//         const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
//             [storage,impressionismAs?.Item]);
//         const headview=<Text variant="h5">
//             {label}
//         </Text>;
//         //不是真的默认不变的不能用  defaultV:默认复检表,
//         const [renderTab]=useTableEdit({inp, setInp,  headview,
//             config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
//         return (
//             <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
//                                  alone={alone}  label={label} column={0}>
//                 <Button intent='primary' onPress={() =>{
//                     let arrUnq=itemResultUnqualifiedOmni(storage, impressionismAs?.Item,);
//                     // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
//                     setStorage({...storage, unq:arrUnq});
//                 }}
//                 >依据记录来初始化本表默认值</Button>但不能重复初始化！
//                 <hr/>
//                 {renderTab}
//             </InspectRecordLayout>
//         );
//     } );

/**复检的原始记录 需要自定义增加检验项目的情形：类似ItemRecheckOmniR；
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数  增加依赖项storage?._Oitems,  setup注入增加了orc；
 * */
// export const ItemRecheckOmniOther=
//     React.forwardRef((
//         { children, show ,alone=true,repId,verId,label,setup,rep}:ItemRecheckOmniRProps,  ref
//     ) => {
//         const theme= useTheme();
//         const {storage, setStorage} =React.useContext(EditStorageContext) as any;
//         const impressionismAs =React.useMemo(() => {
//             return setup({rep,orc:storage, theme});
//         }, [rep, storage?._Oitems, setup, theme]);
//         const getInpFilter = React.useCallback((par: any) => {
//             const {unq} =par||{};
//             return {unq};
//         }, []);
//         const {inp, setInp} = useItemInputControl({ ref });
//
//         const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
//             [storage,impressionismAs?.Item]);
//         const headview=<Text variant="h5">
//             {label}
//         </Text>;
//         //不是真的默认不变的不能用  defaultV:默认复检表,
//         const [renderTab]=useTableEdit({inp, setInp,  headview,
//             config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
//         return (
//             <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
//                                  alone={alone}  label={label} column={0}>
//                 <Button intent='primary' onPress={() =>{
//                     let arrUnq=itemResultUnqualifiedOmni(storage, impressionismAs?.Item,);
//                     // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
//                     setStorage({...storage, unq:arrUnq});
//                 }}
//                 >依据记录来初始化本表默认值</Button>但不能重复初始化！
//                 <hr/>
//                 {renderTab}
//             </InspectRecordLayout>
//         );
//     } );

export const config检测复检表=[['类别','c',30],['项目编号','no',84],['检测不符合内容','b',150],
    ['整改情况','rs',50,{t:'s',l:clcOptions}],['确认日期','d',65,{t:'D'}]] as Each_ZdSetting[];
export const config检验复检表=[['类别','c',30],['项目编号','no',84],['检验不符合内容','b',150],
    ['复检结果','rs',50, {t:'s',l:clcOptions}],['确认日期','d',65,{t:'D'}]] as Each_ZdSetting[];

export interface RecheckEditorProps  extends ItemRecheckOmniRProps{
    config?: Each_ZdSetting[];
}
/**复检的原始记录 需要自定义增加检验项目的情形：类似ItemRecheckOmniR；
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数  增加依赖项storage?._Oitems,  setup注入增加了orc；
 * */
export const RecheckEditor = ({ children, show, alone = true, redId, nestMd, label, rep
                                  ,config=config复检表 ,setup}: RecheckEditorProps) => {
    const {storage,setStorage,modified,setModified} =useStorage();
    const impressionismAs =React.useMemo(() => {
        return setup({rep,orc:storage});
    }, [rep, storage?._Oitems, setup]);
    const [mapNoTag] = useItemsMapOmni({ ItemArs: impressionismAs?.Item, notCheckNo: false })
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t,field,s,o,park]) => {
            if(field!=="c")         //项目类别字段不要给用户编辑
                schemaTab[field] = z.string().optional()
        })
        schemaFields["unq"]= z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["unq"]= storage["unq"]
        storage["unq"].forEach((row: any,index:number) => {
            config.forEach(([t,field,s,o,park]) => {
                if(row[field]===undefined)  fields["unq"][index][field]=""
            })
        })
        return fields
    }, [storage])
    const arrayFields =React.useMemo(() => {
        const itemTemplate = {} as any
        config.forEach(([t,field,s,o,park]) => {
           itemTemplate[field] = ""
        })
        return [ {name:"unq", itemTemplate,} ]
    }, [])
    // const handleExternalDataChange = useCallback(
    //     (newData) => {
    //         // 更新 form 的值，但只在数据真正变化时
    //         if (newData.unq) {
    //             // const currentProducts = form.getValues("unq")
    //             // const isEqual = JSON.stringify(currentProducts) === JSON.stringify(newData.unq)
    //
    //             // if (!isEqual) {
    //             //     form.setValue("unq", newData.unq)
    //             // }
    //         }
    //     },
    //     [],
    // )

    const onConfirm = useCallback(
        (form: UseFormReturn<any, any, any>) => {
            //保存更新externalData的操作
            handleConfirm()
        },
        []
    )

    const 默认复检表 =React.useMemo(()=>{
            let falts=itemResultUnqualifiedOmni(storage, impressionismAs?.Item);
            falts.forEach((row,index) => {
                const mapn = mapNoTag!.get(row.no);
                //数据库没有存储c 不合格表的类别字段；
                falts[index].c= `${mapn?.pre ?? ''}${mapn?.iclas ?? ''}`
            })
            return falts;
          },
        [storage,impressionismAs?.Item]);

    const headview=<h2 >
        {label}
    </h2>;

    const { render,handleConfirm,form,arrayControls } = useFormFramework({schema, defaultValues, arrayFields, rep})
    const [nestRenderer]=useTableEdit({
        form, arrayControls, onConfirm, config, table:'unq',externalData: storage,
        headview,defFixedLay:true, defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2
        // onExternalDataChange: handleExternalDataChange
    });

    const content =<>
                    <Card className="py-1 gap-1">
                        <CardContent className="px-1">
                            注意点击“清空全表至默认”会重新初始化！<hr/>
                            {nestRenderer}
                        </CardContent>
                    </Card>
                    {children}
                </>
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(content)}
    </CollapsibleFormSection>;
};

interface WitnessParkDjProps extends InternalItemProps {
    titles?: any[];      //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    nowit?: boolean;    //没有必要输入见证材料
    //大备注  列表框方式的
    memolist?: any[];
    //见证资料  默认可选择录入
    witlist?: any[];
    tails?: any[];
}

export const itemA技术见证 = ['资料编号', '大备注'];
/**通用见证材料3项的： 约定：children [] 可以嵌入俩个儿子DOM节点，分别代表两个段落插入一个div块;
 * */
export const WitnessSimple = ({
                                  tails, show, alone = true, redId, nestMd, label, rep,
                                  titles, nowit, memolist, witlist
                              }: WitnessParkDjProps) => {
    const {storage,} = useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        itemA技术见证.forEach((name) => {
            schemaFields[name] = z.string().optional()
        })
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        itemA技术见证.forEach((name) => {
            fields[name] = storage[name] ?? ""
        })
        return fields
    }, [storage])
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            return (
                <>
                    {!nowit && <Card className="py-1 gap-1">
                        <CardHeader>
                            <CardTitle>{titles![0]}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1">
                            <FormField control={form.control} name="资料编号"
                                       render={({field}) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                               <FormLabel>资料及编号:</FormLabel>
                                               <FormControl className="w-full">
                                                   <BlobInputList rows={6} datalist={witlist}  {...field}  />
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}
                            />
                            {(tails as any[])?.[0]}
                        </CardContent>
                    </Card>
                    }
                    <Card className="py-1 mb-2 gap-2">
                        <CardHeader>
                            <CardTitle>{titles![1]}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1">
                            <FormField control={form.control} name="大备注"
                                       render={({field}) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                               <FormLabel>备注:</FormLabel>
                                               <FormControl className="w-full">
                                                   <BlobInputList rows={6} datalist={memolist}  {...field}  />
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}
                            />
                            {(tails as any[])?.[1]}
                        </CardContent>
                    </Card>
                </>
            )
        },
        [tails,],
    )
    const {render} = useFormFramework({schema, defaultValues, contentRendererFactory, rep})
    return <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(null)}
    </CollapsibleFormSection>;
};

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface SiteConditionSundProps extends InternalItemProps {
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    //检验条件 较为通用地配置模式：
    config: any[];    //有配置模式的 : 表对象的默认取值；
}

export const 现场条件选 = [
    {label: "符合", value: "√"},
    {label: "不符合", value: "×"},
]
/**检验条件：表格一样。
 * 表单useForm毛病【特别注意】form.setValue(`.${fields.length-1}.`,)name={`.${fields.length-1}.`}的索引序号需有效序号,新增按钮{ fields.length>0 &&隐藏编辑器，否则自动乱加空行导致后续报错。append前直接编辑导致空行。
 * */
export const SiteConditionSund = ({children, show, alone = true, config, label, rep}: SiteConditionSundProps) => {
    const {storage} = useStorage()
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([_t, {f: field, N}]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaTab["d"] = z.string()
        schemaFields["检验条件"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["检验条件"] = storage?.检验条件 || []
        return fields
    }, [storage])
    const arrayFields = React.useMemo(() => {
        const itemTemplate = {d: ""} as any
        config.forEach(([_t, {f: field, N}]) => {
            itemTemplate[field] = ""
        })
        return [{name: "检验条件", itemTemplate,}]
    }, [])
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const {fields, append, remove} = arrays?.["检验条件"] || {};
            //底下编辑项目不能直接用storage的存储数据。需要用表单自带的临时状态取值。
            const tabledArr = form.watch("检验条件") || [];
            const index = selectedIndex ?? 0 // 表格第几行的
            //空行导致tabledArr可能比fields.length更多，form.watch是内部未校验的，fields.length是合法的稳定版本。append新增一条前直接编辑导致空行。
            if (tabledArr[index] === undefined) return null
            const seqOptions = fields?.map((row: any, index: number) => (
                {value: index.toString(), label: `行 ${index + 1} (日期: ${row.d || '未设置'})`}
            ));
            return (
                <>
                    <div>现场检验条件确认结果的记录:
                        <Table >
                            <TableBody>
                                <TableRow>
                                    <CCell>确认日期</CCell>
                                    {config.map(([title, {f: field}]: any, i: number) => <CCell
                                        key={i}>{title}</CCell>)}
                                </TableRow>
                                {storage?.检验条件?.map((obj: any, i: number) => {
                                    return <TableRow key={i}>
                                        <CCell>{obj?.d}</CCell>
                                        {config.map(([title, {f: field}]: any, j: number) => <CCell
                                            key={j}>{obj?.[field] || ''}</CCell>)}
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="w-full flex justify-center mb-1 items-center gap-1">
                        <h4>选择编辑行</h4>
                        <CommonSelect id={"selectedIndex"} value={selectedIndex?.toString()} options={seqOptions}
                                      onValueChange={(v) => {
                                          const index = v ? Number(v) : null;
                                          if (index !== null) setSelectedIndex(index);
                                      }}
                                      onClear={() => setSelectedIndex(null)}
                                      className={"w-full @md:w-[20rem]"}
                        />
                    </div>
                    <div className="h-md:@md:max-w-[80rem] m-auto">
                        <Card className="py-1 gap-2">
                            <CardHeader>
                                <CardTitle>{selectedIndex === null ? '新增' : '修改'}一条</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-1">
                                {/* 新增选择器和编辑区 */}
                                <div className="mt-4 space-y-4">
                                    {selectedIndex !== null && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name={`检验条件.${selectedIndex}.d`}
                                                render={({field}) => (
                                                    <FormItem className="w-full @md:w-[20rem]">
                                                        <FormLabel>确认日期</FormLabel>
                                                        <FormControl>
                                                            <Input type="date"{...field} placeholder="选择日期"
                                                                   value={tabledArr[index] ? tabledArr[index].d : ""}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            {config.map(([title, {f: tag, N: desc}]) => (
                                                <FormField key={tag} control={form.control}
                                                           name={`检验条件.${selectedIndex}.${tag}`}
                                                           render={({field}) => (
                                                               <FormSelectField field={field} label={desc}
                                                                                options={现场条件选}
                                                                                selectClass="w-full @md:w-[20rem]"
                                                                                value={tabledArr[index] ? tabledArr[index][tag] : ""}
                                                               />
                                                           )}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-4 border-t p-6">
                                <Button className=""
                                        onClick={(e) => {
                                            const template = {d: ""} as any;
                                            config.forEach(([_, {f: field}]) => {
                                                template[field] = "";
                                            });
                                            append(template);
                                            setSelectedIndex(fields.length)
                                            e.preventDefault();
                                        }}
                                >
                                    新增一条
                                </Button>
                                <Button variant="destructive" disabled={selectedIndex === null}
                                        onClick={() => {
                                            if (selectedIndex !== null && arrays?.['检验条件']) {
                                                remove(selectedIndex);
                                                setSelectedIndex(null);
                                            }
                                        }}
                                >
                                    删除该行
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    {children ? children :
                        <>注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。</>
                    }
                </>
            );
        },
        [selectedIndex, storage, config, children, setSelectedIndex]
    );

    const {render, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        //contentRendererFactory,不用了
        arrayFields,
        rep
    })
    const content =contentRendererFactory(form, arrayControls)
    return <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(content)}
    </CollapsibleFormSection>;
}
