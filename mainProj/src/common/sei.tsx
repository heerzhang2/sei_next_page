import * as React from "react";
//后端enum BusinessCat_Enum  类似语义 业务类型s ； 专门针对图标单个字符显示的
const businessCatspObj = {
    'REGUL': '定期',
    'ANNUAL': '年度',
    'INSTA': '安装',
    'FIRST': '首检',
    'TEST': '测',
    'DELIVERY': '收',
    'ESTIMATE': '评估',
    'EXPERIMENT': '试验',
    'IDENTIFIC': '鉴定',
    'MANUFACT': '制造',
    'PRESSURE': '耐压',
    'PRODUCT': '产品',
    'REFORM': '改造',
    'REPAIR': '大修',
    'SAFETYINS': '进口',
    'THERMAL': '热效',
    'TYPETST': '型式',
    'OTHER': '它'
};
export const businessCatspMap = new Map(Object.entries(businessCatspObj));

