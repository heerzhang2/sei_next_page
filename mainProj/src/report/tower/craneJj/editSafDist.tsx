/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, InputLine, SuffixInput, TextArea,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {EachMeasureItemConfig} from "../../common/measure";
import {useMeasureItem, useMeasureRow} from "../../hook/useMeasure";
import {ObservationMeasureProps} from "../../gantry/editorDj";

//早前版本：编辑器和打印的都很别直接拼凑的，两个代码关联的字段name需要人工复制核对，没有config数组的模式。
export const config距离 =(orc:any)=> [
    [{n: '距固定', t: ['（1）塔机的尾部与周围建筑物及其外围施工设施之间的安全距离'], u: 'm'}, ],
    [{n: '垂出入', t: ['(2)两台塔机之间的架设距离','处于低位塔机的起重臂端部与另一台塔机的塔身之间的距离'],  c: '弃', d: '2', save: false},],
    [{n: '垂不准', t: [undefined,'处于高位塔机的最低位置的部件（吊钩升至最高点或平衡重的最低部位）与低位塔机中处于最高位置部件之间的垂直距离'],   save: false},],
    [{n: '输最距', t: [<Text>(3)有架空输电线的场合，塔机的任何部位与输电线的安全距离线路电压（ {orc?.输线电压} ）kv</Text>],  save: false},],
    [{check: 'C3.3', }],
] as EachMeasureItemConfig[][];

export const itemA安全距=['输线电压','安距备注'];
export const configFix安全距 =config距离({});           //若用useMeasureClistX()会陷入hook依赖的循环！！
export const SafeDistance =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,iAname}: ObservationMeasureProps, ref
    ) => {
        const {itemObservation, itemObservationA,}=useMeasureItem(configFix安全距,false);
        const {inp, setInp} = useItemInputControl({ref});
        //【Hook死循环】不能使用const newconfig=typeof config ==='function'? config(inp) : config;
        const newconfig =React.useMemo(() => {
            return (typeof config ==='function')? config({输线电压: inp?.输线电压}) : config;
            //底下依赖项 也没法使用[inp?.输线电压, config]无法对'输线电压'编辑成功；另外用}, [storage?.输线电压, config]);也需要重新刷新才能同步。
            //inp.输线电压 变动：=>newconfig=>itemObservationA=>getInpFilter=>inp形成了循环变动链条，循环了！必须要斩断其中一个点关联！！useMeasureClistX进行修订？Fix可变的config两种配置；
        }, [inp?.输线电压, config]);
        const {render}=useMeasureRow(inp,setInp, newconfig, false ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, ...itemA安全距, ...iAname??[]];
        }, [itemObservationA, iAname]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        //【严重的毛病】会死循环！
        // React.useEffect(() => { setInp({ ...inp, 输线电压: voltage }); }, [voltage, inp, setInp] );
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label}>
                <Text variant="h5">{label}</Text>
                本表合计4款共4项目，其中第四款：有架空输电线的场合，塔机的任何部位与输电线的安全距离线路电压（ ）kv；
                <InputLine  label='线路电压' >
                    <SuffixInput  value={inp?.输线电压 ||''}  placeholder="使用默认规则，缺省编号情况的可不填"
                                  onChange={e =>setInp({ ...inp, 输线电压: e.currentTarget.value||undefined }) }>(kv)</SuffixInput>
                </InputLine>
                <hr/>
                { render }
                <hr/>
                备注：
                <TextArea  value={inp?.安距备注 ||''} rows={5}
                           onChange={e => setInp({ ...inp, 安距备注: e.currentTarget.value||undefined}) } />
                { children }
                注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
                2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            </InspectRecordLayout>
        );
    } );
