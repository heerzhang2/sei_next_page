/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    LineColumn,
    InputLine,
    SuffixInput,
    TextArea,
    Input,
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
import {floatInterception, } from "../../common/tool";
import {useTableEditor} from "../hook/useRepTableEditor";
import {EachMeasureCritConfig} from "../common/msCriteria";
import {Each_ZdSetting} from "@/report/hook/use-table-edit";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props extends InternalItemProps {
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的
}

const config导轨表 = [['层站', 'n', 55], ['轿厢左侧顶面', 'zd', 60], ['轿厢左侧侧面', 'zc', 60,], ['轿厢右侧顶面', 'yd', 60], ['轿厢右侧侧面', 'yc', 60], ['对重左侧有钳', 'zq', 60],
    ['对重右侧有钳', 'yq', 60], ['对重左侧无钳', 'zw', 60], ['对重右侧无钳', 'yw', 60], ['轿厢轨距偏', 'jp', 50], ['对重轨距偏', 'zp', 50]] as Each_ZdSetting[];
export const itemA导轨 = ['导轨表', '轿厢导轨z', '轿厢导轨y', '轿厢导轨r', '有钳v', '有钳r', '无钳v', '无钳r', '偏轿厢v', '偏轿厢r', '偏对重v', '偏对重r'];
export const GuideRail =
    React.forwardRef(({children, show, alone = true, refWidth, label}: Props, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA导轨,);
        const {inp, setInp} = useItemInputControl({ref});
        const headview = <Text variant="h5">
            附录A 电梯导轨检验记录：参照上面样表的第7行的标注的各列的简化后的列名来进行录入。单位：mm
        </Text>;
        const [render导轨表] = useTableEditor({
            inp, setInp, headview,
            config: config导轨表, table: '导轨表', column: 8
        });
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                样表格式如下：
                <Table tight miniw={800}><TableBody>
                    <TableRow>
                        <CCell rowSpan={2}>项目编号</CCell><CCell colSpan={10}>3.6导轨C</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={4}>（3）</CCell><CCell colSpan={2}>（3）</CCell><CCell
                        colSpan={2}>（3）</CCell><CCell>（4）</CCell><CCell>（4）</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验内容</CCell><CCell colSpan={4}>轿厢导轨</CCell><CCell
                        colSpan={4}>对重导轨导轨垂直偏差</CCell><CCell>轿厢导轨</CCell><CCell>对重导轨</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>观测数据</CCell><CCell colSpan={2}>左侧导轨垂直偏差</CCell><CCell
                        colSpan={2}>右侧导轨垂直偏差</CCell><CCell rowSpan={2}>左侧</CCell><CCell
                        rowSpan={2}>右侧</CCell><CCell rowSpan={2}>左侧</CCell><CCell rowSpan={2}>右侧</CCell><CCell
                        rowSpan={2}>轨距偏差</CCell><CCell rowSpan={2}>轨距偏差</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell></CCell><CCell>顶面</CCell><CCell>侧面</CCell><CCell>顶面</CCell><CCell>侧面</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>层站</CCell><CCell
                        colSpan={4}>每列导轨工作面每5m铅垂线测量值间的相对最大偏差均应小于下列数值：0≤x≤1.2；</CCell><CCell
                        colSpan={2}>有安全钳：0≤x≤1.2</CCell><CCell
                        colSpan={2}>无安全钳：0≤x≤2</CCell><CCell>0≤x≤2</CCell><CCell>0≤x≤3</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell></CCell><CCell>轿厢左侧顶面</CCell><CCell>轿厢左侧侧面</CCell><CCell>轿厢右侧顶面</CCell><CCell>轿厢右侧侧面</CCell><CCell>对重左侧有钳</CCell><CCell>对重右侧有钳</CCell><CCell>对重左侧无钳</CCell><CCell>对重右侧无钳</CCell><CCell>轿厢轨距偏</CCell><CCell>对重轨距偏</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>测量结果</CCell><CCell colSpan={2}></CCell><CCell colSpan={2}></CCell><CCell
                        colSpan={2}></CCell><CCell colSpan={2}></CCell><CCell></CCell><CCell></CCell>
                    </TableRow>
                </TableBody></Table>
                {render导轨表}
                <hr/>
                上表最后的两行结果拆出来：
                <LineColumn column={6}>
                    <InputLine label={`3.6导轨C（3）轿厢导轨,左侧导轨垂直偏差-测量结果`}>
                        <Input value={inp?.['轿厢导轨z'] || ''}
                               onChange={e => setInp({...inp, 轿厢导轨z: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）轿厢导轨,右侧导轨垂直偏差-测量结果`}>
                        <Input value={inp?.['轿厢导轨y'] || ''}
                               onChange={e => setInp({...inp, 轿厢导轨y: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）轿厢导轨-检验结果`}>
                        <SelectHookfork value={inp?.轿厢导轨r || ''}
                                        onChange={e => setInp({
                                            ...inp,
                                            轿厢导轨r: e.currentTarget.value || undefined
                                        })}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,有安全钳-测量结果`}>
                        <Input value={inp?.['有钳v'] || ''}
                               onChange={e => setInp({...inp, 有钳v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,有安全钳-检验结果`}>
                        <SelectHookfork value={inp?.有钳r || ''}
                                        onChange={e => setInp({...inp, 有钳r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,无安全钳-测量结果`}>
                        <Input value={inp?.['无钳v'] || ''}
                               onChange={e => setInp({...inp, 无钳v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（3）对重导轨导轨垂直偏差,无安全钳-检验结果`}>
                        <SelectHookfork value={inp?.无钳r || ''}
                                        onChange={e => setInp({...inp, 无钳r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）轿厢导轨-测量结果`}>
                        <Input value={inp?.['偏轿厢v'] || ''}
                               onChange={e => setInp({...inp, 偏轿厢v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）轿厢导轨-检验结果`}>
                        <SelectHookfork value={inp?.偏轿厢r || ''}
                                        onChange={e => setInp({...inp, 偏轿厢r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）对重导轨-测量结果`}>
                        <Input value={inp?.['偏对重v'] || ''}
                               onChange={e => setInp({...inp, 偏对重v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label={`3.6导轨C（4）对重导轨-检验结果`}>
                        <SelectHookfork value={inp?.偏对重r || ''}
                                        onChange={e => setInp({...inp, 偏对重r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                注1：左右侧导轨的区别，对轿厢导轨以检验人员站在层门处面朝轿厢为参照，对对重导轨以检验人员面朝被测导轨为参照。<br/>
                注2：所抽检的层站需填写。抽检结果符合要求的，在测量结果填所测量的数值区间范围（min-max），并在相应项目检验结果内打“√”；抽检结果有不符合要求
                的，需填写不合格的观测数据，并在相应项目检验结果中打“×”。
            </InspectRecordLayout>
        );
    });


const item空间 = ['进导程', '自垂距', '轿顶间', '横梁间'];
const itemA空间 = ['空高差H', '进导程r', '自垂距r', '轿顶间r', '横梁间r'];
export const itemn空间=item空间.concat(itemA空间);
export const Headspace =
    React.forwardRef(({children, show, alone = true, refWidth, label}: Props, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(item空间, itemA空间,);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                {label}。 单位：m<br/>
                项目编号 3.2.1 C; 对重完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）：
                <InputLine label='对重完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）'>
                    <Input value={inp?.['空高差H'] || ''}
                           onChange={e => setInp({...inp, 空高差H: e.currentTarget.value || undefined})}/>
                </InputLine>
                <hr/>
                项目编号 3.2.1 C ① 轿厢导轨应提≥ 0.1+0.035V<sup>2</sup>的进一步制导行程（B<sub>1</sub>）
                <LineColumn column={6}>
                    <InputLine label='要求值B1'>
                        <Input value={inp?.['进导程o'] || ''}
                               onChange={e => setInp({...inp, 进导程o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C1）'>
                        <Input value={inp?.['进导程v'] || ''}
                               onChange={e => setInp({...inp, 进导程v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>对重完全压缩在缓冲 器上计算出的轿顶空间各个值
                        A1=C1-H= {floatInterception(inp?.['进导程v'] - inp?.['空高差H'], 3)}</Text>
                    <InputLine label={`3.2.1 C ①-判定结论`}>
                        <SelectHookfork value={inp?.进导程r || ''}
                                        onChange={e => setInp({...inp, 进导程r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.2.1 C ②
                轿顶可站人的最高面积的水平面与相应井道顶最低部件的水平面之间的自由垂直距离B<sub>2</sub>≥1.0+0.035V<sup>2</sup>
                <LineColumn column={6}>
                    <InputLine label='要求值B2'>
                        <Input value={inp?.['自垂距o'] || ''}
                               onChange={e => setInp({...inp, 自垂距o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C2）'>
                        <Input value={inp?.['自垂距v'] || ''}
                               onChange={e => setInp({...inp, 自垂距v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>对重完全压缩在缓冲 器上计算出的轿顶空间各个值
                        A2=C2-H= {floatInterception(inp?.['自垂距v'] - inp?.['空高差H'], 3)}</Text>
                    <InputLine label={`3.2.1 C ②-判定结论`}>
                        <SelectHookfork value={inp?.自垂距r || ''}
                                        onChange={e => setInp({...inp, 自垂距r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.2.1 C ③ 井道顶的最低部件与轿顶设备的最高部件之间的间距B<sub>3</sub>(不包括导靴、钢丝绳
                附件等)不小于0.3+0.035V<sup>2</sup>,与导靴或滚轮、 曳引绳附件、
                垂直滑动门的横梁或部件的最高部分之间的间距B<sub>4</sub>不小于0.1+0.035V<sup>2</sup>
                <LineColumn column={6}>
                    <InputLine label='要求值B3'>
                        <Input value={inp?.['轿顶间o'] || ''}
                               onChange={e => setInp({...inp, 轿顶间o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C3）'>
                        <Input value={inp?.['轿顶间v'] || ''}
                               onChange={e => setInp({...inp, 轿顶间v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>对重完全压缩在缓冲器上计算出的轿顶空间各个值
                        A3=C3-H= {floatInterception(inp?.['轿顶间v'] - inp?.['空高差H'], 3)}</Text>
                    <InputLine label='要求值B4'>
                        <Input value={inp?.['横梁间o'] || ''}
                               onChange={e => setInp({...inp, 横梁间o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <InputLine label='轿厢在上端站平层位置时所测量的各个轿顶空间个值（C4）'>
                        <Input value={inp?.['横梁间v'] || ''}
                               onChange={e => setInp({...inp, 横梁间v: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>对重完全压缩在缓冲器上计算出的轿顶空间各个值
                        A4=C4-H= {floatInterception(inp?.['横梁间v'] - inp?.['空高差H'], 3)}</Text>
                    <InputLine label={`3.2.1 C ③-判定结论`}>
                        <SelectHookfork value={inp?.横梁间r || ''}
                                        onChange={e => setInp({...inp, 横梁间r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
            </InspectRecordLayout>
        );
    });

const item底坑 = ['坑间1', '坑间2', '坑间3', '底距4', '底距5', '底距6', '底距7'];
const itemA底坑 = ['坑高差H', '坑间r', '底距4r', '底距5r', '底距6r', '底距7r'];
export const itemn底坑 =item底坑.concat(itemA底坑);
export const Pitspace =
    React.forwardRef(({children, show, alone = true, refWidth, label}: Props, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(item底坑, itemA底坑,);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                {label}。 单位：m<br/>
                项目编号 3.13 C; 轿厢完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）：
                <InputLine label='轿厢完全压缩在缓冲器上测出的层门地坎与轿门地坎的高差值（H）'>
                    <Input value={inp?.['坑高差H'] || ''}
                           onChange={e => setInp({...inp, 坑高差H: e.currentTarget.value || undefined})}/>
                </InputLine>
                <hr/>
                项目编号 3.13 C ① 底坑中有一个不小于 0.50m×0.60m×1.0m的空间（任一面朝下即可）；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值A1'>
                        <Input value={inp?.['坑间1o'] || ''}
                               onChange={e => setInp({...inp, 坑间1o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A1-H)= {floatInterception(inp?.['坑间1o'] - inp?.['坑高差H'], 2, 'ceil')}</Text>

                    <InputLine label='底坑空间值A2'>
                        <Input value={inp?.['坑间2o'] || ''}
                               onChange={e => setInp({...inp, 坑间2o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A2)= {floatInterception(inp?.['坑间2o'], 2, 'ceil')}</Text>
                    <InputLine label='底坑空间值A3'>
                        <Input value={inp?.['坑间3o'] || ''}
                               onChange={e => setInp({...inp, 坑间3o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A3)= {floatInterception(inp?.['坑间3o'], 2, 'ceil')}</Text>
                    <InputLine label={`3.13 C ①-判定结论`}>
                        <SelectHookfork value={inp?.坑间r || ''}
                                        onChange={e => setInp({...inp, 坑间r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.13 C ②第一部分检验内容与要求：底坑底面与轿厢最低部件的自由垂直距离不小于0.50m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,垂直距离A4'>
                        <Input value={inp?.['底距4o'] || ''}
                               onChange={e => setInp({...inp, 底距4o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A4-H)= {floatInterception(inp?.['底距4o'] - inp?.['坑高差H'], 2)}</Text>
                    <InputLine label={`3.2.1 C ②垂直距离A4-判定结论`}>
                        <SelectHookfork value={inp?.底距4r || ''}
                                        onChange={e => setInp({...inp, 底距4r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                项目编号 3.13 C ②第二部分检验内容与要求：当垂直滑动门的部件、护脚板和相邻井道壁之间，轿厢最低部件和导轨之间的水平距离在0.15m之内时，此垂直距离允许减少到0.10m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,垂直距离A5'>
                        <Input value={inp?.['底距5o'] || ''}
                               onChange={e => setInp({...inp, 底距5o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A5-H)= {floatInterception(inp?.['底距5o'] - inp?.['坑高差H'], 2)}</Text>
                    <InputLine label={`3.2.1 C ②垂直距离A5-判定结论`}>
                        <SelectHookfork value={inp?.底距5r || ''}
                                        onChange={e => setInp({...inp, 底距5r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                项目编号 3.13 C ②第三部分检验内容与要求：当轿厢最低部件和导轨之间的水平距离大于0.15m但小于0.50m
                时，此垂直距离可按线性关系增加至0.50m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,垂直距离A6'>
                        <Input value={inp?.['底距6o'] || ''}
                               onChange={e => setInp({...inp, 底距6o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A6-H)= {floatInterception(inp?.['底距6o'] - inp?.['坑高差H'], 2)}</Text>
                    <InputLine label={`3.2.1 C ②垂直距离A6-判定结论`}>
                        <SelectHookfork value={inp?.底距6r || ''}
                                        onChange={e => setInp({...inp, 底距6r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
                <hr/>
                项目编号 3.13 C ③ 底坑中固定的最高部件和轿厢最低部件之间的距离不小于 0.30m；
                <LineColumn column={6}>
                    <InputLine label='轿厢在下端站平层位置时所测量的各底坑空间值,距离A7'>
                        <Input value={inp?.['底距7o'] || ''}
                               onChange={e => setInp({...inp, 底距7o: e.currentTarget.value || undefined})}/>
                    </InputLine>
                    <Text>轿厢完全压缩在缓冲器上计算出的底坑空间各个值
                        (A7-H)= {floatInterception(inp?.['底距7o'] - inp?.['坑高差H'], 2)}</Text>
                    <InputLine label={`3.2.1 C ③距离A7-判定结论`}>
                        <SelectHookfork value={inp?.底距7r || ''}
                                        onChange={e => setInp({...inp, 底距7r: e.currentTarget.value || undefined})}/>
                    </InputLine>
                </LineColumn>
            </InspectRecordLayout>
        );
    });

export const itemA现场 = ['检验条件'];
/**类似通用的二维表格，但有不同点：必须有一个关键字段唯一性判定；互动流程稍微有差别。适合小数量数据集合。 aDateObj直接倒手...inp;同一个对象参考inp?.检验条件?.find()。
 * */
export const SiteConditionElev =
    React.forwardRef((
        {children, show, alone = true, refWidth, label}: Props, ref
    ) => {
        const theme = useTheme();
        const [getInpFilter] = useMeasureInpFilter(null, itemA现场,);
        const {inp, setInp} = useItemInputControl({ref});
        const [floor, setFloor] = React.useState<string | null>(null);
        const aDateObj = inp?.检验条件?.find((t: any) => t.d === floor);
        // const naDateObjs=inp?.检验条件?.filter((t:any)=>t.d!==floor)||[];        //【约束】d日期：必须作唯一性关键字；
        const dateBlurRef = React.useRef(null);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">
                    {label}
                </Text>
                1、机房或者机器设备间的空气温度保持在5℃～40℃之间；（单位：℃）<br/>
                2、电源输入电压波动在额定电压值±7％的范围内；（单位：V ）<br/>
                3、环境空气中没有腐蚀性和易燃性气体及导电尘埃；<br/>
                4、检验现场（主要指机房或者机器设备间、井道、轿顶、底坑）清洁，没有与电梯工作无关的物品和设备，基站、相关层站等检验现场放置表明正在进行检验的警示牌；<br/>
                5、对井道进行了必要的封闭。
                <hr/>
                <div>
                    现场检验条件确认结果的记录:
                    <Table css={{borderCollapse: 'collapse'}} tight miniw={800}>
                        <TableBody>
                            <TableRow>
                                <CCell>确认日期</CCell>
                                <CCell>1、机房的空气温度</CCell>
                                <CCell>2、电源输入电压</CCell>
                                <CCell>3、环境空气中没有腐蚀性</CCell>
                                <CCell>4、现场没有与工作无关的物品，放警示牌</CCell>
                                <CCell>5、井道进行了封闭</CCell>
                            </TableRow>
                            {inp?.检验条件?.map((obj: any, i: number) => {
                                return <TableRow key={i}>
                                    <CCell>{obj?.d}</CCell>
                                    <CCell>{obj?.T || ''}</CCell>
                                    <CCell>{obj?.V || ''}</CCell>
                                    <CCell>{obj?.y || ''}</CCell>
                                    <CCell>{obj?.x || ''}</CCell>
                                    <CCell>{obj?.f || ''}</CCell>
                                </TableRow>
                            })}
                        </TableBody>
                    </Table>
                </div>
                <>新增检查确认时间=＞</>
                <LineColumn>
                    <InputLine label='首先设置当前检验日期'>
                        <SuffixInput type='date' onPointerOut={(e: any) => {
                            // @ts-ignore
                            dateBlurRef!.current!.focus();
                        }}
                                     value={floor || ''} onSave={txt => setFloor(txt || null)}>
                            <ButtonRefComp disabled={aDateObj || !floor} ref={dateBlurRef}
                                           onPress={() => setInp({
                                               ...inp,
                                               检验条件: (inp?.检验条件 ? [...inp?.检验条件, {d: floor}] : [{d: floor}])
                                           })}
                            >新增</ButtonRefComp>
                            <Button disabled={!aDateObj || !floor}
                                    css={{marginTop: theme.spaces.sm}} size="sm"
                                    onPress={() => setInp({
                                        ...inp,
                                        检验条件: [...inp?.检验条件?.filter((t: any) => t.d !== floor)],
                                    })}
                            >刪除</Button>
                        </SuffixInput>
                    </InputLine>
                    <InputLine label={`1、机房的空气温度(${floor})`}>
                        <SuffixInput value={aDateObj?.T || ''} onSave={txt => {
                            if (floor && aDateObj) {
                                aDateObj.T = txt;
                                setInp({...inp});
                            }
                        }}>℃</SuffixInput>
                    </InputLine>
                    <InputLine label={`2、电源输入电压(${floor})`}>
                        <SuffixInput value={aDateObj?.V || ''} onSave={txt => {
                            if (floor && aDateObj) {
                                aDateObj.V = txt;
                                setInp({...inp});
                            }
                        }}>V</SuffixInput>
                    </InputLine>
                    <InputLine label={`3、环境空气中没有腐蚀性(${floor})`}>
                        <SelectPair value={aDateObj?.y || ''} dlist={现场条件选} onChange={e => {
                            if (floor && aDateObj) {
                                aDateObj.y = e.currentTarget.value || undefined;
                                setInp({...inp});
                            }
                        }}/>
                    </InputLine>
                    <InputLine label={`4、现场没有与工作无关的物品，放警示牌(${floor})`}>
                        <SelectPair value={aDateObj?.x || ''} dlist={现场条件选} onChange={e => {
                            if (floor && aDateObj) {
                                aDateObj.x = e.currentTarget.value || undefined;
                                setInp({...inp});
                            }
                        }}/>
                    </InputLine>
                    <InputLine label={`5、井道进行了封闭(${floor})`}>
                        <SelectPair value={aDateObj?.f || ''} dlist={现场条件选} onChange={e => {
                            if (floor && aDateObj) {
                                aDateObj.f = e.currentTarget.value || undefined;
                                setInp({...inp});
                            }
                        }}/>
                    </InputLine>
                </LineColumn>
                注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
            </InspectRecordLayout>
        );
    });

/**注意这里的ref不是窗口<DIV ref={ref}>的哪一个;而是 React.useRef<InternalItemHandResult>(null)类似的传递数据和接口函数的,不是一个东西;
 * 简易版的原始记录打印：末尾增加文本“三、检验记录”。 #支持cb.toTail的部分跳出单列尾部布局。
 * */
// export const DeviceSurvey =
//     React.forwardRef((
//         {children, show, alone = true, refWidth, label, config}: Props, ref
//     ) => {
//         const [surveyItems, itemA设备概况] = React.useMemo(() => {
//             const surveyItems = [] as any;          //布局2排的，转为正常的1排列表
//             config?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
//                 const [desc2, name2, cb2] = add2p || [];
//                 //【关键】名字变体,{n:'型试样机',t:'b'} 对象含义 .t：有几种情况t='b'布尔;='d'日期;='l'列表;默认是Input ,若又有u字段是单位辨识，就是附加后缀的input;另外l字段是文本数组[];r是文本代数据库:替代。t='n'纯数字,’m‘多行备注
//                 if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, desc, cb});
//                 else if (typeof name === 'object' && name.n && !name.r) surveyItems.push({
//                     name: name.n,
//                     desc,
//                     cb,
//                     type: name.t,
//                     unit: name.u,
//                     list: name.l
//                 });
//                 if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({
//                     name: name2,
//                     desc: desc2,
//                     cb: cb2
//                 });
//                 else if (typeof name2 === 'object' && name2.n && !name2.r) surveyItems.push({
//                     name: name2.n,
//                     desc: desc2,
//                     cb: cb2,
//                     type: name2.t,
//                     unit: name2.u,
//                     list: name2.l
//                 });
//             });
//             const itemA设备概况: string[] = [];
//             //初始化 存储字段
//             surveyItems.forEach(({name, cb}: any, i: number) => {
//                 if (cb?.names) itemA设备概况.push(...cb?.names);
//                 else itemA设备概况.push(name);
//             });
//             return [surveyItems, itemA设备概况];
//         }, [config]);
//         const [getInpFilter] = useMeasureInpFilter(null, itemA设备概况,);
//         const {inp, setInp} = useItemInputControl({ref});
//         //若有 备注 必须配置在最后一个的。
//         const lastAiObj = surveyItems[surveyItems.length - 1];
//         const isMemoLast = lastAiObj?.type === 'm';
//         const toTailNodes: React.ReactNode[]=[];
//         return (
//             <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
//                                  alone={alone} label={label??'二、设备概况'}>
//                 设备概况除在台账业务信息中可修改外还需修改的部分:
//                 <LineColumn column={4}>
//                     {
//                         surveyItems.map(({name, desc, cb, type, unit, list}: any, i: number) => {
//                             if(isMemoLast && (surveyItems.length-1)===i)  return null;
//                             if (cb?.edit) {
//                                 if(!cb?.toTail)
//                                     return <React.Fragment key={i}>{ cb.edit(inp, setInp) }</React.Fragment>;
//                                 else{
//                                     const aNode=<React.Fragment key={i}>
//                                         <Text>{cb?.toTail}：</Text>
//                                         { cb.edit(inp, setInp) }
//                                     </React.Fragment>;
//                                     toTailNodes.push(aNode);
//                                 }
//                             } else if (type === 'l') return <InputLine key={i} label={desc}>
//                                 <InputDatalist value={(inp?.[name]) || ''} datalist={list}
//                                                onListChange={v => {
//                                                    setInp({...inp, [name]: v || undefined});
//                                                }}/>
//                             </InputLine>;
//                             else if (type === 'd') return <InputLine key={i} label={desc}>
//                                 <Input value={inp?.[name] || ''} type='date'
//                                        onChange={e => setInp({...inp, [name]: e.currentTarget.value})}/>
//                             </InputLine>;
//                             else if (type === 'b') return <InputLine key={i} label={desc}>
//                                 <CheckSwitch checked={inp?.[name] || false}
//                                              onChange={e => setInp({...inp, [name]: inp?.[name] ? undefined : true})}/>
//                             </InputLine>;
//                             else if (type === 'B') return <InputLine key={i} label={desc}>
//                                 <BlobInputList value={inp?.[name] || ''} datalist={list}
//                                                onListChange={v => setInp({...inp, [name]: v || undefined})}/>
//                             </InputLine>;
//                             else if (type === 'm') return <div key={i}>{desc}:
//                                 <TextArea value={inp?.[name] || ''} rows={4}
//                                           onChange={e => setInp({...inp, [name]: e.currentTarget.value || undefined})}/>
//                             </div>;
//                             else if (unit) return <InputLine key={i} label={desc}>
//                                 <SuffixInput value={inp?.[name] || ''}
//                                              onSave={txt => setInp({...inp, [name]: txt || undefined})}
//                                              type={type === 'n' ? "number" : undefined}>{unit}</SuffixInput>
//                             </InputLine>;
//                             else return <InputLine label={desc + `:`} key={i}>
//                                     <Input value={inp?.[name] || ''} type={type === 'n' ? "number" : undefined}
//                                            onChange={e => {
//                                                setInp({...inp, [name]: e.currentTarget.value || undefined});
//                                            }}/>
//                                 </InputLine>;
//                         })
//                     }
//                 </LineColumn>
//
//                 {toTailNodes}
//
//                 { isMemoLast && <>
//                     {lastAiObj.desc}:
//                     <TextArea value={inp?.[lastAiObj.name] || ''} rows={5}
//                               onChange={e => setInp({...inp, [lastAiObj.name]: e.currentTarget.value || undefined})}/>
//                 </>
//                 }
//                 {!alone && show && <>
//                     <hr/>
//                     <Text variant="h5">
//                         三、检验记录
//                     </Text>
//                 </>
//                 }
//             </InspectRecordLayout>
//         );
//     });

interface DeviceSurveyProps extends InternalItemProps {
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    //config?: any[];    //有配置模式的
    config: ( (verId:string)=>any[] ) | any[];
    //开始申明提示：
    desc?: any;
}
/**只能两列的概况布局，简易版的：
 * 注意这里的ref不是窗口<DIV ref={ref}>的哪一个;而是 React.useRef<InternalItemHandResult>(null)类似的传递数据和接口函数的,不是一个东西;
 * 简易版的原始记录打印：末尾增加文本“三、检验记录”。
 * 【关键】name变体,{n:'型试样机',t:'b'} 对象含义 .t：有几种情况t='b'布尔;='d'日期;='l'列表;默认是Input ,若又有u字段是单位辨识，就是附加后缀的input;另外l字段是文本数组[];r是文本代数据库:替代。t='n'纯数字,’m‘多行备注
 * */
export const DeviceSurvey =
React.forwardRef((
    {children, show, alone = true, refWidth,label,config,verId,desc}: DeviceSurveyProps, ref
) => {
    const [surveyItems, itemA设备概况] = React.useMemo(() => {
        const surveyItems = [] as any;          //布局2排的，转为正常的1排列表
        const newconfig=typeof config ==='function'? config(verId!) : config;
        newconfig?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
            const [desc2, name2, cb2] = add2p || [];
            if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, desc, cb});
            else if (typeof name === 'object' && name.n && !name.r) surveyItems.push({name: name.n, desc, cb, type: name.t, unit: name.u, list: name.l});
            if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({name: name2, desc: desc2, cb: cb2});
            else if (typeof name2 === 'object' && name2.n && !name2.r) surveyItems.push({name: name2.n, desc: desc2, cb: cb2, type: name2.t, unit: name2.u, list: name2.l});
        });
        const itemA设备概况: string[] = [];
        //初始化 存储字段
        surveyItems.forEach(({name,cb}: any, i: number) => {
            if(cb?.names){
                let newArr = cb?.names.map((item: string) => {
                    if (item.startsWith('_$')) {
                        return item.slice(2);
                    }
                    return item;
                });
                itemA设备概况.push(...newArr);
            }
            else  itemA设备概况.push(name);
        });
        return [surveyItems, itemA设备概况];
    }, [config,verId]);
    const [getInpFilter] = useMeasureInpFilter(null, itemA设备概况,);
    const {inp, setInp} = useItemInputControl({ref});
    //若有 备注 必须配置在最后一个的。
    const lastAiObj=surveyItems[surveyItems.length-1];
    const isMemoLast= lastAiObj?.type==='m';
    const toTailNodes: React.ReactNode[]=[];
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label??'二、设备概况'}>
            {desc? desc : '设备概况除在台账业务信息中可修改外还需修改的部分'}:
            <LineColumn column={4}>
                {
                    surveyItems.map(({name, desc, cb, type, unit, list}: any, i: number) => {
                        if(isMemoLast && (surveyItems.length-1)===i)  return null;
                        if (cb?.edit) {
                            if(!cb?.toTail)
                                return <React.Fragment key={i}>{ cb.edit(inp, setInp) }</React.Fragment>;
                            else{
                                const aNode=<React.Fragment key={i}>
                                    <Text>{cb?.toTail}：</Text>
                                    { cb.edit(inp, setInp) }
                                </React.Fragment>;
                                toTailNodes.push(aNode);
                            }
                        } else if (type === 'l') return <InputLine key={i} label={desc}>
                            <InputDatalist value={(inp?.[name]) || ''} datalist={list}
                                           onListChange={v => {
                                               setInp({...inp, [name]: v || undefined});
                                           }}/>
                        </InputLine>;
                        else if (type === 'd') return <InputLine key={i} label={desc}>
                            <Input value={inp?.[name] || ''} type='date'
                                   onChange={e => setInp({...inp, [name]: e.currentTarget.value})}/>
                        </InputLine>;
                        else if (type === 'b') return <InputLine key={i} label={desc}>
                            <CheckSwitch checked={inp?.[name] || false}
                                         onChange={e => setInp({...inp, [name]: inp?.[name] ? undefined : true})}/>
                        </InputLine>;
                        else if (type === 'B') return <InputLine key={i} label={desc}>
                            <BlobInputList value={inp?.[name] || ''} datalist={list}
                                           onListChange={v => setInp({...inp, [name]: v || undefined})}/>
                        </InputLine>;
                        else if (type === 'm') return <div key={i}>{desc}:
                            <TextArea value={inp?.[name] || ''} rows={4}
                                      onChange={e => setInp({...inp, [name]: e.currentTarget.value || undefined})}/>
                        </div>;
                        else if (unit) return <InputLine key={i} label={desc}>
                            <SuffixInput value={inp?.[name] || ''}
                                         onSave={txt => setInp({...inp, [name]: txt || undefined})}
                                         type={type === 'n' ? "number" : undefined}>{unit}</SuffixInput>
                        </InputLine>;
                        else return <InputLine label={desc + `:`} key={i}>
                                <Input value={inp?.[name] || ''} type={type === 'n' ? "number" : undefined}
                                       onChange={e => {
                                           setInp({...inp, [name]: e.currentTarget.value || undefined});
                                       }}/>
                            </InputLine>;
                    })
                }
            </LineColumn>
            {toTailNodes}
            { isMemoLast && <>
                {lastAiObj.desc}:
                <TextArea value={inp?.[lastAiObj.name] || ''} rows={5}
                          onChange={e => setInp({...inp, [lastAiObj.name]: e.currentTarget.value || undefined})}/>
             </>
            }
            { children }
            {!alone && show && <>
                <hr/>
                <Text variant="h5">
                    三、检验记录
                </Text>
            </>
            }
        </InspectRecordLayout>
    );
});


