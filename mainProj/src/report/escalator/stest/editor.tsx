/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Input, InputLine, Select, Text, } from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

interface ConclusionTestProps  extends InternalItemProps{
    //需要加上 检验日期1 的编辑？
    startd?: boolean;
    nxtstyp?: string;
}
export const itemA结论 = ['检验结论', '新下检日','检测日期','检测日期1'];
//下结论页面：
export const ConclusionEscaTest =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,startd=false,nxtstyp='定期检验'}: ConclusionTestProps, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA结论,);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">
                    {label} (报告下结论)：
                </Text>
                <InputLine label='检测结论'>
                    <Select inputSize="md" css={{minWidth: '140px', fontSize: '1.3rem', padding: '0 1rem'}}
                            value={inp?.检验结论 || ''}
                            onChange={e => setInp({...inp, 检验结论: e.currentTarget.value || undefined})}
                    >
                        <option></option>
                        <option>所检测项目均符合《电梯自行检测规则》(TSG T7008-2023)的相应要求</option>
                        <option>该电梯存在不符合</option>
                    </Select>
                </InputLine>
                <InputLine label='设置检测日期'>
                    <Input value={inp?.检测日期 || ''} type='date'
                           onChange={e => setInp({...inp, 检测日期: e.currentTarget.value})}/>
                </InputLine>
                <InputLine label={`下次检测日期`}>
                    <Input value={inp?.新下检日 || ''} type='date'
                           onChange={e => setInp({...inp, 新下检日: e.currentTarget.value})}/>
                </InputLine>
            </InspectRecordLayout>
        );
    });
