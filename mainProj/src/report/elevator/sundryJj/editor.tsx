/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Input, Table, TableBody, TableRow, CCell, LineColumn, InputLine,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {Each_ZdSetting, useTableEditor} from "../../hook/useRepTableEditor";


const config间隙表=[['层站','n',86],['门扇间间隙','j',90],['扇与门楣间隙','t',90,],['门扇地坎间隙','s',90],['轿层门框间隙','K',90]] as Each_ZdSetting[];
export const itemA间隙=['间隙表','扇间隙','扇套隙','扇坎隙','门扇隙r', '轿框隙','轿框隙r'];
export const DoorGap=
    React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA间隙,);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
            附录A 杂物电梯轿厢与层门之间的间隙、门间隙检验记录：参照上面样表的第5行的标注的各列的简化后的列名来进行录入,结果2行拆出单独录入。单位：mm
        </Text>;
        const [render间隙表]=useTableEditor({inp, setInp,  headview,
            config: config间隙表, table:'间隙表', column:8});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={'附录A 电梯层门间隙、门锁啮合深度等检验记录'}>
                样表格式如下：
                <Table tight  miniw={800}><TableBody>
                    <TableRow>
                        <CCell>项目编号</CCell><CCell colSpan={3}>A3.2.5.2</CCell><CCell>A3.2.5.1</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验内容</CCell><CCell>层门门扇之间的间间隙</CCell><CCell>层门门扇与立柱、门楣间隙</CCell><CCell>层门扇与地坎间隙</CCell><CCell>轿厢与层门框架或层门之间的间隙</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>判断标准</CCell><CCell colSpan={3}>新安装检验： x≤6</CCell><CCell rowSpan={2}>x≤35</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>非首次检验：x≤10</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>层站</CCell><CCell>门扇间间隙</CCell><CCell>扇与门楣间隙</CCell><CCell>门扇地坎间隙</CCell><CCell>轿层门框间隙</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测量结果</CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验结果</CCell><CCell  colSpan={3}></CCell><CCell></CCell>
                    </TableRow>
                </TableBody></Table>
                {render间隙表}
                <hr/>
                上表最后两行结果行的录入拆出来：
                <LineColumn column={6}>
                    <InputLine label={`3.2.5.2,门扇间间隙-测量结果`}>
                        <Input  value={inp?.['扇间隙'] ||''}
                                onChange={e => setInp({...inp, 扇间隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.2.5.2,扇与门楣间隙-测量结果`}>
                        <Input  value={inp?.['扇套隙'] ||''}
                                onChange={e => setInp({...inp, 扇套隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.2.5.2,门扇地坎间隙-测量结果`}>
                        <Input  value={inp?.['扇坎隙'] ||''}
                                onChange={e => setInp({...inp, 扇坎隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.2.5.2-检验结果`}>
                        <SelectHookfork value={ inp?.门扇隙r ||''}
                                        onChange={e => setInp({ ...inp, 门扇隙r: e.currentTarget.value||undefined}) }/>
                    </InputLine>

                    <InputLine label={`3.2.5.1轿层门框间隙-测量结果`}>
                        <Input  value={inp?.['轿框隙'] ||''}
                                onChange={e => setInp({...inp, 轿框隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`3.2.5.1-检验结果`}>
                        <SelectHookfork value={ inp?.轿框隙r ||''}
                                        onChange={e => setInp({ ...inp, 轿框隙r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                注： 1、A3.2.5.1项、A3.2.5.2项，可以抽取基站、端站以及至少20%其他层站的层门进行检验；
                2、所检验的站需填写在相应栏中，测量结果符合要求的，在测量结果栏填所测量的数值区间范围（min-max），并在相应项目检验结果内
                打“√”；测量结果有不符合要求的，需在相应的站填写不合格的观测数据，并在相应项目检验结果中打“×”；
            </InspectRecordLayout>
        );
    } );

