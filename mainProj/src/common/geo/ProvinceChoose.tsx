/** @jsxImportSource @emotion/react */
import * as React from "react";
import { Text, InputLine, Select
} from "customize-easy-ui-component";
import {Dispatch, SetStateAction, } from "react";
import {useLazyLoadQuery, } from "react-relay/hooks";
import {css} from "@emotion/react";
import { graphql } from "relay-runtime";
const ProvinceChooseQuery = require('./__generated__/ProvinceChooseQuery.graphql');


interface ProvinceChooseProps {
    id?: string | undefined;
    //行政区划默认查询的启动点，默认【中国】。
    parentId?: string;
    //直接设置返回的状态变量。
    //setEditorVar: Dispatch<SetStateAction<any>>;
    //因为City->County->Town中间跨越2级以上了，所以需要额外处理 !!：
    onSelect?: (id?:string, ad?:any) => void;
}
/**在国家级区域下挑选 省份
 */
export const ProvinceChoose= ({ id, parentId,onSelect }:ProvinceChooseProps) =>
{
    console.log("ProvinceChooseww：捕获 ==parentId=[",  parentId,  "] id=", id );
    //不推荐模式：fetch a GraphQL query during render，性能较差，延迟大，render同时数据再次调整就会render多次。但relay缓存过的就不会重复查。
    const data = useLazyLoadQuery<typeof ProvinceChooseQuery>(
        graphql`
            query ProvinceChooseQuery($id: ID!) {
                node(id: $id) {
                    id,
                    ... on Country {
                        id name provinces{id name
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

    return (
        <React.Fragment>
            <InputLine label={`省份:`}>
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem'}} divStyle={css`max-width:240px;`}
                        value={id || ''}
                        onChange={e => {
                            const ix=data.node?.provinces.findIndex((it:any) => it.id === e.currentTarget.value);
                            const province=data.node?.provinces[ix];
                            onSelect!(province?.id, province?.adm);
                        }
                        }
                >
                    { data.node?.provinces?.map((hit:any,i:number) => (
                        <option key={i} value={hit?.id}>{{...hit}.name||''}</option>
                    ))}
                    <option value={''}>全部</option>
                </Select>
            </InputLine>
        </React.Fragment>
    );
}

