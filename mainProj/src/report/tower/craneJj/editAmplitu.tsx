/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea, Input,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {arraySetInp, calcAverageArrObj, floatInterception, } from "../../../common/tool";

interface Props  extends InternalItemProps{
    label?: string;
}

export const defaultTl额最幅度=['起升机构起升速度1','起升机构起升速度2','起升机构起升速度3','起升机构下降速度1','起升机构下降速度2','起升机构下降速度3',
    '大车运行速度','动臂变幅速度','小车变幅速度1','小车变幅速度2','回转速度'];
//储存字段名的前缀和上面的标题要一一配对的！  最后一行特殊处理的'回速'
//因（复制）的，第二张的幅度表的： 存储必须改新的字段名。 【另外】'回速'还要特别对待！改成“幅回”
export const item额最幅度o=['幅起1','幅起2','幅起3','幅下1','幅下2','幅下3','幅大','幅变','幅小1','幅小2','幅回'];

export const item额最幅度=[] as string[];
export const itemA额最幅度=['幅度备注'];
item额最幅度o.forEach((name, i:number)=>{
    item额最幅度.push(name);         //name+'1',name+'2',name+'3'
    itemA额最幅度.push(name+'r');
});

//内容篇幅太长，可能不好定位，还是改成紧凑型的布局。但是存储还是用分立的['起速','下速','横速','纵速','回速'].map()没用嵌套表;
export const WeightAmplitude =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,}: Props, ref
    ) => {
        const titles=defaultTl额最幅度;
        const [getInpFilter]=useMeasureInpFilter(item额最幅度,itemA额最幅度,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                { item额最幅度o.map((field, i:number) => {
                    let arrobj=[];
                    for(let e=0;e<3;e++){
                        arrobj.push({d: inp?.[field+'o']?.[e], t:inp?.[field+'v']?.[e]});
                    }
                    const isQ=i === item额最幅度o.length-1;   //最后一行特殊的！
                    return (<React.Fragment key={i}>
                            <div css={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                                <Text variant="h5" css={{fontSize:'1.1rem'}}>项目{i + 1} {titles[i]} {'>>'}</Text>
                                { (new Array(3)).fill(null).map(( _,  w:number) => {
                                    return <React.Fragment key={w}>
                                        &nbsp;&nbsp; <Text variant="h5" css={{fontSize:'1rem'}}>{`次数${w+1}，`}</Text>  {`${isQ?'圈数':'距离'}：`}
                                        <Input value={inp?.[field+'o']?.[w] ||''} style={{display: 'inline-flex', width: '5rem'}}
                                               onChange={e =>arraySetInp(field+'o', w, e.currentTarget.value||undefined,inp,setInp)}/>{isQ?'r':'m'}
                                        &nbsp;{`，时间：`}
                                        <Input value={inp?.[field+'v']?.[w] ||''} style={{display: 'inline-flex', width: '4rem'}}
                                               onChange={e =>arraySetInp(field+'v', w, e.currentTarget.value||undefined,inp,setInp)}/>min
                                        &nbsp;<Text>速度= {floatInterception(inp?.[field+'o']?.[w]/inp?.[field+'v']?.[w], 2)} </Text>（{isQ?'r':'m'}/min)
                                    </React.Fragment>;
                                }) }
                                &nbsp;&nbsp;{`平均速度：`}
                                <Text>{calcAverageArrObj(arrobj,(row)=>{return row?.d/row?.t},2,3)}</Text>{`（${isQ?'r':'m'}/min)`}
                                &nbsp;检验结果
                                <SelectHookfork value={ inp?.[field+'r'] ||''}
                                                onChange={e => setInp({ ...inp, [field+'r']: e.currentTarget.value||undefined}) }/>
                            </div>
                        </React.Fragment>);
                }) }
                备注：
                <TextArea id={'WeightCorrespondM'} value={inp?.幅度备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 幅度备注: e.currentTarget.value||undefined}) } />
                { children }
                <Text>
                    注：1、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对速度允许偏差都没
                    有规定的，相应的速度可不测量。
                    2、具有多挡变速的起升机构，每挡速度允许的额定起重量，测量每挡工作速度，表格不够记录时，在备注栏记录。对于多起升机构或多小车运行机构
                    的起重机，其余起升机构和小车运行机构的速度测量值，记录在备注栏。
                    3、起升机构应具有慢速下降功能，慢降速度根据服务需求确定，但不大于9 m/min。
                    4、对设计规定不能带载变幅的动臂式塔机，可不按本表规定进行带载变幅试验。
                    5、对可变速的其他机构，应进行试验并测量各挡工作速度，在备注栏记录。
                    6、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                    7、未检查或无需检验的，仅填检验结果栏。
                </Text>
            </InspectRecordLayout>
        );
    } );
