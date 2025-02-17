/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Dispatch, SetStateAction} from "react";
import {
    Button,
    Collapse,
    Dialog, DialogClose, DialogContent, DialogDescription, DialogHeading,
    IconButton,
    IconChevronDown,
    IconChevronUp,
    IconX,
    InputLine,
    InputPure,
    Layer, Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverHeading, PopoverRefer,
    Select,
    SuffixInput,
    Text,
    useCollapse,
    useTheme
} from "customize-easy-ui-component";
// import {Dialog,DialogClose, DialogContent, DialogDescription, DialogHeading,DialogTrigger} from "@/comp/Dialog";
import {usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import {AdminunitChooseQuery$data} from "./__generated__/AdminunitChooseQuery.graphql";
import {css} from "@emotion/react";
import {CityChoose} from "./CityChoose";
import {CountyChoose} from "./CountyChoose";
import {TownChoose} from "./TownChoose";
import {ProvinceChoose} from "./ProvinceChoose";
///import { DivisionChooseQuery } from "./__generated__/DivisionChooseQuery.graphql";
import { graphql } from "relay-runtime";
const AdminunitChooseQuery = require('./__generated__/AdminunitChooseQuery.graphql');
//const PositionListQuery = require('./__generated__/PositionListQuery.graphql');


export const 公众聚集场所=['学校','幼儿园','医院','车站','客运码头','商场','体育场馆','展览馆','公园','其它公众聚集场所'];


interface AdminunitChooseProps extends React.InputHTMLAttributes<HTMLInputElement>{
    //当前id所指向的挂接对象模型的给用户看的关键名:标题= 单位名字;
    name?: string | undefined;
    //清空编辑框已经选择的内容
    onCancel?: () => void;
    //行政区划默认查询的启动点，默认【中国】。
    //Adminunit对象直接整个传递进来：
    //输入：
    pos?: any;
    //直接设置返回的状态变量。
    //输出：
    setEditorVar: Dispatch<SetStateAction<any>>;
}

//页面和数据分离后又要被迫整合在一块了？
//非高层次通用的组件。语义整合：　数据获取和规格化显示部分组合在一个文件内。前端graphql底层缓存：不见得每次都会发送请求给后端的。
//graphQL想把多个Query同时都坐在一个Hook函数里面一次性向后端读取，有许多障碍：页面分割，公用组件嵌套，父辈组件知晓子孙辈组件数据请求和参数还得传递数据，不过前端有缓存。

/**默认是不要显示国家级选择，都是【中国】,数据照样准备的，就是显示做屏蔽处理，显示点击能揭示状态。
 *【固定配置】 Country:1 中国；需要数据库配合一样数据！。
 * 注意，这里style参数实际由上一级InputLine组件注入的，不需要自己设置。比如如下的：[约定style范式]嵌套第一层Div style: {flex: '1 1 60%' }
 *   <LineColumn >
 *       <InputLine >
 *            <AdminunitChoose > 两个地方都存在上一级往下一级注入style样式的情况：指导约束下级嵌套div的布局。
 */
export const AdminunitChoose= ({
       name, pos, onCancel, setEditorVar,
       style,
       ...other
} :AdminunitChooseProps) =>{
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    //模态对话框+点击触发加载数据的模式，类似于路由点击链接Relay PreloadData()模式。
    const [queryReference, loadQuery] = useQueryLoader(AdminunitChooseQuery);
    const handleSelect = React.useCallback((pos: any) => {
        setEditorVar(pos);
        setOpen(false);
    }, [setEditorVar]);
    //把Input改成文本点击触发； 原来使用<SuffixInput来包裹的,改成直接上 Div+Text。
  return (
   <React.Fragment>
       <div  css={{
           textAlign: 'left',
           ...style
       }}
       >
           <Text className="Suffix__text" variant={"subtitle"}
                 css={[
                     {
                         display:  "inline-flex" ,
                         paddingLeft: '0.2rem'
                     },
                 ]}
                 onClick={async () => {
                     loadQuery({
                         id: ""
                     });
                     setOpen(true);
                 } }
                 {...other}
           >
               {name || '（空的）请点击选择输入' }
           </Text>

           <IconButton
               variant="ghost"
               icon={<IconX />}
               label="删除"
               css={{
                   display: name ?  undefined : 'none'
               }}
               onClick={async (e) => {
                   await onCancel!();
                   e.preventDefault();
                   e.stopPropagation();
               } }
           />

           <Dialog open={open} onOpenChange={setOpen}>
               <DialogContent >
                   <DialogHeading>
                     地址相关编辑
                   </DialogHeading>
                   <DialogDescription>
                       <div >
                           <React.Suspense fallback="等下马上来...">
                               { queryReference && <AdminunitChooseInner queryReference={queryReference} onSelect={handleSelect} ad={pos}/> }
                           </React.Suspense>
                       </div>
                   </DialogDescription>
                   <DialogClose>
                       <IconX/>
                   </DialogClose>
               </DialogContent>
           </Dialog>
       </div>
   </React.Fragment>
  );
}


interface AdminunitChooseInnerProps {
    queryReference: any;
    onSelect: (pos: any) => void;
    ad?: any;      //输入的:行政区划对象
}

//外国的单位地址？如何处理？外国地址无法直接管理：{pos=null(或特殊构建的id),exadr=[外国粗略地址]} Country country;
//双层模态对话框，常规的PC端应用程序常用的模态编辑选择输入的方式。【对照的模式】采用路由页面附加URI参数解析和多个路由独立页面之间的状态数据传递的方式。
/**新申请地址：楼盘若想选择的话，必须选定街道乡镇级别行政区划才可以的。楼盘只能挑选，新添加楼盘数据维护后台独立做。
 * */
function AdminunitChooseInner({ queryReference, onSelect, ad }:AdminunitChooseInnerProps)
{
    //从对象关联进行延申：获取列表。首先需要一个初始出发点Node()?国家级别【1】=China;真正0号查询:findAllCountry():[Country];
    const data =usePreloadedQuery<typeof AdminunitChooseQuery>(
        graphql`
            query AdminunitChooseQuery($id: String) {
                getAllCountries(continent: $id) {
                    id,name,continent,collapse
                    adm{id,prefix,name,country{id},province{id},city{id},county{id},town{id}}
                    __typename
                }
            }
      `,
        queryReference,
    );
    //有必要？做个 ES搜索引擎 索引，就是给no报告号的搜索加速？？
    const { getAllCountries: list }=data as AdminunitChooseQuery$data;
    //const { countries:list }=object as any;
    //const isps = list && list.edges ? list.edges.map(edge => edge?.node) : [];
    const rep =list && list[0] && list[0].name;
    //  const { getReport: items }= (false)?  data! : {getReport:null};
    const theme = useTheme();
    const chineseObj =React.useMemo(() => {
        return list?.find((cnt) => {
          return  cnt?.name === '中国'
        });
    }, [list]);
    //显示国家级? 代表中国;
    const [viewcntry, setViewcntry] = React.useState<boolean>(ad?.country?.id!==chineseObj?.id );
    const [country, setCountry] = React.useState<any>(ad?.country?.id || chineseObj?.id);
    const [province, setProvince] = React.useState<any>(ad?.province?.id);
    const [city, setCity] = React.useState<any>(ad?.city?.id);
    const [county, setCounty] = React.useState<any>(ad?.county?.id);
    //选择框town对应的ID
    const [town, setTown] = React.useState<any>(ad?.town?.id);
    //中间选择状态的Ad
    const [adnew, setAdnew] = React.useState<any>(ad);      //string|null

    //后端检查楼盘区划一致性。
    //const [vlg, setVlg] = React.useState<any>(pos?.vlg);


  //  const [inp, setInp] = React.useState(null);
    //外部dat不能加到依赖，变成死循环! const  dat =items&&items.data&&JSON.parse(items.data);  这dat每次render都变了？
    //从后端返回的数据可能items已经被修改了
/*    React.useEffect(() => {
        const  dat =rep&&rep.data&&JSON.parse(rep.data);
        dat && setInp(dat);
    }, [rep]);*/

  //  const {call:createfunc,doing, result:obj}= useNewPositionMutation();
    const [open, setOpen] = React.useState(false);
    const [position, setPosition] = React.useState<any>(null);
   /* const [posQreference, loadQuery] = useQueryLoader(PositionListQuery);*/
    const handleSelect = React.useCallback((pos: any) => {
        //console.log("签订pos去：捕获 ==id=[",  id,  "] name=", name );
       // setPosition(id);
       // setAdrname(name);
       // setOpen(false); 关闭弹出窗 Dialog title="从已确认地址当中挑选"
        onSelect!(pos);    //仅传递一部分?
    }, [onSelect]);

    const eos =useCollapse(true,true);
    //console.log("AddressChooseInner树状：sf捕获 position=[",  position,  "] vlg=", vlg );
    console.log("签订pos去：捕获e ==town=[",  town,  "] adnew=", adnew );

    return (
     <React.Fragment>
        <div css={{
            margin: 'auto',
            background: "white",
            padding: theme.spaces.lg
        }}
        >
            {rep?
                <React.Fragment>
                    { viewcntry &&
                        <InputLine label={`国家和地区:`}>
                            <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                                    value={country || ''}
                                    onChange={e => {
                                        const ix=list!.findIndex((it:any) => it.id === e.currentTarget.value);
                                        const country=list![ix];
                                        //onSelect!(country?.id, country?.adm);
                                        setCountry!(country?.id);
                                        setAdnew(country?.adm!);
                                        setProvince(undefined);
                                        setCity(undefined);
                                        setCounty(undefined);
                                        setTown(undefined);
                                        //setAdId(null);
                                        //setVlg(undefined);
                                    }
                                    }
                            >
                                { list?.map((hit:any,i:number) => (
                                    <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                                ))}
                                <option value={''}>全部</option>
                            </Select>
                        </InputLine>
                    }

                <ProvinceChoose id={province} parentId={country} onSelect={(id,ad)=>{
                    setAdnew(ad!);
                    setProvince(id);
                    setCity(undefined);
                    setCounty(undefined);
                    setTown(undefined);
                    //setAdId(null);
                    //setVlg(undefined);
                } } />
                { province &&
                    <CityChoose id={city} parentId={province} onSelect={(id, ad) => {
                        setAdnew(ad!);
                        setCity(id);
                        setCounty(undefined);
                        setTown(undefined);
                        //setAdId(null);
                        //setVlg(undefined);
                    }}/>
                }
                { city &&
                <CountyChoose id={county} parentId={city}
                          onSelect={(id,ad)=>{
                              //setAdId(adid!);
                              setAdnew(ad!);
                              setCounty(id);
                              setTown(undefined);
                              //setVlg(undefined);
                          } }
                />
                }
                { county &&
                    <TownChoose id={town} parentId={county}
                                onSelect={(id, ad) => {
                                    setAdnew(ad!);
                                    setTown(id);
                                    //setVlg(undefined);
                                }}
                    />
                }
                </React.Fragment>
                :
                <Text variant="h5" css={{ textAlign: 'center' }}>
                    没找到此号码
                </Text>
            }

{/*            <Button
                intent="primary"
                css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {
                    //相当于菜单或 Link页面 切换时刻路由器触发的；需要准备好relay数据。
                    loadQuery({
                        where:{
                            name: adrname,  adId,
                            town,county,city,province,country,
                            },
                        first: 3,
                    });
                    setOpen(true);
                }}
            >搜索看(已登记)
            </Button>*/}
            <Button variant="ghost" intent="primary" css={{ marginLeft: theme.spaces.sm }}
                onPress={()=>setViewcntry(!viewcntry)}
            >{viewcntry?'不显示国家':'显示国家级'}</Button>
        </div>

         <Layer elevation={"sm"}     css={{ padding: '0.25rem' }}>
             <Button
                 variant="ghost"
                 intent="primary"
                 iconAfter={eos.show  ? <IconChevronUp /> : <IconChevronDown />}
                 {...eos.buttonProps}
                 css={{whiteSpace:'unset'}}
             >
                 {<Text variant="h5" css={{color: eos.show ? theme.colors.palette.red.base:undefined}}>扩展属性部分</Text>}
             </Button>
             <Collapse {...eos.collapseProps}  noAnimated>
                <div></div>
             </Collapse>
             <Text variant="h5" css={{ textAlign: 'center' }}>
               若需选定楼盘，必须选择到最小一级别行者区划。
             </Text>
             <Button
                 intent="primary"
                 css={{ marginLeft: theme.spaces.sm }}
                 onPress={() => {
                     handleSelect(adnew);
                     //可能没有Adminunit?
                 }}
             >选定确认
             </Button>
         </Layer>
     </React.Fragment>
    );
}

