/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, BlobInputList, Input,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";

//套用通用配置模型， 只有一行的，+ 表格"横竖 翻转"： 但是titl都是空的[];
//标题区最大列数确定的：总体每一行配置如下的[name,titl[{t:'',s: 3}],item,unit]形式；其中titl可变的长度。t是文本,s是跨越几行的TD数默认=1。unit默认='';item=必须有的主标题描述。
export const items静态刚度 = [
    ['空根L1', [], '空载时起重臂根部连接处（铰点）位置L1', 'mm'],
    ['额根L2', [],  '额定载荷时起重臂根部连接处（铰点）位置L2', 'mm'],
    ['根附垂距', [], '塔式起重机最大独立状态下起重臂根部连接处（铰点）至塔式起重机基准面（无附着时的塔式起重机）或最高附着点（有附着时的塔式起重机）的垂直距离H', 'm'],
    ['水平静移', [],  '塔身臂根铰点的水平静位移△L=(L2-L1)', 'mm'],
    ['要134', [],  '要求值(1.34H%)', 'mm'],
];

export const itemA静态刚度: string[] = ['静刚r','静刚备注'];
items静态刚度.forEach(([name, title, initIsp], i: number) => {
    itemA静态刚度.push(name as string);

});
interface Props extends InternalItemProps {
    label?: string;
    titles?: any[];
}

export const Stiffness =
    React.forwardRef((
        {children, show, alone = true, redId, nestMd, label,}: Props, ref
    ) => {
        let oldTitle1: any;
        let oldTitle2: any;
        const [getInpFilter] = useMeasureInpFilter(null, itemA静态刚度,);
        const {inp, setInp} = useItemInputControl({ref});
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text variant="h5">{label}：</Text>
            {items静态刚度.map(([name, titlps, item, unit]: any, i: number) => {
                //前缀可支持三个附加列配置的；
                const [{t: title}, more2, more3] = titlps?.length > 0 ? titlps : ([{}] as any);
                const {t: title2} = more2 || {};
                const {t: title3} = more3 || {};
                oldTitle1 = titlps?.length >= 1 ? (title ? title : oldTitle1) : '';
                oldTitle2 = titlps?.length >= 2 ? (title2 ? title2 : oldTitle2) : '';
                return (<React.Fragment key={i}>
                    <div css={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                        <Text>项目{i + 1} {title ?? oldTitle1} - {title2 ?? oldTitle2} {'>'} {title3} {title3 && '>'} {item}：</Text>
                        &nbsp; &nbsp;
                        <Input value={inp?.[name] || ''} style={{display: 'inline-flex', width: '6rem'}}
                               onChange={e => setInp({...inp, [name]: e.currentTarget.value || undefined})}/>{unit}
                    </div>
                </React.Fragment>);
            })}
            <hr/>
            <div css={{display: 'flex',alignItems: 'center',justifyContent:'space-evenly',maxWidth:'28rem',margin:'auto'}}>
                C4.3.2.5检验结果：
                <SelectHookfork value={inp?.静刚r || ''} onChange={e => {
                    setInp({...inp, 静刚r: e.currentTarget.value || undefined})
                }}/>
            </div>
            <div>备注:
                <BlobInputList value={inp?.['静刚备注'] || ''} rows={3}
                               onListChange={v => setInp({...inp, 静刚备注: v || undefined})}/>
            </div>
            <Text css={{fontSize: '0.75rem'}}>
                注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
                2、上部测量点、下部测量点的标尺方向应一致。
                3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            </Text>
        </InspectRecordLayout>;
    });
