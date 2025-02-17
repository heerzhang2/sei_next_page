/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {usePrefixDataEdit} from "../hook/usePrefixData";

interface Props  extends InternalItemProps{
    label: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
    config?: any[];
}
/**资料审查主体  config={config资料审查}
 * */
export const DeviceSurveyD =
    React.forwardRef((
        {children, show, alone = true, redId, nestMd, label, config}: Props, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        const [renderEditor, itemA] = usePrefixDataEdit({
            inp, setInp, config: config!,
        });
        const [getInpFilter] = useMeasureInpFilter(null, itemA,);
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label ?? '一、设备概况'}>
            <Text variant="h5">{label}：</Text>
            资料审查设备概况除在台账业务信息中可修改外还需修改的部分:
            {renderEditor}
            {children}
        </InspectRecordLayout>;
    });

