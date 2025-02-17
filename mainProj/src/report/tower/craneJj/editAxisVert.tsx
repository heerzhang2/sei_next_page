/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, BlobInputList, Input,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import { objNestSet} from "../../../common/tool";

//新的通用配置模型
//标题区最大列数确定的：总体每一行配置如下的[name,titl[{t:'',s: 3}],item,unit]形式；其中titl可变的长度。t是文本,s是跨越几行的TD数默认=1。unit默认='';item=必须有的主标题描述。
export const items监控设施 = [
    ['独轴X', [{t:'独立状态塔身（或附着状态下最高附着点以上塔身）轴心线',s: 2}  ], '0°（X方向）', undefined],
    ['独轴Y', [{} ],  '90°（Y方向）', ],
    ['轴心X', [{t:'最高附着点以下塔身轴心线',s: 2}  ], '0°（X方向）', undefined],
    ['轴心Y', [{} ],  '90°（Y方向）', ],
];

export const itemA轴垂直度: string[] = ['垂直备注'];
items监控设施.forEach(([name, title, initIsp], i: number) => {
    itemA轴垂直度.push(name as string);

});
interface Props extends InternalItemProps {
    label?: string;
    titles?: any[];
    noZj?: boolean;
}
/** 对应报告MonitoringFaciliVw组件。
 * */
export const AxisVert =
    React.forwardRef((
        {children, show, alone = true, redId, nestMd, label,noZj}: Props, ref
    ) => {
        let oldTitle1: any;
        let oldTitle2: any;
        const [getInpFilter] = useMeasureInpFilter(null, itemA轴垂直度,);
        const {inp, setInp} = useItemInputControl({ref});
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}：</Text>
            {items监控设施.map(([name, titlps, item, unit]: any, i: number) => {
                //前缀可支持三个附加列配置的；
                const [{t: title}, more2, more3] = titlps?.length > 0 ? titlps : ([{}] as any);
                const {t: title2} = more2 || {};
                const {t: title3} = more3 || {};
                oldTitle1 = titlps?.length >= 1 ? (title ? title : oldTitle1) : '';
                oldTitle2 = titlps?.length >= 2 ? (title2 ? title2 : oldTitle2) : '';
                return (<React.Fragment key={i}>
                    <div css={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                        <Text>项目{i + 1} {title ?? oldTitle1} - {title2 ?? oldTitle2} {'>'} {title3} {title3 && '>'} {item}：</Text>

                        &nbsp;上部测量点标尺读数L1
                        <Input value={inp?.[name]?.o || ''} style={{display: 'inline-flex', width: '5rem'}}
                               onChange={e => objNestSet(name, 'o', e.currentTarget.value, inp, setInp)}/>mm
                        &nbsp;下部测量点标尺读数L2
                        <Input value={inp?.[name]?.t || ''} style={{display: 'inline-flex', width: '5rem'}}
                               onChange={e => objNestSet(name, 't', e.currentTarget.value, inp, setInp)}/>mm
                        &nbsp;两个测量点的高度差ΔH
                        <Input value={inp?.[name]?.d || ''} style={{display: 'inline-flex', width: '6rem'}}
                               onChange={e => objNestSet(name, 'd', e.currentTarget.value, inp, setInp)}/>mm
                        &nbsp;侧向垂直度(%)△L=|L1-L2|/△H
                        <Input value={inp?.[name]?.L || ''} style={{display: 'inline-flex', width: '4rem'}}
                               onChange={e => objNestSet(name, 'L', e.currentTarget.value, inp, setInp)}/>%
                        &nbsp;检验结果
                        <SelectHookfork value={inp?.[name]?.r || ''} onChange={e => {
                            objNestSet(name, 'r', e.currentTarget.value || undefined, inp, setInp)
                        }}/>
                    </div>
                </React.Fragment>);
            })}
            <hr/>
            <div>备注:
                <BlobInputList value={inp?.['垂直备注'] || ''} rows={3}
                               onListChange={v => setInp({...inp, 垂直备注: v || undefined})}/>
            </div>
            {!noZj && <Text css={{fontSize: '0.75rem'}}>
                注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
                2、上部测量点、下部测量点的标尺方向应一致。
                3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            </Text>
            }
        </InspectRecordLayout>;
    });
