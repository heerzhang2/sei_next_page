/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Button, Input, InputDatalist, InputLine, Text,
    useReferenceWidth, LineColumn,
} from "customize-easy-ui-component";
import {InspectRecordLayout, SelectHookfork, useItemInputControl, useProjectListAs} from "../../common/base";
import {mergeEditorItemRefs, mergeEditorItemSubRefs} from "../../tools";
import {noOp} from "customize-easy-ui-component/esm/misc/noop";
import {useThrottle} from "../../../hooks/useHelpers";
import {useSubNestAcion} from "../../common/helper";
import {EditStorageContext} from "../../StorageContext";
import {EditorAreaConfig, } from "../../common/eHelper";
import {useSubRepController} from "../../hook/useSubRepController";
import {RecordInputConfig, RecordIspArea, RecordSelfSplit} from "../bridge/orcIspConfig";
import {backItemsConfigSearch} from "../helper";


/**起重监督检验的 范本； 支持分项报告的原始记录
 * */
export function useRecordListSub(ref: React.Ref<unknown>, repId: string, recordPrintList: EditorAreaConfig[],
                                 modAction: string, verId: string, nestMdConfig?: string,titleRender?: (store: any) => React.ReactNode
) {
    const {redId,action}=useSubNestAcion(modAction);   //动态解析URL路由转换可能出现的分项报告模板
    // const qs= queryString.parse(window.location.search);   //确保点击?&from=X 参数变动也能够刷新。
    const {storage, setStorage} =React.useContext(EditStorageContext) as any;
    const iDskey= '_'+nestMdConfig;
    // const rskey= '_'+nestMdConfig+'_'+redId;  带分项报告的机制：
    const { [iDskey]: SubRepIds }=storage;
    //印象派的项目列表需对应Ref=[...recordPrintList.length, 后面的]  ？分项报告有redoId重复的倍数。
    let editorRefCount=recordPrintList.length;      //+maxItemsSeq 伸展开的电梯item1.1列表编辑区域数量;

    //【奇怪】有时重启才会报错：违反hook规则？useProjectListAs因为是hook函数不能放在三元表达式中，但是参数就不管了。
    const refCount=(action==='ALL' || action==='printAll')? editorRefCount*(nestMdConfig? (SubRepIds?.length||1) : 1)  : 0;
    const clRefs =useProjectListAs({count: refCount } );
    //同名字的字段：清除／覆盖，编辑器未定义的字段数据可保留。[分项_2]{}如何正常合并？只有ALL printAll才会用到这的。
    const outCome=(action==='ALL' || action==='printAll')? (
            nestMdConfig? mergeEditorItemSubRefs(clRefs.current!, SubRepIds, nestMdConfig!, editorRefCount,storage, redId)
                : mergeEditorItemRefs( ...clRefs.current! )
        )
        : null;
    //旧模式两次暴露传递，返回给爷辈组件。
    const [doConfirmModify, setDoConfirmModify] = React.useState(false);
    //这个用在：框架右边页面菜单上"全部项目一起确认" 点击收集数据setDoConfirmModify=。然后底下的副作用React.useEffect(自动收集存储。”确认“后再保存。当一个区块不允许点击因ref空的!
    React.useImperativeHandle( ref,() => ({
        doConfirm: (action==='ALL' || action==='printAll')? setDoConfirmModify: noOp
    }), [setDoConfirmModify, action] );
    const {doFunc:throttledSetDoConfirmModify, ready} = useThrottle(setDoConfirmModify,1500);
    //点按钮后outCome先要render一次获得最新值；必须从false到true的变化才能触发执行。 true->true不能执行的。 useLayoutEffect
    React.useEffect(() => {
        if(doConfirmModify){
            setStorage({...storage, ...outCome});
            setDoConfirmModify(false);
        }
    }, [doConfirmModify, outCome, storage, setStorage] );

    const {view} =useSubRepController(nestMdConfig!, titleRender!); //callback: (store: any) => React.ReactNode
    const [refMyLineC,widthMyLinec]= useReferenceWidth();

    // const {impressionism, setImpressionism} =React.useContext(EditStorageContext) as any;
    // console.log('装配印象impressionismrecordPrintList=',recordPrintList);

    // const {generalFormat} =useItemNoRoutePercept({verId:'1', repId:'2'});
    // // console.log('装配起印象impressionism:', Reflect.ownKeys(impressionism));
    // const renderItemsContent =React.useCallback((projList: string) => {
    //     const confList=impressionism[projList] as RecordIspArea[];
    //     let seq = 0;
    //     let htmlTxts =[] as any[];
    //     confList.forEach((area, x) => {
    //         seq += 1;
    //         const rowHead =<ActionMapItems key={seq} ref={clRefs.current![recordPrintList.length+seq-1]}
    //                                       alone={false} show={action==='printAll'}
    //                                       config={area}
    //         />;
    //         htmlTxts.push(rowHead);
    //     });
    //     return ( <React.Fragment key={projList}>
    //         {htmlTxts}
    //     </React.Fragment> );
    // }, [action,  clRefs, impressionism,recordPrintList.length]);

    // //一个可独立路由的编辑器区域：可能有多个的正式报告项目，其中项目有可能是自己拆分的方式做的。路由和编辑器对应。
    // const renderActionArea =React.useCallback((projList: string,prjnos: string) => {
    //     const confList=impressionism[projList] as RecordIspArea[];
    //     let seq = 0;
    //     let htmlTxts =[] as any[];
    //     confList.filter((area) => area.tag === prjnos)
    //         .forEach((area, x) => {          //正常是唯一一个：prjnos标签定位唯一性area。
    //             seq += 1;
    //             const rowHead =<ActionMapItems key={seq} ref={clRefs.current![recordPrintList.length+seq-1]}
    //                                           alone={false} show={action==='printAll'}
    //                                           config={area}
    //             />;
    //             htmlTxts.push(rowHead);
    //     });
    //     return ( <React.Fragment key={prjnos}>
    //         {htmlTxts}
    //     </React.Fragment> );
    // }, [action,  clRefs, impressionism,recordPrintList.length]);

    //去掉了qs,依赖项；
    //编辑器【自定义路由】这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
    const recordList= React.useMemo(() =>
        {
            //【路由器分解】明面上最直观的路由部分，action==createItem(itemArea?)。  比如 /__ItemArs-2.1.2 自己做路由的？
            // let projetLists =Reflect.ownKeys(impressionism) as string[];
            // const {impresTag,prjnos} =verifyAction(action,projetLists);
            // if(impresTag)       //配置文件=印象派模式 ；通常为规整一致的项目列表 可形式化配置的，x.y.z标签对应的路由。
            //     return renderActionArea(impresTag,prjnos!);
            const itemA=recordPrintList.find((one)=>one.itemArea===action);
            if(itemA){
                return <React.Fragment>
                    {
                        React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
                            ref: null,
                            key: itemA.itemArea,
                            repId,
                            show: true,
                            redId,
                            nestMd: nestMdConfig,
                            verId,
                            alone: true,
                            refWidth: widthMyLinec,
                        })
                    }
                </React.Fragment>;
            }else if(action==='ALL' || action==='printAll'){
                if(redId || !nestMdConfig)
                    return recordPrintList.map((each, i) => {
                        // if(each.itemArea.startsWith("__")){         //印象派的项目列表区域:印象派模式的；
                        //     let map = new Map(Object.entries(impressionism));
                        //     for(let [key, value] of map){
                        //         if(each.itemArea=== `__${key}-`)
                        //             return  renderItemsContent(key);        //应该不止唯一个印象派key
                        //     }
                        //     throw new Error(`没做模板区`+each.itemArea);
                        // }
                        // else
                            return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            ref: clRefs.current![i],
                            show: action==='printAll',
                            alone: false,
                            repId,
                            key: i,
                            redId,
                            nestMd: nestMdConfig,
                            verId,
                            refWidth: widthMyLinec,
                        });
                    });
                else return  SubRepIds?.map((redId: string, k: number)=>{
                    //可重复的分项报告 k个；  暂不考虑印象派模式的；
                    return recordPrintList.map((each, i) => {
                        return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            ref: clRefs.current![i+ k*editorRefCount],
                            show: action==='printAll',
                            alone: false,
                            repId,
                            key: i,
                            redId,
                            nestMd: nestMdConfig,
                            verId,       //内嵌模式的分项模式的版本号只能听从主报告配置的。
                            refWidth: widthMyLinec,
                        });
                    });
                });
            }else if(action==='_Controller'){
                return <> {view} </>;
            }
            return  null;
        }
        ,[action,widthMyLinec, clRefs,repId, SubRepIds,nestMdConfig,redId, verId,recordPrintList,editorRefCount, view]);

    const list=(
     <div ref={refMyLineC}>
         {recordList}
         { (action==='ALL' || action==='printAll') &&
             <Button size="lg" intent={'primary'}  disabled ={!ready}
                     onPress={() =>{
                         //按钮“全部已编辑项目一起确认”必须使用ref切配对好才有效的。
                         throttledSetDoConfirmModify!(true);
                     }
                     }>
                 全部已编辑项目一起确认
             </Button>
         }
     </div>
  );

  return { list };
}


//检验项目的标准化展示组件
interface ActionMapItemsProps  extends React.HTMLAttributes<HTMLDivElement>{
    editAreasConf: RecordIspArea[];
    /**单一个路由可编辑区域对应的 一部分项目列表的 配置*/
    index: number;
    // config: RecordIspArea;
    show?: boolean;
    alone?: boolean;
    ref?: any;
    refWidth?: number;
}

//确认方式填X、Z、W（X表示现场监督、Z表示资料核查、W表示实物检查）
export const 工作见证的选择=['W','ZW','X','Z','XW','WX','ZXW'];
//监督检验的 每个正在编辑的项目。
//引进Render Props模式提高复用能力 { details[0](inp,setInp)  }；就可以配置成通用的组件。
//【通用的电梯原始记录的编辑器】对应action=x.y下标分解方式的路由器的组件入口：createItem('item1.1', <ItemUniversal x={0} y={0})
//这里配置的details有可能是 subItems 否则依据names 来配套的。编辑器组件定死用<SelectHookfork的。
//上级组件按钮“全部已编辑项目一起确认”必须使用ref切配对好才有效的。
export const ActionMapItems=
    React.forwardRef((
        { children, show=true, alone=true,editAreasConf,index,refWidth}:ActionMapItemsProps, ref
    ) => {
        const config=editAreasConf[index];
        const getInpFilter = React.useCallback((par: any) => {
            let fields={} as any;
            //配置动态命名的字段获取旧的值，还想保存修改数据，还要界面同步显示变化数值的场景，就按这里做法。
            config.items?.forEach((tago, i) => {
                tago.rss?.map(({name}:RecordSelfSplit,i:number)=> {
                    fields[name] =par[name];
                    return null;
                });
                fields[tago.name] =par[tago.name];
                fields[`${tago.name}_D`]= par[`${tago.name}_D`];
                fields[`${tago.name}_Z`]= par[`${tago.name}_Z`];
                fields[`${tago.name}_S`]= par[`${tago.name}_S`];
                fields[`${tago.name}_M`]= par[`${tago.name}_M`];
            });
            // const {见证资料表 }= par;
            return fields;
        }, [config]);
        const {inp, setInp} = useItemInputControl({ ref });
        const 见证资料选择=inp?.见证表?.map((a:any, i:number) => a.no);
        //因为Hook不能用逻辑条件，只能上组件分解了，按条件分解两个组件。
        //下拉列表标题=检验类别+项目内容；
        //逻辑组件内部的钩子Hook有差异需求。分解成两个组件逻辑合并后，性能是有提升。
        const render =React.useMemo(() => {
            let htmlTxts =[] as any[];
            let tagX: number=0;
            let tagY: number=0;
            let tagZ: number=0;
            let biglabel='';     //配置顺序相关：后面的替代前面的标识名称。
            let titllabel='';      //配置约束 titllabel必须和tagY同时配置上或者两者都不配置，不能只配置编号却没有标题文字。某一级别若切换：比如二级的x.y的y编码的就必须配置上新y取值。
            let sublabel = '';
            //允许本编辑区的配置继承来自前面的编辑区。反方向去搜索配置。【前提】最低一级或者第四级别必然做配置的。 x y z可能省略配置。editAreasConf[0]第一个必然会配置全套的。
            config.items?.forEach((tago, ct) => {
                if(tago){
                    //目前项目编码的划分成几个等级的：自动反向区块顺序中 找项目忽略配置
                    const desLevel=(tago.t!)>0? 4 : (tago.z!)>0? 3: (tago.y!)>0? 2: 1;
                    if(tagZ===0 && desLevel>=3) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,ct,3) as {id: number, name: string};
                        tagZ=id;
                        sublabel=name;
                    }
                    if(tagY===0 && desLevel>=2) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,ct,2) as {id: number, name: string};
                        tagY=id;
                        titllabel=name;
                    }
                    if(tagX===0 && desLevel>=1) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,ct,1) as {id: number, name: string};
                        tagX=id;
                        biglabel=name;
                    }
                    if(tago.x !== tagX && (tago.x!)>0){
                        tagY=0;
                        tagZ=0;         //这情形不能继承 .y .z 取值了；
                    }
                    tagX= (tago.x!)>0? tago.x! : tagX;
                    if(tago.y !== tagY && (tago.y!)>0){
                        tagZ=0;
                    }
                    tagY= (tago.y!)>0? tago.y! : tagY;
                    tagZ= (tago.z!)>0? tago.z! : tagZ;     //配置上面顺序的继承属性取值。  tago.x??tagX;

                    biglabel=tago.big??biglabel;
                    titllabel=tago.titl??titllabel;
                    sublabel=tago.sub??sublabel;
                    let selfSplit=!!tago.rss; //Array.isArray(tago.desc); //typeof tago.desc === "object" && tago.desc?.length>0;
                    // console.log("嵌入DOM废话类型明确吗=",selfSplit,"desc=",tago);
                    const rowHead =<div key={ct} css={{marginTop: '0.5rem'}}>
                        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Text variant="h6">检验类别 {tago.iclas??config.iclas}</Text>
                            <Text variant="h6">检验项目: {tagX}{tagY>0&&('.'+tagY)}{tagZ>0&&('.'+tagZ)}{(tago.t!)>0&&('.'+tago.t)}</Text>
                            <Text variant="h6">{biglabel}</Text>
                        </div>
                        {titllabel && <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Text variant="h6">{titllabel}</Text>
                            <Text variant="h6">{sublabel}</Text>
                            </div>
                        }
                        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            { selfSplit?  <>
                                    { tago.head && <>
                                                { typeof tago.head === "string"?
                                                    <Text  variant="h5">
                                                        {tago.head}
                                                    </Text>
                                                    :
                                                    tago.head
                                                }
                                         </>
                                    }
                                </>
                                :
                                <>
                                    { typeof tago.desc === "string"?
                                        <Text  variant="h5">
                                            {tago.desc}
                                        </Text>
                                        :
                                        tago.desc
                                    }
                                </>
                            }
                        </div>
                        <hr/>
                        { selfSplit?  <>
                            { (tago.rss?.map(({name,desc,label}:RecordSelfSplit, cx:number) => {
                                // let  dnode= (tago.desc as [])?.[cx];
                                return  <React.Fragment key={cx}>
                                        <div>
                                         { typeof desc === "string"?
                                            <Text  variant="h5">
                                                {desc}
                                            </Text>
                                            :
                                             desc
                                         }
                                        </div>
                                        <InputLine label={label ||'检查结果'}>
                                            <SelectHookfork value={(inp?.[name]) || ''} onChange={e => {
                                                inp[name] = e.currentTarget.value || undefined;
                                                setInp({ ...inp });
                                            }}
                                            />
                                        </InputLine>
                                    </React.Fragment>;
                            })) }
                            </>
                            :
                            <InputLine label={(tago.four??tago.sub??tago.name) ||'检查结果'}>
                                <SelectHookfork value={(inp?.[tago.name]) || ''} onChange={e => {
                                    inp[tago.name] = e.currentTarget.value || undefined;
                                    setInp({ ...inp });
                                }}
                                />
                            </InputLine>
                        }
                        <LineColumn column={2} >
                            <InputLine label='不合格内容'>
                                <Input value={(inp?.[`${tago.name}_D`]) || ''} onChange={e => {
                                    inp[`${tago.name}_D`] = e.currentTarget.value || undefined;
                                    setInp({ ...inp });
                                }}
                                />
                            </InputLine>
                            <InputLine label='工作见证'>
                                <InputDatalist value={(inp?.[`${tago.name}_Z`]) || ''} datalist={见证资料选择}
                                               onListChange={v => {
                                                   inp[`${tago.name}_Z`] = v || undefined;
                                                   setInp({ ...inp });
                                               } } />
                            </InputLine>
                            <InputLine label='确认方式'>
                                <InputDatalist value={(inp?.[`${tago.name}_S`]) || ''} datalist={工作见证的选择}
                                               onListChange={v => {
                                                   inp[`${tago.name}_S`] = v || undefined;
                                                   setInp({ ...inp });
                                               } } />
                            </InputLine>
                            <InputLine label='备注'>
                                <Input value={(inp?.[`${tago.name}_M`]) || ''} onChange={e => {
                                    inp[`${tago.name}_M`] = e.currentTarget.value || undefined;
                                    setInp({ ...inp });
                                }}
                                />
                            </InputLine>
                        </LineColumn>
                    </div>;
                    htmlTxts.push(rowHead);
                }
            });
            return  htmlTxts;
        }, [config,index,inp,setInp, 见证资料选择,editAreasConf]);

        return (<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                     alone={alone} label={`${config.iclas} ${config.name??config.tag}`}
                 >
            {render}
        </InspectRecordLayout>);
    } );


//【某项目列表】当中的tag ：
//校验URL的action字段能否匹配项目编号? 2.4。 / 6.9 ;
/** @Deprecated
 * 把路由器的action提取分解：
 * @param projetLists : 所有已经登记在册的项目列表大区。可允许不止于唯一一个的印象派模式的项目列表。
 * @return 印象派项目列表的大区的登记名。
 * @param action 标签组成：__印象派标识-后缀实际的项目序号 ；一个模板支持多个的印象派标识情况。印象派=配置文件模式的。
 *@return 返回 {impresTag 印象派配置标记, prjnos 底下详细的项目编码}
 * */
// function verifyAction( action:  string, projetLists: string[]) {
//     let impresTag=undefined;
//     let prjnos;
//     projetLists.forEach(projetList => {
//        let spart='__'+projetList+'-';
//        if(action.startsWith(spart)){
//            impresTag=projetList;
//            prjnos=action.substring(spart.length);
//        }
//     });
//     return {impresTag, prjnos};
// }

/**原始记录 就需要转换结果的： 若是正式报告的转换可能牵涉分项目的合并的意思。
 * action导航的每个配置项目区域：必须能够决定结论。【注意】不能跨区配置。
 * @return 单一一个项目{正式报告对应一个项目序号的； 原始记录也是关联着项目顺序表上最左边的序号}的 自动综合出来的判别结果。
 * @param itRes : 原始记录 或者 对于正式报告有些可能被转换后的。
 * 默认值 从'合格' 改成 '/'
**/
export const itemResTransform = (itRes: any,config: RecordInputConfig) => {
    let result='／';
    if(config.rss?.length! >0){        //自拆分形式的项目：
        config.rss?.forEach(({name}:RecordSelfSplit, n:number) => {
            if(name){
                const jilu= itRes[name];
                if(!jilu || jilu==='' || jilu==='△' || jilu==='×'){
                    if(result!=='不合格')  result='不合格';
                }
                else if(jilu==='√' || jilu==='▽'){
                    if(result==='／')   result='合格';
                }
                else if(jilu==='／'){
                }
                else
                    throw new Error(`自拆结论非法${jilu}`);
            }
        });
    }
    else{
        const jilu= itRes[config.name];
        if(!jilu || jilu==='' || jilu==='×' || jilu==='△' ){
            result='不合格';
        }
        else if(jilu==='√' || jilu==='▽'){
            result='合格';
        }
        else if(jilu==='／'){
        }
        else
            throw new Error(`结论非法${jilu}`);
    }
    return  result;
}


//定期检验的 每个正在编辑的项目。
//引进Render Props模式提高复用能力 { details[0](inp,setInp)  }；就可以配置成通用的组件。
//【通用的电梯原始记录的编辑器】对应action=x.y下标分解方式的路由器的组件入口：createItem('item1.1', <ItemUniversal x={0} y={0})
//这里配置的details有可能是 subItems 否则依据names 来配套的。编辑器组件定死用<SelectHookfork的。
//上级组件按钮“全部已编辑项目一起确认”必须使用ref切配对好才有效的。
//自拆分模式的项目这里不合格内容要分开输入，不是单独一个的输入。
export const ActionMapItemsDj=
    React.forwardRef((
        { children, show=true, alone=true,editAreasConf,index,refWidth}:ActionMapItemsProps, ref
    ) => {
        const config=editAreasConf[index];
        const getInpFilter = React.useCallback((par: any) => {
            let fields={} as any;
            //配置动态命名的字段获取旧的值，还想保存修改数据，还要界面同步显示变化数值的场景，就按这里做法。
            config.items?.forEach((tago, i) => {
                if((tago.rss?.length!) >0 ){
                    tago.rss?.forEach(({name}:RecordSelfSplit,i:number)=> {
                        fields[name] =par[name];
                        fields[`${name}_D`]= par[`${name}_D`];      //自拆分项目 分别录入不合格
                    });
                }else{
                    fields[`${tago.name}_D`]= par[`${tago.name}_D`];
                }
                fields[tago.name] =par[tago.name];
                // fields[`${tago.name}_Z`]= par[`${tago.name}_Z`];
                // fields[`${tago.name}_S`]= par[`${tago.name}_S`];
                fields[`${tago.name}_M`]= par[`${tago.name}_M`];
            });
            // const {见证资料表 }= par;
            return fields;
        }, [config]);
        const {inp, setInp} = useItemInputControl({ ref });
        // const 见证资料选择=inp?.见证表?.map((a:any, i:number) => a.no);
        //因为Hook不能用逻辑条件，只能上组件分解了，按条件分解两个组件。
        //下拉列表标题=检验类别+项目内容；
        //逻辑组件内部的钩子Hook有差异需求。分解成两个组件逻辑合并后，性能是有提升。
        const render =React.useMemo(() => {
            let htmlTxts =[] as any[];
            let tagX: number=0;
            let tagY: number=0;
            let tagZ: number=0;
            let biglabel='';     //配置顺序相关：后面的替代前面的标识名称。
            let titllabel='';      //配置约束 titllabel必须和tagY同时配置上或者两者都不配置，不能只配置编号却没有标题文字。某一级别若切换：比如二级的x.y的y编码的就必须配置上新y取值。
            let sublabel = '';
            //允许本编辑区的配置继承来自前面的编辑区。反方向去搜索配置。【前提】最低一级或者第四级别必然做配置的。 x y z可能省略配置。editAreasConf[0]第一个必然会配置全套的。
            config.items?.forEach((tago, ct) => {
                if(tago){
                    //目前项目编码的划分成几个等级的：自动反向区块顺序中 找项目忽略配置
                    const desLevel=(tago.t!)>0? 4 : (tago.z!)>0? 3: (tago.y!)>0? 2: 1;
                    if(tagZ===0 && desLevel>=3) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,ct,3) as {id: number, name: string};
                        tagZ=id;
                        sublabel=name;
                    }
                    if(tagY===0 && desLevel>=2) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,ct,2) as {id: number, name: string};
                        tagY=id;
                        titllabel=name;
                    }
                    if(tagX===0 && desLevel>=1) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,ct,1) as {id: number, name: string};
                        tagX=id;
                        biglabel=name;
                    }
                    if(tago.x !== tagX && (tago.x!)>0){
                        tagY=0;
                        tagZ=0;         //这情形不能继承 .y .z 取值了；
                    }
                    tagX= (tago.x!)>0? tago.x! : tagX;
                    if(tago.y !== tagY && (tago.y!)>0){
                        tagZ=0;
                    }
                    tagY= (tago.y!)>0? tago.y! : tagY;
                    tagZ= (tago.z!)>0? tago.z! : tagZ;     //配置上面顺序的继承属性取值。  tago.x??tagX;

                    biglabel=tago.big??biglabel;
                    titllabel=tago.titl??titllabel;
                    sublabel=tago.sub??sublabel;
                    let selfSplit=!!tago.rss; //Array.isArray(tago.desc); //typeof tago.desc === "object" && tago.desc?.length>0;
                    // console.log("嵌入DOM废话类型明确吗=",selfSplit,"desc=",tago);
                    const rowHead =<div key={ct} css={{marginTop: '0.5rem'}}>
                        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Text variant="h6">检验类别 {tago.iclas??config.iclas}</Text>
                            <Text variant="h6">检验项目: {tagX}{tagY>0&&('.'+tagY)}{tagZ>0&&('.'+tagZ)}{(tago.t!)>0&&('.'+tago.t)}</Text>
                            <Text variant="h6">{biglabel}</Text>
                        </div>
                        {titllabel && <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Text variant="h6">{titllabel}</Text>
                            <Text variant="h6">{sublabel}</Text>
                        </div>
                        }
                        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            { selfSplit?  <>
                                    { tago.head && <>
                                        { typeof tago.head === "string"?
                                            <Text  variant="h5">
                                                {tago.head}
                                            </Text>
                                            :
                                            tago.head
                                        }
                                    </>
                                    }
                                </>
                                :
                                <>
                                    { typeof tago.desc === "string"?
                                        <Text  variant="h5">
                                            {tago.desc}
                                        </Text>
                                        :
                                        tago.desc
                                    }
                                </>
                            }
                        </div>
                        <hr/>
                        { selfSplit?  <>
                                { (tago.rss?.map(({name,desc,label}:RecordSelfSplit, cx:number) => {
                                    // let  dnode= (tago.desc as [])?.[cx];
                                    return  <React.Fragment key={cx}>
                                        <div>
                                            { typeof desc === "string"?
                                                <Text  variant="h5">
                                                    {desc}
                                                </Text>
                                                :
                                                desc
                                            }
                                        </div>
                                    <LineColumn column={2} >
                                        <InputLine label={label ||'检查结果'}>
                                            <SelectHookfork value={(inp?.[name]) || ''} onChange={e => {
                                                inp[name] = e.currentTarget.value || undefined;
                                                setInp({ ...inp });
                                            }}
                                            />
                                        </InputLine>
                                        <InputLine label='不合格内容'>
                                            <Input value={(inp?.[`${name}_D`]) || ''} onChange={e => {
                                                inp[`${name}_D`] = e.currentTarget.value || undefined;
                                                setInp({ ...inp });
                                            }}
                                            />
                                        </InputLine>
                                    </LineColumn>
                                    </React.Fragment>;
                                })) }
                                <InputLine label='备注'>
                                    <Input value={(inp?.[`${tago.name}_M`]) || ''} onChange={e => {
                                        inp[`${tago.name}_M`] = e.currentTarget.value || undefined;
                                        setInp({ ...inp });
                                    }}
                                    />
                                </InputLine>
                            </>
                            :
                            <>
                                <LineColumn column={2} >
                                <InputLine label={(tago.four??tago.sub??tago.name) ||'检查结果'}>
                                    <SelectHookfork value={(inp?.[tago.name]) || ''} onChange={e => {
                                        inp[tago.name] = e.currentTarget.value || undefined;
                                        setInp({ ...inp });
                                    }}
                                    />
                                </InputLine>
                                <InputLine label='不合格内容'>
                                    <Input value={(inp?.[`${tago.name}_D`]) || ''} onChange={e => {
                                        inp[`${tago.name}_D`] = e.currentTarget.value || undefined;
                                        setInp({ ...inp });
                                    }}
                                    />
                                </InputLine>
                                <InputLine label='备注'>
                                    <Input value={(inp?.[`${tago.name}_M`]) || ''} onChange={e => {
                                        inp[`${tago.name}_M`] = e.currentTarget.value || undefined;
                                        setInp({ ...inp });
                                    }}
                                    />
                                </InputLine>
                            </LineColumn>
                            </>
                        }
                    </div>;
                    htmlTxts.push(rowHead);
                }
            });
            return  htmlTxts;
        }, [config,index,inp,setInp, editAreasConf]);

        return (<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                     alone={alone} label={`${config.iclas} ${config.name??config.tag}`}
        >
            {render}
        </InspectRecordLayout>);
    } );

