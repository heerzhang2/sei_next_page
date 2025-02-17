/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, InputLine, SuffixInput, TextArea, LineColumn,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {measurementRender} from "../../common/measure";
import {calcAverageArrObj} from "../../../common/tool";

interface ThicknessProps  extends InternalItemProps{
    nomm?: boolean;
}
export const item受力结构=['力面厚1','力面厚2','力面厚3',];
export const itemA受力结构=['力面厚设','力面厚v','力面厚r','力面备注',];
export const Thickness =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,nomm}: ThicknessProps, ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item受力结构, itemA受力结构, );        //hook死循环：改成外部定义callbackFilt  输入变量defaultV可变的。
        const {inp, setInp} = useItemInputControl({ ref });
        const aveThick=calcAverageArrObj([inp?.力面厚1o,inp?.力面厚2o,inp?.力面厚3o],(row)=>row,2);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                <Text variant="h5">{label}</Text>
                序号1，主要受力结构件断面有效厚度，设计值（    ）mm：
                <LineColumn column={2} >
                    <InputLine  label='受力结构件断面有效厚度，设计值：' >
                        <SuffixInput  value={inp?.力面厚设 ||''} onSave={txt=> setInp({...inp,力面厚设: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    { measurementRender(`该有效厚度观测值-1次`,'力面厚1','mm',inp,setInp,true) }
                    { measurementRender('该有效厚度观测值-2次','力面厚2','mm',inp,setInp,true) }
                    { measurementRender('该有效厚度观测值-3次','力面厚3','mm',inp,setInp,true) }
                    <InputLine  label='主要受力结构件断面有效厚度平均值：'>
                        <Text>{aveThick} mm</Text>
                    </InputLine>
                    <InputLine  label='主要受力结构件断面有效厚度-结果值：' >
                        <SuffixInput  value={inp?.力面厚v ||''} onSave={txt=> setInp({...inp,力面厚v: txt || undefined })}>mm</SuffixInput>
                    </InputLine>
                    <InputLine label={`C3.7.3 检验结果`}>
                        <SelectHookfork value={ inp?.力面厚r ||''}
                                        onChange={e => setInp({ ...inp, 力面厚r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                {!nomm && <>
                    备注：
                    <TextArea  value={inp?.力面备注 ||''} rows={3}
                               onChange={e => setInp({ ...inp, 力面备注: e.currentTarget.value||undefined}) } />
                </>
                }
                { children }
                注：1、对于不合格的值才需测量和记录，仅记录有效厚度与设计值之比最小值之处的测量值。
                2、未测量或无需测量的，仅填检验结果栏。
            </InspectRecordLayout>
        );
} );
