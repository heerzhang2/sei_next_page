/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
} from "customize-easy-ui-component";
import {Each_ZdSetting, useRepTableEditor, useTableEditor,} from "../hook/useRepTableEditor";
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import {
    InspectRecordLayout,
    InternalItemProps, SelectHookfork, useItemInputControl,
} from "./base";
import {useMeasureInpFilter} from "./hooks";
import {itemA结论} from "../vehicle/balanceT/editor";
import {tail测仪器} from "../recreation/waterJj/repView";

interface InstrumentTableProps  extends InternalItemProps{
    label: string;
    prnAttach?: string;
}

//【注意】回调函数局限：若加<React.Fragment > 会导致<InputLine 内勤套render时刻无法穿透提供 props 给输入组件的：层次层级不配套，造成样式不一致问题！
const config仪器表=[['测量设备名称','n',140],['规格型号','t',120],['测量设备编号','i',142],
    ['性能状态-开机后','o',75,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.o ||''} onChange={e => setObj({ ...obj, o: e.currentTarget.value||undefined})}/>
    }],
    ['性能状态-关机前','f',75,(obj,setObj)=>{
        return <SelectHookfork value={ obj?.f ||''} onChange={e => setObj({ ...obj, f: e.currentTarget.value||undefined})}/>
    }],
] as Each_ZdSetting[];
/**可复用的： 仪器表录入页面的
 * */
export const ItemInstrumentTable=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,prnAttach}:InstrumentTableProps,  ref
    ) => {
        const headview=<Text variant="h5">
            {label}：
        </Text>;
        const tailview=<>
            {tail测仪器}
            <br/><hr/>
            { !alone && show && prnAttach &&
                <Text variant="h5">
                  {prnAttach}
                </Text>
            }
        </>;
        const {render}=useRepTableEditor({ref,nestMd,show,alone,redId,
            config: config仪器表, table:'仪器表', column:4,  label: label, headview,tailview,
        });
        return render;
} );

interface InstrumentReispProps  extends InternalItemProps{
    label: string;
}
const defaultValCb= (par: { 仪器表?: any; 复检仪器?: any; })=>{
    const { 复检仪器 }=par||{};
    if(!复检仪器)   par.复检仪器=[...(par.仪器表??[])];
    return  par;
}
export const itemA复检仪 = ['复检仪器','仪器表'];
/**复检 仪器表录入页面的
 * 默认：第一次检验的仪表是 orc?.仪器表; 复检仪器表是 orc?.复检仪器=[];
 * */
export const InstrumentReisp=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,}:InstrumentReispProps,  ref
    ) => {
        const headview=<Text variant="h5">
            {label}：
        </Text>;
        const tailview=<>
            {tail测仪器}
            <br/><hr/>
        </>;

        const [getInpFilter] = useMeasureInpFilter(null, itemA复检仪,defaultValCb);
        const {inp, setInp} = useItemInputControl({ref});
        const [renderInner]=useTableEditor({config:config仪器表, table:'复检仪器',column:4,
                        inp, setInp,  headview, tailview,  });
        const render=<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter}  show={show}  redId={redId} nestMd={nestMd}
                                          alone={alone}  label={label}>
            {renderInner}
        </InspectRecordLayout>;
        return render;
} );
