/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Dispatch, SetStateAction, useContext, useRef} from "react";
import {
  Button,
  Dialog, IconAtSign,
  IconButton, IconChevronDown, IconChevronUp, IconX,
  InputLine,
  InputPure, Layer,
  MenuItem, Select,
  SuffixInput, Text,
  useTheme
} from "customize-easy-ui-component";
import UserContext from "../../routing/UserContext";
import {css} from "@emotion/react";
import {PreloadedQuery, usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import {OfficeChooseQuery$data} from "./__generated__/OfficeChooseQuery.graphql";

const graphql = require("babel-plugin-relay/macro");

const DepOfficeQuery = graphql`
    query useUserDepOfficeQuery($id: ID) {
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
`;

/**用户 本单位的部门和科室选定, 页面嵌入式版本
 *Relay的loadQuery()不能在同一个组件接收数据，必须再嵌套一层函数组件来接收获取的queryReference:data数据,无法拼凑在同一个组件中。
 *因为usePreloadedQuery需要queryReference需要动态触发的==null?，所以无法包装成Hook形式来复用的。除非早就准备好数据。
 * depin  已选部门
 * officein 已选科室
 * depTitle,offTitle: 可修改缺省的指示字段标题。
 * */
export function useUserDepOffice(depin?: any, officein?: any, depTitle?:string, offTitle?:string) {
    const {user} = useContext(UserContext);
    const theme = useTheme();
    const divisions = user.unit?.dvs;
    const ixDep = divisions?.findIndex((it: any) => it.id === depin?.id);
    console.log("useUserDepOffice看传入depin=[", depin, "ixDep=", ixDep);
    const [dep, setDep] = React.useState<any>(divisions?.[ixDep!]);      //才能够初始化底下的几个科室数据
    const [queryReference, loadQuery] = useQueryLoader(DepOfficeQuery);       //明显后加载的延迟感觉！useQueryLoader尽量不用？
    //()=>{}回调函数里头：不能用Hook的上React.useState报错。React Hook cannot be called inside a callback
    //不能分叉Hook赋值const X=queryReference? usePreloadedQuery:null;报错Rendered more hooks than during the previous render.
    //Relay无法像{panel}=useUserDepOfficeInner(queryReference,)来解决扩展动态提取数据页面;报错Rendered more hooks than during the previous render.
    const [office, setOffice] = React.useState<any>(officein);
    //const [office, setOffice] = React.useState<any>(dep?.offices![ixOffi!]);
    console.log("useUserDepOffice看看=dep=[", dep, "office=", office);
    const handlePreload = React.useCallback(() => {
        loadQuery({
            id: user.unit?.id
        })
    }, [user.unit?.id, loadQuery]);

    const panel = (
        <React.Fragment>
        {divisions ?
            <React.Fragment>
                <InputLine label={(depTitle??`检验部门`) +':'}>
                    <Select inputSize="md" css={{minWidth: '140px', fontSize: '1rem', padding: '0 1rem'}}
                            divStyle={css`max-width: 240px;`}
                            value={dep?.id || ''}
                            onChange={e => {
                                const ix = divisions!.findIndex((it: any) => it.id === e.currentTarget.value);
                                setDep(divisions![ix!]);
                                setOffice(undefined);
                            }}
                    >
                        <option value={''}>未分部门</option>
                        {
                            divisions?.map((hit: any, i: number) => (
                            <option key={i} value={hit?.id}>{{...hit}.name || ''}</option>
                             ))
                        }
                    </Select>
                </InputLine>
                { queryReference && <OfficeChooseInner queryReference={queryReference}  dep={dep}
                                               office={office} setOffice={setOffice} setDep={setDep} title={offTitle}
                        />
                }
            </React.Fragment>
            :
            <Text variant="h5" css={{textAlign: 'center'}}>
                没找到部门
            </Text>
        }
        </React.Fragment>
    );

    //直接用preload: ()=>loadQuery({id: user.unit?.id})可导致副作用的 死循环 !
    //变更后的选择数据
    return {
        dep,
        setDep,
        office,
        setOffice,
        panel,
        preload: handlePreload,
    };
}


interface OfficeChooseInnerProps {
    queryReference: any;
    //onSelect: (oobj: any) => void;
    dep: any;
    office: any;
    setOffice: Dispatch<SetStateAction<any>>;
    setDep: Dispatch<SetStateAction<any>>;
    title?: string;
}
/*Relay这里usePreloadedQuery会阻塞页面显示，一直等到后端发回数据包，依靠<Suspense/>最临近的Suspense包裹的组件就会被延迟render();
*把<React.Suspense fallback="数据准备...">往上级组件移动，放在恰当位置(影响范围)，既能够表示点击已经启动显示对话框轮廓，同时等待里面异步数据的准备，
*数据加载未完成没必要显示其余大部分组件，就能避免整个页面因为异步数据加载前后的大幅度变动。Suspense也不能把<Dialog>全部包裹，不然数据等待时也没有提示，界面上毫无感觉。
* */
function OfficeChooseInner({ queryReference, dep, office,setOffice,setDep,title }:OfficeChooseInnerProps)
{
    const data= usePreloadedQuery<typeof DepOfficeQuery>(
        DepOfficeQuery,
        queryReference!,
    );
    const { node: unit }=data as OfficeChooseQuery$data;
    if(unit?.__typename === "%other")   throw new Error("模型不对");
    const {user} = useContext(UserContext);
    const theme = useTheme();
    //()=>{}回调函数里头：不能用Hook的上React.useState报错。React Hook cannot be called inside a callback
    //不能分叉Hook赋值const X=queryReference? usePreloadedQuery:null;报错Rendered more hooks than during the previous render.
    const  divisions =unit?.dvs;
    const ixDep= divisions!.findIndex((it:any) => it.id === dep?.id);
    //const [dep, setDep] = React.useState<any>(divisions?.[ixDep!]);      //才能够初始化底下的几个科室数据
    const ixOffi= divisions?.[ixDep!]?.offices?.findIndex((it:any) => it.id === office?.id);
    //const [office, setOffice] = React.useState<any>(divisions?.[ixDep!]?.offices![ixOffi!]);
    console.log("useUserDepOffice看看=dep=[",dep, "office=", office);

    return (
        <InputLine label={(title??`指定的科室`) +':'}>
            <div css={{display:'inline-flex',justifyContent:'space-between'}}>
                <Select inputSize="md"
                        css={{minWidth: '180px', fontSize: '1rem', padding: '0 1rem'}}
                        divStyle={css`max-width: 240px;`}
                        value={office?.id || ''}
                        onChange={e => {
                            setOffice(divisions?.[ixDep!]?.offices?.find((it: any) => it.id === e.currentTarget.value));
                        }}
                >
                    <option value={''}>未分科室</option>
                    {
                        divisions?.[ixDep!]?.offices?.map((hit: any, i: number) => (
                            <option key={i} value={hit?.id}>{{...hit}.name || ''}</option>
                        ))
                    }
                </Select>
                <Button onPress={e => {
                    const ixDep= divisions!.findIndex((it:any) => it.id === user?.dep?.id);
                    setDep(divisions?.[ixDep!]);
                    setOffice(divisions?.[ixDep!]?.offices?.find((it: any) => it.id === user?.office?.id));
                }}>本科室</Button>
            </div>
        </InputLine>
    );
}

