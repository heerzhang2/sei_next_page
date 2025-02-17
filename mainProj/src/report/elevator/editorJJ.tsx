/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    LineColumn,
    InputLine,
    SuffixInput,
    TextArea,
    Input,
    Select,
    Button,
    BlobInputList,
    InputDatalist,
    CheckSwitch,
    useTheme, Table, TableBody, TableRow, CCell, ButtonRefComp,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout,
    InternalItemProps,
    SelectHookfork,
    SelectPair,
    useItemInputControl,
    现场条件选
} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {EachMeasureItemConfig, measurementRender} from "../common/measure";
import {arraySetInp, calcAverageArrObj, floatInterception, tableSetInp} from "../../common/tool";
import {useMeasureOldVer} from "../hook/useMeasureOldVer";
import {Each_ZdSetting, useTableEditor} from "../hook/useRepTableEditor";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的
}

const config间隙表61=[['层站','n',66],['门扇间间隙','j',70],['扇与门套间隙','t',70,],['门扇地坎间隙','s',70],['扇施力间隙','p',70],['门刀地坎间距','i',70],
    ['滚轮地坎间距','g',70],['层地轿地坎距','d',70],['门锁啮合长','l',70]] as Each_ZdSetting[];
const item间隙61=['锁啮深'];
const itemA间隙61=['间隙表','扇间隙','扇套隙','扇坎隙','门扇隙r','施力隙','施力隙r','刀地间','轮地间','门地间r','地地距','地地距r', '锁啮长','锁啮长r','锁啮深r'];
export const itemn间隙61=itemA间隙61.concat(item间隙61);
export const DoorGap61=
    React.forwardRef(({ children, show ,alone=true,refWidth,label}:Props,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(item间隙61,itemA间隙61,);
        const {inp, setInp} = useItemInputControl({ ref });
        const headview=<Text variant="h5">
            {label}：参照上面样表的第6行的标注的各列的简化后的列名来进行录入,最后1列和结果行拆出单独录入。单位：mm
        </Text>;
        const [render间隙表]=useTableEditor({inp, setInp,  headview,
            config: config间隙表61, table:'间隙表', column:8});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                样表格式如下：
                <Table tight  miniw={800}><TableBody>
                    <TableRow>
                        <CCell>项目编号</CCell><CCell colSpan={3}>6.3（1）</CCell><CCell>6.3（2）</CCell><CCell colSpan={2}>6.12</CCell><CCell>6.1</CCell><CCell>6.9(1)</CCell><CCell>6.9(2)</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>项目类别</CCell><CCell colSpan={3}>C</CCell><CCell>C</CCell><CCell colSpan={2}>C</CCell><CCell>C</CCell><CCell>B</CCell><CCell>B</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验内容</CCell><CCell>层门门扇间间隙</CCell><CCell>层门门扇与门套间隙</CCell><CCell>层门扇与地坎间隙</CCell><CCell>层门扇间施力间隙</CCell><CCell>轿门门刀与层门地坎间距</CCell><CCell>门锁滚轮与轿门地坎间距</CCell><CCell>层门地坎与轿门地坎水平距离</CCell><CCell>门锁啮合长度</CCell><CCell>轿门锁啮合深度</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>判断标准</CCell><CCell colSpan={3}>新安装检验： 客梯：x≤6， 货梯：x≤8；</CCell><CCell>旁开门： x≤30</CCell><CCell rowSpan={2} colSpan={2}>x≥5</CCell><CCell rowSpan={2}>x≤35</CCell><CCell rowSpan={2}>x≥7</CCell><CCell rowSpan={2}>x≥7</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>非首次检验货梯：x≤10</CCell><CCell>中分门总 和： x≤45</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>层站</CCell><CCell>门扇间间隙</CCell><CCell>扇与门套间隙</CCell><CCell>门扇地坎间隙</CCell><CCell>扇施力间隙</CCell><CCell>门刀地坎间距</CCell><CCell>滚轮地坎间距</CCell><CCell>层地轿地坎距</CCell><CCell>门锁啮合长</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测量结果</CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                </TableBody></Table>
                {render间隙表}
                <hr/>
                上表最后两行结果行,最后1列的录入拆出来：
                <LineColumn column={6}>
                    <InputLine label={`6.3（1）,层门门扇间间隙-测量结果`}>
                        <Input  value={inp?.['扇间隙'] ||''}
                                onChange={e => setInp({...inp, 扇间隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（1）,层门门扇与门套间隙-测量结果`}>
                        <Input  value={inp?.['扇套隙'] ||''}
                                onChange={e => setInp({...inp, 扇套隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（1）,层门扇与地坎间隙-测量结果`}>
                        <Input  value={inp?.['扇坎隙'] ||''}
                                onChange={e => setInp({...inp, 扇坎隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（1）-检验结果`}>
                        <SelectHookfork value={ inp?.门扇隙r ||''}
                                        onChange={e => setInp({ ...inp, 门扇隙r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.3（2）扇施力间隙-测量结果`}>
                        <Input  value={inp?.['施力隙'] ||''}
                                onChange={e => setInp({...inp, 施力隙: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.3（2）扇施力间隙-检验结果`}>
                        <SelectHookfork value={ inp?.施力隙r ||''}
                                        onChange={e => setInp({ ...inp, 施力隙r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.12 轿门门刀与层门地坎间距-测量结果`}>
                        <Input  value={inp?.['刀地间'] ||''}
                                onChange={e => setInp({...inp, 刀地间: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.12 门锁滚轮与轿门地坎间距-测量结果`}>
                        <Input  value={inp?.['轮地间'] ||''}
                                onChange={e => setInp({...inp, 轮地间: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.12 -检验结果`}>
                        <SelectHookfork value={ inp?.门地间r ||''}
                                        onChange={e => setInp({ ...inp, 门地间r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.1 层地轿地坎距-测量结果`}>
                        <Input  value={inp?.['地地距'] ||''}
                                onChange={e => setInp({...inp, 地地距: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.1 层地轿地坎距-检验结果`}>
                        <SelectHookfork value={ inp?.地地距r ||''}
                                        onChange={e => setInp({ ...inp, 地地距r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.9(1) 门锁啮合长-测量结果`}>
                        <Input  value={inp?.['锁啮长'] ||''}
                                onChange={e => setInp({...inp, 锁啮长: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.9(1) 门锁啮合长-检验结果`}>
                        <SelectHookfork value={ inp?.锁啮长r ||''}
                                        onChange={e => setInp({ ...inp, 锁啮长r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                    <InputLine label={`6.9(2)轿门锁啮合深度-观测数据`}>
                        <Input  value={inp?.['锁啮深o'] ||''}
                                onChange={e => setInp({...inp, 锁啮深o: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.9(2)轿门锁啮合深度-测量结果`}>
                        <Input  value={inp?.['锁啮深v'] ||''}
                                onChange={e => setInp({...inp, 锁啮深v: e.currentTarget.value || undefined}) } />
                    </InputLine>
                    <InputLine label={`6.9(2)轿门锁啮合深度-检验结果`}>
                        <SelectHookfork value={ inp?.锁啮深r ||''}
                                        onChange={e => setInp({ ...inp, 锁啮深r: e.currentTarget.value||undefined}) }/>
                    </InputLine>
                </LineColumn>
                注1：所抽检的层站需填写。抽检结果符合要求的，在测量结果填所测量的数值区间范围（min-max），并在相应项目检验结 果内打“√”；抽检结果有不符合要求的，需填写不合格的观测数据，并在相应项目检验结果中打“×”。
            </InspectRecordLayout>
        );
    } );

export const itemA见证Jj1=['施程录','自检编','整改报编','他资编','大备注'];
/**[麻烦] 但verId不能加上，多个模板做了共享引用的组件，会导致混乱verId逻辑。
 * */
export const WitnessElevJj1=
    React.forwardRef(({ children, show ,alone=true,refWidth,verId,label,titles}:Props,  ref
    ) => {
        const [getInpFilter]=useMeasureInpFilter(null,itemA见证Jj1,);
        const {inp, setInp} = useItemInputControl({ ref });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                注：特殊情况，应在备注中说明检验员所负责检验的项目编号。<br/>
                {titles?.[0]}、见证材料
                <LineColumn column={3}>
                    <InputLine label={`1、《施工过程记录》编号`}>
                        <BlobInputList value={inp?.['施程录'] ||''}   datalist={['材料名称《电梯年度自行检查记录》,编号：']}
                                       onListChange={v => setInp({...inp, 施程录: v || undefined}) } />
                    </InputLine>
                    <InputLine label={`2、《施工自检报告》编号`}>
                        <BlobInputList value={inp?.['自检编'] ||''}   datalist={['材料名称《限速器动作速度校验报告》，编号：']}
                                       onListChange={v => setInp({...inp, 自检编: v || undefined}) } />
                    </InputLine>
                    <InputLine label={`3、《施工单位整改报告》编号`}>
                        <BlobInputList value={inp?.['整改报编'] ||''}   datalist={['材料名称《》，编号：']}
                                       onListChange={v => setInp({...inp, 整改报编: v || undefined}) } />
                    </InputLine>
                    <InputLine label={`4、其他资料及编号`}>
                        <BlobInputList  value={inp?.['他资编'] ||''}
                                        onListChange={v => setInp({ ...inp, 他资编: v || undefined}) } />
                    </InputLine>
                </LineColumn>
                <div>{titles?.[1]}、备注:
                    <BlobInputList  value={inp?.['大备注'] ||''}  rows={5}
                                    datalist={['本报告为复检报告，本次复检仅对上次不合格报告的不合格项进行复检，其余项目单项结论引用上次不合格报告中相对应项目的结论']}
                                    onListChange={v => setInp({ ...inp, 大备注: v || undefined}) } />
                </div>
            </InspectRecordLayout>
        );
    } );

