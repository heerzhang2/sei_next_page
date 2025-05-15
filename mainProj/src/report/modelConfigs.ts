/** 每个报告类型的模板文件 相对路径指示器； 注意输入格式 [], Date()
 *  /report/相对路径 后缀自动加上 ".E.tsx";
 *  中文描述？
 *  模板版本号都是1,2,3 顺序数字的；模板类型号：是简写缩写字符串。属性配置！path是模板路径；name=特征描述。后面vers多版本的：
 *  vers{'v':[a,b], , }版本数组的第二个b：new Date是报告模板的最近更新时间；时间太久远模板可能会淘汰，前端尽量保留历史版本的模板。'v'版本号数字存入数据库。
 *  非主报告的模板：比如：气密性试验， 查找旧的,"REP_TYPE":"110008"
 */

export const ModelTypeArr={
    "EL-DJ" : { name: '有机房曳引驱动电梯定期检验',
        path: "./elevator/PeriodicalInspection",
        vers:{
            "1": ["1版,2020年疫情前",new Date('2017-05-30')], "2": ["2版",new Date('2022-06-12')],"6": ["最后最新",new Date('2021-01-29')],
        }
    },
    "EL-JJ" : { name: '有机房曳引驱动电梯监督检验',
        path: "./elevator/Supervision/i",
        vers:{
            "1": ["1版,2023年福建",new Date('2023-12-25')],
        }
    },
    "SAFT-EL" : { name: '电梯安全性能技术评估',
        path: "./safe/elevator/i",
        vers:{
            "1": ["1版",new Date('2024-01-20')],
        }
    },
    "WALK-SAF" : { name: '自动扶梯和自动人行道安全性能技术评估',
        path: "./safe/walk/i",
        vers:{
            "1": ["1版",new Date('2024-06-26')],
        }
    },
    "EL_SSAF" : { name: '电梯安全性能技术评估(科研类)',
        path: "./safe/scieEleva/i",
        vers:{
            "1": ["1版",new Date('2024-12-17')],
        }
    },
    "WALK_SSAF" : { name: '自动扶梯和自动人行道安全性能技术评估(科研类)',
        path: "./safe/scieWalk/i",
        vers:{
            "1": ["1版",new Date('2024-12-24')],
        }
    },
    "ROL-DJ" : { name: '无机房曳引驱动电梯定期检验',
        path: "./elevator/RoomLessDJ/i",
        vers:{
            "1": ["1版",new Date('2024-01-08')],
        }
    },
    "ROL-JJ" : { name: '无机房曳引驱动电梯监督检验',
        path: "./elevator/RoomLessJJ/i",
        vers:{
            "1": ["1版",new Date('2024-02-17')],
        }
    },
    "ESCL-DJ" : { name: '自动扶梯与自动人行道定期检验',
        path: "./escalator/sidewalkD/i",
        vers:{
            "1": ["1版",new Date('2024-01-13')],
        }
    },
    'WALK-JJ': { name: '自动扶梯与自动人行道监督检验',
        path: "./escalator/supervi/i",
        vers:{
            "1": ["1版",new Date('2024-07-01')],
        }
    },
    "SUNDR-JJ" : { name: '杂物电梯监督检验',
        path: "./elevator/sundryJj/i",
        vers:{
            "1": ["1版",new Date('2024-04-30')],
        }
    },
    "SUNDR-DJ" : { name: '杂物电梯定期检验',
        path: "./elevator/sundryDj/i",
        vers:{
            "1": ["1版",new Date('2024-04-30')],
        }
    },
    "SUNDR_WDJ" : { name: '杂物电梯委托定期检验',
        path: "./convey/sundriWt/i",
        vers:{
            "1": ["1版",new Date('2024-12-16')],
        }
    },
    "HYDLIC-DJ" : { name: '液压电梯定期检验',
        path: "./lift/hydlicDj/i",
        vers:{
            "1": ["1版",new Date('2024-09-01')],
        }
    },
    "HYDLIC_JJ" : { name: '液压电梯监督检验',
        path: "./convey/hydlicJj/i",
        vers:{
            "1": ["1版",new Date('2024-12-10')],
        }
    },
    "EL-WT" : { name: '有机房曳引驱动电梯委托检验',
        path: "./elevator/weituoDj/i",
        vers:{
            "1": ["1版",new Date('2024-05-21')],
        }
    },
    "EL-WTJJ" : { name: '曳引与强制驱动电梯委托监督检验',
        path: "./lift/elWeituoJj/i",
        vers:{
            "1": ["1版",new Date('2024-09-05')],
        }
    },
    'ELV-TS': { name: '电梯自行检测（常规）',
        path: "./elevator/stest/i",
        vers:{
            "1": ["1版",new Date('2024-07-09')],
        }
    },
    'WALK-TS': { name: '自动扶梯与自动人行道自行检测',
        path: "./escalator/stest/i",
        vers:{
            "1": ["1版",new Date('2024-09-03')],
        }
    },
    'SUNDRI_TS': { name: '杂物电梯检测',
        path: "./convey/sundriTs/i",
        vers:{
            "1": ["1版",new Date('2024-12-15')],
        }
    },
    "VS-DJ" : { name: '压力容器定期检验',
        path: "./vessel/PeriodicalInspection",
        vers:{
            "1": ["1版,2023试验",new Date('2023-09-03')],
        }
    },
    "VS-WD" : { name: '压力容器定期委托检查',
        path: "./vessel/entrust/i",
        vers:{
            "1": ["1版",new Date('2024-06-12')],
        }
    },
    "VS_WNJ" : { name: '压力容器年度委托检查',
        path: "./cylinder/annualWt/i",
        vers:{
            "1": ["1版",new Date('2024-11-07')],
        }
    },
    "VS-NJ" : { name: '压力容器年度检查',
        path: "./vessel/Annual/i",
        vers:{
            "1": ["1版",new Date('2024-04-23')],
        }
    },
    "IMCONT-SA" : { name: '进口容器安全性能监检',
        path: "./contain/impsaf/i",
        vers:{
            "1": ["1版",new Date('2024-04-03')],
        }
    },
    "VS-ZJ" : { name: '压力容器制造监督检验',
        path: "./contain/manufa/i",
        vers:{
            "1": ["1版",new Date('2024-04-24')],
        }
    },
    "VS-RJJ" : { name: '压力容器大修改造监检',
        path: "./contain/renovation/i",
        vers:{
            "1": ["1版",new Date('2024-10-08')],
        }
    },
    "VS-BZJ" : { name: '压力容器批量制造监督检验',
        path: "./contain/Batchfa/i",
        vers:{
            "1": ["1版",new Date('2024-07-27')],
        }
    },
    "ASEMBWE_AJ" : { name: '压力容器现场组焊监督检验',
        path: "./cylinder/assembWeld/i",
        vers:{
            "1": ["1版",new Date('2024-11-08')],
        }
    },
    "SPHERIC_AJ" : { name: '球形储罐安装监检',
        path: "./cylinder/sphericalTk/i",
        vers:{
            "1": ["1版",new Date('2024-11-08')],
        }
    },
    "OXYGENC_AJ" : { name: '氧舱安全性能监督检验',
        path: "./cylinder/oxygenChamb/i",
        vers:{
            "1": ["1版",new Date('2024-11-08')],
        }
    },
    "CYLIND-ZJ" : { name: '液化石油气钢瓶制造监督检验',
        path: "./contain/cylindZ/i",
        vers:{
            "1": ["1版",new Date('2024-08-22')],
        }
    },
    "COMPLTVS_WJ" : { name: '整装压力容器安装委托检验',
        path: "./cylinder/completeVes/i",
        vers:{
            "1": ["1版",new Date('2024-11-06')],
        }
    },
    "MVS-QJ" : { name: '移动式压力容器全面检验',
        path: "./movable/RqThorough/i",
        vers:{
            "1": ["1版",new Date('2024-05-16')],
        }
    },
    "MVS-NJ" : { name: '移动式压力容器年度检验',
        path: "./movable/rqAnnual/i",
        vers:{
            "1": ["1版",new Date('2024-08-21')],
        }
    },
    "SPHERIC-DJ": { name: '球形储罐定期检验',
        path: "./vessel/spherical/i",
        vers:{
            "1": ["1版",new Date('2024-10-08')],
        }
    },
    "OXYGEN-WNJ": { name: '氧舱委托年度检查',
        path: "./vessel/oxygenWNj/i",
        vers:{
            "1": ["1版",new Date('2024-10-11')],
        }
    },
    "OXYGEN-DJ": { name: '氧舱定期检验',
        path: "./vessel/oxygenDj/i",
        vers:{
            "1": ["1版",new Date('2024-10-11')],
        }
    },
    "STATIONU_DJ": { name: '站用储气瓶组定期检验',
        path: "./cylinder/stationUse/i",
        vers:{
            "1": ["1版",new Date('2024-11-04')],
        }
    },
    "SKIDMNT_ZJ": { name: '撬装式承压设备系统制造监检证书',
        path: "./cylinder/skidMount/i",
        vers:{
            "1": ["1版",new Date('2024-11-11')],
        }
    },
    "TANKER-NJ" : { name: '罐式车辆常压容器（罐体）检验',
        path: "./movable/tanker/i",
        vers:{
            "1": ["1版",new Date('2024-06-06')],
        }
    },
    "THICK_MS": { name: '测厚试验',
        path: "./cm/thickm/i",
        vers:{
            "1": ["1版,通用",new Date('2023-09-19')],
        }
    },
    "SONIC_TS": { name: '超声波检测报告',
        path: "./cm/sonic/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-21')],
        }
    },
    "RADIO_TS": { name: '射线检测报告',
        path: "./cm/radio/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-25')],
        }
    },
    "PERME_TS": { name: '渗透检测报告{渗透探伤}',
        path: "./cm/permeation/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-27')],
        }
    },
    "MAGNT_TS": { name: '磁粉检测报告{磁粉探伤}',
        path: "./cm/magnetic/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-27')],
        }
    },
    "THICKM_VS": { name: '壁厚测定报告(容器)',
        path: "./cm/thickmVs/i",
        vers:{
            "1": ["1版,容器定检",new Date('2023-09-19')],
        }
    },
    "TOFD_TS": { name: '衍射时差法（TOFD）超声检测',
        path: "./cm/tofd/i",
        vers:{
            "1": ["1版,容器通用",new Date('2023-09-19')],
        }
    },
    "SPECTR_AL": { name: '光谱分析报告',
        path: "./cm/spectrA/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-28')],
        }
    },
    "SPECTR_VS": { name: '光谱分析报告(容器)',
        path: "./cm/spectrVs/i",
        vers:{
            "1": ["1版,容器",new Date('2023-09-19')],
        }
    },
    "OPTIC_TS": { name: '光谱检测报告',
        path: "./cm/optical/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-29')],
        }
    },
    "HARD_TS": { name: '硬度检测报告',
        path: "./cm/hardness/i",
        vers:{
            "1": ["1版,通用",new Date('2024-03-31')],
        }
    },
    "GASPR_TS": { name: '气密性试验报告',
        path: "./cm/gasproof/i",
        vers:{
            "1": ["1版,通用",new Date('2024-05-20')],
        }
    },
    "PRSRE_TS": { name: '耐压试验报告(?)',
        path: "./cm/pressure/i",
        vers:{
            "1": ["1版,容器",new Date('2024-10-10')],
        }
    },
    "CR-JJ" : { name: '起重机械安装改造重大修理监督检验（适于桥式、门式起重机）',
        path: "./crane/bridge/i",
        vers:{
            "1": ["1版,2023年60页",new Date('2023-11-04')],
        }
    },
    "CR-JJWT" : { name: '桥（门）式起重机安装改造重大修理委托检验',
        path: "./bridge/weituoJj/i",
        vers:{
            "1": ["1版",new Date('2024-09-27')],
        }
    },
    "CR-INWT" : { name: '桥（门）式起重机（首次）委托检验',
        path: "./bridge/weituo/i",
        vers:{
            "1": ["1版",new Date('2024-09-30')],
        }
    },
    "CR-DJ" : { name: '起重机械定期（首次）检验（适于桥式、门式起重机）',
        path: "./crane/bridgeDJ/i",
        vers:{
            "1": ["1版",new Date('2024-01-10')],
        }
    },
    "SINGB-IN" : { name: '桥（门）式起重机首次检验',
        path: "./crane/singleBeam/i",
        vers:{
            "1": ["1版",new Date('2024-01-26')],
        }
    },
    "LIFT-DJ" : { name: '简易升降机定期检验',
        path: "./lift/simply/i",
        vers:{
            "1": ["1版",new Date('2024-01-10')],
        }
    },
    "LIFT-JJ" : { name: '简易升降机安装改造重大修理监督检验',
        path: "./lift/simplyJj/i",
        vers:{
            "1": ["1版",new Date('2024-09-26')],
        }
    },
    "CR-SMMS" : { name: '起重机械安全监控管理系统监督检验',
        path: "./bridge/monitorMS/i",
        vers:{
            "1": ["1版",new Date('2024-10-06')],
        }
    },
    "PARK-JJ" : { name: '机械式停车设备安装改造重大修理监督检验',
        path: "./park/Supervision/i",
        vers:{
            "1": ["1版",new Date('2024-02-05')],
        }
    },
    "PARK-DJ" : { name: '机械式停车设备定期检验',
        path: "./park/Periodical/i",
        vers:{
            "1": ["1版",new Date('2024-07-05')],
        }
    },
    "MOBCR-IN" : { name: '流动式起重机定期（首次）检验',
        path: "./mobilecr/Intial/i",
        vers:{
            "1": ["1版",new Date('2024-02-24')],
        }
    },
    "MOBCR_WIN" : { name: '流动式起重机委托检验',
        path: "./mobilecr/intialWt/i",
        vers:{
            "1": ["1版",new Date('2024-12-05')],
        }
    },
    "GANTR-DJ" : { name: '门座式起重机定期检验',
        path: "./gantry/Periodical/i",
        vers:{
            "1": ["1版",new Date('2024-02-24')],
        }
    },
    "GANTR-JJ" : { name: '门座式起重机安装改造重大修理监督检验',
        path: "./gantry/portalJj/i",
        vers:{
            "1": ["1版",new Date('2024-09-20')],
        }
    },
    "TOWER-JJ" : { name: '塔式起重机安装改造重大修理监督检验',
        path: "./tower/craneJj/i",
        vers:{
            "1": ["1版",new Date('2024-05-26')],
        }
    },
    "TOWER-DJ" : { name: '塔式起重机定期检验',
        path: "./tower/craneDj/i",
        vers:{
            "1": ["1版",new Date('2024-07-19')],
        }
    },
    "BRIERECT_JJ" : { name: '架桥机安装改造重大修理监督检验',
        path: "./bridge/erecting/i",
        vers:{
            "1": ["1版",new Date('2024-09-15')],
        }
    },
    "BRIERECT_DJ" : { name: '架桥机定期检验',
        path: "./bridge/erectingDj/i",
        vers:{
            "1": ["1版",new Date('2024-09-19')],
        }
    },
    "CONSTRU-JJ" : { name: '施工升降机安装改造重大修理监督检验',
        path: "./lift/constructJj/i",
        vers:{
            "1": ["1版",new Date('2024-09-23')],
        }
    },
    "CONSTRU-DJ" : { name: '施工升降机定期检验',
        path: "./lift/constructDj/i",
        vers:{
            "1": ["1版",new Date('2024-09-25')],
        }
    },
    "FORK-DJ" : { name: '场(厂)内专用机动车辆定期(首次)检验（叉车）',
        path: "./vehicle/fork/i",
        vers:{
            "1": ["1版",new Date('2023-12-18')],
        }
    },
    "TOUR-IN" : { name: '场(厂)内专用机动车辆定期(首次)检验（观光车）',
        path: "./vehicle/tour/i",
        vers:{
            "1": ["1版",new Date('2024-05-31')],
        }
    },
    "TOUR-INW" : { name: '非公路用旅游观光车辆(首次)委托检验',
        path: "./vehicle/tourWei/i",
        vers:{
            "1": ["1版",new Date('2024-09-13')],
        }
    },
    "FORK_WIN" : { name: '叉车(首次)委托检验',
        path: "./vehicle/forkIniWt/i",
        vers:{
            "1": ["1版",new Date('2024-11-15')],
        }
    },
    "FORK-WTJ" : { name: '叉车(在用)委托检验',
        path: "./vehicle/flWeituo/i",
        vers:{
            "1": ["1版",new Date('2024-09-11')],
        }
    },
    "BALANCE_TT" : { name: '平衡重式叉车型式试验',
        path: "./vehicle/balanceT/i",
        vers:{
            "1": ["1版",new Date('2024-11-15')],
        }
    },
    "VALV-OF" : { name: '安全阀离线校验',
        path: "./valve/offline/i",
        vers:{
            "1": ["1版",new Date('2024-01-25')],
        }
    },
    "VALV-ON" : { name: '安全阀在线检测',
        path: "./valve/online/i",
        vers:{
            "1": ["1版",new Date('2024-04-26')],
        }
    },
    "PRESBEAR-ZJ": { name: '压力容器受压元件、受压部件制造监督检验',
        path: "./valve/presbearZ/i",
        vers:{
            "1": ["1版",new Date('2024-10-14')],
        }
    },
    "INDPL-DJ" : { name: '工业管道定期检验',
        path: "./industrial/Periodical/i",
        vers:{
            "1": ["1版",new Date('2024-03-03')],
        }
    },
    "INDPL-NJ" : { name: '工业管道年度检查',
        path: "./industrial/Annual/i",
        vers:{
            "1": ["1版",new Date('2024-04-16')],
        }
    },
    "INDPL-JJ" : { name: '工业管道施工监督检验',
        path: "./industrial/Supv/i",
        vers:{
            "1": ["1版",new Date('2024-04-28')],
        }
    },
    "PGAS-JJ" : { name: '公用燃气管道施工监督检验',
        path: "./gas/Construct/i",
        vers:{
            "1": ["1版",new Date('2024-04-17')],
        }
    },
    "PLASTI-QJ" : { name: '城镇聚乙烯燃气管道全面检验',
        path: "./gas/plastics/i",
        vers:{
            "1": ["1版",new Date('2024-08-23')],
        }
    },
    "STEEL_DJ" : { name: '钢质管道定期检验GB1四级五级六级',
        path: "./gas/steelDj/i",
        vers:{
            "1": ["1版",new Date('2024-10-15')],
        }
    },
    "STEELT_DJ" : { name: '钢质管道定期检验GB1三级',
        path: "./industrial/steelThDj/i",
        vers:{
            "1": ["1版",new Date('2024-10-22')],
        }
    },
    "STEELF_DJ" : { name: '钢质管道定期检验GB1一级二级',
        path: "./industrial/steelFiDj/i",
        vers:{
            "1": ["1版",new Date('2024-10-25')],
        }
    },
    "HEATING_JJ" : { name: '公用热力管道施工监督检验',
        path: "./industrial/heatingJj/i",
        vers:{
            "1": ["1版",new Date('2024-10-24')],
        }
    },
    "LDISTAN-JJ" : { name: '长输管道施工监督检验',
        path: "./gas/ldistanceJj/i",
        vers:{
            "1": ["1版",new Date('2024-10-15')],
        }
    },
    "LDISTAN-DJ" : { name: '长输管道全面检验',
        path: "./gas/ldistanceDj/i",
        vers:{
            "1": ["1版",new Date('2024-10-18')],
        }
    },
    "LDISTAN-NJ" : { name: '长输管道年度检查',
        path: "./gas/ldistanceNj/i",
        vers:{
            "1": ["1版",new Date('2024-10-19')],
        }
    },
    "UTILITY-NJ" : { name: '公用管道年度检查',
        path: "./gas/utilityNj/i",
        vers:{
            "1": ["1版",new Date('2024-10-20')],
        }
    },
    "POLYETH_ZJ" : { name: '聚乙烯管制造监督检验项目表',
        path: "./industrial/polyethyleZ/i",
        vers:{
            "1": ["1版",new Date('2024-10-25')],
        }
    },
    "ASSEMBLY_ZJ" : { name: '压力管道元件组合装置制造监督检验项目表',
        path: "./industrial/assembly/i",
        vers:{
            "1": ["1版",new Date('2024-10-26')],
        }
    },
    "ARCWELD_ZJ" : { name: '埋弧焊钢管制造监督检验项目表',
        path: "./industrial/arcWeldedZ/i",
        vers:{
            "1": ["1版",new Date('2024-10-27')],
        }
    },
    "BOIL-NJ" : { name: '工业锅炉内部检验',
        path: "./boiler/Internal/i",
        vers:{
            "1": ["1版",new Date('2024-04-01')],
        }
    },
    "BOIL-WB" : { name: '工业锅炉外部检验',
        path: "./boiler/external/i",
        vers:{
            "1": ["1版",new Date('2024-04-25')],
        }
    },
    "ORGAN-NJ" : { name: '有机热载体炉内部检验',
        path: "./furnace/Internal/i",
        vers:{
            "1": ["1版",new Date('2024-05-07')],
        }
    },
    "ORGAN-WB" : { name: '有机热载体炉外部检验',
        path: "./furnace/External/i",
        vers:{
            "1": ["1版",new Date('2024-07-24')],
        }
    },
    "BOIL-SA" : { name: '锅炉产品安全性能监督检验',
        path: "./boiler/manufact/i",
        vers:{
            "1": ["1版",new Date('2024-06-05')],
        }
    },
    "BOIL-JJ" : { name: '整装锅炉安装监督检验',
        path: "./boiler/install/i",
        vers:{
            "1": ["1版",new Date('2024-07-27')],
        }
    },
    "ASSEMBL-JJ" : { name: '组装锅炉安装监督检验',
        path: "./power/assembleJj/i",
        vers:{
            "1": ["1版",new Date('2024-10-12')],
        }
    },
    "BULKIND_AJ" : { name: '散装工业锅炉安装监督检验',
        path: "./furnace/bulkIndust/i",
        vers:{
            "1": ["1版",new Date('2024-11-12')],
        }
    },
    "BOIL-RJ" : { name: '工业锅炉修理、改造监督检验',
        path: "./furnace/glReform/i",
        vers:{
            "1": ["1版",new Date('2024-08-19')],
        }
    },
    "POWER-IN" : { name: '电站锅炉内部检验',
        path: "./boiler/power/i",
        vers:{
            "1": ["1版",new Date('2024-06-16')],
        }
    },
    "POWER-WB" : { name: '电站锅炉外部检验',
        path: "./boiler/powExtn/i",
        vers:{
            "1": ["1版",new Date('2024-08-16')],
        }
    },
    "POWER-RJJ" : { name: '电站锅炉修理改造监督检验',
        path: "./power/reformJj/i",
        vers:{
            "1": ["1版",new Date('2024-10-12')],
        }
    },
    "POWER_AJ" : { name: '电站锅炉安装监检',
        path: "./power/boilInstall/i",
        vers:{
            "1": ["1版",new Date('2024-11-14')],
        }
    },
    "THMEFF-TS" : { name: '工业锅炉热效率简单测试',
        path: "./furnace/Thermal/i",
        vers:{
            "1": ["1版",new Date('2024-07-28')],
        }
    },
    "THMEFF-WT" : { name: '锅炉热效率委托简单测试',
        path: "./furnace/wtThermal/i",
        vers:{
            "1": ["1版",new Date('2024-08-23')],
        }
    },
    "THERMAL_DT" : { name: '锅炉热效率详细测试',
        path: "./power/detThermal/i",
        vers:{
            "1": ["1版",new Date('2024-10-14')],
        }
    },
    "THERMAL_WDT" : { name: '锅炉热效率委托详细测试',
        path: "./power/detThermalWt/i",
        vers:{
            "1": ["1版",new Date('2024-10-28')],
        }
    },
    "BPERFORM_TS" : { name: '电站锅炉性能试验',
        path: "./power/Performance/i",
        vers:{
            "1": ["1版",new Date('2024-10-27')],
        }
    },
    "OBSERV-JJ" : { name: '观览车类大型游乐设施监督检验',
        path: "./amusement/observJj/i",
        vers:{
            "1": ["1版",new Date('2024-04-11')],
        }
    },
    "OBSERV-DJ" : { name: '观览车类大型游乐设施定期检验',
        path: "./amusement/observDj/i",
        vers:{
            "1": ["1版",new Date('2024-07-15')],
        }
    },
    "WATER_DJ" : { name: '水上游乐设施定期检验',
        path: "./amusement/waterDj/i",
        vers:{
            "1": ["1版",new Date('2024-07-18')],
            "2": ["2版2025院标",new Date('2025-01-05')],
        }
    },
    "WATER_JJ" : { name: '水上游乐设施监督检验',
        path: "./recreation/waterJj/i",
        vers:{
            "1": ["1版",new Date('2024-12-27')],
        }
    },
    "FLIGHT-DJ" : { name: '飞行塔类大型游乐设施定期检验',
        path: "./amusement/flightDj/i",
        vers:{
            "1": ["1版",new Date('2024-08-27')],
        }
    },
    "SLIDING_DJ" : { name: '滑行车类大型游乐设施定期检验',
        path: "./amusement/slidingDj/i",
        vers:{
            "1": ["1版",new Date('2024-08-28')],
        }
    },
    "SLIDING_JJ" : { name: '滑行车类大型游乐设施监督检验',
        path: "./recreation/slidingJj/i",
        vers:{
            "1": ["1版",new Date('2025-01-22')],
        }
    },
    "OVEHEAD-DJ" : { name: '架空游览车类大型游乐设施定期检验',
        path: "./amusement/overheadDj/i",
        vers:{
            "1": ["1版",new Date('2024-08-29')],
        }
    },
    "AIRCRAF_DJ" : { name: '自控飞机类大型游乐设施定期检验',
        path: "./amusement/aircraftDj/i",
        vers:{
            "1": ["1版",new Date('2024-08-30')],
            "2": ["2版2025",new Date('2024-01-13')],
        }
    },
    "AIRCRAF_JJ" : { name: '自控飞机类大型游乐设施监督检验',
        path: "./recreation/aircraftJj/i",
        vers:{
            "1": ["1版",new Date('2025-01-08')],
        }
    },
    "DODGEM-DJ" : { name: '碰碰车类大型游乐设施定期检验',
        path: "./amusement/dodgemDj/i",
        vers:{
            "1": ["1版",new Date('2024-08-30')],
        }
    },
    "ZIPLINE-DJ" : { name: '滑索类游乐设施定期检验',
        path: "./amusement/ziplineDj/i",
        vers:{
            "1": ["1版",new Date('2024-08-31')],
        }
    },
    "WATERBO_TS" : { name: '工业锅炉水处理定期检验',
        path: "./water/boilerLedger/i",
        vers:{
            "1": ["1版",new Date('2024-10-28')],
        }
    },
    "POWERSTM_TS" : { name: '锅炉水汽质量检验',
        path: "./water/powerSteam/i",
        vers:{
            "1": ["1版",new Date('2024-10-31')],
        }
    },
    "ORGANICHT_TS" : { name: '在用有机热载体检验',
        path: "./water/organicHeat/i",
        vers:{
            "1": ["1版",new Date('2024-11-01')],
        }
    },
    "ORGANICHT_NT" : { name: '未使用有机热载体检验',
        path: "./water/organicNew/i",
        vers:{
            "1": ["1版",new Date('2024-11-02')],
        }
    },
    "WATERBO_WTS" : { name: '工业锅炉水质委托检验',
        path: "./water/boilerLedgerWt/i",
        vers:{
            "1": ["1版",new Date('2024-11-04')],
        }
    },
    "STARTUPST_TS" : { name: '启动锅炉水汽质量检验',
        path: "./water/startupSteam/i",
        vers:{
            "1": ["1版",new Date('2024-11-04')],
        }
    },
    "SWELLING_MS" : {path: "./cm/swelling/i" },
    "STRENGTH_VFB" : {path: "./boiler/strength_vfb/i" },
    "PIPE_CREEP": {path: "./boiler/pipe_creep/i" },
    "OUT_ROUNDNESS": {path: "./boiler/out_roundness/i" },
    "OXIDESKIN_AC": {path: "./boiler/oxideskin_ac/i" },
    "OXIDESKIN_THICK": {path: "./boiler/oxideskin_thick/i" },
    "ENDOSCOPIC_EX": {path: "./boiler/endoscopic_ex/i" },
};



/**报告类型 转换成 模板文件的文件路径名：
 * */
// function ModelConfigs(type: keyof typeof ModelTypeArr) {
//     return  ModelTypeArr[type]?.path;
// }
//返回字符串： 文件相对路径名字的前缀；
// export default ModelConfigs;
