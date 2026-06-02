/** 每个报告类型的模板文件 相对路径指示器； 注意输入格式 [], Date()
 *  /report/相对路径 后缀自动加上 ".E.tsx";
 *  中文描述？
 *  模板版本号都是1,2,3 顺序数字的；模板类型号：是简写缩写字符串。属性配置！path是模板路径；name=特征描述。后面vers多版本的：
 *  vers{'v':[a,b,c], , }版本数组：
 *    - 第一个元素：版本描述字符串
 *    - 第二个元素：new Date是报告模板的最近更新时间
 *    - 第三个元素（可选）：new Date失效时间，若设置则该版本过期后不允许再使用
 *  时间太久远模板可能会淘汰，前端尽量保留历史版本的模板。'v'版本号数字存入数据库。
 *  非主报告的模板：比如：气密性试验， 查找旧的,"REP_TYPE":"110008"
 */

/** 版本配置项类型
 * [描述, 更新时间, 失效时间?]
 * 失效时间为可选，若设置则表示该版本已过期不允许使用
 */
export type VersionConfig = [string, Date] | [string, Date, Date];

/** 报告模板配置类型 */
export interface ModelConfig {
    name?: string;
    vers?: Record<string, VersionConfig>;
    /** 设备匹配规则配置（从reportTypeMap.ts迁移）
     * 五个选择项按顺序：
     * [设备种类, 设备品种, 子设备品种, 业务类型, 是否委托]
     * - 设备种类: EQP_SORT，空字符串表示任意；第一个字符枚举（3电梯 2压力容器 4起重; 6大型游乐设施；1锅炉 ；5 场（厂）内专用机动车辆；8压力管道；9客运索道；R常压容器； F安全阀；Z水质； 7压力管道元件；）
     * - 设备品种: EQP_VART，空字符串表示任意
     * - 子设备品种: SUB_EQP_VART，空字符串表示任意
     * - 业务类型: OPE_TYPE，必须匹配，null表示兼容所有，数组表示多选
     * - 是否委托: boolean | null，true=仅委托，false=仅法定，null=兼容所有
     */
    matchRules?: MatchRule[];
}

/** 匹配规则类型：[设备种类, 设备品种, 子设备品种, 业务类型, 是否委托]
 * 注意：数组元素2（子设备品种）可以是字符串或字符串数组（多选）
 * 数组元素3（业务类型）可以是字符串、字符串数组或null
 * 数组元素4（是否委托）可以是boolean或null
 */
export type MatchRule = [string, string | string[] | null, string | string[] | null, string | string[] | null, boolean | null];

export const ModelTypeArr: Record<string, ModelConfig> = {
    "EL_DJ" : { name: '有机房曳引驱动电梯定期检验',
        vers:{
            "1": ["1版,2020年疫情前",new Date('2017-05-30'), new Date('2022-06-11')], "2": ["2版",new Date('2022-06-12')],"6": ["最后最新",new Date('2021-01-29')],
        },
        matchRules: [
            ['31','313','','REGUL',false]
        ]
    },
    "EL_JJ" : { name: '有机房曳引驱动电梯监督检验',
        vers:{
            "1": ["1版,2023年福建",new Date('2023-12-25')],
        },
        matchRules: [
            ['31','311','','INSTA',false], ['31','','','INSTA',null]
        ]
    },
    "SAFT_EL" : { name: '电梯安全性能技术评估',
        vers:{
            "1": ["1版",new Date('2024-01-20')],
        },
        matchRules: [['31','311','','ESTIMATE',null]]
    },
    "WALK_SAF" : { name: '自动扶梯和自动人行道安全性能技术评估',
        vers:{
            "1": ["1版",new Date('2024-06-26')],
        },
        matchRules: [['33','','','ESTIMATE',null]]
    },
    "EL_SSAF" : { name: '电梯安全性能技术评估(科研类)',
        vers:{
            "1": ["1版",new Date('2024-12-17')],
        },
        matchRules: [['31','','','ESTIMATE',true]]
    },
    "WALK_SSAF" : { name: '自动扶梯和自动人行道安全性能技术评估(科研类)',
        vers:{
            "1": ["1版",new Date('2024-12-24')],
        },
        matchRules: [['33','331','','ESTIMATE',true]]
    },
    "ROL_DJ" : { name: '无机房曳引驱动电梯定期检验',
        vers:{
            "1": ["1版",new Date('2024-01-08')],
        },
        matchRules: [
            ['31','311','3002','REGUL',null], ['','','','REGUL',false]
        ]
    },
    "ROL_JJ" : { name: '无机房曳引驱动电梯监督检验',
        vers:{
            "1": ["1版",new Date('2024-02-17')],
        },
        matchRules: [['31','311','3002','INSTA',null]]
    },
    "ESCL_DJ" : { name: '自动扶梯与自动人行道定期检验',
        vers:{
            "1": ["1版",new Date('2024-01-13')],
        },
        matchRules: [['33','331','','REGUL',null]]
    },
    "WALK_JJ": { name: '自动扶梯与自动人行道监督检验',
        vers:{
            "1": ["1版",new Date('2024-07-01')],
        },
        matchRules: [['33','331','',['INSTA','REPAIR'],null]]
    },
    "SUNDR_JJ" : { name: '杂物电梯监督检验',
        vers:{
            "1": ["1版",new Date('2024-04-30')],
        },
        matchRules: [['34','343','',null,null]]
    },
    "SUNDR_DJ" : { name: '杂物电梯定期检验',
        vers:{
            "1": ["1版",new Date('2024-04-30')],
        },
        matchRules: [['34','343','','REGUL',null]]
    },
    "SUNDR_WDJ" : { name: '杂物电梯委托定期检验',
        vers:{
            "1": ["1版",new Date('2024-12-16')],
        },
        matchRules: [['34','343','','REGUL',true]]
    },
    "HYDLIC_DJ" : { name: '液压电梯定期检验',
        vers:{
            "1": ["1版",new Date('2024-09-01')],
        },
        matchRules: [['32','','','REGUL',null]]
    },
    "HYDLIC_JJ" : { name: '液压电梯监督检验',
        vers:{
            "1": ["1版",new Date('2024-12-10')],
        },
        matchRules: [['32','','',['INSTA','REPAIR','REFORM'],null]]
    },
    "EL_WT" : { name: '有机房曳引驱动电梯委托检验',
        vers:{
            "1": ["1版",new Date('2024-05-21')],
        },
        matchRules: [['31','','','REGUL',false]]
    },
    "EL_WTJJ" : { name: '曳引与强制驱动电梯委托监督检验',
        vers:{
            "1": ["1版",new Date('2024-09-05')],
        },
        matchRules: [['31','','',['INSTA','REPAIR','REFORM'],true]]
    },
    "ELV_TS": { name: '电梯自行检测（常规）',
        vers:{
            "1": ["1版",new Date('2024-07-09')],
        },
        matchRules: [['31','','','TEST',null]]
    },
    "WALK_TS": { name: '自动扶梯与自动人行道自行检测',
        vers:{
            "1": ["1版",new Date('2024-09-03')],
        },
        matchRules: [['33','','','TEST',null]]
    },
    'SUNDRI_TS': { name: '杂物电梯检测',
        vers:{
            "1": ["1版",new Date('2024-12-15')],
        },
        matchRules: [['34','343','','TEST',null]]
    },
    "VS_DJ" : { name: '压力容器定期检验',
        vers:{
            "1": ["1版,2023试验",new Date('2023-09-03')],
        },
        matchRules: [
            ['21','','','REGUL',false], ['','','','REGUL',false]
        ]
    },
    "VS_WD" : { name: '压力容器定期委托检查',
        vers:{
            "1": ["1版",new Date('2024-06-12')],
        },
        matchRules: [['21','','','REGUL',true]]
    },
    "VS_WNJ" : { name: '压力容器年度委托检查',
        vers:{
            "1": ["1版",new Date('2024-11-07')],
        },
        matchRules: [['21','','','ANNUAL',true]]
    },
    "VS_NJ" : { name: '压力容器年度检查',
        vers:{
            "1": ["1版",new Date('2024-04-23')],
        },
        matchRules: [['21','','',null,null]]
    },
    "IMCONT_SA" : { name: '进口容器安全性能监检',
        vers:{
            "1": ["1版",new Date('2024-04-03')],
        },
        matchRules: [['21','','','SAFETYINS',null]]
    },
    "VS_ZJ" : { name: '压力容器制造监督检验',
        vers:{
            "1": ["1版",new Date('2024-04-24')],
        },
        matchRules: [['','','','MANUFACT',false]]
    },
    "VS_RJJ" : { name: '压力容器大修改造监检',
        vers:{
            "1": ["1版",new Date('2024-10-08')],
        },
        matchRules: [['21','','',['REPAIR','REFORM'],null]]
    },
    "VS_BZJ" : { name: '压力容器批量制造监督检验',
        vers:{
            "1": ["1版",new Date('2024-07-27')],
        },
        matchRules: [['','','','MANUFACT',false]]
    },
    "ASEMBWE_AJ" : { name: '压力容器现场组焊监督检验',
        vers:{
            "1": ["1版",new Date('2024-11-08')],
        },
        matchRules: [['21','','','INSTA',null]]
    },
    "SPHERIC_AJ" : { name: '球形储罐安装监检',
        vers:{
            "1": ["1版",new Date('2024-11-08')],
        },
        matchRules: [['21','','','INSTA',null]]
    },
    "OXYGENC_AJ" : { name: '氧舱安全性能监督检验',
        vers:{
            "1": ["1版",new Date('2024-11-08')],
        },
        matchRules: [['24','','','INSTA',null]]
    },
    "CYLIND_ZJ" : { name: '液化石油气钢瓶制造监督检验',
        vers:{
            "1": ["1版",new Date('2024-08-22')],
        },
        matchRules: [['23','','','MANUFACT',null]]
    },
    "COMPLTVS_WJ" : { name: '整装压力容器安装委托检验',
        vers:{
            "1": ["1版",new Date('2024-11-06')],
        },
        matchRules: [['21','','','INSTA',true]]
    },
    "MVS_QJ" : { name: '移动式压力容器全面检验',
        vers:{
            "1": ["1版",new Date('2024-05-16')],
        },
        matchRules: [['22','','','REGUL',null]]
    },
    "MVS_NJ" : { name: '移动式压力容器年度检验',
        vers:{
            "1": ["1版",new Date('2024-08-21')],
        },
        matchRules: [['22','','','ANNUAL',null]]
    },
    "SPHERIC_DJ": { name: '球形储罐定期检验',
        vers:{
            "1": ["1版",new Date('2024-10-08')],
        },
        matchRules: [['21','2002','','REGUL',null]]
    },
    "OXYGEN_WNJ": { name: '氧舱委托年度检查',
        vers:{
            "1": ["1版",new Date('2024-10-11')],
        },
        matchRules: [['24','','','ANNUAL',true]]
    },
    "OXYGEN_DJ": { name: '氧舱定期检验',
        vers:{
            "1": ["1版",new Date('2024-10-11')],
        },
        matchRules: [['24','','','REGUL',null]]
    },
    "STATIONU_DJ": { name: '站用储气瓶组定期检验',
        vers:{
            "1": ["1版",new Date('2024-11-04')],
        },
        matchRules: [['21','','','REGUL',null]]
    },
    "SKIDMNT_ZJ": { name: '撬装式承压设备系统制造监检证书',
        vers:{
            "1": ["1版",new Date('2024-11-11')],
        },
        matchRules: [['','','','MANUFACT',null]]
    },
    "TANKER_NJ" : { name: '罐式车辆常压容器（罐体）检验',
        vers:{
            "1": ["1版",new Date('2024-06-06')],
        },
        matchRules: [['R3','','','ANNUAL',null]]
    },
    "THICK_MS": { name: '测厚试验',
        vers:{
            "1": ["1版,通用",new Date('2023-09-19')],
        },
        matchRules: [['83','','','REGUL',null]]
    },
    "SONIC_TS": { name: '超声波检测报告',
        vers:{
            "1": ["1版,通用",new Date('2024-03-21')],
        },
        matchRules: [['83','','','REGUL',null]]
    },
    "RADIO_TS": { name: '射线检测报告',
        vers:{
            "1": ["1版,通用",new Date('2024-03-25')],
        }
    },
    "PERME_TS": { name: '渗透检测报告{渗透探伤}',
        vers:{
            "1": ["1版,通用",new Date('2024-03-27')],
        }
    },
    "MAGNT_TS": { name: '磁粉检测报告{磁粉探伤}',
        vers:{
            "1": ["1版,通用",new Date('2024-03-27')],
        }
    },
    "THICKM_VS": { name: '壁厚测定报告(容器)',
        vers:{
            "1": ["1版,容器定检",new Date('2023-09-19')],
        },
        matchRules: [
            ['41','413','','REGUL',false], ['41','413','9999','REGUL',true]
        ]
    },
    "TOFD_TS": { name: '衍射时差法（TOFD）超声检测',
        vers:{
            "1": ["1版,容器通用",new Date('2023-09-19')],
        },
        matchRules: [
            ['41','413','','REGUL',false], ['41','413','9999','REGUL',true]
        ]
    },
    "SPECTR_AL": { name: '光谱分析报告',
        vers:{
            "1": ["1版,通用",new Date('2024-03-28')],
        },
        matchRules: [['83','','','REGUL',null]]
    },
    "SPECTR_VS": { name: '光谱分析报告(容器)',
        vers:{
            "1": ["1版,容器",new Date('2023-09-19')],
        }
    },
    "OPTIC_TS": { name: '光谱检测报告',
        vers:{
            "1": ["1版,通用",new Date('2024-03-29')],
        }
    },
    "HARD_TS": { name: '硬度检测报告',
        vers:{
            "1": ["1版,通用",new Date('2024-03-31')],
        }
    },
    "GASPR_TS": { name: '气密性试验报告',
        vers:{
            "1": ["1版,通用",new Date('2024-05-20')],
        }
    },
    "PRSRE_TS": { name: '耐压试验报告(?)',
        vers:{
            "1": ["1版,容器",new Date('2024-10-10')],
        }
    },
    "CR_JJ" : { name: '起重机械安装改造重大修理监督检验（适于桥式、门式起重机）',
        vers:{
            "1": ["1版,2023年60页",new Date('2023-11-04')],
        },
        matchRules: [
            ['41','413','','INSTA',false], ['','','','INSTA',true]
        ]
    },
    "CR_JJWT" : { name: '桥（门）式起重机安装改造重大修理委托检验',
        vers:{
            "1": ["1版",new Date('2024-09-27')],
        },
        matchRules: [
            ['41','','',['INSTA','REPAIR','REFORM'],true], 
            ['42','','',['INSTA','REPAIR','REFORM'],true]
        ]
    },
    "CR_INWT" : { name: '桥（门）式起重机（首次）委托检验',
        vers:{
            "1": ["1版",new Date('2024-09-30')],
        },
        matchRules: [
            ['41','','','FIRST',true],
            ['42','','','FIRST',true]
        ]
    },
    "CR_DJ" : { name: '起重机械定期（首次）检验（适于桥式、门式起重机）',
        vers:{
            "1": ["1版",new Date('2024-01-10')],
        },
        matchRules: [
            ['41','','','REGUL',null],['42','','','REGUL',null]
        ]
    },
    "SINGB_IN" : { name: '桥（门）式起重机首次检验',
        vers:{
            "1": ["1版",new Date('2024-01-26')],
        },
        matchRules: [['41','419','','FIRST',null]]
    },
    "LIFT_DJ" : { name: '简易升降机定期检验',
        vers:{
            "1": ["1版",new Date('2024-01-10')],
        },
        matchRules: [['48','487','','REGUL',null]]
    },
    "LIFT_JJ" : { name: '简易升降机安装改造重大修理监督检验',
        vers:{
            "1": ["1版",new Date('2024-09-26')],
        },
        matchRules: [['48','487','',['INSTA','REPAIR','REFORM'],null]]
    },
    "CR_SMMS" : { name: '起重机械安全监控管理系统监督检验',
        vers:{
            "1": ["1版",new Date('2024-10-06')],
        },
        matchRules: [
            ['41','','','OTHER',null],['42','','','OTHER',null]
        ]
    },
    "PARK_JJ" : { name: '机械式停车设备安装改造重大修理监督检验',
        vers:{
            "1": ["1版",new Date('2024-02-05')],
        },
        matchRules: [['4D','4D1','','INSTA',null]]
    },
    "PARK_DJ" : { name: '机械式停车设备定期检验',
        vers:{
            "1": ["1版",new Date('2024-07-05')],
        },
        matchRules: [['4D','4D1','','REGUL',null]]
    },
    "MOBCR_IN" : { name: '流动式起重机定期（首次）检验',
        vers:{
            "1": ["1版",new Date('2024-02-24')],
        },
        matchRules: [['44','','','FIRST',false]]
    },
    "MOBCR_WIN" : { name: '流动式起重机委托检验',
        vers:{
            "1": ["1版",new Date('2024-12-05')],
        },
        matchRules: [['44','','','FIRST',true]]
    },
    "GANTR_DJ" : { name: '门座式起重机定期检验',
        vers:{
            "1": ["1版",new Date('2024-02-24')],
        },
        matchRules: [['47','','','REGUL',null]]
    },
    "GANTR_JJ" : { name: '门座式起重机安装改造重大修理监督检验',
        vers:{
            "1": ["1版",new Date('2024-09-20')],
        },
        matchRules: [['47','','',['INSTA','REPAIR','REFORM'],null]]
    },
    "TOWER_JJ" : { name: '塔式起重机安装改造重大修理监督检验',
        vers:{
            "1": ["1版",new Date('2024-05-26')],
        },
        matchRules: [['43','','','INSTA',null]]
    },
    "TOWER_DJ" : { name: '塔式起重机定期检验',
        vers:{
            "1": ["1版",new Date('2024-07-19')],
        },
        matchRules: [['43','','','REGUL',null]]
    },
    "BRIERECT_JJ" : { name: '架桥机安装改造重大修理监督检验',
        vers:{
            "1": ["1版",new Date('2024-09-15')],
        },
        matchRules: [['42','429','',['INSTA','REPAIR','REFORM'],null]]
    },
    "BRIERECT_DJ" : { name: '架桥机定期检验',
        vers:{
            "1": ["1版",new Date('2024-09-19')],
        },
        matchRules: [['42','429','','REGUL',null]]
    },
    "CONSTRU_JJ" : { name: '施工升降机安装改造重大修理监督检验',
        vers:{
            "1": ["1版",new Date('2024-09-23')],
        },
        matchRules: [['48','486','',['INSTA','REPAIR','REFORM'],null]]
    },
    "CONSTRU_DJ" : { name: '施工升降机定期检验',
        vers:{
            "1": ["1版",new Date('2024-09-25')],
        },
        matchRules: [['48','486','','REGUL',null]]
    },
    "FORK_DJ" : { name: '场(厂)内专用机动车辆定期(首次)检验（叉车）',
        vers:{
            "1": ["1版",new Date('2023-12-18')],
        },
        matchRules: [
            ['51','511','','REGUL',null], ['','','','REGUL',false]
        ]
    },
    "TOUR_IN" : { name: '场(厂)内专用机动车辆定期(首次)检验（观光车）',
        vers:{
            "1": ["1版",new Date('2024-05-31')],
        },
        matchRules: [
            ['52','','','REGUL',null], ['','','','FIRST',null]
        ]
    },
    "TOUR_INW" : { name: '非公路用旅游观光车辆(首次)委托检验',
        vers:{
            "1": ["1版",new Date('2024-09-13')],
        },
        matchRules: [
            ['52','','','REGUL',true], ['','','','FIRST',true]
        ]
    },
    "FORK_WIN" : { name: '叉车(首次)委托检验',
        vers:{
            "1": ["1版",new Date('2024-11-15')],
        },
        matchRules: [['51','511','','FIRST',true]]
    },
    "FORK_WTJ" : { name: '叉车(在用)委托检验',
        vers:{
            "1": ["1版",new Date('2024-09-11')],
        },
        matchRules: [['51','511','','REGUL',true]]
    },
    "BALANCE_TT" : { name: '平衡重式叉车型式试验',
        vers:{
            "1": ["1版",new Date('2024-11-15')],
        },
        matchRules: [['51','','','TYPETST',null]]
    },
    "VALV_OF" : { name: '安全阀离线校验',
        vers:{
            "1": ["1版",new Date('2024-01-25')],
        },
        matchRules: [['','','','OTHER',false]]
    },
    "VALV_ON" : { name: '安全阀在线检测',
        vers:{
            "1": ["1版",new Date('2024-04-26')],
        },
        matchRules: [['','','','OTHER',false]]
    },
    "PRESBEAR_ZJ": { name: '压力容器受压元件、受压部件制造监督检验',
        vers:{
            "1": ["1版",new Date('2024-10-14')],
        },
        matchRules: [['','','','MANUFACT',null]]
    },
    "INDPL_DJ" : { name: '工业管道定期检验',
        vers:{
            "1": ["1版",new Date('2024-03-03')],
        },
        matchRules: [['','','','REGUL',null]]
    },
    "INDPL_NJ" : { name: '工业管道年度检查',
        vers:{
            "1": ["1版",new Date('2024-04-16')],
        },
        matchRules: [['83','831','',null,null]]
    },
    "INDPL_JJ" : { name: '工业管道施工监督检验',
        vers:{
            "1": ["1版",new Date('2024-04-28')],
        },
        matchRules: [['83','831','','INSTA',null]]
    },
    "PGAS_JJ" : { name: '公用燃气管道施工监督检验',
        vers:{
            "1": ["1版",new Date('2024-04-17')],
        },
        matchRules: [['82','821','','INSTA',null]]
    },
    "PLASTI_QJ" : { name: '城镇聚乙烯燃气管道全面检验',
        vers:{
            "1": ["1版",new Date('2024-08-23')],
        },
        matchRules: [['82','821','','REGUL',null]]
    },
    "STEEL_DJ" : { name: '钢质管道定期检验GB1四级五级六级',
        vers:{
            "1": ["1版",new Date('2024-10-15')],
        },
        matchRules: [
            ['82','','','REGUL',null],['83','','','REGUL',null]
        ]
    },
    "STEELT_DJ" : { name: '钢质管道定期检验GB1三级',
        vers:{
            "1": ["1版",new Date('2024-10-22')],
        },
        matchRules: [
            ['82','','','REGUL',null],['83','','','REGUL',null]
        ]
    },
    "STEELF_DJ" : { name: '钢质管道定期检验GB1一级二级',
        vers:{
            "1": ["1版",new Date('2024-10-25')],
        },
        matchRules: [
            ['82','','','REGUL',null],['83','','','REGUL',null]
        ]
    },
    "HEATING_JJ" : { name: '公用热力管道施工监督检验',
        vers:{
            "1": ["1版",new Date('2024-10-24')],
        },
        matchRules: [['82','822','',['INSTA','REFORM','REPAIR'],null]]
    },
    "LDISTAN_JJ" : { name: '长输管道施工监督检验',
        vers:{
            "1": ["1版",new Date('2024-10-15')],
        },
        matchRules: [['81','','',null,null]]
    },
    "LDISTAN_DJ" : { name: '长输管道全面检验',
        vers:{
            "1": ["1版",new Date('2024-10-18')],
        },
        matchRules: [['81','','','REGUL',null]]
    },
    "LDISTAN_NJ" : { name: '长输管道年度检查',
        vers:{
            "1": ["1版",new Date('2024-10-19')],
        },
        matchRules: [['81','','','ANNUAL',null]]
    },
    "UTILITY_NJ" : { name: '公用管道年度检查',
        vers:{
            "1": ["1版",new Date('2024-10-20')],
        },
        matchRules: [['82','','','ANNUAL',null]]
    },
    "POLYETH_ZJ" : { name: '聚乙烯管制造监督检验项目表',
        vers:{
            "1": ["1版",new Date('2024-10-25')],
        },
        matchRules: [['71','','','MANUFACT',null]]
    },
    "ASSEMBLY_ZJ" : { name: '压力管道元件组合装置制造监督检验项目表',
        vers:{
            "1": ["1版",new Date('2024-10-26')],
        },
        matchRules: [['72','','','MANUFACT',null]]
    },
    "ARCWELD_ZJ" : { name: '埋弧焊钢管制造监督检验项目表',
        vers:{
            "1": ["1版",new Date('2024-10-27')],
        },
        matchRules: [['71','','','MANUFACT',null]]
    },
    "BOIL_NJ" : { name: '工业锅炉内部检验',
        vers:{
            "1": ["1版",new Date('2024-04-01')],
        },
        matchRules: [['11','','','REGUL',null]]
    },
    "BOIL_WB" : { name: '工业锅炉外部检验',
        vers:{
            "1": ["1版",new Date('2024-04-25')],
        },
        matchRules: [['11','','','ANNUAL',null]]
    },
    "ORGAN_NJ" : { name: '有机热载体炉内部检验',
        vers:{
            "1": ["1版",new Date('2024-05-07')],
        },
        matchRules: [['13','','', 'REGUL',null]]
    },
    "ORGAN_WB" : { name: '有机热载体炉外部检验',
        vers:{
            "1": ["1版",new Date('2024-07-24')],
        },
        matchRules: [['13','','', 'ANNUAL',null]]
    },
    "BOIL_SA" : { name: '锅炉产品安全性能监督检验',
        vers:{
            "1": ["1版",new Date('2024-06-05')],
        },
        matchRules: [['11','','','MANUFACT',null]]
    },
    "BOIL_JJ" : { name: '整装锅炉安装监督检验',
        vers:{
            "1": ["1版",new Date('2024-07-27')],
        },
        matchRules: [['11','','','INSTA',null]]
    },
    "ASSEMBL_JJ" : { name: '组装锅炉安装监督检验',
        vers:{
            "1": ["1版",new Date('2024-10-12')],
        },
        matchRules: [
            ['11','','','INSTA',null],['12','','','INSTA',null]
        ]
    },
    "BULKIND_AJ" : { name: '散装工业锅炉安装监督检验',
        vers:{
            "1": ["1版",new Date('2024-11-12')],
        },
        matchRules: [
            ['11','','','INSTA',null],['12','','','INSTA',null]
        ]
    },
    "BOIL_RJ" : { name: '工业锅炉修理、改造监督检验',
        vers:{
            "1": ["1版",new Date('2024-08-19')],
        },
        matchRules: [['11','','',['REFORM','REPAIR'],null]]
    },
    "POWER_IN" : { name: '电站锅炉内部检验',
        vers:{
            "1": ["1版",new Date('2024-06-16')],
        },
        matchRules: [['11','111','1002','REGUL',null]]
    },
    "POWER_WB" : { name: '电站锅炉外部检验',
        vers:{
            "1": ["1版",new Date('2024-08-16')],
        },
        matchRules: [['11','111','1002','ANNUAL',null]]
    },
    "POWER_RJJ" : { name: '电站锅炉修理改造监督检验',
        vers:{
            "1": ["1版",new Date('2024-10-12')],
        },
        matchRules: [['11','111','1002',['REFORM','REPAIR'],null]]
    },
    "POWER_AJ" : { name: '电站锅炉安装监检',
        vers:{
            "1": ["1版",new Date('2024-11-14')],
        },
        matchRules: [['11','111','1002','INSTA',null]]
    },
    "THMEFF_TS" : { name: '工业锅炉热效率简单测试',
        vers:{
            "1": ["1版",new Date('2024-07-28')],
        },
        matchRules: [['12','121','1003','THERMAL',null]]
    },
    "THMEFF_WT" : { name: '锅炉热效率委托简单测试',
        vers:{
            "1": ["1版",new Date('2024-08-23')],
        },
        matchRules: [['','','','THERMAL',true]]
    },
    "THERMAL_DT" : { name: '锅炉热效率详细测试',
        vers:{
            "1": ["1版",new Date('2024-10-14')],
        },
        matchRules: [['','','','THERMAL',null]]
    },
    "THERMAL_WDT" : { name: '锅炉热效率委托详细测试',
        vers:{
            "1": ["1版",new Date('2024-10-28')],
        },
        matchRules: [['','','','THERMAL',true]]
    },
    "BPERFORM_TS" : { name: '电站锅炉性能试验',
        vers:{
            "1": ["1版",new Date('2024-10-27')],
        },
        matchRules: [['11','111','1002','EXPERIMENT',null]]
    },
    "OBSERV_JJ" : { name: '观览车类大型游乐设施监督检验',
        vers:{
            "1": ["1版",new Date('2024-04-11')],
        },
        matchRules: [['61','',['INSTA','REPAIR'],null,null]]
    },
    "OBSERV_DJ" : { name: '观览车类大型游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-07-15')],
        },
        matchRules: [['61','611','','REGUL',null]]
    },
    "WATER_DJ" : { name: '水上游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-07-18'), new Date('2025-01-04')],
            "2": ["2版2025院标",new Date('2025-01-05')],
        },
        matchRules: [['6D','','','REGUL',null]]
    },
    "WATER_JJ" : { name: '水上游乐设施监督检验',
        vers:{
            "1": ["1版",new Date('2024-12-27')],
        },
        matchRules: [['6D','','',['INSTA','REPAIR','REFORM'],null]]
    },
    "FLIGHT_DJ" : { name: '飞行塔类大型游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-08-27')],
        },
        matchRules: [['65','','','REGUL',null]]
    },
    "SLIDING_DJ" : { name: '滑行车类大型游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-08-28')],
        },
        matchRules: [['62','','','REGUL',null]]
    },
    "SLIDING_JJ" : { name: '滑行车类大型游乐设施监督检验',
        vers:{
            "1": ["1版",new Date('2025-01-22')],
        },
        matchRules: [['62','','',['INSTA','REPAIR','REFORM'],null]]
    },
    "OVEHEAD_DJ" : { name: '架空游览车类大型游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-08-29')],
        },
        matchRules: [['63','','','REGUL',null]]
    },
    "AIRCRAF_DJ" : { name: '自控飞机类大型游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-08-30'), new Date('2025-01-12')],
            "2": ["2版2025",new Date('2024-01-13')],
        },
        matchRules: [['67','','','REGUL',null]]
    },
    "AIRCRAF_JJ" : { name: '自控飞机类大型游乐设施监督检验',
        vers:{
            "1": ["1版",new Date('2025-01-08')],
        },
        matchRules: [['67','','',['INSTA','REPAIR','REFORM'],null]]
    },
    "DODGEM_DJ" : { name: '碰碰车类大型游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-08-30')],
        },
        matchRules: [['6A','','','REGUL',null]]
    },
    "ZIPLINE_DJ" : { name: '滑索类游乐设施定期检验',
        vers:{
            "1": ["1版",new Date('2024-08-31')],
        },
        matchRules: [['6B','','','REGUL',null]]
    },
    "WATERBO_TS" : { name: '工业锅炉水处理定期检验',
        vers:{
            "1": ["1版",new Date('2024-10-28')],
        },
        matchRules: [['','','1003','TEST',null]]
    },
    "POWERSTM_TS" : { name: '锅炉水汽质量检验',
        vers:{
            "1": ["1版",new Date('2024-10-31')],
        },
        matchRules: [['','','1002','TEST',null]]
    },
    "ORGANICHT_TS" : { name: '在用有机热载体检验',
        vers:{
            "1": ["1版",new Date('2024-11-01')],
        },
        matchRules: [
            ['13','','','EXPERIMENT',null],['','','','EXPERIMENT',null]
        ]
    },
    "ORGANICHT_NT" : { name: '未使用有机热载体检验',
        vers:{
            "1": ["1版",new Date('2024-11-02')],
        },
        matchRules: [
            ['13','','','EXPERIMENT',null],['','','','EXPERIMENT',null]
        ]
    },
    "WATERBO_WTS" : { name: '工业锅炉水质委托检验',
        vers:{
            "1": ["1版",new Date('2024-11-04')],
        },
        matchRules: [['','','1003','TEST',true]]
    },
    "STARTUPST_TS" : { name: '启动锅炉水汽质量检验',
        vers:{
            "1": ["1版",new Date('2024-11-04')],
        },
        matchRules: [['','','','TEST',null]]
    },
};



//ES6 Generator 函数, 为不具备 Iterator 接口的对象提供遍历方法。   https://www.runoob.com/w3cnote/es6-generator.html
function* entries(obj: Record<string, any>) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]] as [string, ModelConfig];
    }
}

/** 根据设备类别和业务类型性质来搜索可能使用的报告模板类型的列表。
 * 输出有顺序的：匹配最佳的放在[0]第一位上。
 * 从 reportTypeMap.ts 迁移整合至此
 * */
export function getReportModelTypes(
    sort: string, vart: string, subvart: string, bsType: string, entrust: boolean
): string[] {
    let mac2bind = [] as [string, number][];     //前面放入报告模板编号，后面放入匹配程度等级；
    let m = 0;
    //是否满足，最大的满足程度 0，1，，，，4个条件都满足的。  ==0不满足删除。
    for (let [key, config] of entries(ModelTypeArr)) {
        const matchRules = config.matchRules;
        if (!matchRules || matchRules.length === 0) continue;

        let matched = 0;      //配对等级 程度好的
        for (const gz of matchRules) {         //可以用这个模板的条件，多个 gz1 or gz2 or ...
            if (null !== gz[3]) {
                if (typeof gz[3] === 'string') {
                    if (gz[3] !== bsType) continue;
                } else {
                    //数组形式的配置【多选的 业务类型】
                    if (!gz[3].find((it: any) => it === bsType))
                        continue;
                }
            }                   //业务类别提前做的排除：
            if (null === gz[4] || (false === gz[4] && !entrust) || (true === gz[4] && entrust)) {
                //剩下就是设备分类的匹配
                if (!gz[0]) {         //任意vart的设备？最宽松条件了；
                    if (matched <= 0) matched = 1;
                    continue;
                } else if (gz[0] === sort) {
                    if (!gz[1]) {         //任意sort的设备
                        if (matched <= 1) matched = 2;
                        continue;
                    } else if (gz[1] === vart) {
                        if (!gz[2]) {         //任意subvart的设备
                            if (matched <= 2) matched = 3;
                            continue;
                        } else if (gz[2] === subvart) {
                            matched = 4;
                        }
                    }
                }
            }
            if (matched >= 4) break;      //最高可能的等级
        }
        if (matched > 0)
            mac2bind[m++] = [key, matched];
    }
    //必须interface Array<T> 才能用的sort()操作
    mac2bind.sort(function (a, b) {
        if (a[1] > b[1]) {        //比较位于[,]第二个的等级即可
            return -1;     //返回，a排列在b之前
        } else {
            return 1;      //返回，b排列在a之前
        }
    });
    return mac2bind.map(one => one[0]);
}

/** 检查指定版本是否已过期
 * @param modelType 报告模板类型
 * @param version 版本号
 * @returns 如果版本已过期返回true，否则返回false
 */
export function isVersionExpired(modelType: string, version: string): boolean {
    const config = ModelTypeArr[modelType];
    if (!config || !config.vers) return false;

    const versionConfig = config.vers[version];
    if (!versionConfig || versionConfig.length < 3) return false;

    const expiryDate = versionConfig[2];
    if (!expiryDate) return false;

    return new Date() > expiryDate;
}

/** 获取指定模板类型的有效版本列表（未过期的）
 * @param modelType 报告模板类型
 * @returns 有效版本号列表
 */
export function getValidVersions(modelType: string): string[] {
    const config = ModelTypeArr[modelType];
    if (!config || !config.vers) return [];

    return Object.entries(config.vers)
        .filter(([version, verConfig]) => {
            if (verConfig.length < 3) return true; // 没有设置失效时间的视为有效
            const expiryDate = verConfig[2];
            if (!expiryDate) return true;
            return new Date() <= expiryDate;
        })
        .map(([version]) => version);
}

/**报告类型 转换成 模板文件的文件路径名：
 * */
// function ModelConfigs(type: keyof typeof ModelTypeArr) {
//     return  ModelTypeArr[type]?.path;
// }
//返回字符串： 文件相对路径名字的前缀；
// export default ModelConfigs;
