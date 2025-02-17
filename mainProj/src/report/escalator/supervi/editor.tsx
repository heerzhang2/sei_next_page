/** @jsxImportSource @emotion/react */
import * as React from "react";
import {BlobInputList, Input, InputLine, LineColumn, SuffixInput, Text,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {floatInterception, objNestSet,} from "../../../common/tool";
import {useOmnipotentPrefTitle} from "../../hook/useOmnipotentPref";

interface Props  extends InternalItemProps{
    label: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
    config?: any[];
}
export const itemA扶速差=['扶行距上','左错距上','右错距上','扶行距下','左错距下','右错距下','扶速差r','仪左错上','仪右错上','仪左错下','仪右错下','仪扶差r'];
export const HandrailBias=
    React.forwardRef(({ children, show ,alone=true,refWidth,label}:InternalItemProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null, itemA扶速差, );
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            <Text variant="h5">{label}</Text>
            <Text variant="h6">方法一：</Text>
            <Text variant="h5">上行&gt;&gt;</Text>
            <LineColumn>
                <InputLine label='实际运行距离S(mm)'>
                    <SuffixInput value={inp?.扶行距上 ?? ''}
                                 onSave={txt => setInp({...inp, 扶行距上: txt || undefined})}>mm</SuffixInput>
                </InputLine>
                <InputLine label='左侧扶手带与梯级（踏板、胶带）错位距离Sl(mm)'>
                    <SuffixInput value={inp?.左错距上 ?? ''}
                                 onSave={txt => setInp({...inp, 左错距上: txt || undefined})}>mm</SuffixInput>
                </InputLine>
                <InputLine label='右侧扶手带与梯级（踏板、胶带）错位距离Sr(mm)'>
                    <SuffixInput value={inp?.右错距上 ?? ''}
                                 onSave={txt => setInp({...inp, 右错距上: txt || undefined})}>mm</SuffixInput>
                </InputLine>
            </LineColumn>
            <div css={{textAlign: 'center'}}>
                左侧扶手带空载运行速度与梯级速度偏差δl （δl =100Sl /S）
                计算结果：{floatInterception(100 * inp?.左错距上 / inp?.扶行距上, 2)} %;<br/>
                右侧扶手带空载运行速度与梯级速度偏差δr （δr =100Sr /S）
                计算结果：{floatInterception(100 * inp?.右错距上 / inp?.扶行距上, 2)} %;
            </div>
            <Text variant="h5">下行&lt;&lt;</Text>
            <LineColumn>
                <InputLine label='实际运行距离S(mm)'>
                    <SuffixInput value={inp?.扶行距下 ?? ''}
                                 onSave={txt => setInp({...inp, 扶行距下: txt || undefined})}>mm</SuffixInput>
                </InputLine>
                <InputLine label='左侧扶手带与梯级（踏板、胶带）错位距离Sl(mm)'>
                    <SuffixInput value={inp?.左错距下 ?? ''}
                                 onSave={txt => setInp({...inp, 左错距下: txt || undefined})}>mm</SuffixInput>
                </InputLine>
                <InputLine label='右侧扶手带与梯级（踏板、胶带）错位距离Sr(mm)'>
                    <SuffixInput value={inp?.右错距下 ?? ''}
                                 onSave={txt => setInp({...inp, 右错距下: txt || undefined})}>mm</SuffixInput>
                </InputLine>
            </LineColumn>
            <div css={{textAlign: 'center'}}>
                左侧扶手带空载运行速度与梯级速度偏差δl （δl =100Sl /S）
                计算结果：{floatInterception(100 * inp?.左错距下 / inp?.扶行距下, 2)} %;<br/>
                右侧扶手带空载运行速度与梯级速度偏差δr （δr =100Sr /S）
                计算结果：{floatInterception(100 * inp?.右错距下 / inp?.扶行距下, 2)} %;
            </div>
            <Text variant="h6" css={{textAlign: 'center'}}>判断标准 允许偏差为0-+2%</Text>
            <InputLine label={'结果判定'}>
                <SelectHookfork value={inp?.扶速差r ?? ''} onChange={e =>
                                            setInp({...inp, 扶速差r: e.currentTarget.value || undefined})}/>
            </InputLine>
            <Text css={{fontSize: '0.8rem'}}>
                备注：1.方法一与方法二只需选取一种；2.错位距离Sl 、Sr的判定，当扶手带超前于梯级（踏板、胶带）时为正值，反之为负值。
            </Text>
            <hr/>
            <Text variant="h6" css={{marginTop: '1rem',}}>方法二：</Text>
            <Text variant="h5">上行&gt;&gt;</Text>
            <LineColumn>
                <InputLine label='左侧扶手带速度偏差δl；δl=Sl/S'>
                    <SuffixInput value={inp?.仪左错上 ?? ''}
                                 onSave={txt => setInp({...inp, 仪左错上: txt || undefined})}>%</SuffixInput>
                </InputLine>
                <InputLine label='右侧扶手带速度偏差δr；δr=Sr/S'>
                    <SuffixInput value={inp?.仪右错上 ?? ''}
                                 onSave={txt => setInp({...inp, 仪右错上: txt || undefined})}>%</SuffixInput>
                </InputLine>
            </LineColumn>
            <Text variant="h5">下行&lt;&lt;</Text>
            <LineColumn>
                <InputLine label='左侧扶手带速度偏差δl；δl=Sl/S'>
                    <SuffixInput value={inp?.仪左错下 ?? ''}
                                 onSave={txt => setInp({...inp, 仪左错下: txt || undefined})}>%</SuffixInput>
                </InputLine>
                <InputLine label='右侧扶手带速度偏差δr；δr=Sr/S'>
                    <SuffixInput value={inp?.仪右错下 ?? ''}
                                 onSave={txt => setInp({...inp, 仪右错下: txt || undefined})}>%</SuffixInput>
                </InputLine>
            </LineColumn>
            <Text variant="h6" css={{textAlign: 'center'}}>判断标准 允许偏差为0-+2%</Text>
            <InputLine label={'结果判定'}>
                <SelectHookfork value={inp?.仪扶差r ?? ''} onChange={e =>
                    setInp({...inp, 仪扶差r: e.currentTarget.value || undefined})}/>
            </InputLine>
        </InspectRecordLayout>
    );
});

export const item监控设施 = [
    ['视频监', [{t:'视频监控设施',s: 1},{t:'( 1 )',}], '公众聚集场所的电梯和住宅小区的电梯，应当配备符合有关规定和标准的视频监控设施。', undefined],
    ['远程监', [{t:'远程监测装置',s: 1},{t:'( 1 )',s: 1},], '新安装的乘客电梯应当配备能够实现远程监测功能的装置，并提供标准数据接口。', ],
];

export const itemA监控设施: string[] = [ ];
item监控设施.forEach(([name, title, initIsp], i: number) => {
    itemA监控设施.push(name as string);
});

export const MonitoringFacili =
    React.forwardRef((
        {children, show, alone = true, refWidth, label, }: Props, ref
) => {
    const {inp, setInp} = useItemInputControl({ref});
    const [getInpFilter] = useMeasureInpFilter(null, itemA监控设施,);
    const titNode=useOmnipotentPrefTitle({config:item监控设施});
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label}>
            <Text variant="h5">{label}：</Text>
            {item监控设施.map(([name, _1, _2, unit]: any, i: number) => {
                return (<React.Fragment key={i}>
                    <div css={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                        {titNode[i]}
                        &nbsp;
                        <div>
                            检查结果
                            <SelectHookfork value={(inp?.[name]?.r) ?? ''} style={{display: 'inline-flex', width: '8rem'}}
                                            onChange={e =>
                                                objNestSet(name, 'r', e.currentTarget.value || undefined, inp, setInp)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center'}}>
                            &nbsp;存在问题描述
                            <BlobInputList value={inp?.[name]?.m ?? ''} datalist={['见结果栏']}
                                           style={{display: 'inline-flex', width: '19rem'}} rows={2}
                                           onListChange={v => objNestSet(name, 'm', v || undefined, inp, setInp)}/>
                        </div>
                        <div>确认时间
                            <Input value={(inp?.[name]?.d) ?? ''}  type='date' size={4}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => objNestSet(name, 'd', e.currentTarget.value || undefined, inp, setInp)}/>
                        </div>
                    </div>
                </React.Fragment>);
            })}
            {children}
        </InspectRecordLayout>
    );
});


/*日期可兼容文本输入：
    <MemoDateInput value={inp?.[name]?.d || ''} onChange={v => objNestSet(name,'d', v||undefined,inp,setInp) } />
* */
