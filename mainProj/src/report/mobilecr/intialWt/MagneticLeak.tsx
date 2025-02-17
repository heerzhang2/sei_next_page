/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, CCell, Table, TableBody, TableRow, Cell, InputLine, LineColumn, SuffixInput, TextArea,
} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {arraySetInp, calcAverageArrObj} from "../../../common/tool";
import {RepLink} from "../../common/base";

const tailZj = <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：未检查或无需检验的，仅填检验结果栏。采用现场监督且结果合格时，可仅填检验结果栏。
</Text>;
export const items漏磁检=[['2mm','场强2'],['50mm','场强5'],['100mm','场强10']];
export const itemA漏磁检=['场强2','场强5','场强10','漏磁检r','漏磁备注'];
interface Props extends InternalItemProps {
    apno?: string;
}
export const MagneticLeak =
    React.forwardRef((
        {children, show, alone = true, redId, nestMd, label, apno='10'}: Props, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA漏磁检,);
        const {inp, setInp} = useItemInputControl({ref});
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}</Text>
            <Text css={{display: 'flex',justifyContent: 'end'}}>测磁场强度，单位：Gs</Text>
            { items漏磁检.map(([title,field], i:number) => {
                return  <React.Fragment key={i}>
                    项目{i+1} {'>'} 在 {title} 处：
                    <LineColumn>
                        { ['左端','中间','右端'].map(( prefix,  w:number) => {
                            return <InputLine key={w} label={`${prefix}，磁场强度：`}>
                                <SuffixInput  value={inp?.[field]?.[w] ||''} onSave={txt=>arraySetInp(field, w, txt,inp,setInp)}>Gs</SuffixInput>
                            </InputLine>;
                        }) }
                        <InputLine  label={`结果值：`}>
                            <Text>{calcAverageArrObj(inp?.[field],a=>a,1,3)}</Text>
                        </InputLine>
                    </LineColumn>
                </React.Fragment>;
            }) }
            <InputLine label={'检验结果'}>
                <SelectHookfork value={ inp?.漏磁检r ||''}
                                onChange={e => setInp({ ...inp, 漏磁检r: e.currentTarget.value||undefined}) }/>
            </InputLine>
            备注：
            <TextArea  value={inp?.漏磁备注 ||''} rows={4}
                       onChange={e => setInp({ ...inp, 漏磁备注: e.currentTarget.value||undefined}) } />


            { children ? children : tailZj }
        </InspectRecordLayout>;
});
/*文字差异：
* */
export const MagneticLeakVw = ({orc, rep, label,children,dunit}: { orc: any, rep: any, label: string, children?: any,dunit?:boolean}
) => {
    return <>
        <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}}}>
            <Text variant="h4" css={{
                marginTop: '1rem',
            }}>{label}</Text>
            {dunit && <div css={{textAlign: 'right'}}>单位：Gs</div>}
        </div>
        <Table id='MagneticLeak' fixed={["%","17%","17%","17%","17%","9%"] }
                     css={{borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}}}  tight miniw={800} >
            <TableBody>
                <TableRow>
                    <CCell>测试点</CCell>
                    <CCell>左端</CCell>
                    <CCell>中间</CCell>
                    <CCell>右端</CCell>
                    <CCell>结果值</CCell>
                    <CCell>检验结果</CCell>
                </TableRow>
                <RepLink ori rep={rep} tag={'MagneticLeak'}>
                    { items漏磁检.map(( [title,field],  w:number) => {
                        // const itspd=orc?.[field+'o']?.[w]/orc?.[field+'v']?.[w];
                        return  <TableRow key={w}>
                            <CCell>{title}</CCell>
                            <CCell>{orc?.[field]?.[0]}</CCell>
                            <CCell>{orc?.[field]?.[1]}</CCell>
                            <CCell>{orc?.[field]?.[2]}</CCell>
                            <CCell>{calcAverageArrObj(orc?.[field],a=>a,1,3)}</CCell>
                            {w===0 && <CCell rowSpan={3}>{orc?.漏磁检r}</CCell>}
                        </TableRow>;
                    }) }
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell split={true} colSpan={5}>
                            <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                                {orc.漏磁备注 || '／'}
                            </div>
                        </Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {children ? children : tailZj}
    </>;
};
