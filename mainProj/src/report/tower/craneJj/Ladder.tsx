/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableHead, TableRow, Text, TextArea,} from "customize-easy-ui-component";
import {InspectRecordLayout, RepLink, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {EachMeasureItemConfig,} from "../../common/measure";
import {ObservationMeasureProps} from "../../gantry/editorDj";
import {useMeasureItem, useMeasureRow, useMeasureTable} from "../../hook/useMeasure";

export const config梯子 = [
    [{n: '台净高', t: ['（1）通道与平台','通道、斜梯和平台的净空高度'], u: 'm', c: '四'}],
    [{n: '台净宽', t: [undefined,'运动部分附近的通道和平台的净宽度'], c: '四'}],
    [{n: '高不净宽', t: [undefined,'如果设有扶手或者栏杆，在高度不超过0.6m的范围内，通道的净宽度'], c: '四'}],
    [{n: '固道净宽', t: [undefined,'固定部分之间的通道净宽度'], c: '四'}],
    [{n: '少使高', t: [undefined,'起重机械结构件内部很少使用的进出通道','最小净空高度'], c: '四'}],
    [{n: '少使道宽', t: [undefined,undefined,'通道净宽度'], c: '四'}],
    [{n: '维保净高', t: [undefined,'只用于维护保养的平台，其上面的净空高度'], c: '四'}],
    [{n: '缝隙最宽', t: [undefined,'通道基面上缝隙长度等于或者大于200mm时，其最大宽度'], u: 'mm', c: '四'}],
    [{n: '动线上距', t: [undefined,'通道区域与裸露动力线，上方距离'], u: 'm', c: '四'}],
    [{n: '动线左右', t: [undefined,'通道区域与裸露动力线，左右距离'], c: '四'}],
    [{n: '动线下距', t: [undefined,'通道区域与裸露动力线，下方距离'], c: '四'}],
    [{n: '一休高', t: [undefined,'第一个休息小平台处的高度'], c: '四'}],
    [{n: '休间高', t: [undefined,'休息小平台间隔高度'], c: '四'}],
    [{n: '休踏板距', t: [undefined,'休息小平台平面距下面第一个梯级踏板或踏杆的中心线距离'],u: 'mm', c: '四'}],
    [{n: '洞宽', t: [undefined,'梯子不中断，不中断护圈供操作人员出入洞口尺寸','洞口宽度'], u: 'm',c: '四'}],
    [{n: '洞高', t: [undefined,undefined,'洞口高度'], c: '四'}],
    [{n: '斜梯角', t: ['（2）梯子与栏杆','斜梯','斜梯的倾斜角'], u: '°', c: '四'}],
    [{n: '斜栏间距', t: [undefined,undefined,'主要斜梯栏杆的间距'], u: 'm', c: '四'}],
    [{n: '他斜栏间', t: [undefined,undefined,'其他斜梯栏杆的间距'], c: '四'}],
    [{n: '斜靠栏高', t: [undefined,undefined,'斜梯的一侧靠墙壁时，栏杆高度'], c: '四'}],
    [{n: '梯级宽', t: [undefined,undefined,'梯级的净宽度'], c: '四'}],
    [{n: '梯级高', t: [undefined,undefined,'单个梯级的高度'], c: '四'}],
    [{n: '梯级进深', t: [undefined,undefined,'梯级的进深'], c: '四'}],
    [{n: '直撑杆间', t: [undefined,'直梯','直梯两侧撑杆的间距'], c: '四'}],
    [{n: '撑梯级宽', t: [undefined,undefined,'两侧撑杆之间梯级宽度'], c: '四'}],
    [{n: '直梯级间', t: [undefined,undefined,'梯级的间距'], c: '四'}],
    [{n: '直梯固距', t: [undefined,undefined,'梯级与固定结构件距离'], c: '四'}],
    [{n: '直护圈径', t: [undefined,undefined,'从高处有跌落危险的直梯，护圈直径'], c: '四'}],
    [{n: '直杆高出', t: [undefined,undefined,'直梯的两边撑杆比最上一个梯级高出的高度'], c: '四'}],
    [{n: '栏垂高', t: [undefined,'栏杆的垂直高度'], u: 'm', c: '四'}],
    [{n: '脚板高', t: [undefined,'踢脚板高度'], c: '四'}],
    [{n: '栏中间距', t: [undefined,'中间横杆，其与踢脚板或者栏杆的距离'], c: '四'}],
    [{n: '栏不道高', t: [undefined,'对净高不超过1.3m的通道，栏杆的高度'], c: '四'}],
    [{n: '扶手断长', t: [undefined,'沿建筑物墙壁或者实体墙结构设有的通道，允许用扶手代替栏杆，扶手的中断长度'], c: '四'}],
    [{n: '围绳高', t: [undefined,'护绳(如钢丝绳、链条)，高度'], c: '四'}],
    [{check: 'C3.7.4'}],
] as EachMeasureItemConfig[][];

//需加  '梯子备注'
export const Ladder =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,iAname}: ObservationMeasureProps, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        const {itemObservation, itemObservationA,}=useMeasureItem(config as EachMeasureItemConfig[][],false);
        const {render}=useMeasureRow(inp,setInp, config as EachMeasureItemConfig[][], false ,false);
        // const {render,itemObservation, itemObservationA,}=useMeasureOldVer(inp,setInp, config as EachMeasureItemConfig[][], false ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, '梯子备注'];
        }, [itemObservationA]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">{label}</Text>
                { render }
                备注：
                <TextArea  value={inp?.梯子备注 ||''} rows={3}
                           onChange={e => setInp({ ...inp, 梯子备注: e.currentTarget.value||undefined}) } />
                { children ? children
                    :
                    <Text>注：1、对于不合格的值才需测量和记录，未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。<br/>
                        2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                    </Text>
                }
            </InspectRecordLayout>
        );
} );
/**安全距离记录 ；报告可打印的 测量：支持更大可能的复用性。 用了Hook就需要正规的React组件模式来做。
 * @param label 允许注入任意的DOM节点，不仅是字符串的。
 * */
export const LadderVw = ({children, orc, rep, label, config,fixed=["4%", "8%","16%", "17%", "%", "5%", "10%", "9%", "6%"]}:
                      { orc: any, rep: any, label: any, children?: any, config?: any[],fixed?:string[] }
) => {
    const renderMeasure = useMeasureTable({rep, orc,  config: config ?? config梯子});
    // const renderMeasure = useMeasureCTable({rep, orc, config: config ?? config梯子});
    return <>
        <div css={{"@media print": {paddingBottom: '5rem', pageBreakInside: 'avoid'}}}>
            {typeof label === 'object' ? <>{label}</>
                :
                <Text variant="h4" css={{
                    marginTop: '1rem',
                }}>{label}</Text>
            }
        </div>
        <Table id={'Ladder'} fixed={fixed}
               css={{borderCollapse: 'collapse', "@media print": {marginTop: '-5rem'}}} tight miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell><Text css={{fontSize: '0.6rem'}}>序号</Text></CCell><CCell
                    colSpan={4}>检验项目</CCell><CCell>单位</CCell><CCell>观测值</CCell>
                    <CCell>结果值</CCell><CCell><Text css={{fontSize: '0.6rem'}}>检验结果</Text></CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'Ladder'}>
                    {renderMeasure}
                    <TableRow>
                        <CCell>备注</CCell>
                        <Cell colSpan={8}>
                            <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                                {orc.梯子备注 || '／'}
                            </div>
                        </Cell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        {children ? children
            :
            <Text css={{fontSize: '0.8rem'}}>
                注：1、对于不合格的值才需测量和记录，未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。<br/>
                2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            </Text>
        }
    </>;
};
