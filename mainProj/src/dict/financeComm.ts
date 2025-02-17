
export type AccountingCategoryB = {
     NODE_ID: string;
     NODE_NAME: string;
};
export type AccountingCategory = {
    [key: string]: Array<AccountingCategoryB>;
};

//前端自主维护的字典： 估计会计用得到的？
//直接提取旧数据的形式：
export const 会计项目录= {
    "机电类": [
        {NODE_ID: "1001", NODE_NAME: "无损检测"},
        {NODE_ID: "1002", NODE_NAME: "理化测试"},
        {NODE_ID: "1003", NODE_NAME: "场内专用机动车辆或其他机动工业车辆型式试验"},
        {NODE_ID: "1004", NODE_NAME: "非特种设备委托检验"},
        {NODE_ID: "1005", NODE_NAME: "非监管（省外）特种设备委托检验"},
        {NODE_ID: "1006", NODE_NAME: "核电站特种设备委托检验"},
        {NODE_ID: "1007", NODE_NAME: "老旧电梯安全性能评估"},
        {NODE_ID: "1008", NODE_NAME: "设备监理"},
        {NODE_ID: "1009", NODE_NAME: "其他技术服务"},
        {NODE_ID: "1010", NODE_NAME: "设备改造维修咨询"},
        {NODE_ID: "1011", NODE_NAME: "起重机械安全性能评估"},
        {NODE_ID: "1012", NODE_NAME: "电梯安全性能评估"},
        {NODE_ID: "1013", NODE_NAME: "游乐设施安全性能评估"},
        {NODE_ID: "1014", NODE_NAME: "厂车安全性能评估"},
        {NODE_ID: "1015", NODE_NAME: "事故鉴定"},
        {NODE_ID: "1016", NODE_NAME: "产品质量鉴定"},
        {NODE_ID: "1017", NODE_NAME: "移装鉴定"},
        {NODE_ID: "1018", NODE_NAME: "评审收入"}
    ],
    "承压类": [
        {NODE_ID: "2001", NODE_NAME: "无损检测"},
        {NODE_ID: "2002", NODE_NAME: "理化测试"},
        {NODE_ID: "2003", NODE_NAME: "公用管道、长输管道基于风险的评价"},
        {NODE_ID: "2004", NODE_NAME: "压力容器不停机不开罐检验评价"},
        {NODE_ID: "2005", NODE_NAME: "腐蚀监测服务"},
        {NODE_ID: "2006", NODE_NAME: "金属监督服务"},
        {NODE_ID: "2007", NODE_NAME: "非特种设备委托检验"},
        {NODE_ID: "2008", NODE_NAME: "PE管道委托检验"},
        {NODE_ID: "2009", NODE_NAME: "腐蚀、有毒、易燃环境等高风险的安全阀在线校验和修复"},
        {NODE_ID: "2010", NODE_NAME: "常规安全阀校验和维修"},
        {NODE_ID: "2011", NODE_NAME: "设备监理"},
        {NODE_ID: "2012", NODE_NAME: "设备改造维修咨询"},
        {NODE_ID: "2013", NODE_NAME: "环保检测"},
        {NODE_ID: "2014", NODE_NAME: "能效测试"},
        {NODE_ID: "2015", NODE_NAME: "合同能源管理"},
        {NODE_ID: "2016", NODE_NAME: "锅炉水（油）质监测"},
        {NODE_ID: "2017", NODE_NAME: "到货检验服务"},
        {NODE_ID: "2018", NODE_NAME: "材料部件金属性能检测"},
        {NODE_ID: "2019", NODE_NAME: "事故鉴定"},
        {NODE_ID: "2020", NODE_NAME: "产品质量鉴定"},
        {NODE_ID: "2021", NODE_NAME: "锅炉移装鉴定"},
        {NODE_ID: "2022", NODE_NAME: "容器鉴定"},
        {NODE_ID: "2023", NODE_NAME: "容器超设计使用年限鉴定"},
        {NODE_ID: "2024", NODE_NAME: "砝码租金"},
        {NODE_ID: "2027", NODE_NAME: "阀门型式试验"},
        {NODE_ID: "2025", NODE_NAME: "非监管（省外）特种设备委托检验"},
        {NODE_ID: "2026", NODE_NAME: "锅炉安全评估"}
    ],
    "综合类": [
        {NODE_ID: "3001", NODE_NAME: "其他经营性服务"},
        {NODE_ID: "3002", NODE_NAME: "培训服务"}
    ],
    "专用车公告类": [
        {NODE_ID: "4001", NODE_NAME: "汽车及挂车外部照明和光信号装置安装规定"},
        {NODE_ID: "4002", NODE_NAME: "汽车和挂车后下部防护装置"},
        {NODE_ID: "4003", NODE_NAME: "汽车和挂车侧面防护装置"},
        {NODE_ID: "4004", NODE_NAME: "间接视野装置安装要求"},
        {NODE_ID: "4005", NODE_NAME: "汽车、挂车及汽车列车外廓尺寸、轴荷及质量限值"},
        {NODE_ID: "4006", NODE_NAME: "汽车号牌板（架）及其位置"},
        {NODE_ID: "4007", NODE_NAME: "侧倾稳定角"},
        {NODE_ID: "4008", NODE_NAME: "汽车及部件标记、车辆识别代号（VIN）"},
        {NODE_ID: "4009", NODE_NAME: "车身反光标识安装和粘贴要求"},
        {NODE_ID: "4010", NODE_NAME: "车辆尾部标志板安装规定"},
        {NODE_ID: "4011", NODE_NAME: "防飞溅系统的车辆安装要求"},
        {NODE_ID: "4012", NODE_NAME: "车用起重尾板安装"},
        {NODE_ID: "4013", NODE_NAME: "车速表和里程表要求"},
        {NODE_ID: "4014", NODE_NAME: "汽车护轮板"},
        {NODE_ID: "4015", NODE_NAME: "汽车制动系统"},
        {NODE_ID: "4016", NODE_NAME: "载重汽车轮胎"},
        {NODE_ID: "4017", NODE_NAME: "校车顶部结构强度"},
        {NODE_ID: "4018", NODE_NAME: "前下部防护"},
        {NODE_ID: "4019", NODE_NAME: "前照灯光束照射位置及发光强度"},
        {NODE_ID: "4020", NODE_NAME: "汽车定型试验"},
        {NODE_ID: "4021", NODE_NAME: "机动车安全运行强制性项目"},
        {NODE_ID: "4022", NODE_NAME: "汽车燃料消耗量试验"},
        {NODE_ID: "4023", NODE_NAME: "其他技术服务"}
    ],
    "专用车委托类": [
        {NODE_ID: "5001", NODE_NAME: "汽车和挂车后下部防护装置"},
        {NODE_ID: "5002", NODE_NAME: "汽车和挂车侧面防护装置"},
        {NODE_ID: "5003", NODE_NAME: "汽车、挂车及汽车列车外廓尺寸、轴荷及质量限值"},
        {NODE_ID: "5004", NODE_NAME: "侧倾稳定角"},
        {NODE_ID: "5005", NODE_NAME: "防飞溅系统雨帘位移"},
        {NODE_ID: "5006", NODE_NAME: "前下部防护"},
        {NODE_ID: "5007", NODE_NAME: "汽车燃料消耗量"},
        {NODE_ID: "5008", NODE_NAME: "机动车安全运行项目"},
        {NODE_ID: "5009", NODE_NAME: "汽车动力性"},
        {NODE_ID: "5010", NODE_NAME: "汽车滑行"},
        {NODE_ID: "5011", NODE_NAME: "防雨密封性"},
        {NODE_ID: "5012", NODE_NAME: "洗扫车定型试验"},
        {NODE_ID: "5013", NODE_NAME: "垃圾车定型试验"},
        {NODE_ID: "5014", NODE_NAME: "扫路车定型试验"},
        {NODE_ID: "5015", NODE_NAME: "洒水车定型试验"},
        {NODE_ID: "5016", NODE_NAME: "清洗车定型试验"},
        {NODE_ID: "5017", NODE_NAME: "车厢可卸式垃圾车定型试验"},
        {NODE_ID: "5018", NODE_NAME: "餐厨车垃圾车定型试验"},
        {NODE_ID: "5019", NODE_NAME: "排水抢险车定型试验"},
        {NODE_ID: "5020", NODE_NAME: "厢式运输车定型试验"},
        {NODE_ID: "5021", NODE_NAME: "混凝土搅拌运输车定型试验"},
        {NODE_ID: "5022", NODE_NAME: "电动汽车用动力蓄电池电性能"},
        {NODE_ID: "5023", NODE_NAME: "电动汽车用动力蓄电池循环寿命"},
        {NODE_ID: "5024", NODE_NAME: "无损检测"},
        {NODE_ID: "5025", NODE_NAME: "硬度测量"},
        {NODE_ID: "5026", NODE_NAME: "金属元素分析"},
        {NODE_ID: "5027", NODE_NAME: "金相组织"},
        {NODE_ID: "5028", NODE_NAME: "厚度测量"},
        {NODE_ID: "5029", NODE_NAME: "常压罐车罐体"},
        {NODE_ID: "5030", NODE_NAME: "其他技术服务"}
    ],
} as AccountingCategory;

/**会计目录
 * NODE_ID不能重复*/
export const accountingCateMap = new Map(Object.entries(会计项目录));
Object.entries(会计项目录).map(([bigclass , bobj  ], i) => {
       return bobj.map(({NODE_ID,NODE_NAME}, i) => {
            if(accountingCateMap.has(NODE_ID))  throw new Error(`会计目录${NODE_ID}重复`);
            accountingCateMap.set(NODE_ID, NODE_NAME as any);
    })
});
