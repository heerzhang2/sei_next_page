/** @jsxImportSource @emotion/react */
import {EachObserveConfig,} from "../../hook/useObserve";
import {genCBoAve, genCBoOmit} from "./repView";

const arItemNm=(new Array(3)).fill(null).map(( _,  w:number) =>'最驶速'+(w+1) );
export const config最驶速=[
    [{n: '最驶速1', t: ['碰碰船最大行驶速度应当小于10km/h'], x:'第1次', u: 'km/h', c: '四', d: 1,
                          cbo:genCBoAve(arItemNm,1,'km/h','检测项目> 第1次-行驶速')},
        {n: '最驶速2', t: [undefined], x:'第2次', c: '四', d: 1, cbo:genCBoOmit('最驶速2','km/h','第2次-行驶速')},
        {n: '最驶速3', t: [undefined], x:'第3次', c: '四', d: 1, cbo:genCBoOmit('最驶速3','km/h','第3次-行驶速')},
    ],
    [{check: 'K8.25', }],
] as EachObserveConfig[][];
