import * as React from "react";
import {InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl} from "./base";
import {Each_ZdSetting, useTableEditor} from "../hook/useRepTableEditor";
import {EditStorageContext, useStorage} from "../StorageContext";
import {itemResultUnqualifiedSsm, RecordInputConfig} from "./config";
import {useMeasureInpFilter} from "./hooks";
import {measurementRender} from "./measure";
import {itemResultUnqualifiedOmni} from "./omni";
import {z} from "zod";
import {tail测仪器} from "@/report/recreation/waterJj/repView";
import {Button, Card, CardContent} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {CollapsibleFormSection} from "@/components/chub";
import {instrumentOption} from "@/report/common/Instrument";
import {clcOptions} from "@/report/common/ActionMapItem";
// import {特殊项目编码} from "../elevator/Supervision/FormatOriginal";

export interface EditorProps  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的 : 表对象的默认取值；
}

export const config复检表=[['类别','c',30],['编号','no',84],['不合格内容','b',150],['复检结果','rs',50,(obj,setObj)=>{
  return <SelectHookfork value={ obj?.rs ||''} onChange={e => setObj({ ...obj, rs: e.currentTarget.value||undefined}) }/>
}],['复检日期','d',65,(obj,setObj)=>{
  return <Input  value={obj?.d ||''}  type='date' onChange={e => setObj({ ...obj, d: e.currentTarget.value}) } />
}]] as Each_ZdSetting[];


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
export const ItemRecheckResult=
    React.forwardRef((
        { children, show ,alone=true,repId,verId,label,noCB,setup}:ItemRecheckResultProps,  ref
    ) => {
      const theme= useTheme();
      const impressionismAs =React.useMemo(() => {
        return setup({verId:verId!, repId:repId!, theme});
      }, [verId, repId,setup, theme]);
      const getInpFilter = React.useCallback((par: any) => {
        const {unq} =par||{};
        return {unq};
      }, []);
      const {inp, setInp} = useItemInputControl({ ref });
      const {storage, setStorage} =React.useContext(EditStorageContext) as any;
      const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedSsm(storage, impressionismAs?.Item,{noCB: noCB }),
          [storage,impressionismAs?.Item,noCB]);
      const headview=<Text variant="h5">
        {label}
      </Text>;
      //不是真的默认不变的不能用  defaultV:默认复检表,
      const [renderTab]=useTableEditor({inp, setInp,  headview,
        config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
      return (
          <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                               alone={alone}  label={label} column={0}>
            <Button intent='primary' onPress={() =>{
              let arrUnq=itemResultUnqualifiedSsm(storage, impressionismAs?.Item,{noCB: noCB });
              // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
              setStorage({...storage, unq:arrUnq});
            }}
            >依据记录来初始化本表默认值</Button>但不能重复初始化！
            <hr/>
            {renderTab}
          </InspectRecordLayout>
      );
    } );

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
export const ObservationMeasure=
    React.forwardRef((
        { children, show ,alone=true,refWidth,label,config,headview,tailview}:ObservationMeasureProps,  ref
    ) => {
        const [itemObservation, itemObservationA] =React.useMemo(() => {
            const item观测机房 : string[]=[];
            const itemA观测机房 : string[]=[];
            config.forEach(([_fxArr,_] : any, i:number)=> {
                if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
                const itrsName=_fxArr[0]?.n + 'r';
                _fxArr.forEach(({n,}: any, k:number)=> {
                    item观测机房.push(n);
                });
                itemA观测机房.push(itrsName);
            });
            return [item观测机房, itemA观测机房];
        }, [config]);
        const [getInpFilter]=useMeasureInpFilter(itemObservation, itemObservationA, );        //hook死循环
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label}>
                {headview? headview :<>
                    {label}<br/>
                    </>
                }
                {
                    //【极特殊】并非是通常的数组，正常数组的元素应当是对等的数据类型，反观这里：元素类型不一样，顺序至关重要，数组个数固定约定好的，实际应该是对象的{}简化版本变形来的。
                    config.map(([_fxArr,tag,iclas,fxno,node]: any, i:number)=> {
                        if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
                        const itrsName=_fxArr[0]?.n + 'r';     //结论存储在第一个分项目开头的字段
                        return  <React.Fragment key={i}>
                            <Text variant="h5">
                                {iclas} {tag} {fxno}：
                            </Text>
                            { typeof node === "string"?
                                <Text>{node}</Text>
                                :
                                node
                            }
                            <LineColumn  column={4} >
                                {   _fxArr.map(({n,t,u}: SubMeasuresConfig, k:number)=> {
                                    return <React.Fragment key={k} >
                                        { measurementRender(t, n, u, inp, setInp) }
                                    </React.Fragment>;
                                })
                                }
                                <InputLine label={`${tag} ${fxno??''}结果判定:`} key={i}>
                                    <SelectHookfork value={ inp?.[itrsName] ||''}
                                                    onChange={e => setInp({ ...inp, [itrsName]: e.currentTarget.value||undefined}) }/>
                                </InputLine>
                            </LineColumn>
                        </React.Fragment>;
                    })
                }
                { tailview }
            </InspectRecordLayout>
        );
    } );

/**机电检验项目列表情况下的， 复检的原始记录  常见的不合格编辑器 机电类常见的
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数
 * */
export const ItemRecheckOmni=
    React.forwardRef((
        { children, show ,alone=true,repId,verId,label,setup}:ItemRecheckResultProps,  ref
    ) => {
        // const theme= useTheme();
        const impressionismAs =React.useMemo(() => {
            return setup({verId:verId!, repId:repId!, theme});
        }, [verId, repId,setup, theme]);
        const getInpFilter = React.useCallback((par: any) => {
            const {unq} =par||{};
            return {unq};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const {storage, setStorage} =React.useContext(EditStorageContext) as any;
        const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
            [storage,impressionismAs?.Item]);
        const headview=<h2>
            {label}
        </h2>;
        //不是真的默认不变的不能用  defaultV:默认复检表,
        const [renderTab]=useTableEditor({inp, setInp,  headview,
            config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label} column={0}>
                <Button onClick={() =>{
                    let arrUnq=itemResultUnqualifiedOmni(storage, impressionismAs?.Item,);
                    // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
                    setStorage({...storage, unq:arrUnq});
                }}
                >依据记录来初始化本表默认值</Button>但不能重复初始化！
                <hr/>
                {renderTab}
            </InspectRecordLayout>
        );
    } );

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
export const ItemRecheckOmniR=
    React.forwardRef((
        { children, show ,alone=true,repId,verId,label,setup,rep}:ItemRecheckOmniRProps,  ref
    ) => {
        const theme= useTheme();
        const impressionismAs =React.useMemo(() => {
            return setup({rep, theme});
        }, [rep, setup, theme]);
        const getInpFilter = React.useCallback((par: any) => {
            const {unq} =par||{};
            return {unq};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const {storage, setStorage} =React.useContext(EditStorageContext) as any;
        const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
            [storage,impressionismAs?.Item]);
        const headview=<Text variant="h5">
            {label}
        </Text>;
        //不是真的默认不变的不能用  defaultV:默认复检表,
        const [renderTab]=useTableEditor({inp, setInp,  headview,
            config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label} column={0}>
                <Button intent='primary' onPress={() =>{
                    let arrUnq=itemResultUnqualifiedOmni(storage, impressionismAs?.Item,);
                    // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
                    setStorage({...storage, unq:arrUnq});
                }}
                >依据记录来初始化本表默认值</Button>但不能重复初始化！
                <hr/>
                {renderTab}
            </InspectRecordLayout>
        );
    } );

/**复检的原始记录 需要自定义增加检验项目的情形：类似ItemRecheckOmniR；
 * @param setup  每个模板的setupItemAreaRoute检验项目配置构建函数  增加依赖项storage?._Oitems,  setup注入增加了orc；
 * */
export const ItemRecheckOmniOther=
    React.forwardRef((
        { children, show ,alone=true,repId,verId,label,setup,rep}:ItemRecheckOmniRProps,  ref
    ) => {
        const theme= useTheme();
        const {storage, setStorage} =React.useContext(EditStorageContext) as any;
        const impressionismAs =React.useMemo(() => {
            return setup({rep,orc:storage, theme});
        }, [rep, storage?._Oitems, setup, theme]);
        const getInpFilter = React.useCallback((par: any) => {
            const {unq} =par||{};
            return {unq};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });

        const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
            [storage,impressionismAs?.Item]);
        const headview=<Text variant="h5">
            {label}
        </Text>;
        //不是真的默认不变的不能用  defaultV:默认复检表,
        const [renderTab]=useTableEditor({inp, setInp,  headview,
            config: config复检表, table:'unq', defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label} column={0}>
                <Button intent='primary' onPress={() =>{
                    let arrUnq=itemResultUnqualifiedOmni(storage, impressionismAs?.Item,);
                    // let arrUnq22=itRes.failure.map((ts:any, i:number) => { return {no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; });
                    setStorage({...storage, unq:arrUnq});
                }}
                >依据记录来初始化本表默认值</Button>但不能重复初始化！
                <hr/>
                {renderTab}
            </InspectRecordLayout>
        );
    } );

export const config检测复检表=[['类别','c',30],['项目编号','no',84],['检测不符合内容','b',150],
    ['整改情况','rs',50,{t:'s',l:clcOptions}],['确认日期','d',65,{t:'D'}]] as Each_ZdSetting[];
export const config检验复检表=[['类别','c',30],['项目编号','no',84],['检验不符合内容','b',150],
    ['复检结果','rs',50, {t:'s',l:clcOptions}],['确认日期','d',65,{t:'d'}]] as Each_ZdSetting[];

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
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t,field,s,o,park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["unq"]= z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["unq"]= storage["unq"].slice(0,30)
        return fields
    }, [storage])
    const arrayFields =React.useMemo(() => {
        const itemTemplate = {} as any
        config.forEach(([t,field,s,o,park]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"unq", itemTemplate,} ]
    }, [])

    const 默认复检表 =React.useMemo(()=>itemResultUnqualifiedOmni(storage, impressionismAs?.Item,),
        [storage,impressionismAs?.Item]);
    const headview=<h2 >
        {label}
    </h2>;
    const [nestRendererFactory]=useTableEditor({headview, config, table:'unq',defFixedLay:true, defaultV:默认复检表, noDelAdd:true, fixColumn:2,maxRf:2,saveFixC:true});
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            return (
                <>
                    <Card className="py-1 gap-1">
                        <CardContent className="px-1">
                            注意点击“清空全表至默认”会重新初始化！<hr/>
                            {nestRendererFactory(form, arrays)}
                        </CardContent>
                    </Card>
                    {children}
                </>
            )
        },
        [children,nestRendererFactory ],
    )
    const { render } = useFormFramework({schema, defaultValues, contentRendererFactory,arrayFields, rep})
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render()}
    </CollapsibleFormSection>;
};
