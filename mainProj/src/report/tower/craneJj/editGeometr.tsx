/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {EachMeasureItemConfig} from "../../common/measure";
import {useMeasureOldVer} from "../../hook/useMeasureOldVer";
import {ObservationMeasureProps} from "../../gantry/editorDj";

export const config几何尺寸 = [
    [{n: '校节长', t: ['校准节尺寸','长'], u: 'mm',c: '四', d: '2'},
        {n: '校节宽', t: [undefined, '宽'], c: '四', d: '2'},
        {n: '校节高', t: [undefined, '高'], c: '四', d: '2'},
    ],
    [{n: '幅度', t: ['幅度'], u: 'm', c: '四', d: '2'}],
    [{n: '升高度', t: ['起升高度'], u: 'm', c: '四', d: '2'}],
    [{check: 'C3.6'}],
] as EachMeasureItemConfig[][];

export const Geometric =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,iAname}: ObservationMeasureProps, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        const {render,itemObservation, itemObservationA,}=useMeasureOldVer(inp,setInp, config as EachMeasureItemConfig[][],
            true ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, '几何备注'];
        }, [itemObservationA]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label}>
                <Text variant="h5">{label}</Text>
                { render }
                备注：
                <TextArea  value={inp?.几何备注 ||''} rows={4}
                           onChange={e => setInp({ ...inp, 几何备注: e.currentTarget.value||undefined}) } />
                注：1、以设计图样要求作为检验结果判定依据。
                2、有多个起升机构的，其余机构的起升高度测量值和结果填在备注栏中。
                3、未测量或无需测量的，仅填检验结果栏。
            </InspectRecordLayout>
        );
    } );
