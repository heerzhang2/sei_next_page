/** @jsxImportSource @emotion/react */
import * as React from "react";
import { Text, InputLine, Select
} from "customize-easy-ui-component";
import {Dispatch, SetStateAction, } from "react";
import {useLazyLoadQuery, } from "react-relay/hooks";
import {css} from "@emotion/react";
const graphql = require("babel-plugin-relay/macro");
const TownChooseQuery = require('./__generated__/TownChooseQuery.graphql');


interface TownChooseProps {
    //选中了哪一个Town街道；
    id?: string | undefined;
    //行政区划默认查询的启动点， 上一级的行政区域（区县）的id。
    parentId?: string;
    //直接设置返回的状态变量。父组件负责构造数据状态的，子组件是单纯的。
    //点击列表选中某个街道。
    //setEditorVar: Dispatch<SetStateAction<any>>;
    //返回选中的 Twon.id 和Adminunit.id
    onSelect?: (id?:string, ad?:any) => void;
}
/**在行政区域（区县）底下挑选 街道
 */
export const TownChoose= ({ id, parentId,onSelect }:TownChooseProps) =>
{
    //不推荐模式：fetch a GraphQL query during render，性能较差，延迟大，render同时数据再次调整就会render多次。但relay缓存过的就不会重复查。
    const data = useLazyLoadQuery<typeof TownChooseQuery>(
        graphql`
            query TownChooseQuery($id: ID!) {
                node(id: $id) {
                    id,
                    ... on County {
                        id name towns{id name 
                        adm{id,prefix,name,country{id},province{id},city{id},county{id},town{id}}
                        }
                    },
                    __typename
                }
            }
        `,
        {id: parentId},
        {fetchPolicy: 'store-or-network'},
    );

    //底下Select组件不要添加 value={id || ''} 我这只需要单个方向知道选择哪一个镇。
    return (
        <React.Fragment>
            <InputLine label={`镇乡街道:`}>
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                        value={id || ''}
                        onChange={e => {
                            //外部都是town ID，不知道key索引号。
                            const ix=data.node?.towns.findIndex((it:any) => it.id === e.currentTarget.value);
                            const town=data.node?.towns[ix];
                            onSelect!(town?.id, town?.adm);
                        }
                        }
                >
                    { data.node?.towns?.map((hit:any,i:number) => (
                        <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                    ))}
                    <option value={''}>全部</option>
                </Select>
            </InputLine>
        </React.Fragment>
    );
}

