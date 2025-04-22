import {FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "./mainProj/src/components/ui";
import {Each_ZdSetting} from "./mainProj/src/report/hook/useRepTableEditor";
import {ButtonRefComp, DdMenu, DdMenuItem, useTheme,} from "customize-easy-ui-component";
import * as React from "react";
import {useWindowSize} from "customize-easy-ui-component/esm/Hooks/use-window-size";
import {useMeasure} from "customize-easy-ui-component/esm/Hooks/use-measure";

interface TableEditorProps {
    config: Each_ZdSetting[];
    table: string;
    headview: React.ReactNode;
    tailview?: React.ReactNode;
    defaultV?: any[];
    noDelAdd?: boolean;
    fixColumn?: number;
    editAs?: (obj:any, setObj:React.Dispatch<React.SetStateAction<any>>, seq:number | null) => React.ReactNode;
    maxRf?: number;
    stretchF?: number[];
    saveFixC?: boolean;
}

const TabSplChars=['◆','╏','│','┋','╁','↑','╀','●','║','◇','┃','┩','¤','┪','╔','╝','Θ','∣','╚','╗','╡','┇','╞','╘','╕','┊','╬','┾','╮','╉','◎','♂','╰','┠','↓','╠'];

export function useTableEditor({config, table, headview,tailview,defaultV, noDelAdd,fixColumn,editAs,maxRf,
                                   stretchF=[1,1.35,1.7], saveFixC=false,
                               }: TableEditorProps) {
    const theme = useTheme();
    const excludeFix=(defaultV && (fixColumn!>=1) && noDelAdd) && (!saveFixC);      //排除掉固定列模式的存储需要。
    const [seq, setSeq] = React.useState<number | null>(null);   //表對象的當前一條。
    const [hoverr, setHoverr] = React.useState<number | null>(0);
    const [obj, setObj] = React.useState<any>({});
    function spliteor(i:number){
        return TabSplChars[i%(TabSplChars.length)];
    }
    const editor=React.useCallback( (form: any, arrays?: Record<string, any>) => {
        const { fields, append, remove, move} =arrays?.[table];
        const tabledArr = form.watch(table)
        if(editAs) return editAs(obj,setObj,seq);
        else return <Layer elevation={"sm"} css={{display: 'flex',justifyContent: 'center',flexDirection: 'column',width: '-webkit-fill-available',
            [theme.mediaQueries.md]: {flexDirection: 'row',padding:'0.25rem'}
        }}>
            {seq===null? '新' : seq!+1}
            <div className="editLinc" css={{width: '-webkit-fill-available'}}>
                <div className="editItems" >
                    {(config).map(([title,tag, _, callback,park]:any,i:number) => {
                        if(fixColumn && i<fixColumn)   return <React.Fragment key={i}></React.Fragment>;
                        else return (
                            <React.Fragment key={i}>
                                { callback ? callback(form,title,tag,park)
                                    :
                                    park? <FormField key={i} control={form.control} name={`${park}.${tag}`}
                                                     render={({ field: formField }) => (
                                                         <FormItem>
                                                             <FormLabel>{title}</FormLabel>
                                                             <FormControl>
                                                                 <Input {...formField} />
                                                             </FormControl>
                                                             <FormMessage />
                                                         </FormItem>
                                                     )}
                                        />
                                        :
                                        <FormField key={i} control={form.control} name={tag}
                                                   render={({ field: formField }) => (
                                                       <FormItem>
                                                           <FormLabel>{title}</FormLabel>
                                                           <FormControl>
                                                               <Input {...formField} />
                                                           </FormControl>
                                                           <FormMessage />
                                                       </FormItem>
                                                   )}
                                        />
                                }
                            </React.Fragment>
                        );
                    } )  }
                </div>
                <Button onPress={() => {
                    append(obj)
                } }
                >{(tabledArr.length>0 && seq!==null)? `改一组就确认`: `新增一组`}</Button>
            </div>
        </Layer>;
    }, [ obj, seq, config,breaks,column, fixColumn, table ,editAs]);

    const [tiloff, setTiloff] = React.useState<number>(0);       //头部的栏目条位置跟随
    const {innerHeight, }= useWindowSize();       //浏览器TAB内窗口全局大小; 两阶段拉伸[电脑屏|平板电脑, 台式机的超大屏幕]
    const dytilRef = React.useRef<HTMLDivElement>(null);
    const barRect = useMeasure(dytilRef as React.RefObject<HTMLElement>);
    const hBarWidth= barRect?.width || 0;
    const screenTp=(innerHeight!)>860 && hBarWidth>1700 ? 2: (innerHeight!)>740 && hBarWidth>1280 ? 1: 0;
    const [fixedColW, setFixedColW] = React.useState<boolean>(false);
    const raft= React.useMemo( () => {
        const desiredW=config.reduce((prevSum, [_, _t, width] : any,i,arr) => {
            return (prevSum + width);
        }, 0);
        let rfnum=Math.floor(hBarWidth!/(desiredW*stretchF[screenTp]));
        let canDispNum=(isNaN(rfnum) || rfnum<1)? 1 : rfnum>20? 20 : rfnum;
        if(maxRf)   return (canDispNum>maxRf?  maxRf : canDispNum);
        else  return canDispNum;
    }, [hBarWidth, screenTp, stretchF, config, maxRf ]);

    const rowRefs = React.useRef<Map<number, HTMLDivElement | null>>(new Map());
    React.useEffect(() => {
        if(hoverr!=null){         //栏目条位置跟随
            const clkRow = rowRefs.current!.get(hoverr!);
            const rect = clkRow?.getBoundingClientRect();
            const bar= dytilRef?.current?.getBoundingClientRect();
            const spanY=rect?.top! - bar?.top! - bar?.height!;
            setTiloff(spanY);
        }
    }, [hoverr, setTiloff]);
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const tabledArr = form.watch(table)
            const membersum=tabledArr.length;
            const linecnt=Math.ceil(tabledArr.length/raft) ;        //最多抵达行的总个数；
            return (
                <>
                    {headview}
                    <Button intent='primary' onPress={() => setFixedColW(!fixedColW)}
                    >{fixedColW? `弹性布局` : `定长折叠`}</Button>按每行{excludeFix? config.length-fixColumn! : config.length}列为一组录入
                    <Button onPress={() => {
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
                            const domRow=<div css={{display: 'flex',flexWrap: 'wrap',justifyContent:'space-around',alignItems:'center'}}>
                                { (new Array(raft)).fill(null).map((__:any,b:number)=> {
                                    const  a=tabledArr[raft*i +b];    //后端数据的某一行对象a={,}
                                    return <DdMenu key={b}  label="多选" icon={
                                        <ButtonRefComp  size="md" variant="ghost"  css={{display: 'flex',flexDirection: 'column',alignItems:'flex-start',
                                            flexWrap: 'wrap', width: '-webkit-fill-available', justifyContent: 'space-between',
                                            height: 'unset', minHeight: '32px', padding: 'unset !important',textAlign:'unset' }}
                                                        onPress={(e: React.FormEvent<Element> | Event| any) =>{
                                                            setTiloff(0);
                                                            setSeq(null);
                                                            if(i===hoverr)   setHoverr(0);
                                                            else  setHoverr(i);
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
                                            <DdMenuItem label={'修改'} onClick={  () => { {/*onModifySeq(raft*i +b,a)*/} } } />
                                            {!noDelAdd &&  <>
                                                <DdMenuItem label={'刪除这条'} onClick={  () => { {/*onDeleteSeq(raft*i +b)*/} } } />
                                                <DdMenuItem label={'插入一条'} onClick={  () => { {/*onInsertSeq(raft*i +b)*/} } } />
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
                                        rowRefs.current!.set(i, el);
                                    },
                                }) }
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
        [editor, ],
    )
    return  [contentRendererFactory];
}












