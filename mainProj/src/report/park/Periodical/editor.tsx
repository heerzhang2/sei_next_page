/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text, Input, TextArea, Button,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {tableSetInp,} from "../../../common/tool";

interface WitnessParkDjProps  extends InternalItemProps{
    label?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    nums?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
    bhTil?: string;
}
export const itemA技术见证=['见证表','大备注'];
const default见证: never[]=[];
/**通用见证材料+备注 2项： 约定：children [] 可以嵌入俩个儿子DOM节点，分别代表两个段落插入一个div块;
 * */
export const WitnessParkDj=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,titles,nums=6,bhTil='备注'}:WitnessParkDjProps,  ref
) => {

    const defvcbFunc = React.useCallback((par: any) => {
        const { 见证表, }=par||{};
        if(!见证表 || 见证表.length<1)   par.见证表=default见证;
        return  par;
    }, []);
    const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证,defvcbFunc);
    const {inp, setInp} = useItemInputControl({ ref });
    const labelMg=titles?.[0]+' '+titles?.[1];
    return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                            nestMd={nestMd} alone={alone} label={labelMg??'五、见证资料 六、备注'}>
        <div>
            <Text variant="h5">
                {titles![0]}: <Button onPress={() => {
                setInp({...inp, 见证表: default见证});
            }}>清空全表至默认</Button>
            </Text>
            {(new Array(nums)).fill(null).map((_, w: number) => {
                return <React.Fragment key={w}>
                    序号 {w + 1} ：
                    <div css={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly'}}>
                        <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                            代号
                            <Input value={inp?.见证表?.[w]?.no || ''} size={2}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => tableSetInp('见证表', w, inp, setInp, 'no', e.currentTarget.value || undefined)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                            名称
                            <Input value={inp?.见证表?.[w]?.ti || ''} size={42}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => tableSetInp('见证表', w, inp, setInp, 'ti', e.currentTarget.value || undefined)}/>
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                            {bhTil}
                            <Input value={inp?.见证表?.[w]?.bh || ''} size={23}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => tableSetInp('见证表', w, inp, setInp, 'bh', e.currentTarget.value || undefined)}/>
                        </div>
                    </div>
                </React.Fragment>;
            })}
        </div>
        {(children as any[])?.[0]}
        <hr/>
        <Text variant="h5">
            {titles![1]}
        </Text>
        <TextArea value={inp?.大备注 || ''} rows={4}
                  onChange={e => setInp({...inp, 大备注: e.currentTarget.value || undefined})}/>
        {(children as any[])?.[1]}
    </InspectRecordLayout>;
});

/*日期可兼容文本输入：
    <MemoDateInput value={inp?.[name]?.d || ''} onChange={v => objNestSet(name,'d', v||undefined,inp,setInp) } />
* */
