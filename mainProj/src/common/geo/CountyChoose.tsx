/** @jsxImportSource @emotion/react */
import * as React from "react";
import { Text, InputLine, Select
} from "customize-easy-ui-component";
import {Dispatch, SetStateAction, } from "react";
import {useLazyLoadQuery, } from "react-relay/hooks";
import {css} from "@emotion/react";
import { graphql } from "relay-runtime";
const CountyChooseQuery = require('./__generated__/CountyChooseQuery.graphql');


interface CountyChooseProps {
    id?: string | undefined;
    //行政区划默认查询的启动点，默认【中国】。
    parentId?: string;
    //直接设置返回的状态变量。
    //setEditorVar: Dispatch<SetStateAction<any>>;
    //更多逻辑啊
    onSelect?: (id?:string, ad?:any) => void;
}
/**在单位底下挑选 部门 分支机构
 */
export const CountyChoose= ({ id, parentId, onSelect }:CountyChooseProps) =>
{
    //不推荐模式：fetch a GraphQL query during render，性能较差，延迟大，render同时数据再次调整就会render多次。但relay缓存过的就不会重复查。
    const data = useLazyLoadQuery<typeof CountyChooseQuery>(
        graphql`
            query CountyChooseQuery($id: ID!) {
                node(id: $id) {
                    id,
                    ... on City {
                        id name counties{id name 
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
    //parentId? parentId:"Q2l0eTox" 删除value={id || ''}
    return (
        <React.Fragment>
            <InputLine label={`区县:`}>
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                        value={id || ''}
                        onChange={e => {
                           //setEditorVar!(e.currentTarget.value||undefined);
                            const ix=data.node?.counties.findIndex((it:any) => it.id === e.currentTarget.value);
                            const county=data.node?.counties[ix];
                            onSelect!(county?.id, county?.adm);
                            //onSelect!(e.currentTarget.value||undefined)
                        }
                        }
                >
                    { data.node?.counties?.map((hit:any,i:number) => (
                        <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                    ))}
                    <option value={''}>全部</option>
                </Select>
            </InputLine>
        </React.Fragment>
    );
}

