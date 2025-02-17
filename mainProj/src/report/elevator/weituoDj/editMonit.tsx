/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, BlobInputList, InputIdProvider,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import { objNestSet} from "../../../common/tool";

//新的通用配置模型
//标题区最大列数确定的：总体每一行配置如下的[name,titl[{t:'',s: 3}],item,unit]形式；其中titl可变的长度。t是文本,s是跨越几行的TD数默认=1。unit默认='';item=必须有的主标题描述。
export const items监控设施 = [
    ['视频监', [{t:'视频监控设施',s: 1},{t:'( 1 )',}], '公众聚集场所的电梯和住宅小区的电梯，应当配备符合有关规定和标准的视频监控设施。', undefined],
    ['远程监', [{t:'远程监测装置', s: 1},{t:'( 1 )',s: 1},], '乘客电梯应当配备能够实现远程监测功能的装置（指监督检验时已按《条例》要求配置和其他自行配置的远程监测装置），并提供标准数据接口。', ],
    ['降温措', [{t:'机房通风降温措施',},{t:'( 1 )',s: 1}], '采取在机房安装空调等通风降温措施，保证电梯机房内温度符合相关标准要求。' ],
];

export const itemA监控设施: string[] = ['工作备注'];
items监控设施.forEach(([name, title, initIsp], i: number) => {
    itemA监控设施.push(name as string);

});
interface Props extends InternalItemProps {
    label?: string;
    titles?: any[];
    //拆分的标签号码； 序号，以0为起点
    part?: number;
}
/** 对应报告MonitoringFaciliVw组件。
 * */
export const MonitoringFacili =
    React.forwardRef((
        {children, show, alone = true, redId, nestMd, label, part}: Props, ref
    ) => {
        let oldTitle1: any;
        let oldTitle2: any;
        const [getInpFilter] = useMeasureInpFilter(null, itemA监控设施,);
        const {inp, setInp} = useItemInputControl({ref});
        return <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
                                    nestMd={nestMd} alone={alone} label={label!}>
            <Text>{label}：</Text>
            { items监控设施.map(([name,titlps,item,unit]: any, i:number) => {
                //前缀可支持三个附加列配置的；
                const [{t: title},more2,more3]=titlps?.length>0? titlps : ([{}] as any);
                const  {t: title2}=more2 || {};
                const  {t: title3}=more3 || {};
                oldTitle1= titlps?.length>=1? (title? title:oldTitle1) : '';
                oldTitle2= titlps?.length>=2? (title2? title2:oldTitle2) : '';
                return (<React.Fragment key={i}>
                    <div css={{display: 'flex',flexWrap:'wrap',alignItems:'center'}}>
                        <Text>项目{i+1} {title??oldTitle1} - {title2??oldTitle2} {'>'} {title3} {title3&&'>'} {item}：</Text>
                        检验结果
                        <SelectHookfork value={inp?.[name]?.r || ''} onChange={e => {
                            objNestSet(name,'r', e.currentTarget.value||undefined,inp,setInp)
                        }}/>
                        &nbsp;存在问题描述
                        <InputIdProvider>
                            <BlobInputList value={inp?.[name]?.P || ''} datalist={[]}
                                           style={{display: 'inline-flex', width: '15rem'}}
                                           onListChange={v => objNestSet(name,'P', v||undefined,inp,setInp) } />
                        </InputIdProvider>
                    </div>
                </React.Fragment>);
            })}
            <hr/>
            备注：1.检查依据:《福建省电梯安全管理条例》；<br/>
            2.本附录所列项目检查结果不作为整机结论判定依据。
        </InspectRecordLayout>;
    });

/*
<InputDatalist value={(inp?.[name]?.c) || ''} datalist={监检方法选}
                   style={{display: 'inline-flex', width: '5rem'}}
                   onListChange={v => objNestSet(name,'c', v||undefined,inp,setInp) } />
<MemoDateInput value={inp?.[name]?.d || ''}
               onChange={v => objNestSet(name,'d', v||undefined,inp,setInp) } />
* */
