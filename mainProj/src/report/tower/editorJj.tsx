/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, TextArea,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, useItemInputControl,
} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {Notepad, TechnicalWitness} from "../park/editor";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的 : 表对象的默认取值；
    defNote?: any[];     //默认的记事表
    defWitn?: any[];     //默认的见证表
}

export const itemA技术见证=['见证表','记事表','大备注'];
/**通用见证材料3项的： 约定：children [] 可以嵌入俩个儿子DOM节点，分别代表两个段落插入一个div块;
 * */
export const WitnessCr3Tower=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,titles,defNote,defWitn}:Props,  ref
    ) => {
        const defvcbFunc = React.useCallback((par: any) => {
            const { 见证表,记事表 }=par||{};
            if(!见证表 || 见证表.length<1)   par.见证表=defWitn;
            if(!(记事表?.length>=1))   par.记事表=defNote;
            return  par;
        }, []);
        const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证,defvcbFunc);
        const {inp, setInp} = useItemInputControl({ ref });
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd}
                                    alone={alone} label={label!}>
            <TechnicalWitness nums={6} inp={inp} setInp={setInp} defaultV={defWitn}
                              label={titles![0] + '、技术资料和工作见证材料'}/>
            {(children as any[])?.[0]}
            <hr/>
            <Notepad nums={5} inp={inp} setInp={setInp} defaultV={defNote} label={titles![1] + '、记事'}/>
            <hr/>
            <Text variant="h5">
                {titles![2]}、备注
            </Text>
            <TextArea value={inp?.大备注 || ''} rows={4}
                      onChange={e => setInp({...inp, 大备注: e.currentTarget.value || undefined})}/>
            {(children as any[])?.[1]}
        </InspectRecordLayout>;
    });
