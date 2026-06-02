// import * as React from "react";
//后端enum BusinessCat_Enum  类似语义 业务类型s ； 专门针对图标单个字符显示的
const businessCatspObj = {
    'REGUL': '定期（内部、全面）检验',
    'ANNUAL': '年度（外部、在线）检验',
    'INSTA': '安装监检',
    'FIRST': '首检',
    'TEST': '检测',
    'DELIVERY': '验收',
    'ESTIMATE': '评估',
    'EXPERIMENT': '试验',
    'IDENTIFIC': '鉴定检验',
    'MANUFACT': '制造监检',
    'PRESSURE': '耐压试验',
    'PRODUCT': '产品质量检验',
    'REFORM': '改造监检',
    'REPAIR': '重大修理',
    'SAFETYINS': '进口安全性能检验',
    'THERMAL': '热效率测试',
    'TYPETST': '型式试验',
    'OTHER': '其它'
};
export const businessCatspMap = new Map(Object.entries(businessCatspObj));

