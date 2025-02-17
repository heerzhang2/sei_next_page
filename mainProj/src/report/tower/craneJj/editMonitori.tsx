/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, InputLine, SuffixInput, TextArea, LineColumn, Input,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {objNestSet, tableSetInp} from "../../../common/tool";

interface Props  extends InternalItemProps{
    label?: string;
}
export const itemA起升高度 = ['起高表','起高表r','行程表','行程表r','幅度表','幅度表r','回转表','回转表r', '监风速','监控备注'];
export const MonitoringSys =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,}: Props, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA起升高度,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                <Text variant="h5" css={{fontSize:'1.3rem'}}>项目1: C4.2.2.5.1.1 起升高度（m）{'>>'}</Text>
                <div css={{display: 'flex', margin: 'auto'}}>
                    <div css={{display: 'inline-block', margin: 'auto'}}>
                        {['1次','2次','3次'].map((group, i: number) => {
                            return <React.Fragment key={i}>
                                <Text variant="h6">{group}:</Text>
                                显示屏数值H1
                                <Input value={inp?.起高表?.[i]?.H1 ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('起高表',i, inp,setInp,'H1',e.currentTarget.value||undefined)}/>
                                (m)，H2
                                <Input value={inp?.起高表?.[i]?.H2 ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('起高表',i, inp,setInp,'H2',e.currentTarget.value||undefined)}/>
                                (m)，测量值h1
                                <Input value={inp?.起高表?.[i]?.h1 ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('起高表',i, inp,setInp,'h1',e.currentTarget.value||undefined)}/>
                                (m)，h2
                                <Input value={inp?.起高表?.[i]?.h2 ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('起高表',i, inp,setInp,'h2',e.currentTarget.value||undefined)}/>
                                (m)，计算值H
                                <Input value={inp?.起高表?.[i]?.H ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('起高表',i, inp,setInp,'H',e.currentTarget.value||undefined)}/>
                                (m)，h
                                <Input value={inp?.起高表?.[i]?.h ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('起高表',i, inp,setInp,'h',e.currentTarget.value||undefined)}/>
                                (m)。
                            </React.Fragment>;
                        })}
                        <br/><Text variant="h5" css={{display:'inline-flex'}}>起升高度-检验结果：</Text>
                        <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                            <SelectHookfork value={(inp?.起高表r) || ''}
                                            onChange={e => setInp({...inp, 起高表r: e.currentTarget.value || undefined})}/>
                        </div>
                    </div>
                </div>
                <Text variant="h5" css={{fontSize:'1.3rem',marginTop:'1rem'}}>项目2: C4.2.2.5.1.2 运行行程（m）{'>>'}</Text>
                <div css={{display: 'flex', margin: 'auto'}}>
                    <div css={{display: 'inline-block', margin: 'auto'}}>
                        {['(1)小车','(2)大车'].map((group, i: number) => {
                            return <React.Fragment key={i}>
                                <Text variant="h6">{group}:</Text>
                                显示屏数值S1
                                <Input value={inp?.行程表?.[i]?.S1 ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('行程表',i, inp,setInp,'S1',e.currentTarget.value||undefined)}/>
                                (m)，S2
                                <Input value={inp?.行程表?.[i]?.S2 ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('行程表',i, inp,setInp,'S2',e.currentTarget.value||undefined)}/>
                                (m)，测量值s
                                <Input value={inp?.行程表?.[i]?.s ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('行程表',i, inp,setInp,'s',e.currentTarget.value||undefined)}/>
                                (m)，计算值S
                                <Input value={inp?.行程表?.[i]?.S ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('行程表',i, inp,setInp,'S',e.currentTarget.value||undefined)}/>
                                (m)。
                            </React.Fragment>;
                        })}
                        <br/><Text variant="h5" css={{display:'inline-flex'}}>运行行程-检验结果：</Text>
                        <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                            <SelectHookfork value={(inp?.行程表r) || ''}
                                            onChange={e => setInp({...inp, 行程表r: e.currentTarget.value || undefined})}/>
                        </div>
                    </div>
                </div>
                <Text variant="h5" css={{fontSize:'1.3rem',marginTop:'1rem'}}>项目3: C4.2.2.5.1.3 幅度（m）{'>>'}</Text>
                <div css={{display: 'flex', margin: 'auto'}}>
                    <div css={{display: 'inline-block', margin: 'auto'}}>
                        {['30%（R0.3）','60%（R0.6）','90%（R0.9）'].map((group, i: number) => {
                            return <React.Fragment key={i}>
                                <Text variant="h6">最大工作幅度 {group}:</Text>
                                显示屏数值
                                <Input value={inp?.幅度表?.[i]?.d ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('幅度表',i, inp,setInp,'d',e.currentTarget.value||undefined)}/>
                                (m)，测量值
                                <Input value={inp?.幅度表?.[i]?.m ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('幅度表',i, inp,setInp,'m',e.currentTarget.value||undefined)}/>
                                (m)，计算值
                                <Input value={inp?.幅度表?.[i]?.c ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('幅度表',i, inp,setInp,'c',e.currentTarget.value||undefined)}/>
                                (%)。
                            </React.Fragment>;
                        })}
                        <br/><Text variant="h5" css={{display:'inline-flex'}}>幅度-检验结果：</Text>
                        <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                            <SelectHookfork value={(inp?.幅度表r) || ''}
                                            onChange={e => setInp({...inp, 幅度表r: e.currentTarget.value || undefined})}/>
                        </div>
                    </div>
                </div>
                <Text variant="h5" css={{fontSize:'1.3rem',marginTop:'1rem'}}>项目4: C4.2.2.5.1.6 回转角度（°）{'>>'}</Text>
                <div css={{display: 'flex', margin: 'auto'}}>
                    <div css={{display: 'inline-block', margin: 'auto'}}>
                        {['1次'].map((group, i: number) => {
                            return <React.Fragment key={i}>
                                显示屏数值
                                <Input value={inp?.回转表?.[i]?.d ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('回转表',i, inp,setInp,'d',e.currentTarget.value||undefined)}/>
                                (°)，测量值
                                <Input value={inp?.回转表?.[i]?.m ||''} size={4} style={{display: 'inline-flex', width: 'unset'}}
                                       onChange={e =>tableSetInp('回转表',i, inp,setInp,'m',e.currentTarget.value||undefined)}/>
                                (°)。
                            </React.Fragment>;
                        })}
                        <br/><Text variant="h5" css={{display:'inline-flex'}}>回转角度-检验结果：</Text>
                        <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                            <SelectHookfork value={(inp?.回转表r) || ''}
                                            onChange={e => setInp({...inp, 回转表r: e.currentTarget.value || undefined})}/>
                        </div>
                    </div>
                </div>
                <Text variant="h5" css={{fontSize:'1.3rem',marginTop:'1rem'}}>项目5: C4.9.7.1 风速（m/s）； 1次 {'>>'}</Text>
                <LineColumn column={6}>
                    <InputLine label={`显示屏数值：`}>
                        <SuffixInput  value={inp?.监风速?.d ||''}
                                      onChange={e=>objNestSet('监风速','d',e.currentTarget.value||undefined, inp, setInp)}>m/s</SuffixInput>
                    </InputLine>
                    <InputLine label={`测量值：`}>
                        <SuffixInput  value={inp?.监风速?.m ||''}
                                      onChange={e=>objNestSet('监风速','m',e.currentTarget.value||undefined, inp, setInp)}>m/s</SuffixInput>
                    </InputLine>
                    <InputLine label='C4.9.7.1 风速-检验结果'>
                        <SelectHookfork value={ inp?.监风速?.r ||''}
                                        onChange={e =>objNestSet('监风速','r',e.currentTarget.value||undefined, inp, setInp) }/>
                    </InputLine>
                </LineColumn>
                备注：
                <TextArea  value={inp?.监控备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 监控备注: e.currentTarget.value||undefined}) } />
                { children }
                <Text>注：1、显示值和测量值不大于5%时，检验结果符合要求。
                    <Text css={{display: 'flex', marginLeft:'2rem'}}>2、未检查或无需检验的，仅填检验结果栏。<br/>
                        3、幅度的综合误差ER=｜Ra-Rb｜/Rb×100%（式中，Ra为系统测量值; Rb为试验幅度的实际数值。）</Text>
                </Text>
            </InspectRecordLayout>
        );
    } );

