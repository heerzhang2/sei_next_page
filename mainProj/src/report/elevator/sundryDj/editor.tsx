import * as React from "react";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label: string;
    nos?: string;
    titles: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    // config?: any[];    //有配置模式的 : 表对象的默认取值；
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
}

export const itemA技术见证=['大备注','见证资'];
/**通用见证材料3项的： 只剩下了一个： 六、备注；
 * */
export const WitnessSound=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,titles,memolist,witnlist}:Props, ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证, );
        const {inp, setInp} = useItemInputControl({ ref });
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd}
                                    alone={alone} label={label!}>
            { (children as any[])?.[0] && <>
                {(children as any[])?.[0]}
                <hr/>
             </>
            }
            <Text variant="h5">
                {titles[0]}
            </Text>
            <BlobInputList value={inp?.见证资 || ''} rows={4}
                           onListChange={v => setInp({...inp, 见证资: v || undefined})}
                           datalist={witnlist}
            />
            <hr/>
            <Text variant="h5">
                {titles[1]}
            </Text>
            <BlobInputList value={inp?.大备注 || ''} rows={7}
                           onListChange={v => setInp({...inp, 大备注: v || undefined})}
                           datalist={memolist}
            />
            {(children as any[])?.[1]}
        </InspectRecordLayout>;
    });
