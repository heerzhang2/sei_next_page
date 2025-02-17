/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Input, Table, TableBody, TableHead, TableRow, Text, TextArea,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {calcAverageArrObj, floatInterception, tableSetInp} from "../../../common/tool";

export const tail速度 = <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：1、对于起升速度、下降速度、回转速度、变幅速度，测3次计算平均值。<br/>
    2、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计
    文件对速度允许偏差都没有规定的，相应的速度仅测量，不作检验结果判定。<br/>
    3、对于多起升机构或多小车运行机构的起重机，仅记录其中1个主起升机构的速度。对于其余起升机构的速度测量值，
    记录在备注栏。<br/>
    4、根据GBT 14560-2022 规定, 起升、变幅、伸缩、回转和行走等机构的运行应平稳，其运行速度与设计值的相对误差
    不应大于5%。<br/>
    5、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。<br/>
    6、未检查或无需检验的，仅填检验结果栏。采用现场监督且结果合格时，可仅填检验结果栏。
</Text>;

//默认的配置
export const config运行速度=[ ['主升速表','主起升机构起升速度'],['主降速表','主起升机构下降速度'],['回转速表','回转速度'],['变幅速表','变幅速度'],
                   ['吊回速表','吊具回转速度'] ];
interface Props  extends InternalItemProps{
    config: any[];
    sseq: number;
    stim?: number;
    xtim?: number;
}
//固定的存储名字，不能注入变化的：
export const itemA速度 = ['速度备注'];
// 运行速度s.forEach(([name, title], i: number) => {
//     itemA速度.push(name+'表', name+'表r');
// });
export const MoveSpeed =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,sseq,stim=4,xtim=3}: Props, ref
    ) => {
        const config上 = config.slice(0, sseq);
        const config下 = config.slice(sseq);
        const itemA = React.useMemo(() => {
            let items: string[]=[];
            config.forEach(([name,title], i:number)=>{
                items.push(name+'',  name+'r');
            });
            return [...items, ...itemA速度];
        }, [config]);
        const [getInpFilter] = useMeasureInpFilter(null, itemA,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                <Text variant="h5">前 {config上.length} 个项目: 距离（m）{'>>'}</Text>
                <div css={{display: 'flex', margin: 'auto'}}>
                    <div css={{display: 'inline-block', margin: 'auto'}}>
                        {config上.map(([name,title], t: number) => {
                            const avspeed=calcAverageArrObj(inp?.[name],(row)=>{return row?.d/row?.t},2);
                            return <React.Fragment key={t}>
                                <Text variant="h5">{t+1},&nbsp; {title} :</Text>
                                {(new Array(stim)).fill(null).map((_, i: number) => {
                                    let o = inp?.[name]?.[i];
                                    const itspd = o?.d / o?.t;
                                    return <div key={i}>
                                        <Text>&nbsp; {i + 1} 次: </Text>
                                        距离
                                        <Input value={o?.d || ''} size={4}
                                               style={{display: 'inline-flex', width: 'unset'}}
                                               onChange={e => tableSetInp(name, i, inp, setInp, 'd', e.currentTarget.value || undefined)}/>
                                        (m)，时间
                                        <Input value={o?.t || ''} size={4}
                                               style={{display: 'inline-flex', width: 'unset'}}
                                               onChange={e => tableSetInp(name, i, inp, setInp, 't', e.currentTarget.value || undefined)}/>
                                        (min)，速度={!isNaN(itspd) && floatInterception(itspd, 2)} (m/min)。
                                    </div>;
                                })}
                                <Text variant="h6" css={{display: 'inline-flex'}}>平均速度= {avspeed} m/min, {title}-检验结果：</Text>
                                <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                                    <SelectHookfork value={(inp?.[name + 'r']) || ''}
                                                    onChange={e => setInp({...inp, [name + 'r']: e.currentTarget.value || undefined})}/>
                                </div>
                            </React.Fragment>;
                        })}
                    </div>
                </div>
                <Text variant="h5">后 {config下.length} 个项目: 圈数(r) {'>>'}</Text>
                <div css={{display: 'flex', margin: 'auto'}}>
                    <div css={{display: 'inline-block', margin: 'auto'}}>
                        {config下.map(([name,title], t: number) => {
                            const avspeed=calcAverageArrObj(inp?.[name],(row)=>{return row?.d/row?.t},1);
                            return <React.Fragment key={t}>
                                <Text variant="h5">{sseq+t+1},&nbsp; {title} :</Text>
                                {(new Array(xtim)).fill(null).map((_, i: number) => {
                                    let o = inp?.[name]?.[i];
                                    const itspd = o?.d / o?.t;
                                    return <div key={i}>
                                        <Text>&nbsp; {i + 1} 次: </Text>
                                        圈数
                                        <Input value={o?.d || ''} size={4}
                                               style={{display: 'inline-flex', width: 'unset'}}
                                               onChange={e => tableSetInp(name, i, inp, setInp, 'd', e.currentTarget.value || undefined)}/>
                                        (r)，时间
                                        <Input value={o?.t || ''} size={4}
                                               style={{display: 'inline-flex', width: 'unset'}}
                                               onChange={e => tableSetInp(name, i, inp, setInp, 't', e.currentTarget.value || undefined)}/>
                                        (min)，速度={!isNaN(itspd) && floatInterception(itspd, 1)} (r/min)。
                                    </div>;
                                })}
                                <Text variant="h6" css={{display: 'inline-flex'}}>平均速度= {avspeed} r/min, {title}-检验结果：</Text>
                                <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                                    <SelectHookfork value={(inp?.[name + 'r']) || ''}
                                                    onChange={e => setInp({...inp, [name + 'r']: e.currentTarget.value || undefined})}/>
                                </div>
                            </React.Fragment>;
                        })}
                    </div>
                </div>
                备注：
                <TextArea  value={inp?.速度备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 速度备注: e.currentTarget.value||undefined}) } />
                {children}
            </InspectRecordLayout>
        );
} );
/*支持config注入，拆分点，上下两部分的测量次数=4或=3；注解
* */
export const MoveSpeedVw= ({children, orc, rep,label,config,sseq,stim=4,xtim=3} : { orc: any, rep: any,label:any, children?: any,config:any[],sseq:number,
               stim?:number,xtim?:number}
) => {
    const config上 = config.slice(0, sseq);
    const config下 = config.slice(sseq);
    return <>
        <div css={{"@media print": {paddingBottom: '7rem', pageBreakInside: 'avoid'}}}>
            {typeof label === 'object' ? <>{label}</>
                :
                <Text variant="h4" css={{
                    marginTop: '1rem',
                }}>{label}</Text>
            }
        </div>
        <Table id={'MoveSpeed'} fixed={ ["%", "5%", "10%", "10%", "11.5%", "15.5%", "8.5%"] }
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-7rem'}}} tight miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell>项目</CCell><CCell>次数</CCell><CCell>距离(m)</CCell><CCell>时间(min)</CCell>
                    <CCell>速度(m/min)</CCell><CCell>平均速度(m/min)</CCell><CCell>检验结果</CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'MoveSpeed'}>
                    {config上.map(([name, title], t: number) => {
                        const avspeed = calcAverageArrObj(orc?.[name], (row) => {
                            return row?.d / row?.t
                        }, 2);
                        return <React.Fragment key={t}>
                            {(new Array(stim)).fill(null).map((_, d: number) => {
                                const o = orc?.[name]?.[d];
                                const itspd = o?.d / o?.t;
                                return <TableRow key={d}>
                                    {0 === d && <CCell rowSpan={stim}>{title}</CCell>}
                                    <CCell>{d + 1}</CCell>
                                    <CCell>{o?.d}</CCell>
                                    <CCell>{o?.t}</CCell>
                                    <CCell>{!isNaN(itspd) && floatInterception(itspd, 2)}</CCell>
                                    {0 === d && <CCell rowSpan={stim}>{avspeed}</CCell>}
                                    {0 === d && <CCell rowSpan={stim}>{orc?.[name + 'r']}</CCell>}
                                </TableRow>;
                            })}
                        </React.Fragment>;
                    })}
                </RepLink>
            </TableBody>
        </Table>
        <div css={{"@media print": {paddingBottom: '4.5rem', pageBreakInside: 'avoid'}}} />
        <Table fixed={ ["4.5%","%", "5%", "10%", "10%", "11.5%", "15.5%", "8.5%"] }
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-4.5rem'}}} tight miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell colSpan={2}>项目</CCell><CCell>次数</CCell><CCell>圈数(r)</CCell><CCell>时间(min)</CCell>
                    <CCell>速度(r/min)</CCell><CCell>平均速度(r/min)</CCell><CCell>检验结果</CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'MoveSpeed'}>
                    {config下.map(([name, title], t: number) => {
                        const avspeed = calcAverageArrObj(orc?.[name], (row) => {
                            return row?.d / row?.t
                        }, 1);
                        return <React.Fragment key={t}>
                            {(new Array(xtim)).fill(null).map((_, d: number) => {
                                const o = orc?.[name]?.[d];
                                const itspd = o?.d / o?.t;
                                return <TableRow key={d}>
                                    {0 === d && <CCell rowSpan={xtim} colSpan={2}>{title}</CCell>}
                                    <CCell>{d + 1}</CCell>
                                    <CCell>{o?.d}</CCell>
                                    <CCell>{o?.t}</CCell>
                                    <CCell>{!isNaN(itspd) && floatInterception(itspd, 1)}</CCell>
                                    {0 === d && <CCell rowSpan={xtim}>{avspeed}</CCell>}
                                    {0 === d && <CCell rowSpan={xtim}>{orc?.[name + 'r']}</CCell>}
                                </TableRow>;
                            })}
                        </React.Fragment>;
                    })}
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell colSpan={7}>
                            <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                                {orc.速度备注 || '／'}
                            </div>
                        </Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {children}
    </>;
};
