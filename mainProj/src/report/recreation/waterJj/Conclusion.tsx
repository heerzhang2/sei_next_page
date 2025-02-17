/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Input, InputLine, Select, Text, } from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, SelectInput, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {css} from "@emotion/react";

interface ConclusionProps  extends InternalItemProps{
    startd?: boolean;
    nxtstyp?: string;
    rslist?: string[];
}
const 结论选 = ['合格','不合格','整改后合格'];
export const itemA结论 = ['检验结论', '新下检日','检验日期','检验日期1' ];
//下结论页面：
export const ConclusionWaterJj =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,startd=false,nxtstyp='检验',rslist=结论选}: ConclusionProps, ref
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
                    <SelectInput value={inp?.检验结论 || ''}  list={rslist}
                                nMinW  divStyle={css``}  css={{fontSize: '1rem'}}
                                onChange={e => setInp({...inp, 检验结论: e.currentTarget.value || undefined})}/>
                </InputLine>
                <InputLine label={`设置${nxtstyp}日期`}>
                    <Input value={inp?.检验日期 || ''} type='date'
                           onChange={e => setInp({...inp, 检验日期: e.currentTarget.value})}/>
                </InputLine>
                { startd &&
                    <InputLine  label='检验起始日期' >
                        <Input  value={inp?.检验日期1 ||''}  type='date'
                                onChange={e => setInp({ ...inp, 检验日期1: e.currentTarget.value}) } />
                    </InputLine>
                }
                <InputLine label={`下次检验日期`}>
                    <Input value={inp?.新下检日 || ''} type='date'
                           onChange={e => setInp({...inp, 新下检日: e.currentTarget.value})}/>
                </InputLine>
            </InspectRecordLayout>
        );
});
