/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    BlobInputList, CCell, CheckSwitch, Input, InputDatalist, InputLine, LineColumn, SuffixInput, TableRow, Text, TextArea,
} from "customize-easy-ui-component";
import {CCellUnit, } from "../common/base";
import {multilines2Html} from "../tools";
import {EditStorageContext} from "../StorageContext";
import {NoDeprecatedCustomRule} from "graphql/validation";

interface ThreeRaftReviewProps {
    inp: any;
    setInp: React.Dispatch<React.SetStateAction<any>>;
    verId?: string;
    config?: ( (verId:string,orc:any)=>any[] ) | any[];
    // defValCb?: DefaultCallback;
}
/**非独立编辑器形式； 不支持pr：“”配置方式掺入列。
 * 编辑器三排模式的：类似概要的编辑器和报告： 【缺点】不考虑前缀的配置；
 * 类似于 ThreeConfigRaft 只有内容。    @ 给useThreeRaftSurveyTbl配套的， 可支持3排编辑器。
 * @param config  范式模型配置; 基础配置统一为[desc, name, cb] 3元组合的。
 * */
export const useThreeRaftSurvey= ({ config,inp,setInp,verId}  :ThreeRaftReviewProps
) => {
    const {storage, } =React.useContext(EditStorageContext) as any;     //某些特殊编辑器需要知道基础个别的字段。
    //surveyItems: 2大列布局映射成： 统一1个列表的。 编辑器没有考虑左边还是右边的那一列位置关系。
    const [surveyItems, itemAnew] = React.useMemo(() => {
        const surveyItems = [] as any;          //布局2排的，转为正常的1排列表
        const newconfig=typeof config ==='function'? config(verId!,storage) : config;
        newconfig?.forEach(([[desc, name, cb], add2p, tail3p]: any, i: number) => {
            const [desc2, name2, cb2] = add2p || [];
            if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, desc, cb});
            else if (typeof name === 'object' && name.n && !name.r) surveyItems.push({name: name.n, desc, cb, type: name.t, unit: name.u, list: name.l});
            if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({name: name2, desc: desc2, cb: cb2});
            else if (typeof name2 === 'object' && name2.n && !name2.r) surveyItems.push({name: name2.n, desc: desc2, cb: cb2, type: name2.t, unit: name2.u, list: name2.l});
            const [desc3, name3, cb3] = tail3p || [];
            if (typeof name3 === 'string' && name3 && !name3.startsWith('_$')) surveyItems.push({name: name3, desc: desc3, cb: cb3});
            else if (typeof name3 === 'object' && name3.n && !name3.r) surveyItems.push({name: name3.n, desc: desc3, cb: cb3, type: name3.t, unit: name3.u, list: name3.l});
        });
        const itemA设备概况: string[] = [ ];
        //初始化 存储字段
        surveyItems.forEach(({name,cb}: any, i: number) => {
            if(cb?.names)   itemA设备概况.push(...cb?.names);           //允许用回调模式
            else  itemA设备概况.push(name);
        });
        return [surveyItems, itemA设备概况];
    }, [config]);

    //正常的每一行都独立 布局； 若一个序号多个小项目的：可能遭遇太过拥挤情况。
    const render= React.useMemo(() =>
        {
            //若有 备注 必须配置在最后一个的。
            const lastAiObj=surveyItems[surveyItems.length-1];
            const isMemoLast= lastAiObj?.type==='m';
            const toTailNodes: React.ReactNode[]=[];
         return <>
             <LineColumn column={4}>
                 {
                     surveyItems.map(({name, desc:orgDesc, cb, type, unit, list}: any, i: number) => {
                         const desc= typeof orgDesc==='string'? orgDesc: orgDesc?.text;       //第一列的遇见的：标题也做了定制和回调啊。
                         if(isMemoLast && (surveyItems.length-1)===i)  return null;
                         if (cb?.edit) {
                             if(!cb?.toTail)
                                 return <React.Fragment key={i}>{ cb.edit(inp, setInp) }</React.Fragment>;
                             else{
                                 const aNode=<React.Fragment key={i}>
                                     <Text>{cb?.toTail}：</Text>
                                     { cb.edit(inp, setInp) }
                                 </React.Fragment>;
                                 toTailNodes.push(aNode);
                             }
                         } else if (type === 'l') return <InputLine key={i} label={desc}>
                             <InputDatalist value={(inp?.[name]) || ''} datalist={list}
                                            onListChange={v => {
                                                setInp({...inp, [name]: v || undefined});
                                            }}/>
                         </InputLine>;
                         else if (type === 'd') return <InputLine key={i} label={desc}>
                             <Input value={inp?.[name] || ''} type='date'
                                    onChange={e => setInp({...inp, [name]: e.currentTarget.value})}/>
                         </InputLine>;
                         else if (type === 'b') return <InputLine key={i} label={desc}>
                             <CheckSwitch checked={inp?.[name] || false}
                                          onChange={e => setInp({...inp, [name]: inp?.[name] ? undefined : true})}/>
                         </InputLine>;
                         else if (type === 'B') return <InputLine key={i} label={desc}>
                             <BlobInputList value={inp?.[name] || ''} datalist={list}
                                            onListChange={v => setInp({...inp, [name]: v || undefined})}/>
                         </InputLine>;
                         else if (type === 'm') return <div key={i}>{desc}:
                             <TextArea value={inp?.[name] || ''} rows={4}
                                       onChange={e => setInp({...inp, [name]: e.currentTarget.value || undefined})}/>
                         </div>;
                         else if (unit) return <InputLine key={i} label={desc}>
                             <SuffixInput value={inp?.[name] || ''}
                                          onSave={txt => setInp({...inp, [name]: txt || undefined})}
                                          type={type === 'n' ? "number" : undefined}>{unit}</SuffixInput>
                         </InputLine>;
                         else return <InputLine label={desc} key={i}>
                                 <Input value={inp?.[name] || ''} type={type === 'n' ? "number" : undefined}
                                        onChange={e => {
                                            setInp({...inp, [name]: e.currentTarget.value || undefined});
                                        }}/>
                             </InputLine>;
                     })
                 }
             </LineColumn>
             {toTailNodes}
             { isMemoLast && <>
                 {lastAiObj.desc}:
                 <TextArea value={inp?.[lastAiObj.name] || ''} rows={5}
                           onChange={e => setInp({...inp, [lastAiObj.name]: e.currentTarget.value || undefined})}/>
             </>
             }
        </>;
        }
        ,[config,inp,setInp]);

    //状态控制部分useItemInputControl({ref})等需要上一级组件一起公用的，所以拆分穿插掉。需要返回itemObservation给上级组件
  return [render, itemAnew] as any;     //注意类型匹配！
}

//附加的Node插入某一位置column的？
// export type AdditionalCc = {
//     [number]: any;
// };
interface ThreeRaftReviewTblProps {
    orc: any;
    parentOrc?: any;
    config: any[][][];
    rep: any;
    slash?: boolean;
    //【规定】字典类型的 类似于{ 0:  <CCell rowSpan={3}>性能参数</CCell>, } 说明附加的列的第几行在第一列的位置去插入的；插入位置固定在第一列的。
    //只能第一行，其他行导致整个表格的列数增加了，其他没有纳入rowSpan的剩下行布局colSpan无法修改！ 只能拆分表格。
    embed?: any;
}
/**@Deprecated
 * 淘汰，不支持pr：“”配置方式掺入列。
 * 设备概况：和useThreeRaftSurvey编辑器配合的，给正式报告展示。 支持3排的/三个大区列布局。 【缺点】没有考虑到前缀列的插入。
 * 对比不同于 useThreeColumnView 的：对方支持拆分config配置区块的。
 * @param config: 配置。
 * @param  slash 打斜杠
 * @param  parentOrc  和 orc对应， 分项报告的情形用的。
 * @return  不能用DOM<></>在做一次包裹的，否则hhref无法点击生效。
 * 可替代的用： 兼容分项报告 usePrefixData； 主报告的 useThreeColumnView ；
 * */
export const useThreeRaftSurveyTbl= ({orc, config, rep, parentOrc:orgParOrc, slash,embed} : ThreeRaftReviewTblProps
) => {
    const parentOrc=orgParOrc? orgParOrc : orc;         //兼容分项报告的情形
    const nodes=config?.map(([[desc,name,cb],add2p,thirdP] : any, i:number)=> {
        const [desc2,name2,cb2]= add2p||[];
        const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
        const txtnode1=cb&&cb.view? cb.view(orc, parentOrc,rep) :
            typeof name==='string'? (name?.startsWith('_$')? parentOrc?.[name.substring(2)] : orc?.[name]) :
                name.r? name.r :
                    name.t==='b'? (orc?.[name.n]? '是':'否') :
                        name.t === 'm' ?
                            <div css={{textAlign: 'left', whiteSpace: 'pre-wrap'}}>{orc?.[name.n] ?? '／'}</div>
                            :
                            orc?.[name.n];
        const tailUnit2=!desc2? undefined :
            typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
        const txtnode2=!desc2? undefined :
            cb2&&cb2.view? cb2.view(orc, parentOrc,rep) :
                typeof name2==='string'? (name2?.startsWith('_$')? parentOrc?.[name2.substring(2)] : orc?.[name2]) :
                    name2.r? name2.r :
                        name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                            orc?.[name2.n];
        const [desc3,name3,cb3]= thirdP||[];
        const tailUnit3=!desc3? undefined :
            typeof cb3==='string'? cb3 : (typeof name3==='object' && name3.u)? name3.u:undefined;
        const txtnode3=!desc3? undefined :
            cb3&&cb3.view? cb3.view(orc, parentOrc,rep) :
                typeof name3==='string'? (name3?.startsWith('_$')? parentOrc?.[name3.substring(2)] : orc?.[name3]) :
                    name3.r? name3.r :
                        name3.t==='b'? (orc?.[name3.n]? '是':'否') :
                            orc?.[name3.n];
        return <React.Fragment key={i}>
            <TableRow>
                { embed && embed[i] }
                <CCell>{typeof desc==='string'? desc: desc?.view(orc, parentOrc,rep)}</CCell>
                { tailUnit1?
                    <CCellUnit unit={tailUnit1} colSpan={desc3? 1 : desc2? 2: 5}>{txtnode1??(slash&&'／')}</CCellUnit>
                    :
                    <CCell colSpan={desc3? 1 : desc2? 2: 5}>{txtnode1??(slash&&'／')}</CCell>
                }
                {desc2 && <>
                    <CCell>{desc2}</CCell>
                    { tailUnit2?
                        <CCellUnit unit={tailUnit2} colSpan={desc3? 1 : 2}>{txtnode2??(slash&&'／')}</CCellUnit>
                        :
                        <CCell colSpan={desc3? 1 : 2}>{txtnode2??(slash&&'／')}</CCell>
                    }
                </>
                }
                {desc3 && <>
                    <CCell>{desc3}</CCell>
                    { tailUnit3?
                        <CCellUnit unit={tailUnit3}>{txtnode3??(slash&&'／')}</CCellUnit>
                        :
                        <CCell>{txtnode3??(slash&&'／')}</CCell>
                    }
                </>
                }
            </TableRow>
        </React.Fragment>;
    });
    return  nodes;
};
