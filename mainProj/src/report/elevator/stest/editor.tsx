import * as React from "react";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

interface ConclusionTestProps extends InternalItemProps{
    //需要加上 检验日期1 的编辑？
    startd?: boolean;
    nxtstyp?: string;
}
export const itemA结论 = ['检验结论', '新下检日','检测日期','检测日期1'];
//下结论页面：
export const ConclusionTest =
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
                <InputLine label='检验结论'>
                    <Select inputSize="md" css={{minWidth: '140px', fontSize: '1.3rem', padding: '0 1rem'}}
                            value={inp?.检验结论 || ''}
                            onChange={e => setInp({...inp, 检验结论: e.currentTarget.value || undefined})}
                    >
                        <option></option>
                        <option>合格</option>
                        <option>不合格</option>
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
