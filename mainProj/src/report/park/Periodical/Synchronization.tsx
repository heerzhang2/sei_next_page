/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea, InputLine, ColumnWidth, Input, BlobInputList, Table, TableHead, TableRow, CCell, TableBody, Cell,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

interface Props  extends InternalItemProps{
    label?: string;
    titleNames?: any[];
}
const guide机构同步缺省=[['机构','同小构'],['机构','不小构'],['机构','不小行'],['机构','他机构']];
//itemA同步性能存储名字'同小构','不小构','不小行','他机构实际上仅为代指：分别转义指向4个自定义名字的机构。实际全名输入在在[field]?.p的。
export const itemA同步性能=['同小构','不小构','不小行','他机构','同步性r','同步备注'];

export const Synchronization =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,titleNames=guide机构同步缺省}: Props, ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA同步性能,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                先请补全项目机构的[X]名称。<br/>
                { titleNames.map(([title,field,resFd], i:number) => {
                    //机构 的名称也需要录入啊： 增加存储字段 .p
                    return  <React.Fragment key={i}>
                        项目 {'>'} {inp?.[field]?.p??'／'}机构
                        <Input  value={inp?.[field]?.p ||''}
                           onChange={e => setInp({ ...inp, [field]:{...inp?.[field], p: e.currentTarget.value||undefined} }) } /> 机构：
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
                <Text css={{fontSize:'0.8rem'}}>
                    {children ? children :
                        <>
                            注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。
                            2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
                            3、在项目内填写有同步要求的机构名称，如“起升机构、回转机构”等，具体描述以设计文件规定为准。
                        </>
                    }
                </Text>
            </InspectRecordLayout>
        );
    } );

/**同步性能
 * 机构名字也是要 输入的：
 * */
export const SynchronizationVw= ({children, orc, rep,label } : { orc: any, rep: any,label:any, children?: any}
) => {
    // const theme = useTheme();
    return <>
        <div  css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
            { typeof label==='object' ?  <>{label}</>
                :
                <Text variant="h4" css={{marginTop: '1rem',
                }}>{label}</Text>
            }
        </div>
        <Table id='Synchronization' fixed={ ["5%","%","9%","23%","23%","12%","10.5%","9%"] }
               tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} } >
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
                    { guide机构同步缺省.map(([title,field], i:number) => {
                        return  <React.Fragment key={i}>
                                <TableRow>
                                    <CCell rowSpan={2} colSpan={2}>{orc?.[field]?.p? (orc?.[field]?.p+'机构'): title}</CCell>
                                    <CCell rowSpan={2}>{orc?.[field]?.u}</CCell>
                                    <CCell>{orc?.[field]?.fu}</CCell>
                                    <CCell>{orc?.[field]?.su}</CCell>
                                    <CCell rowSpan={2}>{orc?.[field]?.m}</CCell>
                                    <CCell rowSpan={2}>{orc?.[field]?.l}</CCell>
                                    {i===0 && <CCell split rowSpan={8}>{orc?.同步性r || '／'}</CCell>}
                                </TableRow>
                                <TableRow>
                                    <CCell>{orc?.[field]?.fd}</CCell>
                                    <CCell>{orc?.[field]?.sd}</CCell>
                                </TableRow>
                        </React.Fragment>;
                    }) }
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell colSpan={7}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.同步备注 || '／'}
                        </div></Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        <Text css={{fontSize:'0.8rem'}}>
            {children ? children :
                <>
                    注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。
                    2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
                    3、在项目内填写有同步要求的机构名称，如“起升机构、回转机构”等，具体描述以设计文件规定为准。
                </>
            }
        </Text>
    </>;
};
