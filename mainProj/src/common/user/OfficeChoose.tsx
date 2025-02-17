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
    InputLine,
    Select,
    Layer, IconChevronUp, IconChevronDown, useCollapse,
    DialogHeading, DialogContent, DialogDescription, DialogClose
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import {Dispatch, SetStateAction, useContext} from "react";
import {usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import {OfficeChooseQuery$data} from "./__generated__/OfficeChooseQuery.graphql";
import {css} from "@emotion/react";
import UserContext from "../../routing/UserContext";
const graphql = require("babel-plugin-relay/macro");
const OfficeChooseQuery = require('./__generated__/OfficeChooseQuery.graphql');


interface OfficeChooseProps {
    //页面显示啥：当前id所指向的挂接对象模型的给用户看的关键名:标题= User 展示的是中文称呼 姓名; 不是那个username关键字。
    name?: string | undefined;
    //清空编辑框已经选择的内容
    // onCancel?: () => void;
    //旧选择的 对象直接整个传递进来：
    //输入：初始化旧的选择对象; 整个User模型数据{id username ..}
    oobj?: any;
    //? 要限制选择User的范围 本单位的，本部门、、？
    //输出： 回调保存： setXXX(整个对象{id,...}); 关键是模型对象的ID必须的。若是json非结构化的还需要更多信息字段。
    setEditorVar: Dispatch<SetStateAction<any>>;
}

/**单独一个科室的选择
 模态对话框的缺点: 弹出多层层叠的对话框形态的就不舒服？，刷新消失掉，取消返回到哪里去。
 */
export const OfficeChoose= ({ name, oobj, setEditorVar, ...other }:OfficeChooseProps) =>
{
    const {user} = useContext(UserContext);
    const [open, setOpen] = React.useState(false);
    //模态对话框+点击触发加载数据的模式，类似于路由点击链接Relay PreloadData()模式。
    const [queryReference, loadQuery] = useQueryLoader(OfficeChooseQuery);
    const handleSelect = React.useCallback((oobj: any) => {
        setEditorVar(oobj);
        setOpen(false);
    }, [setEditorVar]);
   //console.log("正常这里触发的： oobj=[",  oobj,  "] vlg name=", name);
    //按钮触发或点击输入框触发的Relay查询。
  return (
   <React.Fragment>
    <SuffixInput  readOnly
          component={InputPure}
           value={name || '' }
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
            display: name ?  undefined : 'none'
          }}
          onClick={async (e) => {
            await setEditorVar!(undefined);
            e.preventDefault();
            e.stopPropagation();
          } }
        />
    </SuffixInput>
       <Dialog open={open} onOpenChange={setOpen}>
           <DialogContent >
               <DialogHeading>
                   科室选择相关
               </DialogHeading>
               <DialogDescription>
        <div >
            <React.Suspense fallback="等下马上来...">
                { queryReference && <OfficeChooseInner queryReference={queryReference} onSelect={handleSelect} oobj={oobj}/> }
            </React.Suspense>
        </div>
               </DialogDescription>
               <DialogClose>关闭</DialogClose>
           </DialogContent>
    </Dialog>

   </React.Fragment>
  );
}


interface OfficeChooseInnerProps {
    queryReference: any;
    onSelect: (oobj: any) => void;
    oobj?: any;      //上一次选择 或 默认待选对象
}

/**报错，必须单独定义，不能放在一个graphql``;里面定义！
 * 虽然可以提取服务端数据，科室前端没法正常显示啊？ 底层接口数据提取看似正常，就是展示层Relay给页面这块却无法打印出,Object打印都是代理?:
 * __fragments: {OfficeChoose_User: {…}}  __id: "3hPum060QP6JWAlSxgD881VzZXI"
 * 对照的类似代码 ...PipingUnitListInner 似乎需要额外处理的：
 * 【结论】没办法独立定义fragment，必须用 useFragment(graphql` 这样定义。只能普遍都用的 props.xxx 传递reference 嵌套组件的形式。
 * */
const fragment作废的 = graphql`
    fragment OfficeChoose_User on User {
        id,username,person{id,name}
    }
`;

/**新申请地址：楼盘若想选择的话，必须选定街道乡镇级别行政区划才可以的。楼盘只能挑选，新添加楼盘数据维护后台独立做。
 * 需要做提前Preload()模式的话，只能再做一次嵌套的组件类似 XxxInner({ queryReference}) 这样子的多一层组件包裹下沉。这丫queryReference才会预备数据，避免render时为空的。
 * 片段fragment命名规则，只能on单一个类型；
 * 暂时没考虑分开加载数据。一个单位能有多少个员工，后端还会缓存查询，就是加载初始化组件时刻接收较多数据。非同一单位其它单位的人员暂不考虑可选。
 * 需要通过对象setXxx()传递的情形，不能用fragment OfficeChoose_User on User来声明字段，要改成直接全字段声明，倒腾一手不认识! 和Relay没关系，因为react原因？
 * 举例，底下改成 dvs{id,name, offices{id,name, staff{...OfficeChoose_User} }, 后 组件状态管理无法直接透明传递了，setOffice(officeSel);不能office?.staff?.map((hit:any,来正常提取职员列表的User对象了！
 * 片段 ...OfficeChoose_User 不能在本组件直接使用，必须和其它Relay嵌套传递reference做法那样，在其它子孙组件利用Relay函数来接收和转换后才能正常显示。
 * 双层模态对话框，常规的PC端应用程序常用的模态编辑选择输入的方式。【对照的模式】采用路由页面附加URI参数解析和多个路由独立页面之间的状态数据传递的方式。
 * */
function OfficeChooseInner({ queryReference, onSelect, oobj }:OfficeChooseInnerProps)
{
    //从对象关联进行延申：获取列表。首先需要一个初始出发点Node()?国家级别【1】=China;真正0号查询:findAllCountry():[Country];
    const data =usePreloadedQuery<typeof OfficeChooseQuery>(
        graphql`
            query OfficeChooseQuery($id: ID) {
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
    const { node: unit }=data as OfficeChooseQuery$data;
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
    //console.log("Person捕获e ==user=[",user,   "] id=", id,"初", person,"#ID=",user?.id);
    const [people, setPeople] = React.useState<any>({...user,person, id });
    const handleSelect = React.useCallback((oobj: any) => {
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
                                    setPeople(undefined);
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
                                    setPeople(undefined);
                                } }
                        >
                            {
                                dep?.offices?.map((hit:any,i:number) => (
                                <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                            ))}
                            <option value={''}>未分科室</option>
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
               选定科室：{office?.name} 确定吗？
             </Text>
             <Button
                 intent="primary"
                 css={{ marginLeft: theme.spaces.sm }}
                 onPress={() => {
                     handleSelect(office);
                 }}
             >选定确认
             </Button>
         </Layer>
     </React.Fragment>
    );
}

