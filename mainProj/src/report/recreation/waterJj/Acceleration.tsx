/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea, Input, CCell, Table, TableBody, TableRow, TableHead, Cell, InputLine, BlobInputList, LineColumn, SuffixInput,
} from "customize-easy-ui-component";
import {CCellUnit, InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {calcAverageArrObj, objNestSet, tableSetInp} from "../../../common/tool";
import {RepLink} from "../../common/base";

export const config加速度=[ ['加空载','空载'],['加满载','满载'],['加偏载','偏载'],['加他况','其他载荷工况'] ];
export const tail加速度= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：<br/>
    （1）设计加速度未涉及的工况无需检测；<br/>
    （2）设计加速度在不同乘坐位置之间有明显差异时，应选择不少于三处位置进行测试，在本表中备注栏中填写其余位置说明及测试结果且对加速度区域进行综合判定。
</Text>;

interface Props  extends InternalItemProps{
    sseq: number;
    stnum?: number;      //每个项目有3次的测试
}
export const itemA加速 = ['加速备注','加测位','加风速','加采频', '加速设值','加速试果','加速区域','设计加速','加速结论'];
config加速度.forEach(([name,title], i:number)=>{
    itemA加速.push(name+'',  name+'r');
});
const AxyzNm = ['a', 'b', 'c', 'd', 'e', 'f'];
const AxyzCfg=[ ['a','Ax.max'],['b','Ax.min'],['c','Ay.max'],['d','Ay.min'],['e','Az.max'],['f','Az.min'] ];
export const Acceleration =
React.forwardRef((
    {children, show, alone = true, refWidth,label,sseq,stnum=3}: Props, ref
) => {
    const [getInpFilter] = useMeasureInpFilter(null, itemA加速,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            <Text variant="h5">{label}</Text>
            <LineColumn>
                <InputLine label='测试位置'>
                    <BlobInputList value={inp?.加测位 || ''} rows={2}
                                   onListChange={v => setInp({...inp, 加测位: v || undefined})}/>
                </InputLine>
                <InputLine label='风速'>
                    <SuffixInput value={inp?.加风速 || ''}
                                 onSave={txt => setInp({...inp, 加风速: txt || undefined})}>m/s</SuffixInput>
                </InputLine>
                <InputLine label='采样频率'>
                    <SuffixInput value={inp?.加采频 || ''}
                                 onSave={txt => setInp({...inp, 加采频: txt || undefined})}>Hz</SuffixInput>
                </InputLine>
            </LineColumn>
            <Text variant="h5">按测量工况分4个项目: 加速度A，单位（g）{'>>'}</Text>
            <div css={{display: 'flex', margin: 'auto'}}>
                <div css={{display: 'inline-block', margin: 'auto'}}>
                    {config加速度.map(([name, title], t: number) => {
                        const avv = AxyzNm.map((tag, t: number) => calcAverageArrObj(inp?.[name], (row) => row?.[tag], 1, stnum));
                        return <React.Fragment key={t}>
                            <Text variant="h5">{t + 1},&nbsp; {title} :</Text>
                            {(new Array(stnum)).fill(null).map((_, i: number) => {
                                let o = inp?.[name]?.[i];
                                return <div key={i}>
                                    <Text>&nbsp; {i + 1} 次: </Text>
                                    {AxyzCfg.map(([tag,title], h: number) => {
                                        return <React.Fragment key={h}>
                                            {title}
                                            <Input value={o?.[tag] || ''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                                   onChange={e => tableSetInp(name, i, inp, setInp, tag, e.currentTarget.value || undefined)}/>
                                        </React.Fragment>;
                                    })}
                                </div>;
                            })}
                            <Text variant="h6">{title}-平均值：Ax.max= {avv[0]} ,Ax.min= {avv[1]} ,Ay.max= {avv[2]} ,Ay.min= {avv[3]} ,Az.max= {avv[4]} ,Az.min= {avv[5]} ;</Text>
                        </React.Fragment>;
                    })}
                </div>
            </div>
            <Text variant="h5">判定部分: {'>>'}</Text>
            <div css={{display: 'flex', margin: 'auto'}}>
                <div css={{display: 'inline-block', margin: 'auto'}}>
                    <Text variant="h5">测试结果:</Text>
                    {AxyzCfg.map(([tag,title], i: number) => {
                        return <React.Fragment key={i}>
                            <Text>{title}</Text>
                            <Input value={inp?.加速试果?.[tag] || ''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                     onChange={e => objNestSet('加速试果', tag, e.currentTarget.value || undefined, inp, setInp)}/>
                        </React.Fragment>;
                    })}
                    <Text variant="h5">设计值:</Text>
                    {AxyzCfg.map(([tag,title], i: number) => {
                        return <React.Fragment key={i}>
                            <Text>{title}</Text>
                            <Input value={inp?.加速设值?.[tag] || ''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => objNestSet('加速设值', tag, e.currentTarget.value || undefined, inp, setInp)}/>
                        </React.Fragment>;
                    })}
                </div>
            </div>
            <LineColumn>
                <InputLine label='加速度区域' >
                    <BlobInputList  value={inp?.加速区域 ||''} datalist={[]} rows={2}
                                    onListChange={v => setInp({ ...inp, 加速区域: v || undefined}) } />
                </InputLine>
                <InputLine label='设计加速度区域' >
                    <BlobInputList  value={inp?.设计加速 ||''} datalist={[]} rows={2}
                                    onListChange={v => setInp({ ...inp, 设计加速: v || undefined}) } />
                </InputLine>
                <InputLine label='结果判定：'>
                    <SelectHookfork value={inp?.加速结论 ?? ''} onChange={e => {
                        setInp({...inp, 加速结论: e.currentTarget.value || undefined});
                    }}/>
                </InputLine>
            </LineColumn>
            备注：
            <TextArea value={inp?.加速备注 || ''} rows={3}
                      onChange={e => setInp({...inp, 加速备注: e.currentTarget.value || undefined})}/>
            {children ?? tail加速度}
    </InspectRecordLayout>
    );
});

export const AccelerationVw = ({children, orc, rep, label, stnum = 3}:
                               { orc: any, rep: any, label: any, children?: any, stnum?: number }
) => {
    return <>
        <div css={{"@media print": {paddingBottom: '4rem', pageBreakInside: 'avoid'}}}>
            <Text variant="h4" css={{marginTop: '1rem',}}>{label}</Text>
        </div>
        <Table id={'Acceleration'} fixed={ ["13%", "44%", "10%", "%"] }
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-4rem'}}} tight miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    <TableRow>
                        <CCell>测试位置</CCell>
                        <CCell colSpan={3}>{orc?.加测位}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>风速</CCell>
                        <CCellUnit unit={'m/s'}>{orc?.加风速}</CCellUnit>
                        <CCell>采样频率</CCell>
                        <CCellUnit unit={'Hz'}>{orc?.加采频}</CCellUnit>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        <div css={{"@media print": {paddingBottom: '7rem', pageBreakInside: 'avoid'}}}/>
        <Table fixed={ ["13%", "9%", "13%", "13%", "13%", "13%", "%", "13%"] }
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-7rem'}}} tight miniw={800}>
            <TableHead>
                <TableRow><CCell rowSpan={3}>测量工况</CCell><CCell rowSpan={3}>测量次数</CCell><CCell
                    colSpan={6}>加速度A（g）</CCell></TableRow>
                <TableRow><CCell colSpan={2}>Ax</CCell><CCell colSpan={2}>Ay</CCell><CCell
                    colSpan={2}>Az</CCell></TableRow>
                <TableRow><CCell>max</CCell><CCell>min</CCell><CCell>max</CCell><CCell>min</CCell><CCell>max</CCell><CCell>min</CCell></TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    {config加速度.map(([name, title], t: number) => {
                        const avv = AxyzNm.map((tag, k: number) => calcAverageArrObj(orc?.[name], (row) => row?.[tag], 1, stnum));
                        return <React.Fragment key={t}>
                            {(new Array(stnum)).fill(null).map((_, d: number) => {
                                const o = orc?.[name]?.[d];
                                return <TableRow key={d}>
                                    {0 === d && <CCell rowSpan={stnum + 1}>{title}</CCell>}
                                    <CCell>{d + 1}</CCell>
                                    <CCell>{o?.a}</CCell><CCell>{o?.b}</CCell>
                                    <CCell>{o?.c}</CCell><CCell>{o?.d}</CCell>
                                    <CCell>{o?.e}</CCell><CCell>{o?.f}</CCell>
                                </TableRow>
                            })}
                            <TableRow><CCell>平均值</CCell>
                                {AxyzNm.map((_, h: number) => <CCell key={h}>{avv[h]}</CCell>)}
                            </TableRow>
                        </React.Fragment>;
                    })}
                    <TableRow><CCell colSpan={2}>测试结果</CCell>
                        {AxyzNm.map((tag, h: number) => <CCell key={h}>{orc?.加速试果?.[tag]}</CCell>)}
                    </TableRow>
                    <TableRow><CCell colSpan={2}>设计值</CCell>
                        {AxyzNm.map((tag, h: number) => <CCell key={h}>{orc?.加速设值?.[tag]}</CCell>)}
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        <Table fixed={ ["10.1%", "44%", "14.1%", "%"] } css={{borderCollapse: 'collapse', }} tight miniw={800}>
            <TableBody>
                <RepLink ori rep={rep} tag={'Acceleration'}>
                    <TableRow>
                        <CCell>加速度区域</CCell><CCell>{orc?.加速区域}</CCell>
                        <CCell>设计加速度区域</CCell><CCell>{orc?.设计加速}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>结果判定</CCell><CCell colSpan={3}>{orc?.加速结论 || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell split={true} colSpan={3}>
                            <div css={{whiteSpace: 'pre-wrap'}}><Text>{orc?.加速备注 || '／'}</Text></div>
                        </Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {children ?? tail加速度}
    </>;
};
