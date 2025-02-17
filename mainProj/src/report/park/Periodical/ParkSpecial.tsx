/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea, InputLine, ColumnWidth, Input, Table, TableRow, CCell, TableBody, Cell, SuffixInput,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {objNestArrSetInp} from "../../../common/tool";

export const items停车专项=[['单车最大进(出)时间','进出时','s'],['平层精度','平层精','mm'] ];
export const itemA停车专项=['进出时','平层精', '停车专r','停专备注'];
/**机械式停车设备专项试验: 比监检的少了后面2大项目。
 * */
export const ParkSpecial=
    React.forwardRef(({ children, show ,alone=true,refWidth,label='附录7：C4.3.2.5机械式停车设备专项试验记录表'}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA停车专项,);      //实际存储还是嵌套的对象格式的。'进出时'：{l,,}；
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                {label}<br/>
                { items停车专项.map(([title,field,unit], i:number) => {
                    return  <React.Fragment key={i}>
                        第{i+1}个项目 {'>'} {title}:
                        <ColumnWidth clnWidth={320} key={i}>
                            <InputLine  label='偏差允计值：'>
                                <Input  value={inp?.[field]?.l ||'±'}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], l: e.currentTarget.value||undefined} }) } />
                            </InputLine>
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <ColumnWidth clnWidth={160} key={w+'_'+i}>
                                    <InputLine label={`次数${w+1}，测量值：`}>
                                        <SuffixInput  value={inp?.[field]?.o?.[w] ||''} onSave={txt=>objNestArrSetInp(field,'o',w,txt,inp,setInp)}>{unit}</SuffixInput>
                                    </InputLine>
                                    <InputLine label={`次数${w+1}，结果值：`}>
                                        <SuffixInput  value={inp?.[field]?.v?.[w] ||''} onSave={txt=>objNestArrSetInp(field,'v',w,txt,inp,setInp)}>{unit}</SuffixInput>
                                    </InputLine>
                                    <InputLine label={`次数${w+1}，偏差值：`}>
                                        <Input  value={inp?.[field]?.m?.[w] ||''}
                                                onChange={e => objNestArrSetInp(field,'m',w, e.currentTarget.value||undefined, inp,setInp)} />
                                    </InputLine>
                                </ColumnWidth>;
                            }) }
                        </ColumnWidth>
                    </React.Fragment>;
                }) }
                <InputLine label='C4.3.2.5机械式停车设备专项试验-检验结果'>
                    <SelectHookfork value={ inp?.停车专r ||''}
                                    onChange={e => setInp({ ...inp, 停车专r: e.currentTarget.value||undefined}) }/>
                </InputLine>
                备注：
                <TextArea  value={inp?.停专备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 停专备注: e.currentTarget.value||undefined}) } />
                <Text>注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
                    2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
                </Text>
            </InspectRecordLayout>
        );
    } );

/**格式化记录或报告用：停车专项试验
 * */
export const ParkSpecialVw= ({children, orc, rep,label='附录7：C4.3.2.5机械式停车设备专项试验记录表' } : { orc: any, rep: any,label?:any, children?: any}
) => {
    let arrobj回: any[]=[];
    for(let e=0;e<3;e++){
        arrobj回.push({d: orc?.回速o?.[e], t:orc?.回速v?.[e]});
    }
    //const avspeed5=calcAverageArrObj(orc.吊回速,(row)=>{return row?.d/row?.t},2);上一代(orc.吊回速??[{}])?.map((o: any, i:number) => {}
    return <>
        <div  css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
            <Text id='ParkSpecial' variant="h4" css={{marginTop: '1rem',}}>{label}</Text>
        </div>
        <Table fixed={ ["7%","%","6%","17%","12%","13%","13%","9%"] }
               tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} } >
            <TableBody>
                <TableRow>
                    <CCell colSpan={2}>项目</CCell>
                    <CCell>单位</CCell>
                    <CCell>测量值</CCell>
                    <CCell>结果值</CCell>
                    <CCell>偏差值</CCell>
                    <CCell>偏差允计值</CCell>
                    <CCell>检验结果</CCell>
                </TableRow>
                <RepLink ori rep={rep} tag='ParkSpecial'>
                    { items停车专项.map(([title,field,unit], i:number) => {
                        let arrobj: any[]=[];
                        for(let e=0;e<3;e++){
                            arrobj.push({d: orc?.[field+'o']?.[e], t:orc?.[field+'v']?.[e]});
                        }
                        return  <React.Fragment key={i}>
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                // const itspd=orc?.[field+'o']?.[w]/orc?.[field+'v']?.[w];
                                return  <TableRow key={w}>
                                    {w===0 && <CCell rowSpan={3} colSpan={2}>{title}</CCell>}
                                    {w===0 && <CCell rowSpan={3}>{unit}</CCell>}
                                    <CCell>{orc?.[field]?.o?.[w]}</CCell>
                                    <CCell>{orc?.[field]?.v?.[w]}</CCell>
                                    <CCell>{orc?.[field]?.m?.[w]}</CCell>
                                    {w===0 && <CCell rowSpan={3}>{orc?.[field]?.l}</CCell>}
                                    {0===i && w===0 && <CCell split rowSpan={12}>{orc?.停车专r}</CCell>}
                                </TableRow>;
                            }) }
                        </React.Fragment>;
                    }) }
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell colSpan={7}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.停专备注 || '／'}
                        </div></Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
        2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
    </>;
};
