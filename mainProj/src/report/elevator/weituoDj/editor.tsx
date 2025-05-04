/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Input, Table, TableBody, TableRow, CCell, LineColumn, InputLine, InputIdProvider, InputDatalist,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {objNestSet, } from "../../../common/tool";
import {useTableEditor} from "../../hook/useRepTableEditor";
import {Dispatch, SetStateAction} from "react";
import {Each_ZdSetting} from "@/report/hook/use-table-editor";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
}

export const item测间隙o = [ ['轿门1', {t: '轿门1', },],  ['轿门2', {t: '轿门2', },]   ,];
const config间隙表=[['层站','n',86],['门扇间间隙','j',90],['扇与门楣间隙','t',90,],['门扇地坎间隙','s',90],
    ['扇间施力间隙','p',90],['门锁啮合长','l',90] ] as Each_ZdSetting[];
export const itemA间隙=['间隙表','扇间隙','扇套隙','扇坎隙','门扇隙r', '施力隙','施力隙r','锁啮长','锁啮长r'];
    // for(let key  in out){} 是找对象属性的。
for(let one of item测间隙o){
    const [name,]=one as any;
    itemA间隙.push(name);
}
export const DoorGap=
    React.forwardRef(({ children, show ,alone=true,refWidth,label}:Props,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA间隙,);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
         {label}：参照上面样表的第5行的标注的各列的简化后的列名来进行录入,结果2行以及轿门2个行都拆出单独录入。单位：mm
        </Text>;
        const [render间隙表]=useTableEditor({inp, setInp,  headview,
            config: config间隙表, table:'间隙表', column:8});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={'附录A 电梯层门间隙、门锁啮合深度等检验记录'}>
                样表格式如下：
                <Table tight miniw={800}><TableBody>
                    <TableRow>
                        <CCell>项目编号</CCell><CCell
                        colSpan={3}>*A1.2.7.2(1)</CCell><CCell>*A1.2.7.2(2)</CCell><CCell>*A1.2.7.8(2)</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验内容</CCell><CCell>门扇之间间隙</CCell><CCell>门扇与立柱、门楣
                        间隙</CCell><CCell>门扇与地坎间隙</CCell>
                        <CCell>层门扇间施力间隙</CCell><CCell>门锁啮合长度</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>判断标准</CCell><CCell
                        colSpan={3}>客梯：x≤6，</CCell><CCell>旁开门：x≤30</CCell><CCell rowSpan={2}>x≥7</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>货梯：x≤10；</CCell><CCell>中分门：x≤45</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>层站/轿门</CCell><CCell>门扇间间隙</CCell><CCell>扇与门楣间隙</CCell><CCell>门扇地坎间隙</CCell><CCell>扇间施力间隙</CCell><CCell>门锁啮合长</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测量结果</CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验结果</CCell><CCell colSpan={3}></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                </TableBody></Table>
                {render间隙表}
                <hr/>
                上表轿门1/2两行的录入：
                <ElevatorGateMesGap inp={inp} setInp={setInp}/>
                <hr/>
                上表最后两行结果行的录入：
                <LineColumn column={6}>
                    <InputLine label={`*A1.2.7.2(1)门扇间间隙-测量结果`}>
                        <Input value={inp?.['扇间隙'] || ''}
                               onChange={e => setInp({...inp, 扇间隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`*A1.2.7.2(1)扇与门楣间隙-测量结果`}>
                        <Input value={inp?.['扇套隙'] || ''}
                               onChange={e => setInp({...inp, 扇套隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`*A1.2.7.2(1)门扇地坎间隙-测量结果`}>
                        <Input value={inp?.['扇坎隙'] || ''}
                               onChange={e => setInp({...inp, 扇坎隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`*A1.2.7.2(1)-检验结果`}>
                        <SelectHookfork value={inp?.门扇隙r || ''}
                                        onChange={e => setInp({...inp, 门扇隙r: e.currentTarget.value || undefined})}/>
                    </InputLine>

                    <InputLine label={`*A1.2.7.2(2)扇间施力间隙-测量结果`}>
                        <Input value={inp?.['施力隙'] || ''}
                               onChange={e => setInp({...inp, 施力隙: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`*A1.2.7.2(2)-检验结果`}>
                        <SelectHookfork value={inp?.施力隙r || ''}
                                        onChange={e => setInp({...inp, 施力隙r: e.currentTarget.value || undefined})}/>
                    </InputLine>

                    <InputLine label={`*A1.2.7.8(2)门锁啮合长-测量结果`}>
                        <Input value={inp?.['锁啮长'] || ''}
                               onChange={e => setInp({...inp, 锁啮长: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`*A1.2.7.8(2)-检验结果`}>
                        <SelectHookfork value={inp?.锁啮长r || ''}
                                        onChange={e => setInp({...inp, 锁啮长r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                注： 1、超过注册登记日期或安装监检合格日期15年的电梯，才需对A1.2.7.2项进行检验。可以抽取基站、端站以及至少20%其他层站的层门进行检验；
                2、A1.2.7.8(2)项只有在认为啮合深度可能不足时，才需测量相关数据；未测量时，观测数据和测量结果可不填。检验结果应填，对不适用项填“/”；
                3、所检验的站需填写在相应栏中，测量结果符合要求的，在测量结果栏填所测量的数值区间范围（min-max），并在相应项目检验结果内打“√”；测量结
                果有不符合要求的，需在相应的站填写不合格的观测数据，并在相应项目检验结果中打“×”；
            </InspectRecordLayout>
        );
    });

interface ElevatorGateMesGapProps extends InternalItemProps {
    inp: any,
    setInp: Dispatch<SetStateAction<any>>,
}
//存储实际独立于“层站”测量表的；
const  ElevatorGateMesGap = ({inp, setInp,} : ElevatorGateMesGapProps
) => {
    return <>
        { item测间隙o.map(([name,conf,]: any, i:number) => {
            const {t: title,  }=conf;
            return (<React.Fragment key={i}>
                <div css={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                    <Text>序号{i + 1} {'>'} {title}：</Text>
                    &nbsp;
                    <div>门扇之间间隙
                        <InputIdProvider>
                            <InputDatalist value={(inp?.[name]?.j) || ''}
                                           style={{display: 'inline-flex', width: '4rem'}}
                                           onListChange={v => objNestSet(name, 'j', v || undefined, inp, setInp)}/>mm
                        </InputIdProvider>
                    </div>
                    <div css={{display: 'inline-flex', alignItems: 'center'}}>
                        &nbsp;门扇与立柱、门楣间隙
                        <Input value={inp?.[name]?.t || ''} size={3} style={{display: 'inline-flex', width: '4rem'}}
                               onChange={e => objNestSet(name, 't', e.currentTarget.value || undefined, inp, setInp)}/>mm
                    </div>
                    <div css={{display: 'inline-flex', alignItems: 'center'}}>
                        &nbsp;门扇与地坎间隙
                        <Input value={inp?.[name]?.s || ''} size={3} style={{display: 'inline-flex', width: '4rem'}}
                               onChange={e => objNestSet(name, 's', e.currentTarget.value || undefined, inp, setInp)}/>mm
                    </div>
                    <div css={{display: 'inline-flex', alignItems: 'center'}}>
                        &nbsp;门锁啮合长度
                        <Input value={inp?.[name]?.l || ''} size={3} style={{display: 'inline-flex', width: '4rem'}}
                               onChange={e => objNestSet(name, 'l', e.currentTarget.value || undefined, inp, setInp)}/>mm
                    </div>
                </div>
            </React.Fragment>);
        })}
    </>;
};
