/** @jsxImportSource @emotion/react */
import * as React from "react";
import {backItemsConfigSearch, RecordIspArea, RecordSelfSplit} from "../common/config";
import {InspectRecordLayout, SelectHookfork, useItemInputControl} from "../common/base";
import {Input, InputLine, LineColumn, Text} from "customize-easy-ui-component";

//检验项目的标准化展示组件
interface Props  extends React.HTMLAttributes<HTMLDivElement>{
    editAreasConf: RecordIspArea[];
    /**单一个路由可编辑区域对应的 一部分项目列表的 配置*/
    index: number;
    show?: boolean;
    alone?: boolean;
    ref?: any;
    refWidth?: number;
    /**后面两个参数：定制 ，确认日期字段 有些项目需要拆分为两个日期输入的情况；
     * */
    custST?: (area:RecordIspArea,par:any,fields:any)=>any;
}

// export const 工作见证的选择=['W','ZW','X','Z','XW','WX','ZXW'];
//【单一个编辑区域的】 全部项目。LikeVehicle
export const ActionMapItemLikeElvPeriodical=
    React.forwardRef((
        { children, show=true, alone=true,editAreasConf,index,refWidth,custST}:Props, ref
    ) => {
        const config=editAreasConf[index];
        const getInpFilter = React.useCallback((par: any) => {
            let fields={} as any;
            //配置动态命名的字段获取旧的值，还想保存修改数据，还要界面同步显示变化数值的场景，就按这里做法。
            config.items?.forEach((tago, i) => {
                tago.rss?.map(({name}:RecordSelfSplit,i:number)=> {
                    fields[name] =par[name];
                    fields[`${name}_D`] =par[`${name}_D`];
                    return null;
                });
                fields[tago.name] =par[tago.name];
                fields[`${tago.name}_D`]= par[`${tago.name}_D`];
                // fields[`${tago.name}_Z`]= par[`${tago.name}_Z`];
                // fields[`${tago.name}_S`]= par[`${tago.name}_S`];
                // fields[`${tago.name}_M`]= par[`${tago.name}_M`];
            });
            if(custST)
                fields=custST(config, par, fields);
            // const {见证资料表 }= par;
            return fields;
        }, [config,custST]);
        const {inp, setInp} = useItemInputControl({ ref });
        // const 见证资料选择=inp?.见证表?.map((a:any, i:number) => a.no);
        const render =React.useMemo(() => {
            let htmlTxts =[] as any[];
            let tagX: number=0;
            let tagY: number=0;
            let tagZ: number=0;
            let biglabel='';     //配置顺序相关：后面的替代前面的标识名称。
            let titllabel='';      //配置约束 titllabel必须和tagY同时配置上或者两者都不配置，不能只配置编号却没有标题文字。某一级别若切换：比如二级的x.y的y编码的就必须配置上新y取值。
            let sublabel = '';
            //允许本编辑区的配置继承来自前面的编辑区。反方向去搜索配置。【前提】最低一级或者第四级别必然做配置的。 x y z可能省略配置。editAreasConf[0]第一个必然会配置全套的。
            //【不同点】允许相等检验项目栏目编码串的，直接融合正在编辑的项目区域显示。
            for(let wf=0; wf<config.items?.length; ){
                const tago=config.items[wf];
                //连续跟随的几个项目是否 ？多个具有相同的项目编码串 alikeSize=相同的个数 项目栏目编码串判定一摸一样横跨剩下几个行的；
                let alikeSize=0;
                if(tago) {
                    // let alike=false;         //普通的各个项目栏目自己能区分的的 或者 是处在上一个相等目标结论位置范围启动第一个项目的。
                    for(let nu=wf+1; nu<=config.items.length-1; nu++)
                    {
                        const next=config.items[nu];
                        if(next){
                            //可能被判定为 一摸一样 项目栏目编码串的情形； 只能在同一个编辑区内部判别，这个不能跨区域。
                            if((next.x===tago.x || !next.x) && (next.y===tago.y || !next.y) && (next.z===tago.z || !next.z) && (next.t===tago.t || !next.t))
                                alikeSize++;
                            else break;
                        }
                    }
                    //目前项目编码的划分成几个等级的：自动反向区块顺序中 找项目忽略配置
                    const desLevel=(tago.t!)>0? 4 : (tago.z!)>0? 3: (tago.y!)>0? 2: 1;
                    if(tagZ===0 && desLevel>=3) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,wf,3) as {id: number, name: string};
                        tagZ=id;
                        sublabel=name;
                    }
                    if(tagY===0 && desLevel>=2) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,wf,2) as {id: number, name: string};
                        tagY=id;
                        titllabel=name;
                    }
                    if(tagX===0 && desLevel>=1) {
                        const {id,name}=backItemsConfigSearch(editAreasConf,index,wf,1) as {id: number, name: string};
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
                    const rowHead =<div key={wf} css={{marginTop: '1rem'}}>
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

                        { alikeSize<=0 && <>
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
                                          <LineColumn column={3} >
                                            <InputLine label={label ||'检查结果'}>
                                                <SelectHookfork value={(inp?.[name]) || ''} onChange={e => {
                                                    inp[name] = e.currentTarget.value || undefined;
                                                    setInp({ ...inp });
                                                }}
                                                />
                                            </InputLine>
                                            <InputLine label='资料确认描述或存在问题描述'>
                                                <Input value={(inp?.[`${name}_D`]) || ''} onChange={e => {
                                                    inp[`${name}_D`] = e.currentTarget.value || undefined;
                                                    setInp({ ...inp });
                                                }}
                                                />
                                            </InputLine>
                                          </LineColumn>
                                        </React.Fragment>;
                                    })) }

                                    { tago.tail && <>
                                        { typeof tago.tail === "string"?
                                            <Text  variant="h5">
                                                {tago.tail}
                                            </Text>
                                            :
                                            tago.tail
                                        }
                                    </>
                                    }

                                </>
                                :
                                <LineColumn column={3} >
                                    <InputLine label={(tago.four??tago.sub??tago.name) ||'检查结果'}>
                                        <SelectHookfork value={(inp?.[tago.name]) || ''} onChange={e => {
                                            inp[tago.name] = e.currentTarget.value || undefined;
                                            setInp({ ...inp });
                                        }}
                                        />
                                    </InputLine>
                                    <InputLine label='资料确认描述或存在问题描述'>
                                        <Input value={(inp?.[`${tago.name}_D`]) || ''} onChange={e => {
                                            inp[`${tago.name}_D`] = e.currentTarget.value || undefined;
                                            setInp({ ...inp });
                                        }}
                                        />
                                    </InputLine>
                                </LineColumn>
                            }
                        </> }

                        { alikeSize>0 && (new Array(alikeSize+1)).fill(null).map(( _,  d:number) => {
                            let iEncodeSame=wf+d;        //可能多个具有相同的项目编码串； 直接融合一起了：没必要相同项目编码串的各自为政地显示。
                            const tago=config.items[iEncodeSame];
                            return <React.Fragment key={iEncodeSame}>
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
                                        <InputLine label='不合格描述'>
                                            <Input value={(inp?.[`${tago.name}_D`]) || ''} onChange={e => {
                                                inp[`${tago.name}_D`] = e.currentTarget.value || undefined;
                                                setInp({ ...inp });
                                            }}
                                            />
                                        </InputLine>
                                    </>
                                    :
                                    <LineColumn column={3} >
                                        <InputLine label={(tago.four??tago.sub??tago.name) ||'检查结果'}>
                                            <SelectHookfork value={(inp?.[tago.name]) || ''} onChange={e => {
                                                inp[tago.name] = e.currentTarget.value || undefined;
                                                setInp({ ...inp });
                                            }}
                                            />
                                        </InputLine>
                                        <InputLine label='不合格描述'>
                                            <Input value={(inp?.[`${tago.name}_D`]) || ''} onChange={e => {
                                                inp[`${tago.name}_D`] = e.currentTarget.value || undefined;
                                                setInp({ ...inp });
                                            }}
                                            />
                                        </InputLine>
                                    </LineColumn>
                                }
                            </React.Fragment>;
                        }) }

                    </div>;

                    htmlTxts.push(rowHead);
                }
                wf+= alikeSize+1;
            }

            return  htmlTxts;
        }, [config,index,inp,setInp, editAreasConf]);

        return (<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                     alone={alone} label={`${config.iclas} ${config.name??config.tag}`}
        >
            {render}
        </InspectRecordLayout>);
    } );
