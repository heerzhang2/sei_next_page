/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Input, InputLine, LineColumn, SuffixInput, Text,} from "customize-easy-ui-component";
import {EachObserveConfig} from "../../hook/useObserve";
import {calcAverageArrObj,} from "../../../common/tool";

import {genCBoAvAl, genCBoOmitAl} from "@/report/common/cbo";

export const tail主技= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
   注：运行速度根据测量仪器填写相应栏。
</Text>;

//[特殊的] 距离 时间分离的
export const genCBoDistSpe = (nmar:string[],resvDg:number,unit:string,title?:any) => {
    const pairs=Math.ceil(nmar.length/2);
    return {
        edit:(inp:any,setInp:(a:any)=>void)=>{
            let valuAr=(new Array(pairs).fill(null)).map((_, p: number) =>
                inp?.[nmar[2*p]+'o'] / inp?.[nmar[2*p+1]+'o']
            );
            const avHs=calcAverageArrObj(valuAr,(row)=>row,resvDg);
            return [true, <div css={{textAlign: 'center'}}><hr/><br/>距离与时间，仪器分开测量的<br/><Text css={{fontWeight: 800}}>{title}：</Text>
                <LineColumn  column={4} >
                    <InputLine  label='观测数据'>
                        <SuffixInput value={ inp?.[nmar[0]+'o'] ||''}
                                     onSave={txt => setInp({ ...inp, [nmar[0]+'o']: txt||undefined} ) }>{unit}</SuffixInput>
                    </InputLine>
                    <InputLine  label='运行速度-设计值'>
                        <Input value={ inp?.[nmar[0]+'a'] ||''}
                               onChange={e => setInp({ ...inp, [nmar[0]+'a']: e.currentTarget.value||undefined}) } />
                    </InputLine>
                </LineColumn>
                <Text css={{display: 'ruby'}}>计算的测量结果： {avHs} m/s</Text>
            </div>]
        },
        view: (orc: any) =>{
            let valuAr=(new Array(pairs).fill(null)).map((_, p: number) =>
                orc?.[nmar[2*p]+'o'] / orc?.[nmar[2*p+1]+'o']
            );
            const avHs=calcAverageArrObj(valuAr,(row)=>row,resvDg);
            return [false, <>
                <CCell>{orc?.[nmar[0]+'o']}</CCell>
                <CCell split rowSpan={nmar.length}>{avHs}</CCell>
                <CCell split rowSpan={nmar.length}>{orc?.[nmar[0]+'a']}</CCell>
            </>]
        },
    };
};

const arDistSpe=(new Array(6)).fill(null).map(( _,  w:number) => {
    let mid=w % 2 === 0? '距':'时';
    return  '行速'+mid+ Math.ceil((w+1)/2);
})
//【问题】注入的回调CB无法获取context变量:配置行的其它设置。 增加嵌套形式的辅助生成器？
export const config主技术=[
    [{n: '行高1', t: ['运行高度',], x:'第1次', u: 'm', c: '四', d: 1, cbo:genCBoAvAl(['行高1','行高2','行高3'],1,'m','运行高度> 第1次')},
        {n: '行高2', t: [undefined,], x:'第2次', c: '四', d: 1, cbo:genCBoOmitAl('行高2','m','运行高度> 第2次')},
        {n: '行高3', t: [undefined,], x:'第3次', c: '四', d: 1, cbo:genCBoOmitAl('行高3','m','运行高度> 第3次')},
    ],
    [{n: '行速1', t: ['运行速度',], x:'第1次', u: 'km/h', c: '四', d: 1, cbo:genCBoAvAl(['行速1','行速2','行速3'],1,'km/h','运行速度> 第1次')},
       {n: '行速2', t: [undefined,], x:'第2次', c: '四', d: 1, cbo:genCBoOmitAl('行速2','km/h','运行速度> 第2次')},
       {n: '行速3', t: [undefined,], x:'第3次', c: '四', d: 1, cbo:genCBoOmitAl('行速3','km/h','运行速度> 第3次')},
        //实际的拆分栏目
        {n: '行速距1', t: ['运行速度','第1次'], x:'距离', u: 'm', c: '四', d: 1,
                          cbo:genCBoDistSpe(arDistSpe,1,'m','运行速度> 第1次-距离')},
        {n: '行速时1', t: [undefined,undefined], x:'时间',u: 's', c: '四', d: 1, cbo:genCBoOmitAl('行速时1','s','第1次-时间')},
        {n: '行速距2', t: [undefined,'第2次'], x:'距离', u: 'm', c: '四', d: 1, cbo:genCBoOmitAl('行速距2','m','第2次-距离')},
        {n: '行速时2', t: [undefined,undefined], x:'时间',u: 's', c: '四', d: 1, cbo:genCBoOmitAl('行速时2','s','第2次-时间')},
        {n: '行速距3', t: [undefined,'第3次'], x:'距离', u: 'm', c: '四', d: 1, cbo:genCBoOmitAl('行速距3','m','第3次-距离')},
        {n: '行速时3', t: [undefined,undefined], x:'时间',u: 's', c: '四', d: 1, cbo:genCBoOmitAl('行速时3','s','第3次-时间')},
    ],
    [{check: '7.5', }],
] as EachObserveConfig[][];
