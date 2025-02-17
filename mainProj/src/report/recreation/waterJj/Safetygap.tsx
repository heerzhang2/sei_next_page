/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, InputLine, SuffixInput, Text,} from "customize-easy-ui-component";
import {EachObserveConfig} from "../../hook/useObserve";
import {calcAverageArrObj,} from "../../../common/tool";
import {genCBoOmit} from "./repView";

//[特殊的] 距离 时间分离的  m/s
export const genCBoDistSpe = (nmar:string[],resvDg:number,unit:string,title?:any) => {
    const pairs=Math.ceil(nmar.length/2);
    return {
        edit:(inp:any,setInp:(a:any)=>void)=>{
            let valuAr=(new Array(pairs).fill(null)).map((_, p: number) =>
                inp?.[nmar[2*p]+'o'] / inp?.[nmar[2*p+1]+'o']
            );
            const avHs=calcAverageArrObj(valuAr,(row)=>row,resvDg);
            return [true, <div css={{textAlign: 'center'}}><Text css={{fontWeight: 800}}>{title}：</Text>
                    <InputLine  label='观测数据'>
                        <SuffixInput value={ inp?.[nmar[0]+'o'] ||''}
                                     onSave={txt => setInp({ ...inp, [nmar[0]+'o']: txt||undefined} ) }>{unit}</SuffixInput>
                    </InputLine>
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
            </>]
        },
    };
};

const arDistSpe=(new Array(6)).fill(null).map(( _,  w:number) => {
    let mid=w % 2 === 0? '距':'时';
    return  '格流'+mid+ Math.ceil((w+1)/2);
})
//【问题】注入的回调CB无法获取context变量:配置行的其它设置。 ？#增加嵌套形式的crit_XX gen_XX 辅助生成器？
export const config格栅流=[
    [{n: '格流距1', t: ['间隙流速应当小于0.2m/s','第1次'], x:'距离', u: 'm', c: '四', d: 1,
                          cbo:genCBoDistSpe(arDistSpe,1,'m','检测项目> 第1次-距离')},
        {n: '格流时1', t: [undefined,undefined], x:'时间',u: 's', c: '四', d: 1, cbo:genCBoOmit('格流时1','s','第1次-时间')},
        {n: '格流距2', t: [undefined,'第2次'], x:'距离', u: 'm', c: '四', d: 1, cbo:genCBoOmit('格流距2','m','第2次-距离')},
        {n: '格流时2', t: [undefined,undefined], x:'时间',u: 's', c: '四', d: 1, cbo:genCBoOmit('格流时2','s','第2次-时间')},
        {n: '格流距3', t: [undefined,'第3次'], x:'距离', u: 'm', c: '四', d: 1, cbo:genCBoOmit('格流距3','m','第3次-距离')},
        {n: '格流时3', t: [undefined,undefined], x:'时间',u: 's', c: '四', d: 1, cbo:genCBoOmit('格流时3','s','第3次-时间')},
    ],
    [{check: 'K8.19', }],
] as EachObserveConfig[][];
