/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    IconButton,
    IconX,
    InputPure,
    SuffixInput,
    Dialog,
    Text,
    Button,
    useTheme,
    InputLine, Select,
    Layer, IconChevronUp, IconChevronDown, useCollapse,
    DialogContent, DialogHeading, DialogDescription, DialogClose
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import {Dispatch, SetStateAction, useContext} from "react";
import {usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import {css} from "@emotion/react";
import UserContext from "../../routing/UserContext";
import {MultUserChooseQuery$data} from "./__generated__/MultUserChooseQuery.graphql";
import {idsSelectMapper, idsTreeSelectMapper} from "../tool";
import { graphql } from "relay-runtime";
const MultUserChooseQuery = require('./__generated__/MultUserChooseQuery.graphql');


interface MultUserChooseProps {
    //页面显示啥：多个对象的简易化拼凑展示描述。可为空自动显示已选定几个个数。
    name?: string | undefined;
    //清空编辑框已经选择的内容 等于= setEditorVar([])
    // onCancel?: () => void;
    //旧选择的 对象直接整个传递进来：
    //输入[多个或0个已经选定账户对象]：初始化旧的选择对象; 整个User模型数据{id username ..}
    oobj?: any[];
    //? 要限制选择User的范围 本单位的，本部门、、？
    //输出： 回调保存： setXXX(整个对象{id,...}); 关键是模型对象的ID必须的。若是json非结构化的还需要更多信息字段。
    setEditorVar: Dispatch<SetStateAction<any>>;
}

/**多个用户的选择设定，界面展示层：电脑版本手机触摸版本看着差别较大的！
 * 占坑显示那一层的界面
 */
export const MultUserChoose= ({ name, oobj, setEditorVar, ...other }:MultUserChooseProps) =>
{
    const {user} = useContext(UserContext);
    const [open, setOpen] = React.useState(false);
    //模态对话框+点击触发加载数据的模式，类似于路由点击链接Relay PreloadData()模式。
    const [queryReference, loadQuery] = useQueryLoader(MultUserChooseQuery);
    const handleSelect = React.useCallback((oobj: any[]) => {
        setEditorVar(oobj);
        setOpen(false);
    }, [setEditorVar]);
    const namePs= name? name : `已经选定${oobj?.length??0}个`;
   //console.log("正常这里触发的： oobj=[",  oobj,  "] vlg name=", name);

  return (
   <React.Fragment>
    <SuffixInput  readOnly
          component={InputPure}
           value={namePs || '' }
           onClick={async () => {
                loadQuery({
                   id: user.unit?.id
                });
              setOpen(true);
            } }
          {...other}
    >
       <IconButton
          variant="ghost"
          icon={<IconX />}
          label="删除"
          css={{
            display: oobj?.length!>0 ?  undefined : 'none'
          }}
          onClick={async (e) => {
              // onCancel={() => { setLiabler(undefined) }}
            await setEditorVar!(undefined);
            e.preventDefault();
            e.stopPropagation();
          } }
        />
    </SuffixInput>
    <Dialog open={open} onOpenChange={setOpen}>
           <DialogContent >
               <DialogHeading>
                   多个用户选择
               </DialogHeading>
               <DialogDescription>
        <div >
            <React.Suspense fallback="等下马上来...">
                { queryReference && <MultUserChooseInner queryReference={queryReference} onSelect={handleSelect} oobj={oobj}/> }
            </React.Suspense>
        </div>
               </DialogDescription>
               <DialogClose>关闭</DialogClose>
           </DialogContent>
    </Dialog>
   </React.Fragment>
  );
}


interface MultUserChooseInnerProps {
    queryReference: any;
    onSelect: (oobj: any[]) => void;
    oobj?: any[];      //上一次选择 或 默认待选对象
}

/**新申请地址：楼盘若想选择的话，必须选定街道乡镇级别行政区划才可以的。楼盘只能挑选，新添加楼盘数据维护后台独立做。
 * 需要做提前Preload()模式的话，只能再做一次嵌套的组件类似 XxxInner({ queryReference}) 这样子的多一层组件包裹下沉。这丫queryReference才会预备数据，避免render时为空的。
 * 片段fragment命名规则，只能on单一个类型；
 * 暂时没考虑分开加载数据。一个单位能有多少个员工，后端还会缓存查询，就是加载初始化组件时刻接收较多数据。非同一单位其它单位的人员暂不考虑可选。
 * 需要通过对象setXxx()传递的情形，不能用fragment MultUserChoose_User on User来声明字段，要改成直接全字段声明，倒腾一手不认识! 和Relay没关系，因为react原因？
 * 举例，底下改成 dvs{id,name, offices{id,name, staff{...MultUserChoose_User} }, 后 组件状态管理无法直接透明传递了，setOffice(officeSel);不能office?.staff?.map((hit:any,来正常提取职员列表的User对象了！
 * 片段 ...MultUserChoose_User 不能在本组件直接使用，必须和其它Relay嵌套传递reference做法那样，在其它子孙组件利用Relay函数来接收和转换后才能正常显示。
 * 双层模态对话框，常规的PC端应用程序常用的模态编辑选择输入的方式。【对照的模式】采用路由页面附加URI参数解析和多个路由独立页面之间的状态数据传递的方式。
 * */
function MultUserChooseInner({ queryReference, onSelect, oobj }:MultUserChooseInnerProps)
{
    //从对象关联进行延申：获取列表。首先需要一个初始出发点Node()?国家级别【1】=China;真正0号查询:findAllCountry():[Country];
    const data =usePreloadedQuery<typeof MultUserChooseQuery>(
        graphql`
            query MultUserChooseQuery($id: ID) {
                node(id: $id) {
                    ... on Unit {
                        id,name,
                        dvs{id,name, offices{id,name, staff{id,username,person{id,name}} },
                            staff{id,username,person{id,name}} },
                        staff{id,username,person{id,name}}
                    }
                    __typename
                }
            }
      `,
        queryReference,
    );
    //有必要？做个 ES搜索引擎 索引，就是给no报告号的搜索加速？？
    const { node: unit }=data as MultUserChooseQuery$data;
    //直接上node()副作用，类型不确定编译告警; 不是所需模型的ID所获得的对象直接抛出代码问题。if + throw 掩护后面代码就不出现编译告警。  =unit?.dvs![0]?.name!;
    if(unit?.__typename === "%other")   throw new Error("模型不对");
    const  divisions =unit?.dvs;
    const {user} = useContext(UserContext);
    const theme = useTheme();
    const ixDep= divisions!.findIndex((it:any) => it.id === user.dep!.id);
    const [dep, setDep] = React.useState<any>(divisions?.[ixDep!]);      //才能够初始化底下的几个科室数据
    //不能直接用user.office， 里面没装入职员列表信息，需要从dep获取
    const ixOffi= dep?.offices?.findIndex((it:any) => it.id === user.office?.id);
    const [office, setOffice] = React.useState<any>(dep?.offices![ixOffi!]);
    const {id, person} =user;
    //多人的: 多选任职员的可直接报多个[User]对象扔回去, 不同部门，不同科室的Select<>要综合考虑到。
    const [peoples, setPeoples] = React.useState<any>(oobj);
    const peoplesId=[];
    for (let i = 0; i < peoples?.length; i++) {
        let sss= peoples[i].id;
        peoplesId.push(sss);
    }
    // console.log("Person捕获e ==duoxuan人数=[", peoples, peoplesId);

    const handleSelect = React.useCallback((oobj: any[]) => {
        onSelect!(oobj);    //仅传递一部分?
    }, [onSelect]);
    const eos =useCollapse(true,true);


    return (
     <React.Fragment>
        <div css={{
            margin: 'auto',
            background: "white",
            padding: theme.spaces.lg
        }}
        >
            {divisions?
                <React.Fragment>
                    <InputLine label={`单位所属部门:`}>
                        <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                                value={dep?.id || ''}
                                onChange={e => {
                                    const ix=divisions!.findIndex((it:any) => it.id === e.currentTarget.value);
                                    setDep(divisions![ix!]);
                                    setOffice(undefined);
                                    // setPeople(undefined);
                                } }
                        >
                            { divisions?.map((hit:any,i:number) => (
                                <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                            ))}
                            <option value={''}>未分部门</option>
                        </Select>
                    </InputLine>
                    <InputLine label={`底下的科室:`}>
                        <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                                value={office?.id || ''}
                                onChange={e => {
                                    setOffice(dep?.offices?.find((it:any) => it.id === e.currentTarget.value) );
                                    // setPeople(undefined);
                                } }
                        >
                            {
                                dep?.offices?.map((hit:any,i:number) => (
                                    <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                                ))}
                            <option value={''}>未分科室</option>
                        </Select>
                    </InputLine>
                    <InputLine label={`${office? '科室' : dep? '部门' : '单位'}下的人员(多选):`}>
                        <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                                multiple   value={ peoplesId }
                                onChange={e => {
                                    const peoplesSel=[];
                                    for (let i = 0; i < e.currentTarget.selectedOptions.length; i++) {
                                        let sss=e.currentTarget.selectedOptions[i].value;
                                        peoplesSel.push(sss);
                                    }
                                    const nsPeoples=idsTreeSelectMapper(peoples, peoplesSel, office? office?.staff : dep? dep?.staff : unit?.staff );
                                    console.log("多选啊里触发的： nsPeoples=", nsPeoples);
                                    setPeoples(nsPeoples);
                                } }
                        >
                            { (office? office?.staff : dep? dep?.staff : unit?.staff)?.map((hit:any,i:number) => (
                                <option key={i} value={hit?.id}>{hit?.person?.name||''}</option>
                            ))}
                            <option value={''}></option>
                        </Select>
                    </InputLine>

                </React.Fragment>
                :
                <Text variant="h5" css={{ textAlign: 'center' }}>
                    没找到部门
                </Text>
            }
        </div>

         <Layer elevation={"sm"}     css={{ padding: '0.25rem' }}>
             <Button
                 variant="ghost"
                 intent="primary"
                 iconAfter={eos.show  ? <IconChevronUp /> : <IconChevronDown />}
                 {...eos.buttonProps}
                 css={{whiteSpace:'unset'}}
             >
                 {<Text variant="h5" css={{color: eos.show ? theme.colors.palette.red.base:undefined}}>当前选择详情</Text>}
             </Button>

             <Text variant="h5" css={{ textAlign: 'center' }}>
               选定平台账户：{peoples?.map((a:any)=>a.person?.name.concat(","))} 确定吗？
             </Text>
             <Button
                 intent="primary"
                 css={{ marginLeft: theme.spaces.sm }}
                 onPress={() => {
                     handleSelect([]);
                 }}
             >全部清空已选
             </Button>
             <Button
                 intent="primary"
                 css={{ marginLeft: theme.spaces.sm }}
                 onPress={() => {
                     handleSelect(peoples);
                 }}
             >选定确认
             </Button>
         </Layer>
     </React.Fragment>
    );
}

