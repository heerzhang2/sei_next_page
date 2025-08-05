import * as React from "react";
import {InternalItemProps, OriginalViewProps} from "@/report/common/base";
import {createItem} from "@/report/common/eHelper";
import {DeviceSurveyD} from "@/report/common/survey";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {Explanatory} from "@/report/power/boilInstall/Explanatory";
import {ConclusionBoiler, itemA结论} from "@/report/power/boilInstall/Conclusion";
import {CertMemo} from "@/report/power/boilInstall/CertMemo";
import {BoilerDiagram, itemA简图} from "@/report/power/boilInstall/BoilerDiagram";
import {display额定功率, input额定是} from "@/report/boiler/rarelyVary";
import {render设备类别} from "@/report/common/render";
import {CardContent,} from "@/components/ui";
import {CollapsibleFormSection} from "@/components/chub";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {DevToolsSection, useEntranceSetup} from "@/report/hook/useEntranceSetup";

/**有的 是非Pdf的原始记录 *.doc附件形式：
 * */
export const Projects记录 = [
    {name: '目录', na: true},
    //嵌套的目录构建形式？？ 大标题 一、 立刻跟随的 1.1
    // 一、锅炉安装监督检验综合报告
    // 1.1锅炉安装监督检验结论报告
    {name: '综合报告', ml: '一、锅炉安装监督检验综合报告', do: true},
    {name: '结论报告', ml: '1.1锅炉安装监督检验结论报告', do: true},
    {name: '锅炉简图', ml: '1.2锅炉结构简图'},
    //pdf模板问题？ 应该是大文本的，非上传图片
    {name: '检验过程概述', ml: '1.3锅炉安装施工及监督检验过程概述'},
    {name: '1.4主要受压元件一览表', },
    {name: '二、锅炉安装监督检验分项报告',},
    {name: '安装单位审查', ml: '2.1安装单位资源条件审查报告',},
    {name: '2.2锅炉出厂资料审查报告', },
    {name: '2.3工艺文件审查报告', },
    {name: '2.4材料管理监检报告', },
    {name: '基础、钢结构安装', ml: '2.5锅炉基础、钢结构安装监检报告',},
    {name: '锅筒汽水分离器', ml: '2.6锅筒、汽水分离器安装监检报告', },
    {name: '2.7集箱、减温器安装监检报告', },
    {name: '受热面及其附件', ml: '2.8受热面及其附件安装监督检验报告', },
    {name: '管道、主要连接管', ml: '2.9锅炉范围内管道、主要连接管道安装监检报告',},
    {name: '2.9.1锅炉范围内管道特性表', },
    {name: '2.9.2锅炉范围内管道单线图',},
    {name: '蒸汽吹灰系统', ml: '2.10蒸汽吹灰系统、锅炉本体其他装置安装监检报告',},
    {name: '2.11锅炉水压试验现场监督报告', },
    {name: '炉墙保温防腐', ml: '2.12炉墙保温防腐、安全保护装置安装监检报告', },
    {name: '炉水处理、调试', ml: '2.13锅炉水处理、调试及试运行安装监检报告', },
    {name: '三、锅炉安装监检见证资料', },
    {name: '安全性能监督检验证', ml: '3.1锅炉产品安全性能监督检验证书', },
    {name: '3.2锅炉产品合格证', },
    {name: '3.3锅炉安装许可证', },
    {name: '3.4锅炉安装质量证明书', },
    {name: '3.5特种设备监督检验工作联络单', },
    {name: '检验工作意见通知书', ml: '3.6特种设备监督检验工作意见通知书', },
    {name: '检验证书', do: true, na: true},
];

export const config设备概况 = [
    //没有在结论概况中出现的：  在头部抬头栏目出现
    [['工程名称', {n: '工程名称', t: 'B'}],],
    //不用台账的安装单位？
    [['安装单位', {n: '安装单', t: 'B'}], ['安装联系人', '安装联人']],
    [['安装许可证编号', '安许可号'], ['联系电话', '安装联电']],
    [['使用单位', '_$使用单位'],],
    [['使用单位地址', '_$使用单位地址'],],
    [['使用单位代码', '_$使用单位信用码'], ['邮政编码', '_$使用单位邮编']],
    [['锅炉安装地点', '_$设备使用地点'], ['使用单位联系人电话', '_$使用单位电话'],],
    // [['使用单位代码', '_$使用单位信用码'],  ['使用单位联系人电话', '_$使用单位电话'], ],
    [['制造单位', '_$制造单位'],],
    [['设备代码', '_$设备代码',], ['制造日期', '_$制造日期']],
    [['产品编号', '_$出厂编号'], ['锅炉型号', '_$型号'],],
    [[display额定功率, '_$额定蒸发量', input额定是], ['再热蒸汽流量', '_$再热蒸汽流量', 't/h'],],
    [['锅筒工作压力', '_$锅筒工作压力', 'MPa'], ['锅筒工作温度', {n: '筒工温', u: '℃'},],],
    //过热 蒸汽==过热 器?
    [['过热蒸汽出口压力', '_$过热器出口压', 'MPa'], ['过热蒸汽出口温度', '_$过热器出口温', '℃'],],
    [['再热蒸汽进口压力', '_$再热入口压力', 'MPa'], ['再热蒸汽进口温度', '_$再热入口温度', '℃'],],
    [['再热蒸汽出口压力', '_$再热出口压力', 'MPa'], ['再热蒸汽出口温度', '_$再热出口温度', '℃'],],
    [['给水压力', '_$给水压力', 'MPa'], ['给水温度', '_$给水温度', '℃'],],
    [['燃烧方式', '_$燃烧方式'], ['监督检验受理文号', '告知号']],
    //下结论编辑器的
    [['监检开始日期', '_$检验日期1'], ['监检结束日期', '_$检验日期']],
];

export const 许可级别选 = ['A级', 'B级'];
export const config证书概要 = [
    //施工==安装单位，在结论概况页面录入的；
    [['施工单位', '_$安装单'],],
    [['许可级别', {n: '许可级', t: 'l', l: 许可级别选}], ['许可证编号', '_$安许可号'],],
    [['使用单位', '_$使用单位'], ['制造单位', '_$制造单位']],
    //台账必须录入:设备名称？
    [['设备类别', '_$设备类别', render设备类别], ['设备品种(名称)', '_$设备名称']],
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号']],
    [['设备代码', '_$设备代码'], ['制造日期', '_$制造日期']],
    [['使用地点', '_$设备使用地点']],
    [['使用单位内部编号', '_$单位内部编号'], ['使用登记证编号', '_$使用证号']],
    //orc?.额定蒸发量  .是功率
    [['额定蒸发量(功率)', '_$额定蒸发量', input额定是], ['额定出口压力', '_$设计出口压力', 'MPa']],
    //设计出口温度 svp?.设出口温);     这不是用台账的:额定工作压力  ['额定温度', '_$额定温度','℃']
    [['额定出口温度', '_$出口温度', '℃'], ['允许工作压力', '许工压', 'MPa']],
    //允许工作温度=额定温度；    台账3字段：耐压试验压力、水压试验压力、液压试验压力；
    [['允许工作温度', '_$额定温度', '℃'], ['水(耐)压试验压力', '试验压', 'MPa']],
];

export const EntranceSetup = ({show, redId, nestMd, rep}: InternalItemProps) => {
    const {schema, defaultValues, doCheckNames} = useEntranceSetup(rep)
    const handleCheckNames = React.useCallback((e: React.MouseEvent) => {
        doCheckNames(e, rep, [{value: config设备概况, type: 'esnt'}, {value: config证书概要, type: 'esnt'},
            {value: [...itemA结论, ...itemA简图,]},
            {value: ['Projects', '证书说明', "长文字页"]}
        ])}, [doCheckNames, rep],)
    const contentRendererFactory = React.useCallback((form: any) => (
            <CardContent>
                <DevToolsSection form={form} onCheckNames={handleCheckNames} />
            </CardContent>),
        [handleCheckNames],)
    const {render}= useFormFramework({schema, defaultValues, contentRendererFactory, rep})
    return <CollapsibleFormSection title="初始化本报告，默认值配置等" defaultOpen={show}>
        {render(null)}
    </CollapsibleFormSection>
}

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('ProjectList', <ProjectR nRec defaultProj={Projects记录} label={'记录的目录页'}/>),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'检验结论报告-概况'}/>),
    createItem('CertificateSummary', <DeviceSurveyD config={config证书概要} label={'证书的设备概况部分'}/>),
    createItem('CertMemo', <CertMemo label={'证书-说明'} />),
    createItem('Conclusion', <ConclusionBoiler startd cjry label={'检验结论报告-下结论'}/>),
    createItem('BoilerDiagram', <BoilerDiagram label="1.2锅炉结构简图"/>),
    createItem('Explanatory', <Explanatory label={'1.3锅炉安装施工过程概述'} />),
];

export const OriginalView=({ action, verId, rep}:OriginalViewProps)=>{
    const {list}=useRecordListSubr(rep, recordPrintList, action, verId);
    return <>
          {list}
    </>;
}
