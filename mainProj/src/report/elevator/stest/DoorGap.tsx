/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, InputLine, Input, Table, TableHead, TableRow, CCell, TableBody, LineColumn,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, RepLink, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {useTableEditor} from "../../hook/useRepTableEditor";
import {tableSetInp} from "../../../common/tool";
import {Each_ZdSetting} from "@/report/hook/use-table-editor";


const config间隙表=[['层站','n',66],['门扇间间隙','j',60],['扇与门套间隙','t',60,],['门扇地坎间隙','s',60],['扇施力间隙','p',60],
                               ['门锁啮合深','l',60], ['门刀地坎间距','i',60], ['滚轮地坎间距','g',60]] as Each_ZdSetting[];
export const itemA间隙=['轿门表','间隙表','扇间隙','扇套隙','扇坎隙','门扇隙r','施力隙','施力隙r','锁啮深','锁啮深r',
                             '刀地间','轮地间','门地间r'];
export const DoorGap=
    React.forwardRef(({ children, show ,alone=true,refWidth,label}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null, itemA间隙,);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
            参照上面样表的第6行的标注的各列的简化后的列名来进行录入,结果2行拆出单独录入。单位：mm
        </Text>;
        const [render间隙表]=useTableEditor({inp, setInp,  headview,
            config: config间隙表, table:'间隙表', column:8});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">
                    {label} 单位：mm
                </Text>
                样表格式如下：
                <Table fixed={["5%", "3%", "1%", "8%", "9%", "9%", "22%", "15%", "%", "14%"]} tight miniw={800}
                       css={{borderCollapse: 'collapse'}}>
                    <TableBody>
                        <TableRow>
                            <CCell colSpan={3}>项目编号</CCell><CCell
                            colSpan={3}>A1.2.7.1（1）</CCell><CCell>A1.2.7.1（2）</CCell><CCell>A1.2.7.7（2）</CCell><CCell
                            colSpan={2}>A1.2.7.8</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell
                                colSpan={3}>检验内容</CCell><CCell>门扇间间隙</CCell><CCell>门扇与门套间隙</CCell><CCell>门扇与地坎间隙</CCell>
                            <CCell>层门扇间施力间隙</CCell><CCell>层门/轿门锁紧元件啮合深度</CCell><CCell>轿门门刀与层门地坎间距</CCell><CCell>门锁滚轮与轿门地坎间距</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell rowSpan={2} colSpan={3}>判断标准</CCell><CCell rowSpan={2} colSpan={3}>客梯：x≤6<br/>货梯：x≤10</CCell>
                            <CCell>旁开门： x≤30</CCell><CCell rowSpan={2}>x≥7</CCell><CCell rowSpan={2}
                                                                                            colSpan={2}>x≥5</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell>中分门总 和： x≤45</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell colSpan={3}>轿门</CCell><CCell colSpan={7}></CCell>
                        </TableRow>
                        <TableRow>
                            <CCell
                                colSpan={3}>层站</CCell><CCell>门扇间间隙</CCell><CCell>扇与门套间隙</CCell><CCell>门扇地坎间隙</CCell><CCell>扇施力间隙</CCell>
                            <CCell>门锁啮合深</CCell><CCell>门刀地坎间距</CCell><CCell>滚轮地坎间距</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell
                                colSpan={3}>测量结果</CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell>
                        </TableRow>
                    </TableBody>
                </Table>
                {(new Array(3)).fill(null).map((_, w: number) => {
                    return <React.Fragment key={w}>
                        轿门 {w + 1} ：
                        <div css={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly'}}>
                            <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                门扇间间隙
                                <Input value={inp?.轿门表?.[w]?.j ?? ''} size={2}
                                       style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e => tableSetInp('轿门表', w, inp, setInp, 'j', e.currentTarget.value || undefined)}/>mm
                            </div>
                            <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                门扇与门套间隙
                                <Input value={inp?.轿门表?.[w]?.t ?? ''} size={2}
                                       style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e => tableSetInp('轿门表', w, inp, setInp, 't', e.currentTarget.value || undefined)}/>mm
                            </div>
                            <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                门扇与地坎间隙
                                <Input value={inp?.轿门表?.[w]?.s ?? ''} size={2}
                                       style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e => tableSetInp('轿门表', w, inp, setInp, 's', e.currentTarget.value || undefined)}/>mm
                            </div>
                            <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                层门/轿门锁紧元件啮合深度
                                <Input value={inp?.轿门表?.[w]?.l ?? ''} size={2}
                                       style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e => tableSetInp('轿门表', w, inp, setInp, 'l', e.currentTarget.value || undefined)}/>mm
                            </div>
                        </div>
                    </React.Fragment>;
                })}
                <hr/>
                {render间隙表}
                <hr/>
                上表最后两行结果行的录入拆出来：
                <LineColumn column={6}>
                    <InputLine label={`A1.2.7.1（1）,层门门扇间间隙-测量结果`}>
                        <Input value={inp?.['扇间隙'] || ''}
                               onChange={e => setInp({...inp, 扇间隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.1（1）,层门门扇与门套间隙-测量结果`}>
                        <Input value={inp?.['扇套隙'] || ''}
                               onChange={e => setInp({...inp, 扇套隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.1（1）,层门扇与地坎间隙-测量结果`}>
                        <Input value={inp?.['扇坎隙'] || ''}
                               onChange={e => setInp({...inp, 扇坎隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.1（1）-检验结果`}>
                        <SelectHookfork value={inp?.门扇隙r || ''}
                                        onChange={e => setInp({...inp, 门扇隙r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.1（2）扇施力间隙-测量结果`}>
                        <Input value={inp?.['施力隙'] || ''}
                               onChange={e => setInp({...inp, 施力隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.1（2）扇施力间隙-检验结果`}>
                        <SelectHookfork value={inp?.施力隙r || ''}
                                        onChange={e => setInp({...inp, 施力隙r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.7（2）轿门锁啮合深度-测量结果`}>
                        <Input value={inp?.锁啮深 || ''}
                               onChange={e => setInp({...inp, 锁啮深: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.7（2）轿门锁啮合深度-检验结果`}>
                        <SelectHookfork value={inp?.锁啮深r || ''}
                                        onChange={e => setInp({...inp, 锁啮深r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.8轿门门刀与层门地坎间距-测量结果`}>
                        <Input value={inp?.['刀地间'] || ''}
                               onChange={e => setInp({...inp, 刀地间: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.8门锁滚轮与轿门地坎间距-测量结果`}>
                        <Input value={inp?.['轮地间'] || ''}
                               onChange={e => setInp({...inp, 轮地间: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`A1.2.7.8-检验结果`}>
                        <SelectHookfork value={inp?.门地间r || ''}
                                        onChange={e => setInp({...inp, 门地间r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                <Text css={{fontSize: '0.8rem'}}>
                    注：<br/>
                    1、A1.2.7.1项、A1.2.7.8项，可以抽取基站、端站以及至少20%其他层站的层门进行检测；
                    2、A1.2.7.7.(2)项只有在认为啮合深度可能不足时，才需测量相关数据；未测量时，观测数据和测量结果可不填。
                    检测结果应填，对不适用项填“/”；
                    3、所检测的站需填写在相应栏中，观测数据符合要求的，在测量结果栏填所测量的数值区间范围（min-max），
                    并在相应项目检测结果内打“√”；观测数据有不符合要求的，需在相应的站填写不合格的观测数据，并在相应项目
                    检测结果中打“×”；
                </Text>
            </InspectRecordLayout>
        );
    } );

/**可打印的
 * */
export const DoorGapVw= ({children, orc, rep,label } : { orc: any, rep: any,label:any, children?: any}
) => {
    const gcRows=(orc?.轿门表?.length??1) + (orc?.间隙表?.length??1);
    return <>
        <div css={{"@media print": {paddingBottom: '5.5rem', pageBreakInside: 'avoid'}}}>
            <Text variant="h5" css={{marginTop: '1rem',
            }}>{label}</Text>
            <div css={{textAlign: 'right'}}>单位：mm</div>
        </div>
        <Table id='Gap' fixed={ ["2.8%", "5%", "3%","11%","11%","11%","16%","14%","%","13%"]  }
                  tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-5.5rem'}} } >
          <TableHead>
              <TableRow>
                  <CCell colSpan={3}>项目编号</CCell><CCell colSpan={3}>A1.2.7.1（1）</CCell><CCell>A1.2.7.1（2）</CCell><CCell>A1.2.7.7（2）</CCell><CCell colSpan={2}>A1.2.7.8</CCell>
              </TableRow>
              <TableRow>
                  <CCell colSpan={3}>检验内容</CCell><CCell>门扇间间隙</CCell><CCell>门扇与门套间隙</CCell><CCell>门扇与地坎间隙</CCell>
                  <CCell>层门扇间施力间隙</CCell><CCell>层门/轿门锁紧元件啮合深度</CCell><CCell>轿门门刀与层门地坎间距</CCell><CCell>门锁滚轮与轿门地坎间距</CCell>
              </TableRow>
          </TableHead>
         <TableBody>
           <RepLink ori rep={rep} tag={'Gap'}>
            <TableRow>
                <CCell rowSpan={2} colSpan={3}>判断标准</CCell><CCell rowSpan={2} colSpan={3}>客梯：x≤6<br/>货梯：x≤10</CCell>
                <CCell>旁开门： x≤30</CCell><CCell rowSpan={2}>x≥7</CCell><CCell rowSpan={2} colSpan={2}>x≥5</CCell>
            </TableRow>
            <TableRow>
                <CCell>中分门总 和： x≤45</CCell>
            </TableRow>
            { (orc?.轿门表??[{}]).map((o: any, i: number) => {
              return <TableRow key={i}>
                         {0===i && <CCell  split  rowSpan={gcRows}>观测数据</CCell>}
                         <CCell colSpan={2}>轿门{i+1}</CCell>
                         <CCell>{o?.j??'／'}</CCell>
                         <CCell>{o?.t??'／'}</CCell>
                         <CCell>{o?.s??'／'}</CCell>
                         <CCell>／</CCell>
                         <CCell>{o?.l??'／'}</CCell>
                         <CCell colSpan={2}>／</CCell>
                     </TableRow>
            })}
            { (orc?.间隙表??[{}]).map((o: any, i: number) => {
                 return <TableRow key={i}>
                     <CCell>{o?.n??'／'}</CCell>
                     <CCell><Text css={{fontSize: '0.7rem'}}>站</Text></CCell>
                     <CCell>{o?.j??'／'}</CCell>
                     <CCell>{o?.t??'／'}</CCell>
                     <CCell>{o?.s??'／'}</CCell>
                     <CCell>{o?.p??'／'}</CCell>
                     <CCell>{o?.l??'／'}</CCell>
                     <CCell>{o?.i??'／'}</CCell>
                     <CCell>{o?.g??'／'}</CCell>
                 </TableRow>
            })}
            <TableRow>
                <CCell colSpan={3}>测量结果</CCell><CCell>{orc?.扇间隙??'／'}</CCell><CCell>{orc?.扇套隙??'／'}</CCell><CCell>{orc?.扇坎隙??'／'}</CCell>
                <CCell>{orc?.施力隙??'／'}</CCell><CCell>{orc?.锁啮深??'／'}</CCell><CCell>{orc?.刀地间??'／'}</CCell><CCell>{orc?.轮地间??'／'}</CCell>
            </TableRow>
             <TableRow>
                 <CCell colSpan={3}>检测结果</CCell><CCell colSpan={3}>{orc?.门扇隙r??'／'}</CCell><CCell>{orc?.施力隙r??'／'}</CCell>
                 <CCell>{orc?.锁啮深r??'／'}</CCell><CCell colSpan={2}>{orc?.门地间r??'／'}</CCell>
             </TableRow>
          </RepLink>
         </TableBody>
        </Table>
        <Text css={{fontSize:'0.8rem'}}>
            {children ? children :
                <>
                    注：<br/>
                    1、A1.2.7.1项、A1.2.7.8项，可以抽取基站、端站以及至少20%其他层站的层门进行检测；
                    2、A1.2.7.7.(2)项只有在认为啮合深度可能不足时，才需测量相关数据；未测量时，观测数据和测量结果可不填。
                    检测结果应填，对不适用项填“/”；
                    3、所检测的站需填写在相应栏中，观测数据符合要求的，在测量结果栏填所测量的数值区间范围（min-max），
                    并在相应项目检测结果内打“√”；观测数据有不符合要求的，需在相应的站填写不合格的观测数据，并在相应项目
                    检测结果中打“×”；
                </>
            }
        </Text>
    </>;
};
