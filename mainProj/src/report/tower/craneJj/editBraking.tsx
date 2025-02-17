/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea, LineColumn, InputLine, SuffixInput,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {arraySetInp, calcAverageArrObj, } from "../../../common/tool";

interface Props  extends InternalItemProps{
    label?: string;
    titles?: any[];
    noAux?: boolean;        //没有 副起升机构 的录入
}

const item制动距离o=['主制距','副制距'];
// export const item制动距离=[] as string[];
export const itemA制动距离=['制距备注'];
item制动距离o.forEach((name, i:number)=>{
    itemA制动距离.push(name);       //item制动距离.push(name);
    itemA制动距离.push(name+'r');
});
export const defaultTl制动距离=['主起升机构','副起升机构'];

//内容篇幅太长，可能不好定位，还是改成紧凑型的布局。但是存储还是用分立的['起速','下速','横速','纵速','回速'].map()没用嵌套表;
export const Braking =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,titles=defaultTl制动距离,noAux}: Props, ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA制动距离,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                { item制动距离o.map(( field, i:number) => {
                    if(noAux && i>0) return null;
                    return<React.Fragment key={i}>项目{i+1} {'>'} {titles[i]}：
                        <LineColumn>
                            { (new Array(3)).fill(null).map(( _,  w:number) => {
                                return <InputLine key={w} label={`次数${w+1}，制动距离：`}>
                                    <SuffixInput  value={inp?.[field]?.[w] ||''} onSave={txt=>arraySetInp(field,w,txt,inp,setInp)}>mm</SuffixInput>
                                </InputLine>;
                            }) }
                            <InputLine  label='平均制动距离：'>
                                <Text>{calcAverageArrObj(inp?.[field],a=>a,2,3)}mm</Text>
                            </InputLine>
                            <InputLine label={titles[i]+' > 制动距离-检验结果'}>
                                <SelectHookfork value={ inp?.[field+'r'] ||''}
                                                onChange={e => setInp({ ...inp, [field+'r']: e.currentTarget.value||undefined}) }/>
                            </InputLine>
                        </LineColumn>
                    </React.Fragment>;
                }) }
                备注：
                <TextArea  value={inp?.制距备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 制距备注: e.currentTarget.value||undefined}) } />

                <Text css={{fontSize:'0.8rem'}}>
                    { children?  children
                        :
                        <>
                            注：1、对于标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件对制动
                            距离都没有规定的，相应的制动距离可不测量。
                            2、对于多起升机构的起重机，仅记录其中1个主起升机构和1个副起升机构制动距离。对于其余起升机构制动距离，记录在
                            备注栏。
                            3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                            4、未检查或无需检验的，仅填检验结果栏。
                        </>
                    }
                </Text>
            </InspectRecordLayout>
        );
    } );
