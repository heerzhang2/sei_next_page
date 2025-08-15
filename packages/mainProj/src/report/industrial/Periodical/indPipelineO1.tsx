import * as React from "react";
import {InternalItemProps, OriginalViewProps} from "@/report/common/base";
import {aggregateProj, createItem} from "@/report/common/eHelper";
import {DeviceSurveyD, DeviceSurveyFx} from "@/report/common/survey";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {config壁厚测仪, TkmsConclusion, TkmsMeasurement, TkmsPartSummary} from "@/report/cm/thickm/ThickMs1";
import {titleRenders, 工作介质选, 管道级别} from "@/report/industrial/Periodical/rarelyVary";
import {FxDiagram} from "@/report/cm/thickm/FxDiagram";
import {config磁粉仪概, MangPartSummary, mang示说选} from "@/report/cm/magnetic/Magnetic1";
import {FxSimpConclus} from "@/report/cm/magnetic/FxSimpConclus";
import {itemA单特性, PropertySolidify} from "@/report/industrial/property-solidify";
import {SingleLineDiagram} from "@/report/industrial/diagram-manager";
import {LineDiagramFile} from "@/report/industrial/diagram-file";
import {itemA宏观检验, Macroscopic} from "@/report/industrial/Periodical/Macroscopic";
import {Accessories, itemA安全附件} from "@/report/industrial/Periodical/Accessories";
import {itemA资审查, MaterialReview} from "@/report/industrial/Periodical/MaterialReview";
import {ConcAppendix, itemA结论附} from "@/report/industrial/Periodical/ConcAppendix";
import {ConclusionIndPer, itemA结论} from "@/report/industrial/Periodical/Conclusion";
import {config超声仪概, SoniEvaluation, soni结果选} from "@/report/cm/sonic/Ultrasound1";
import {HydrostaticTest, itemA耐压验} from "@/report/industrial/Periodical/HydrostaticTest";
import {config硬度仪, HardEvaluation, hard示说选} from "@/report/cm/hardness/Hardness1";
import {config光谱测仪, OptcEvaluation, optc示说选} from "@/report/cm/optical/Optical1";
import {config强度核概, CpsvCalculation, cpsv结果选} from "@/report/cm/cpStrength/csVerification1";
import {LongArticleFx} from "@/report/cm/cpStrength/LongArticleFx";
import {config射线仪概, config射线测仪, RadoEvaluation, RadoWorkpiece, rado示说选, rado结果选} from "@/report/cm/radio/Radiography1";
import {config渗透仪概, PermEvaluation, perm示说选, perm结果选} from "@/report/cm/permeation/PermTest1";
import {config光析仪概, SpetChemicCompo, SpetElementSet, spet示说选, spet结果选} from "@/report/cm/spectr/SpetrAnalys1";
import {CardContent} from "@/components/ui";
import {CollapsibleFormSection} from "@/components/chub";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {DevToolsSection, useEntranceSetup} from "@/report/hook/useEntranceSetup"
import {ReportCacheManager} from "@/components/report-cache-manager";

/**有的 是非Pdf的原始记录 *.doc附件形式：
 *  因为模板已经里另外做一个ConcAppendix附页编辑器了，参数na:不需要再设置了 ha:也不要用;
 *  这里缺少关联 modType :
 * */
export const Projects记录 = [
    {name:'工业管道定期检验结论',do:true},
    {name:'资料审查',do:true,ml:'工业管道资料审查报告'},
    {name:'宏观检验',do:true,ml:'工业管道宏观检验报告'},
    {name:'安全附件与仪表检验',do:false,ml:'安全附件与仪表检验报告'},
    // {name:'压力容器资料审查',do:true,ha:''},   {name:'衍射时差法（TOFD）超声检测',ha:''},
    {name:'壁厚测定',},
    {name:'渗透检测',},
    {name:'射线检测'},
    {name:'磁粉检测',ml:'磁粉检测报告',},
    {name:'超声波检测',ml:'超声波检测报告'},
    {name:'光谱分析',ml:'材料成分分析（光谱分析）报告'},
    {name:'光谱检测',},
    {name:'硬度检测',},
    {name:'金相分析'},
    {name:'泄漏试验'},
    {name:'耐压试验'},
    {name:'管道特性表',ml:'管道特性表',na:true},
    {name:'管道单线图',ml:'管道单线图',na:true},
    {name:'耐压强度校核',ml:'耐压强度校核报告'},
];

export const config设备概况 = [
    [['管道名称', '_$管道设备名'], ['单位内编号', {n: '单位内编号', t: 'B', l: ['见管道特性表']}],],
    [['管道级别', {n: '管道级别', t: 'l', l: 管道级别}], ['起始—终止位置', {n: '起始终止', t: 'B', l: ['见管道特性表']}]],
    [['使用单位名称', '_$使用单位'], ['使用登记证编号', '_$使用证号'],],
    [['使用单位地址', '_$使用单位地址'],],
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['邮政编码', '_$使用单位邮编'],],
    [['安全管理人员', '安全员'], ['联系电话', '安全员电']],
    //投用日期: 还是不用台账的。 还是：需报告自己录入。而且不是日期的。
    [['设计使用年限', '_$设计年限', '年'], ['投入使用日期', {n: '投用日', t: 'l', l: ["见管道特性表"]}],],
    //拆分和注解插入点的：
    [['公称外径', {n: '公外径', u: 'mm'}], ['管道长度', {n: '管长度', u: 'm'}]],
    [['管道壁厚', {n: '管壁厚', u: 'mm'}], ['设计压力', {n: '设计压', u: 'MPa'}]],
    [['设计温度', {n: '设计温', u: '℃'}], ['工作压力', {n: '工作压', u: 'MPa'}]],
    [['工作温度', {n: '工作温', u: '℃'}], ['工作介质', {n: '工作介', t: 'l', l: 工作介质选}]],
];

export const EntranceSetup = ({show, rep}: InternalItemProps) => {
    const {schema, defaultValues, doCheckNames} = useEntranceSetup(rep)
    const handleCheckNames = React.useCallback((e: React.MouseEvent) => {
            doCheckNames(e, rep, [{ value: config设备概况, type: "esnt" }, { value: [...itemA结论,...itemA结论附, ...itemA资审查] },
                { value: [...itemA宏观检验,...itemA安全附件, ...itemA单特性, ...itemA耐压验] },
                { value: ["Projects", ] },
         ])}, [doCheckNames, rep],)
    const contentRendererFactory = React.useCallback((form: any) => (
            <CardContent>
                <DevToolsSection form={form} onCheckNames={handleCheckNames} />
            </CardContent>),
       [handleCheckNames])
    const {render}= useFormFramework({schema, defaultValues, contentRendererFactory, rep})
    return <CollapsibleFormSection title="初始化本报告，默认值配置等" defaultOpen={show}>
                <ReportCacheManager repId={rep.id} template="INDPL_DJ" version="1" />
                {render(null)}
        </CollapsibleFormSection>
}

const createRecordList =()=>[
    createItem('Entrance', <EntranceSetup/>),
    createItem('ProjectList', <ProjectR nRec defaultProj={Projects记录} label={'记录的目录页'}/>),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'检验结论报告-概况'} comment={{8:"以下8个性能参数"}}/>),
    createItem('Conclusion', <ConclusionIndPer startd cjry label={'检验结论报告-下结论'}/>),
    createItem('ConcAppendix', <ConcAppendix label="工业管道定期检验结论报告附页"/>),
    createItem('MaterialReview', <MaterialReview label="工业管道资料审查报告"/>),
    createItem('Macroscopic', <Macroscopic label="宏观检验报告"/>),
    createItem('Accessories', <Accessories label="安全附件与仪表检验报告"/>),
    createItem('Solidify', <PropertySolidify />),
    createItem('LineDiagram', <SingleLineDiagram />),
    createItem('LineDiagramFile', <LineDiagramFile />),
    //侧壁厚： 没有独立流转子报告的版本号，依附于主报告。 确保名称与 Projects记录 中的一致；可重复分项的name命名冲突检查是独立于主报告的。没有独立的Entrance初始化和原始记录列表。
    aggregateProj('壁厚测定', 'THICK_MS', [
        createItem('TkmsInstrument', <DeviceSurveyFx config={config壁厚测仪} label='壁厚测定-概要仪器'/>),
        createItem('TkmsPartSummary', <TkmsPartSummary label='壁厚各部位测点和最小壁厚'/>),
        createItem('TkmsDiagram', <FxDiagram label="测厚点位置示图" pic='_FILE_S部位' memo='点图说明' maxFile={3}/>),
        createItem('TkmsMeasurement', <TkmsMeasurement label='测厚表'/>),
        createItem('TkmsConclusion', <TkmsConclusion label={'壁厚测定-结果'} />),
    ]),
    aggregateProj('磁粉检测', 'MAGNT_TS', [
        createItem('MangInstrument', <DeviceSurveyFx config={config磁粉仪概} label='磁粉检测-概要仪器'/>),
        createItem('MangDiagram', <FxDiagram label="磁粉检测部位缺陷位置图" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={mang示说选}/>),
        createItem('MangPartSummary', <MangPartSummary label='磁粉检测结果评定表'/>),
        createItem('MangConclusion', <FxSimpConclus label={'磁粉检测-检测结果'} clc="结果" clist={["1级"]}/>),
    ]),
    aggregateProj('超声波检测', 'SONIC_TS', [
        createItem('SoniInstrument', <DeviceSurveyFx config={config超声仪概} label='超声波检测-概要仪器'/>),
        createItem('SoniEvaluation', <SoniEvaluation label='焊接接头超声检测结果评定'/>),
        createItem('SoniConclusion', <FxSimpConclus label={'超声波检测-检测结果'} clc="结果" clist={soni结果选}/>),
    ]),
    aggregateProj('硬度检测', 'HARD_TS', [
        createItem('HardInstrument', <DeviceSurveyFx config={config硬度仪} label='磁粉检测-概要仪器'/>),
        createItem('HardDiagram', <FxDiagram label="磁粉检测部位、缺陷位置示意图" pic='_FILE_S部位' memo='点图说明' maxFile={10} dlist={hard示说选}/>),
        createItem('HardEvaluation', <HardEvaluation label='硬度检测分析结果表'/>),
        createItem('HardConclusion', <FxSimpConclus label={'硬度检测-备注检测结果'} clc="结果" memo='备注'
                                                    clist={['所检项目未见异常。']} mlist={['试验部位为硬度检测附图中编号处的管件。']}/>),
    ]),
    aggregateProj('光谱检测', 'OPTIC_TS', [
        createItem('OptcInstrument', <DeviceSurveyFx config={config光谱测仪} label='光谱检测-概要仪器'/>),
        createItem('OptcEvaluation', <OptcEvaluation label='光谱检测分析结果表'/>),
        createItem('OptcDiagram', <FxDiagram label="光谱检测位置示意图" pic='_FILE_S部位' memo='点图说明' maxFile={10} dlist={optc示说选}/>),
        createItem('OptcConclusion', <FxSimpConclus label={'光谱检测-检测结果'} clc="结果"
                                                    clist={['对管件进行光谱复核，经检测，管件的Mn元素含量符合母材20钢的标准范围。']} />),
    ]),
    aggregateProj('耐压强度校核', 'CPSTR_VR', [
        createItem('CpsvInstrument', <DeviceSurveyFx config={config强度核概} label='耐压强度校核-概要'/>),
        createItem('CpsvParMemo', <CpsvCalculation label='校核参数取值说明'/>),
        createItem('CpsvCalculation', <LongArticleFx label='耐压强度校核-计算' wsPre/>),
        createItem('CpsvConclusion', <FxSimpConclus label={'强度校核-校核结果'} clc="结果" clist={cpsv结果选} ticlc='校核结果'/>),
    ]),
    createItem('HydrostaticTest', <HydrostaticTest label='耐压试验报告'/>),
    aggregateProj('射线检测', 'RADIO_TS', [
        createItem('RadoInstrument', <DeviceSurveyFx config={config射线仪概} label='射线检测-概要仪器'/>),
        createItem('RadoWorkpiece', <RadoWorkpiece label='射线检测-工件编号'/>),
        createItem('RadoEvaluation', <RadoEvaluation label='射线检测底片评定表'/>),
        createItem('RadoDiagram', <FxDiagram label="检测部位（布片示意图）" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={rado示说选}/>),
        createItem('RadoConclusion', <FxSimpConclus label={'射线检测-检测结果'} clc="结果" clist={rado结果选} />),
    ]),
    aggregateProj('渗透检测', 'PERME_TS', [
        createItem('PermInstrument', <DeviceSurveyFx config={config渗透仪概} label='渗透检测-概要仪器'/>),
        createItem('PermDiagram', <FxDiagram label="渗透检测部位及缺陷位置图" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={perm示说选}/>),
        createItem('PermEvaluation', <PermEvaluation label='渗透检测结果评定表'/>),
        createItem('PermConclusion', <FxSimpConclus label={'渗透检测-检测结果'} clc="结果" clist={perm结果选} />),
    ]),
    aggregateProj('光谱分析', 'SPECTR_AL', [
        createItem('SpetInstrument', <DeviceSurveyFx config={config光析仪概} label='光谱分析-概要仪器'/>),
        createItem('SpetDiagram', <FxDiagram label="光谱分析-检测部位图" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={spet示说选}/>),
        createItem('SpetElementSet', <SpetElementSet label='光谱分析-录入元素集'/>),
        createItem('SpetChemicCompo', <SpetChemicCompo label='光谱分析元素及含量表'/>),
        createItem('SpetConclusion', <FxSimpConclus label={'光谱分析-检测结果'} clc="结果" ticlc='分析结果' memo='备注'
                                                    clist={spet结果选} mlist={['检测部位均为管件']} />),
    ]),
];

export const OriginalView = ({ action, verId, rep }: OriginalViewProps) => {
    // 使用 useMemo 优化性能，避免每次渲染都重新创建记录列表
    const recordPrintList = React.useMemo(() => createRecordList(), [])
    const { list } = useRecordListSubr(rep, recordPrintList, action, verId, titleRenders)
    return <>{list}</>
}
