/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text,} from "customize-easy-ui-component";
import {EachObserveConfig} from "../../hook/useObserve";
import {genCBoAvAl, genCBoOmitAl} from "../waterJj/repView";

export const tail主技= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
</Text>;

export const config主技术=[
    [{n: '行高1', t: ['运行高度',], x:'第1次', u: 'm', c: '四', d: 1, cbo:genCBoAvAl(['行高1','行高2','行高3'],1,'m','运行高度> 第1次')},
        {n: '行高2', t: [undefined,], x:'第2次', c: '四', d: 1, cbo:genCBoOmitAl('行高2','m','运行高度> 第2次')},
        {n: '行高3', t: [undefined,], x:'第3次', c: '四', d: 1, cbo:genCBoOmitAl('行高3','m','运行高度> 第3次')},
    ],
    [{check: '7.5', }],
] as EachObserveConfig[][];
