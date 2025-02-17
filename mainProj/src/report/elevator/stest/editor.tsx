/** @jsxImportSource @emotion/react */
import * as React from "react";
import {BlobInputList, Input, InputLine, Select, Text, TextArea,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

interface WitnessParkDjProps  extends InternalItemProps{
    titles?: any[];      //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    nowit?: boolean;    //没有必要输入见证材料
    //大备注  列表框方式的
    memolist?: any[];
    //见证资料  默认可选择录入
    witlist?: any[];
}
export const itemA技术见证=['资料编号','大备注'];
/**通用见证材料3项的： 约定：children [] 可以嵌入俩个儿子DOM节点，分别代表两个段落插入一个div块;
 * */
export const WitnessSimple=
    React.forwardRef((
        { children, show ,alone=true,redId,nestMd,label,titles,nowit,memolist,witlist}:WitnessParkDjProps,  ref
) => {
    const defvcbFunc = React.useCallback((par: any) => {
        // const { 见证表, }=par||{};
        return  par;
    }, []);
    const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证,defvcbFunc);
    const {inp, setInp} = useItemInputControl({ ref });
    return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                nestMd={nestMd} alone={alone} label={label!}>
        {!nowit && <>
            <div>
                <Text variant="h5">
                    {titles![0]}
                </Text>
                资料及编号:
                <BlobInputList value={inp?.资料编号 || ''} rows={6} datalist={witlist}
                               onListChange={v => setInp({...inp, 资料编号: v || undefined}) } />
            </div>
            {(children as any[])?.[0]}
            <hr/>
          </>
        }
        <Text variant="h5">
            {titles![1]}
        </Text>
        <BlobInputList value={inp?.大备注 || ''} rows={6} datalist={memolist}
                       onListChange={v => setInp({...inp, 大备注: v || undefined}) } />
        {(children as any[])?.[1]}
    </InspectRecordLayout>;
});

interface ConclusionTestProps extends InternalItemProps{
    //需要加上 检验日期1 的编辑？
    startd?: boolean;
    nxtstyp?: string;
}
export const itemA结论 = ['检验结论', '新下检日','检测日期','检测日期1'];
//下结论页面：
export const ConclusionTest =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,startd=false,nxtstyp='定期检验'}: ConclusionTestProps, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA结论,);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">
                    {label} (报告下结论)：
                </Text>
                <InputLine label='检验结论'>
                    <Select inputSize="md" css={{minWidth: '140px', fontSize: '1.3rem', padding: '0 1rem'}}
                            value={inp?.检验结论 || ''}
                            onChange={e => setInp({...inp, 检验结论: e.currentTarget.value || undefined})}
                    >
                        <option></option>
                        <option>合格</option>
                        <option>不合格</option>
                    </Select>
                </InputLine>
                <InputLine label='设置检测日期'>
                    <Input value={inp?.检测日期 || ''} type='date'
                           onChange={e => setInp({...inp, 检测日期: e.currentTarget.value})}/>
                </InputLine>
                <InputLine label={`下次检测日期`}>
                    <Input value={inp?.新下检日 || ''} type='date'
                           onChange={e => setInp({...inp, 新下检日: e.currentTarget.value})}/>
                </InputLine>
            </InspectRecordLayout>
        );
    });
