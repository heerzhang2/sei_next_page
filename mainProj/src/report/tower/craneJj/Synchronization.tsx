/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    BlobInputList, CCell, Cell, ColumnWidth, Input, InputLine, Table, TableBody, TableHead, TableRow, Text, TextArea,
} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

interface Props  extends InternalItemProps{
    label?: string;
    titleNames?: any[];
}
export const guide机构同步=[['同一小车起升机构','同小构'],['不同小车起升机构','不小构'],['不同小车运行机构','不小行'],['其他机构','他机构']];
export const itemA机构同步=['同小构','不小构','不小行','他机构','同步性r','同步备注'];

export const Synchronization =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,titleNames=guide机构同步}: Props, ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA机构同步,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                { titleNames.map(([title,field,resFd], i:number) => {
                    return  <React.Fragment key={i}>
                        项目 {'>'} {title}：
                        <ColumnWidth clnWidth={320} >
                            <InputLine  label='单位：'>
                                <BlobInputList value={inp?.[field]?.u ||''} rows={1}  datalist={['mm', 'm/min']}
                                               onListChange={v => setInp({ ...inp, [field]:{...inp?.[field], u: v} }) } />
                            </InputLine>
                            <InputLine  label='机构1：'>
                                <div css={{display: 'flex',alignItems: 'center'}}>
                                    <Input  value={inp?.[field]?.fu ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], fu: e.currentTarget.value||undefined} }) } />
                                    /
                                    <Input  value={inp?.[field]?.fd ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], fd: e.currentTarget.value||undefined} }) } />
                                </div>
                            </InputLine>
                            <InputLine  label='机构2：'>
                                <div css={{display: 'flex',alignItems: 'center'}}>
                                    <Input  value={inp?.[field]?.su ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], su: e.currentTarget.value||undefined} }) } />
                                    /
                                    <Input  value={inp?.[field]?.sd ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], sd: e.currentTarget.value||undefined} }) } />
                                </div>
                            </InputLine>
                            <ColumnWidth clnWidth={160} >
                                <InputLine  label='偏差测量值：'>
                                    <Input  value={inp?.[field]?.m ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], m: e.currentTarget.value||undefined} }) } />
                                </InputLine>
                                <InputLine  label='偏差允计值：'>
                                    <Input  value={inp?.[field]?.l ||''}
                                            onChange={e => setInp({ ...inp, [field]:{...inp?.[field], l: e.currentTarget.value||undefined} }) } />
                                </InputLine>
                            </ColumnWidth>
                        </ColumnWidth>
                    </React.Fragment>;
                }) }
                <InputLine label='C4.3.2.3各机构同步性能记录表-检验结果'>
                    <SelectHookfork value={ inp?.同步性r ||''}
                                    onChange={e => setInp({ ...inp, 同步性r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.同步备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 同步备注: e.currentTarget.value||undefined}) } />
                {children ?? tailZj同步}
            </InspectRecordLayout>
        );
    } );
export const tailZj同步 = <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
    2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。<br/>
    3、未检查或无需检验的，仅填检验结果栏。
</Text>;
export const SynchronizationVw = ({children, orc, rep, label}: { orc: any, rep: any, label: any, children?: any }
) => {
    return <>
        <div css={{"@media print": {paddingBottom: '5.5rem', pageBreakInside: 'avoid'}}}>
            {typeof label === 'object' ? <>{label}</>
                :
                <Text variant="h4" css={{
                    marginTop: '1rem',
                }}>{label}</Text>
            }
        </div>
        <Table id={'Synchronization'} fixed={["5%", "%", "9%", "23%", "23%", "12%", "10.5%", "9%"]}
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-5.5rem'}}} tight miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell colSpan={2}>项目</CCell>
                    <CCell>单位</CCell>
                    <CCell>机构1</CCell>
                    <CCell>机构2</CCell>
                    <CCell>偏差测量值</CCell>
                    <CCell>偏差允计值</CCell>
                    <CCell>检验结果</CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'Synchronization'}>
                    {guide机构同步.map(([title, field], i: number) => {
                        return <React.Fragment key={i}>
                            <TableRow>
                                <CCell rowSpan={2} colSpan={2}>{title}</CCell>
                                <CCell rowSpan={2}>{orc?.[field]?.u}</CCell>
                                <CCell>{orc?.[field]?.fu}</CCell>
                                <CCell>{orc?.[field]?.su}</CCell>
                                <CCell rowSpan={2}>{orc?.[field]?.m}</CCell>
                                <CCell rowSpan={2}>{orc?.[field]?.l}</CCell>
                                {i === 0 && <CCell split rowSpan={8}>{orc?.同步性r || '／'}</CCell>}
                            </TableRow>
                            <TableRow>
                                <CCell>{orc?.[field]?.fd}</CCell>
                                <CCell>{orc?.[field]?.sd}</CCell>
                            </TableRow>
                        </React.Fragment>;
                    })}
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell colSpan={7}>
                            <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                                {orc.同步备注 || '／'}
                            </div>
                        </Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {children ?? tailZj同步}
    </>;
};