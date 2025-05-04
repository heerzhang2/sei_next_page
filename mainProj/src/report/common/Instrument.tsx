/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
} from "customize-easy-ui-component";
import {useTableEditor,} from "../hook/useRepTableEditor";
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/webcam/dist/style.min.css';
import {
    InspectRecordLayout,
    InternalItemProps, useItemInputControl,
} from "./base";
import {useMeasureInpFilter} from "./hooks";
import {tail测仪器} from "../recreation/waterJj/repView";
import {z} from "zod";
import {useStorage} from "@/report/StorageContext";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {CollapsibleFormSection} from "@/components/chub";
import {Each_ZdSetting} from "@/report/hook/use-table-editor";


interface InstrumentTableProps  extends InternalItemProps{
    label: string;
    prnAttach?: string;
}
export const instrumentOption = [
    { label: "正常", value: "√" },
    { label: "不正常", value: "×" },
]
//【注意】回调函数局限：若加<React.Fragment > 会导致<InputLine 内勤套render时刻无法穿透提供 props 给输入组件的：层次层级不配套，造成样式不一致问题！
const config仪器表=[['测量设备名称','n',140],['规格型号','t',120],['测量设备编号','i',142],
    ['性能状态-开机后','o',55,{t:'s',l:instrumentOption}],
    ['性能状态-关机前','f',55,{t:'s',l:instrumentOption}]
] as Each_ZdSetting[];
/**可复用的： 仪器表录入页面的
 * */
export const ItemInstrumentTable = ({ children, show, alone = true, redId, nestMd, label, rep
                                        ,prnAttach}: InstrumentTableProps) => {
    const {storage,setStorage,modified,setModified} =useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config仪器表.forEach(([t,field,s,o,park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["仪器表"]= z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["仪器表"]= storage["仪器表"]
        return fields
    }, [storage])
    const arrayFields =React.useMemo(() => {
        const itemTemplate = {} as any
        config仪器表.forEach(([t,field,s,o,park]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"仪器表", itemTemplate,} ]
    }, [])

    const headview=<h5>{label}：</h5>;
    const tailview=<>
        {tail测仪器}
        <br/><hr/>
        { !alone && show && prnAttach &&
            <h5>{prnAttach}</h5>
        }
    </>;
    const [nestRendererFactory]=useTableEditor({headview, config: config仪器表, table:'仪器表',defFixedLay:true, tailview});
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            return (
                <>
                    <Card className="py-1 gap-1">
                        <CardContent className="px-1">
                            {nestRendererFactory(form, arrays)}
                        </CardContent>
                    </Card>
                    {children}
                </>
            )
        },
        [children,nestRendererFactory ],
    )
    const { render } = useFormFramework({schema, defaultValues, contentRendererFactory,arrayFields, rep})
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render()}
    </CollapsibleFormSection>;
};


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
