/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    BlobInputList,
    Button,
    ButtonRefComp,
    CCell, CheckSwitch,
    DdMenu,
    DdMenuItem,
    Input, InputDatalist,
    InputLine,
    Layer,
    LineColumn, SuffixInput,
    TableRow,
    Text,
    TextArea,
    useTheme,
} from "customize-easy-ui-component";
import {InspectRecordLayout, useItemInputControl} from "../common/base";
import {useMediaLayout} from "use-media";
import {useMeasure} from "customize-easy-ui-component/esm/Hooks/use-measure";
import {useWindowSize} from "customize-easy-ui-component/esm/Hooks/use-window-size";
import {objNestSet} from "../../common/tool";
import {EditStorageContext} from "../StorageContext";
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
import {ClearableSelect} from "@/components/chub";
import {clcOptions} from "@/report/common/ActionMapItem";
import {tail应变} from "@/report/recreation/waterJj/StrainStress";

//通用render编辑器回调类型: 因为后面修改的只好把参数field放在后面添加，避免报错太多了。
//这里第三个field参数：实际就是表格的嵌套属性字段。而inp,setInp实际对应通用表格组件内部提供的obj,setObj的状态管理变量函数：而不是报告编辑区对话框层面的inp,setInp。混淆。
/**
 *@param park?: 嵌套字段情况的 湖北存储名。
 * */
export declare type InputRenderCallback = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>,field:string,park?:string) => React.ReactNode;
// interface RenderProps {
//     entry: IntersectionObserverEntry | undefined;
//     ref: React.RefObject<any> | ((node?: Element | null) => void);
// }

/**
 * 通用型 {制作 报告的} 可适应 大屏 手机小屏幕的 二维表格数据编辑录入。
 * 注意固定长布局 l3: 参数设置：最大设置为手机的竖屏的极限宽度360px，超过了不正常。"D:/file/dsfsdfxqe4qwe说的很对cvxcv3xcvsdf.docx"就超过了；
 * 【局限与选择】固定长布局不适合小屏幕竖屏的+超长的字段内容需显示的场景，要切换弹性布局来显示。
 * 若配置刚刚加上了 input_render_cb 字段，效果可能需要重启前端才能正常？展示。
 *@param  n1 参数是标题名；
 * f2 参数是=存储字段；
 * l3： 安排的px宽度 允许超过手机宽度如=430。
 * input_render_cb 当前单独一个字段的编辑器重新自己定义。
 * */
export type Each_ZdSetting =[
    n1:string,      //字段标题名
    f2:string,      //数据库标签
    l3:number,      //布局的像素宽度
    input_render_cb?: InputRenderCallback | undefined,       //编辑回调: 编辑器特殊性要求，高阶函数。
    //只能支持1层的嵌套对象： 对于Row.{m. sgm {name,username}}无法支持的。
    park?:string,       //对于比如svp{},pa{}的嵌套字段的编辑直接支持，直接保存为嵌套的对象字段；
];
//通道 厚度分区（mm） :? 能不能抽象和复用“通用多行表输入”的组件？  通道表; 二维数组对象表达法。

interface Props {
    ref: React.Ref<any>;
    //接受par输入的过滤器，回调 过滤有用数据。
    //filter: (par: any) => {};
    //可重复加的报告实例id
    redId?: string;
    show?: boolean;
    alone: boolean;
    nestMd?: string;
    //表格的基本配置  多字段
    config: Each_ZdSetting[];
    /**存储的json表*/
    table: string;
    /**LineColumn 自适应 最大放下编辑框 列数： >=2 and <=5 */
    column?: number;
    /**LineColumn 自适应 适应内容宽度来拆分几个排的列 */
    breaks?: number[];
    label: string;
    /**自定义开头 DOM */
    headview: React.ReactNode;
    /**自定义尾部 DOM */
    tailview?: React.ReactNode;
    /**缺省表赋值，初始化用
     * default 是js的关键字 不能用作变量名
     * */
    defaultV?: any[];
}
/**【用的少】因为很多需要其它编辑内容的；会直接改用useTableEditor；表格数据编辑: 不能多個表格追加一起做編輯的。
 * 用了<DdMenu icon替代了<Popover>做菜单后会好点：菜单版面紧凑而且易于扩展。
 * */
export function useRepTableEditor({ ref, nestMd, show, alone, redId, config, table,column,breaks,label,
                                      headview,tailview,defaultV}
    : Props
) {
    const getInpFilter = React.useCallback((par: any) => {
        const  grid= par?.[table];   //动态字段table的提取。
        if(!grid)   return { [table]: defaultV };
        else return { [table]: grid };
    }, [table, defaultV]);
    const {inp, setInp} = useItemInputControl({ ref });
    const [renderInner]=useTableEditor({config, table, column, breaks,
                     inp, setInp,  headview, tailview, defaultV});
    const render=<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter}  show={show}  redId={redId} nestMd={nestMd}
                                 alone={alone}  label={label}>
        {renderInner}
    </InspectRecordLayout>;
  return { render };
}


interface TableEditorProps {

    // ref: React.Ref<any>;
    //表格的基本配置  多字段
    config: Each_ZdSetting[];
    /**存储的json表*/
    table: string;
    /**自适应 最大放下编辑框 列数： >=2 and <=5
     * 给输入编辑器区域的 LineColumn组件 用的；
     * */
    column?: number;
    /**自适应 适应内容宽度来拆分几个排的列 */
    breaks?: number[];
    /**自定义开头 DOM */
    headview: React.ReactNode;
    /**自定义尾部 DOM */
    tailview?: React.ReactNode;
    /**缺省表赋值，初始化用
     * default 是js的关键字 不能用作变量名
     * */
    defaultV?: any[];
    /**不能增加或删除，只能按照默认值设置的那些行做修改,允许清空复位*/
    noDelAdd?: boolean;
    /**从config[]前面的起算：第几个列的对应的每一行数据才能被修改，在这一个基数之前的各列只能用默认值; 缺省等同fixColumn=0*/
    fixColumn?: number;
    /**编辑器组件可自定义的*/
    editAs?: (obj:any, setObj:React.Dispatch<React.SetStateAction<any>>, seq:number | null) => React.ReactNode;
    /**在水平轴X方向布局上：最多允许显示几排的; 有些表格的可输入的行数实际很少的*/
    maxRf?: number;
    /**水平轴X方向依据浏览器可用屏幕区域大小来进行拉伸，默认是小屏幕的，配置分别代表了两阶段拉伸[小屏幕,电脑屏|平板电脑, 台式机的超大屏幕]的拉伸系数；
     * 缺省取值=[1, 1.35, 1.70];
     * */
    stretchF?: number[];
    /**默认是不保存固定列的取值*/
    saveFixC?: boolean;
}

//36个预定分隔符：代替表格的边线：不被文本录入用，尽量宽度小。
const TabSplChars=['◆','╏','│','┋','╁','↑','╀','●','║','◇','┃','┩','¤','┪','╔','╝','Θ','∣','╚','╗','╡','┇','╞','╘','╕','┊','╬','┾','╮','╉','◎','♂','╰','┠','↓','╠'];

/**表格数据编辑：纯净的版本，没有加上框架<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter=;允许多个表格一起编辑。
 * 可以和别的更多的 编辑表单内容直接的组合。
 * 【特别地】针对（defaultV && fixColumn && noDelAdd）同时满足的特别情况：把固定不变的列从表格存储和编辑保存方法中分离开来，这个情景下obj对象不要包括固定列。
 * 可惜缺点也明显：需要多一个确认或多一次点击菜单有点啰嗦， 但是生命力适应性也较好。
 * 上一级提供useForm,这里作为父辈form一部份构造的（form，，）=>DOM。
 * */
export function useTableEditor({config, table,column,breaks, headview,tailview,defaultV, noDelAdd,fixColumn,editAs,maxRf,
                                   stretchF=[1,1.35,1.7], saveFixC=false,
}: TableEditorProps) {
    const theme = useTheme();
    const isBigSrc = useMediaLayout(`${theme.breakpoints.big}`);
    const excludeFix=(defaultV && (fixColumn!>=1) && noDelAdd) && (!saveFixC);      //排除掉固定列模式的存储需要。
    //当前正在编辑的是位于表存储数组的哪一行，
    const [seq, setSeq] = React.useState<number | null>(null);   //表對象的當前一條。
    //当前标题条跟随的 被用户点击关注的哪一行。 0，1,2: null=代表清空选定； 0:行的=默认位置；
    const [hoverr, setHoverr] = React.useState<number | null>(0);
    //【二传手的】需要多点一次(触发确认)按钮的；分离的状态对象：仅针对表格唯一行。
    const [obj, setObj] = React.useState<any>({});
    // async function doLogin(e: React.FormEvent  | Event)
    // {   console.log("点了form");  }
    const onModifySeq = React.useCallback((idx:number,it:any) => {
        setObj(it);
        setSeq(idx);
    }, [setSeq, setObj]);
    // function onModifySeq(idx:number,it:any){
    //     setObj(it);
    //     setSeq(idx);
    // }
    const onDeleteSeq = React.useCallback((idx:number) => {
        inp?.[table]?.splice(idx,1);
        setInp({...inp,[table]: [...inp?.[table]] });
        setSeq(null);
    }, [inp, setInp, table]);
    const onInsertSeq = React.useCallback((idx:number) => {
        inp?.[table]?.splice(idx,0, obj);
        setInp({...inp,[table]:[...inp?.[table]] });
        setSeq(idx);
    }, [obj, inp, setInp, table]);
    // function onInsertSeq(idx:number){
    //     inp?.[table]?.splice(idx,0, obj);
    //     setInp({...inp,[table]:[...inp?.[table]] });
    //     setSeq(idx);
    // }

    //代替表格的边线：不被文本录入用，尽量宽度小。
    function spliteor(i:number){
        return TabSplChars[i%(TabSplChars.length)];
    }
    //【注意】回调callback局限：若加<React.Fragment > 会导致<InputLine 内勤套render时刻无法穿透提供 props 给输入组件的：层次层级不配套，造成样式不一致问题！
    const editor=React.useCallback( (form: any, arrays?: Record<string, any>) => {
        if(editAs) return editAs(obj,setObj,seq);
        else return <Layer elevation={"sm"} css={{display: 'flex',justifyContent: 'center',flexDirection: 'column',width: '-webkit-fill-available',
                            [theme.mediaQueries.md]: {flexDirection: 'row',padding:'0.25rem'}
            }}>
            {seq===null? '新' : seq!+1}
            <div className="editLinc" css={{width: '-webkit-fill-available'}}>
                <LineColumn className="editItems" breaks={breaks} column={column}>
                    {(config).map(([title,tag, _, callback,park]:any,i:number) => {
                        if(fixColumn && i<fixColumn)   return <React.Fragment key={i}></React.Fragment>;
                        else return (
                            <InputLine key={i} label={title+'：'}
                                       css={{ "& .InputLine__Head": {alignItems: 'center'} }}
                            >
                                { callback ? callback(obj, setObj, tag, park)
                                    :
                                    park? <Input value={obj?.[park]?.[tag] ||''}
                                                 onChange={e => {
                                                     objNestSet(park, tag,  e.currentTarget.value||undefined, obj, setObj);
                                                 } } />
                                        :
                                    <Input value={obj?.[tag] ||''}
                                           onChange={e => {
                                               setObj({...obj, [tag]: (e.currentTarget.value||undefined)});
                                           } } />
                                }
                            </InputLine>
                        );
                    } )  }
                </LineColumn>
                <Button onPress={() => {
                    if(seq !== null) {
                        inp?.[table]?.splice(seq, 1, obj);    //替换掉的
                        setInp({ ...inp, [table]: [...inp?.[table]] });
                    }
                    else if(inp?.[table]?.length>0){
                        inp?.[table]?.splice(inp?.[table]?.length, 0, obj);    //尾巴加
                        setInp({ ...inp, [table]: [...inp?.[table]] });
                    }
                    else  setInp({ ...inp, [table]: [obj] });
                } }
                >{(inp?.[table]?.length>0 && seq!==null)? `改一组就确认`: `新增一组`}</Button>
            </div>
        </Layer>;
    }, [ obj, seq, config,breaks,column, fixColumn, table ,editAs]);

    //若往底下<ButtonRefComp再嵌入<Table<TableRow<CCell也可以，保持各个按钮区域行在竖向线上也能对齐：适合只能像打印规定尺寸的场景，各个字段所占用空间变化差距大的不适合。tr div不能混合用！
    const [tiloff, setTiloff] = React.useState<number>(0);       //头部的栏目条位置跟随
    //表格的全字段名称所在栏目div:
    const {innerHeight, }= useWindowSize();       //浏览器TAB内窗口全局大小; 两阶段拉伸[电脑屏|平板电脑, 台式机的超大屏幕]
    const dytilRef = React.useRef<HTMLDivElement>(null);
    const barRect = useMeasure(dytilRef as React.RefObject<HTMLElement>);
    const hBarWidth= barRect?.width || 0;
    //屏幕的类型 ：大中小屏的区分；
    const screenTp=(innerHeight!)>860 && hBarWidth>1700 ? 2: (innerHeight!)>740 && hBarWidth>1280 ? 1: 0;
    const [fixedColW, setFixedColW] = React.useState<boolean>(isBigSrc);
    const raft= React.useMemo( () => {
        //不能用 dytilRef?.current?.getBoundingClientRect();没办法更新。
        //按属性对Object分类 https://blog.csdn.net/weixin_48594833/article/details/128830644  回调行数prev 必需,cur 必需,index 可选,arr可选
        const desiredW=config.reduce((prevSum, [_, _t, width] : any,i,arr) => {
            return (prevSum + width);
        }, 0);
        let rfnum=Math.floor(hBarWidth!/(desiredW*stretchF[screenTp]));
        let canDispNum=(isNaN(rfnum) || rfnum<1)? 1 : rfnum>20? 20 : rfnum;
        if(maxRf)   return (canDispNum>maxRf?  maxRf : canDispNum);
        else  return canDispNum;
    }, [hBarWidth, screenTp, stretchF, config, maxRf ]);
    // console.log("古荡苏打水建议放排barRect=",barRect);
    //不能依据状态来丢弃HOOK调用; 若是=fixedColW? useMeasure(dytilRef) :? @报错React has detected a change in the order of Hooks called           Previous render            Next render
    //旧版本用const szTil=useMeasure(dytilRef.current? dytilRef : null);          //可回避 HOOK报错

    React.useLayoutEffect(() => {
        setFixedColW(isBigSrc);
        // target.current && setSize(target.current.getBoundingClientRect())
    }, [isBigSrc, setFixedColW])

    const rowRefs = React.useRef<Map<number, HTMLDivElement | null>>(new Map());
    //【可能因位置移动变量没变化】导致不能实际变更标题条的新位置。只好麻烦点加了这个。
    React.useEffect(() => {
        if(hoverr!=null){         //栏目条位置跟随
            const clkRow = rowRefs.current!.get(hoverr!);
            const rect = clkRow?.getBoundingClientRect();
            const bar= dytilRef?.current?.getBoundingClientRect();
            const spanY=rect?.top! - bar?.top! - bar?.height!;
            //【关键靠】tiloff状态量变动驱动 标题条移动的。
            setTiloff(spanY);
        }
    }, [hoverr, setTiloff]);

    //若ALL编辑区域拉上的情况{instrumentTable}还没有ref.current: 切换后才有DOM存在的；所以这个上面的useMeasure就无法注册成功，拉开展示DOM之后useMeasure不会更新了:上一级dytilRef无法体现页面点击拉开新的ref、
    // console.log("目前管壁·旧的=",raft, seq);
    const membersum=inp?.[table]?.length;
    const linecnt=Math.ceil(inp?.[table]?.length/raft) ;        //最多抵达行的总个数；

    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            return (
                <>
                    {headview}
                    <Button intent='primary' onPress={() => setFixedColW(!fixedColW)}
                    >{fixedColW? `弹性布局` : `定长布局`}</Button>按每行{excludeFix? config.length-fixColumn! : config.length}列为一组录入
                    <Button onPress={() => {
                        if(excludeFix){
                            let fxkeys={} as any;       //配置里面前面几列的固定不修改的字段key名; 转为对象化形式的{key1:, key2:, ...}；
                            for(let k=0;k<fixColumn!;k++){
                                const field=config[k][1];
                                fxkeys[field]=undefined;        //排除字段。
                            }
                            const excludeAft=defaultV?.map(defObj=>{
                                const newobj = Object.keys(defObj).reduce((object : any, key) => {
                                    if(! (key in fxkeys)) {
                                        object[key] =defObj[key];
                                    }
                                    return object;
                                }, {})
                                return newobj;
                            });
                            setInp({ ...inp, [table]: excludeAft})
                        }
                        else setInp({ ...inp, [table]: defaultV});
                    } }>清空全表至默认</Button>
                    <hr/>
                    <div>
                        <div ref={dytilRef}
                             style={{
                                 position: 'relative',        //用'fixed'的更离奇；'sticky',
                                 top: `${tiloff}px`,
                                 background: 'ghostwhite',
                                 zIndex: theme.zIndices.sticky,
                             }}
                        >
                            <div className="HBar" css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                                { (new Array(raft)).fill(null).map(( _,  b:number) => {
                                    return <DdMenu key={b}  label="多选" icon={
                                        <ButtonRefComp  size="md" variant="ghost"  css={{display: 'flex',flexDirection: 'column',alignItems:'flex-start',
                                            flexWrap: 'wrap', width: '-webkit-fill-available', justifyContent: 'space-between',
                                            height: 'unset', minHeight: '32px', padding: 'unset !important',textAlign:'unset' }}
                                                        onPress={(e: React.FormEvent<Element> | Event| any) =>{
                                                            setTiloff(0);
                                                        } } >
                                            <Text variant={'subtitle'}>{`${b+1}`}</Text>
                                            <div css={{display: 'flex',width: '-webkit-fill-available',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                                                {(config).map(([title,tag,width]:any,k:number) => {
                                                    //数据行 不考虑加： whiteSpace: 'break-spaces', 若超长的 重叠显示的；
                                                    return (
                                                        <div key={k} css={{width:fixedColW? width*stretchF[screenTp] : 'unset',overflowWrap:'anywhere',whiteSpace: 'initial',lineHeight: 1.3}}>
                                                            {spliteor(k)}{title}</div>
                                                    );
                                                } )  }
                                            </div>
                                        </ButtonRefComp>
                                    }
                                                   divStyle={{ padding: '0 !important',width: fixedColW? 'unset':`calc(${100/raft}%)` } }
                                    >
                                    </DdMenu>
                                }) }
                            </div>
                        </div>

                        {!isNaN(linecnt) && (new Array(linecnt)).fill(null).map((_, i:number)=>{
                            //底下的<DdMenu 没办法用 css={{padding 来改动样式啊。
                            // let mbbLeft=(membersum- raft*i);
                            // mbbLeft= mbbLeft>=raft? raft : mbbLeft;    //当前这行有几个真实的存在 data[];
                            const domRow=<div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                                { (new Array(raft)).fill(null).map((__:any,b:number)=> {
                                    const  a=inp?.[table]?.[raft*i +b];    //后端数据的某一行对象a={,}
                                    return <DdMenu key={b}  label="多选" icon={
                                        <ButtonRefComp  size="md" variant="ghost"  css={{display: 'flex',flexDirection: 'column',alignItems:'flex-start',
                                            flexWrap: 'wrap', width: '-webkit-fill-available', justifyContent: 'space-between',
                                            height: 'unset', minHeight: '32px', padding: 'unset !important',textAlign:'unset' }}
                                                        onPress={(e: React.FormEvent<Element> | Event| any) =>{
                                                            setTiloff(0);
                                                            setSeq(null);
                                                            if(i===hoverr)   setHoverr(0);
                                                            else  setHoverr(i);     //光靠setTiloff不保证能更新啊，只能额外增加状态和依赖
                                                        } } >
                                            <Text variant={'subtitle'}>{`${raft*i +b+1}`}</Text>
                                            <div css={{display: 'flex',width: '-webkit-fill-available',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                                                {(config).map(([title,tag,width,_,park]:any,k:number) => {
                                                    //数据行 不考虑加： whiteSpace: 'break-spaces', 若超长的 重叠显示的；
                                                    return (
                                                        <div key={k} css={{width:fixedColW? width*stretchF[screenTp] : 'unset',overflowWrap:'anywhere',whiteSpace: 'initial',lineHeight: 1.3}}>
                                                            { (raft*i+b < membersum) &&
                                                                (spliteor(k) + ((excludeFix && k<fixColumn!) ?  (park? defaultV[raft*i+b]?.[park]?.[tag] : defaultV[raft*i+b]?.[tag])
                                                                        : (park? a?.[park]?.[tag]??'' : a?.[tag]??'')
                                                                )  )
                                                            }
                                                        </div>
                                                    );
                                                } )  }
                                            </div>
                                        </ButtonRefComp>
                                    }
                                                   divStyle={{ padding: '0 !important',width: fixedColW? 'unset':`calc(${100/raft}%)` } }
                                    >
                                        { (raft*i+b < membersum)  &&  <>
                                            <DdMenuItem label={'修改'} onClick={  () => { onModifySeq(raft*i +b,a) } } />
                                            {!noDelAdd &&  <>
                                                <DdMenuItem label={'刪除这条'} onClick={  () => { onDeleteSeq(raft*i +b) } } />
                                                <DdMenuItem label={'插入一条'} onClick={  () => { onInsertSeq(raft*i +b) } } />
                                            </>
                                            }
                                        </>
                                        }
                                    </DdMenu>

                                })
                                }
                            </div>;

                            return <React.Fragment  key={i}>
                                { React.cloneElement(domRow as React.ReactElement<any>, {
                                    ref: (el: HTMLDivElement | null) => {
                                        rowRefs.current!.set(i, el);        //栏目条位置跟随rowRefs=第几个行Line? 而不是member第几个;
                                    },
                                }) }
                                {(seq!=null && seq>=raft*i && seq<raft*(i+1) ) && editor(form, arrays)}
                            </React.Fragment>;
                        }) }
                    </div>
                    <div css={{display: seq===null? 'flex': 'none', justifyContent: 'center'}}>
                        { !noDelAdd && editor(form, arrays)}
                    </div>
                    {tailview}
                </>
            )
        },
        [ ],
    )
    //useForm依赖颠倒了：需工厂模式
    return  [contentRendererFactory];
}

/**因为异型表格 需要的render扩展配置： 对编辑器配置的对等关联性质扩充，来丰富报告或原始记录的打印的变通。
 * */
export type HeterogeneousColSpan =[row:number, column: number];
export type HeterogeneousColumn =[name:string, span: HeterogeneousColSpan];
// export type HeterogeneousSpan = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode;
export type Heterogeneous= {
    //表题名称替换 默认的。
    n?: string;
    //列 Span 替换默认值。【注意】具体的表格不应该使用这里预留的字段，假若所指代意思不一样的话。 "n""c""1""2"预留的通用表格对象属性。
    c?: number;
    //数值作为标签=对象key的: 1=前面追加第一个列， 2=前面追加第二个列， 3=...; 附加几个表格列位置的定义。  //举例,属性 2:['斜梯',[7,1]] as HeterogeneousColumn
    [key: number]: HeterogeneousColumn;
}
/**
 * @Deprecated
 * 针对性检验项目栏目几个列Cell的修订：  附身列的定义；
 * */
export const HeterogeneousRender=(title:string, setting: Heterogeneous, defColumn:number
)=> {
    //针对的“检验项目栏目”：最多支持这一行的位置允许一次性扩充出4列；
    const {n:name, c:column, 1:col1, 2:col2, 3:col3,4:col4}=setting;
    return <>
        {col1 && <CCell rowSpan={col1[1][0]} colSpan={col1[1][1]}>{col1[0]}</CCell>}
        {col2 && <CCell rowSpan={col2[1][0]} colSpan={col2[1][1]}>{col2[0]}</CCell>}
        {col3 && <CCell rowSpan={col3[1][0]} colSpan={col3[1][1]}>{col3[0]}</CCell>}
        {col4 && <CCell rowSpan={col4[1][0]} colSpan={col4[1][1]}>{col4[0]}</CCell>}
        <CCell colSpan={column??defColumn} css={{wordBreak: 'break-all'}}>{name??title}</CCell>
    </>;
}
/**二维表的 正常给报告上面做显示的样子，没有序号栏目
 * @param table 表名
 * @param config 表的模型配置
 * @param orc  原始记录或报告json
 * @param least  内容区域若为空的是否保留空白行的。
 * @param slash  需斜杠替换空白的。
 * */
export function useRepTableViewer(config: Each_ZdSetting[], table: string, orc: any, least?: boolean, slash?: boolean)
{
    //如果表头是部分有两行的情况？： 不好配置，或只生成最详细的第二行，第一行手动生成的？ rowSpan只能往前往下衍生的！！配置第一行的某些字段要归并的，那样第二行也有了。【太麻烦】；
    const titleRow=<TableRow>
        {config.map(([title,_2,_1], i:number) => {
            return <CCell key={i}>{title}</CCell>;
        }) }
    </TableRow>;
    const content=orc?.[table];
    const rowsMore=<>
        {!content && least &&
           <TableRow>
                {config.map(([title,aName,_1], c:number) => {
                    return <CCell key={c}>{slash && '／'}</CCell>;
                }) }
           </TableRow>
        }
        {content?.map((o: any, i:number) => {
            return (<TableRow key={i}>
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        }) }
    </>
    return  [titleRow, rowsMore];
}
//类似useRepTableViewer 直接注入表格content=orc?.[table];
export function useContentTableViewer(config: Each_ZdSetting[],content: any[], least?: boolean, slash?: boolean)
{
    //如果表头是部分有两行的情况？： 不好配置，或只生成最详细的第二行，第一行手动生成的？ rowSpan只能往前往下衍生的！！配置第一行的某些字段要归并的，那样第二行也有了。【太麻烦】；
    const titleRow=<TableRow>
        {config.map(([title,_2,_1], i:number) => {
            return <CCell key={i}>{title}</CCell>;
        }) }
    </TableRow>;
    const rowsMore=<>
        {!content && least &&
            <TableRow>
                {config.map(([title,aName,_1], c:number) => {
                    return <CCell key={c}>{slash && '／'}</CCell>;
                }) }
            </TableRow>
        }
        {content?.map((o: any, i:number) => {
            return (<TableRow key={i}>
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        }) }
    </>
    return  [titleRow, rowsMore];
}
/**二维表的 正常给报告, 【左边+右边】一行显示出2排的布局。有些字段少的表，一行左右的分2半地安排2个表区表头的。 和仪器表类似但它只显示出部分config列出字段。
 * @param table 表名
 * @param config 表的模型配置
 * @param orc  原始记录或报告json
 * @param least  内容区域若为空的是否保留空白行的。
 * @param slash  需斜杠替换空白的。
 * @param nhead  不用输出这个表头。
 * @param seqCl  生成"序号"列，默认=没有。 直接注入 序号的node对象；
 * @return [, titleRow] ,后面titleRow：很多情形不采用这个表头输出。
 * */
export function useRep2hTableViewer(config: Each_ZdSetting[], table: string, orc: any,nhead?: boolean, least?: boolean, slash?: boolean,seqCl?: any)
{
    const content=orc?.[table];
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(1===i%2) return null;
            const ro=content?.[i+1];
            rowsMore.push(<TableRow key={i}>
                    {seqCl && <CCell>{i+1}</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }

                    {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        })
    }
    //旧的方式：外部可操作性较差，不好修改Node
    // const rowsMore=<>
    //     {0===sizeData && least &&
    //     }
    //     {sizeData>0 &&  }
    // </>
    if(nhead){
        return  [rowsMore];
    }
    else{
        //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
        const titleRow=<TableRow>
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}
//对比useRep2hTableViewer，采用content注入：适应不直接从orc读取的表格。
export function useContent2hTableViewer(config: Each_ZdSetting[], content: any[],nhead?: boolean, least?: boolean, slash?: boolean,seqCl?: any)
{
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(1===i%2) return null;
            const ro=content?.[i+1];
            rowsMore.push(<TableRow key={i}>
                    {seqCl && <CCell>{i+1}</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }

                    {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        })
    }
    if(nhead){
        return  [rowsMore];
    }
    else{
        //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
        const titleRow=<TableRow>
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}

interface useRep2hTableViewerXProps {
    config: Each_ZdSetting[];
    table: string;
    orc: any;
    nhead?: boolean;
    least?: boolean;
    slash?: boolean,
    seqCl?: any;
    //【规定】字典类型的 类似于{ 0:  <CCell rowSpan={3}>性能参数</CCell>, } 说明附加的列的第几行在第一列的位置去插入的；插入位置固定在第一列的。
    //但是 不会插入到titleRow表头的栏；
    embed?: any;
}
/**对 useRep2hTableViewer 扩展的，支持前面配设扩展列，只在第一列位置插入的；rowSpan=是整个表的行数。 但不影响标题区。
 * */
export const useRep2hTableViewerX= ({config, table, orc,nhead=true, least=true, slash=true,seqCl,embed} : useRep2hTableViewerXProps
) => {
    const content=orc?.[table];
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {embed && <CCell>{embed}</CCell> }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        const rowFspan=(content?.length +1)/2;
        content?.forEach((o: any, i:number) => {
            if(1===i%2) return null;
            const ro=content?.[i+1];
            rowsMore.push(<TableRow key={i}>
                    {embed && 0===i && <CCell  split  rowSpan={rowFspan}  key={'H'+i}>{embed}</CCell> }
                    {seqCl && <CCell>{i+1}</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }

                    {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        })
    }
    //【特别注意】 这两个return的接收差异有问题： 若出现： key报错
    if(nhead){
        return  [rowsMore, null];
    }
    else{
        //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
        const titleRow=<TableRow>
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
};
/**支持更多的，类似useContent2hTableViewer是针对2排的。这个可以随意多排的。
@param blocks: 几个排的布局。默认=1； 【局限性】排固定数； #不允许动态调整的！
 支持park? 嵌套字段。
* */
export function useRaftTableViewer(config: Each_ZdSetting[], content: any[], blocks:number=1, nhead?: boolean, least?: boolean, slash?: boolean, seqCl?: any)
{
    const sizeData=content?.length || 0;
    let rowsMore=[];
    /*不能用：
     for (let i = 0; i < blocks; i++) {
                 rowsMore.push(<TableRow key={1}>  </TableRow>; }
    * */
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>/</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{slash&&'／'}</CCell>;
                    }) }
                </React.Fragment>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(blocks<=0 || blocks>20) throw new Error(`排数非法${blocks}`);
            //只能第一个区块/排的： 构造一组【blocks个对象】
            if(0!==i%blocks)
                return null;
            rowsMore.push(<TableRow key={i}>
                {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                    const ro=content?.[i+b];
                    return <React.Fragment key={b}>
                        {seqCl && <CCell>{ro?  (i+b+1) : '／' }</CCell>}
                        {config.map(([title,aName,_wid, _cb, park], c:number) => {
                            const txt=park?  ro?.[park]?.[aName]  : ro?.[aName];
                            return <CCell key={c}>{txt??(slash&&'／')}</CCell>;
                        }) }
                    </React.Fragment>;
                }) }
                </TableRow>
            );
        })
    }
    if(nhead){
        return  [rowsMore];
    }
    else{
        const titleRow=<TableRow>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>{seqCl}</CCell>
                    }
                    {config.map(([title,_tag,_wpx], i:number) => {
                        return <CCell key={i}>{title}</CCell>;
                    }) }
                </React.Fragment>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}
interface RaftTableViewerXProps {
    config: Each_ZdSetting[],
    content: any[],
    blocks?: number,
    nhead?: boolean,
    least?: boolean,
    slash?: boolean,
    seqCl?: any,
    //在第一行的左边插入dom; # 没考虑 blocks>1 情形的mergeL/R的。
    mergeL?: React.ReactNode,
    //在第一行的右边插入dom
    mergeR?: React.ReactNode,
}
/**非独立编辑器形式； 不支持pr：“”配置方式掺入列。
 * 编辑器三排模式的：类似概要的编辑器和报告： 【缺点】不考虑前缀的配置；
 * 类似于 ThreeConfigRaft 只有内容。    @ 给useThreeRaftSurveyTbl配套的， 可支持3排编辑器。
 * @param config  范式模型配置; 基础配置统一为[desc, name, cb] 3元组合的。
 * */
export const useRaftTableViewerX= ({config,content,blocks=1,nhead=true,least=true,slash=true,
                                       seqCl,mergeL,mergeR}  :RaftTableViewerXProps
) => {
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>/</CCell>}
                    {mergeL}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{slash&&'／'}</CCell>;
                    }) }
                    {mergeR}
                </React.Fragment>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(blocks<=0 || blocks>20) throw new Error(`排数非法${blocks}`);
            //只能第一个区块/排的： 构造一组【blocks个对象】
            if(0!==i%blocks)
                return null;
            rowsMore.push(<TableRow key={i}>
                    {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                        const ro=content?.[i+b];
                        return <React.Fragment key={b}>
                            {seqCl && <CCell>{ro?  (i+b+1) : '／' }</CCell>}
                            {0===i && mergeL}
                            {config.map(([title,aName,_wid, _cb, park], c:number) => {
                                const txt=park?  ro?.[park]?.[aName]  : ro?.[aName];
                                return <CCell key={c}>{txt??(slash&&'／')}</CCell>;
                            }) }
                            {0===i && mergeR}
                        </React.Fragment>;
                    }) }
                </TableRow>
            );
        })
    }
    if(nhead){
        return  [rowsMore];
    }
    else{
        //没考虑 mergeL / R的。
        const titleRow=<TableRow>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>{seqCl}</CCell>
                    }
                    {config.map(([title,_tag,_wpx], i:number) => {
                        return <CCell key={i}>{title}</CCell>;
                    }) }
                </React.Fragment>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}

/**表格编辑项目的特别回调，
 * */
export const tabIBlistCb=(datalist:string[],rows?:number)=>{
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=>{
        return  <BlobInputList value={obj?.[tag] || ''} rows={rows??2} datalist={datalist}
                               onListChange={v => setObj({...obj, [tag]: v || undefined}) } />
    }
}
//表格录入日期：类似高阶函数
export const tabIDateCb=()=>{
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=>{
        return  <Input value={obj?.[tag] || ''}  type='date'
                        onChange={e => setObj({ ...obj, [tag]: e.currentTarget.value}) } />
    }
}
//【特殊布局】放大编辑框：
export const tabTextAreCb=(rows?:number)=>{
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=> {
        return <div css={{ "div:has(&).InputLine__Head": {display: 'block'} }}>
            <TextArea value={obj?.[tag] || ''} rows={rows ?? 2}
                      onChange={e => setObj({...obj, [tag]: e.currentTarget.value})}/>
        </div>
    }
}
/**签名 需要user context
* */
export const tabIUserSign = (user: any) => {
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string, park: string) => {
        //存储上多一层嵌套对象 inp?.[name]?.sgm?.name  通常value={obj?.[tag] || ''}
        return <div>
            签字人：{obj?.[park]?.name || ''}。<br/>
            {obj?.[park]?.username === user?.username ?
                <Button intent="warning"
                        onPress={async () => {
                            // await tableSetInp('单图表', dxtix, inp, setInp, 'sgm', undefined);
                            await setObj({...obj, [park]: undefined});
                            // await objNestSet(tag,'sgm', undefined, obj,setObj);
                        }}
                >去除签名</Button>
                :
                <Button intent="warning"
                        onPress={async () => {
                            const me = {username: user?.username, name: user?.person?.name};
                            // await tableSetInp('单图表', dxtix, inp, setInp, 'sgm', me);
                            await setObj({...obj, [park]: me});
                            // await objNestSet(tag,'sgm', me, obj,setObj);
                        }}
                >签名</Button>
            }
        </div>
    }
}
