//前端自定收费代码和收费项目名称

import * as React from "react";

export const BolierFixedC = {
    "1": "D≤1",
    "2": "1＜D≤2",
    "3": "2＜D≤4",
    "4": "4＜D≤6",
    "5": "6＜D≤10",
    "6": "10＜D≤20",
    "7": "D＞20",
}
const BolierFixedD = {
    "1": "D≤35",
    "2": "D≤75",
    "3": "D≤130",
    "4": "D≤220",
    "5": "D≤400",
    "6": "D≤670",
    "7": "D≤1000",
    "8": "D＞1000",
}
const BolierFixedE = {
    "1": "D≤1",
    "2": "1＜D≤2",
    "3": "2＜D≤4",
    "4": "4＜D≤6",
    "5": "6＜D≤10",
    "6": "10＜D≤20",
    "7": "20＜D≤35",
    "8": "D＞35",
}
const 锅炉项目 ={
    "43": {
        "0": "锅炉水压试验",
        "Prf": "",
        ...asFixedPrefixOf(BolierFixedC,"工业锅炉水压试验")
    },
    "53": {
        "Prf": "电站锅炉水压试验",
        ...BolierFixedD
    },
    "63": {
        "Prf": "垃圾焚烧发电锅炉水压试验",
        ...BolierFixedD
    },
} as any;
const 加收收费项 = {
    "108": "先导式安全阀离线校验，协商加收收费",
    "104": "易燃、易爆、有毒、腐蚀介质的安全阀需在线校验，协商加收收费",
}
const VesselFixedA = {
    "1": "V＜1",
    "2": "1≤V＜10",
    "3": "10≤V＜20",
    "4": "20≤V＜50",
    "5": "50≤V＜100",
    "6": "V≥100",
}
/**名称前缀修改，免去重复输入VesselFixedA了。
 * 目的：把{"1": "V＜1",  ,}  都统一改成  {"1": prefix + "V＜1",  ,}
 * */
function asFixedPrefixOf(orgObj: any,
    prefix: string
)
{
    //下面这行如果不嵌套一层Object.fromEntries( ... )，结果会导致利用asVesselFixAPrefix解构的地方产生{"0":}丢失；？返回的是[[],[]]的并非{,,}对象。
    let all= Object.fromEntries(
        Object.entries(orgObj).map(([vkey,vvalue],i) => {
                return  [`${vkey}` , prefix+vvalue];
            }
        )
    );
    return  all;
}
const VesselFixedC = {
    "1": "100≤MPa＜200",
    "2": "200≤MPa＜500",
    "3": "V≥500",
}

const 压力容器项 = {
    "37": {
        "0": "耐压试验(各类压力容器)",
        "Prf": "",
        ...asFixedPrefixOf(VesselFixedA,"一类压力容器耐压试验")
    },
    "38": {
        "0": "气密性试验(各类压力容器)",
        "Prf": "",
        ...asFixedPrefixOf(VesselFixedA,"一类压力容器气密性试验")
    },
    "39": {
        "Prf": "二类压力容器耐压试验",
        ...VesselFixedA
    },
    "3A": {
        "Prf": "二类压力容器气密性试验",
        ...VesselFixedA
    },
    "3B": {
        "Prf": "三类压力容器耐压试验",
        ...VesselFixedA
    },
    "3C": {
        "Prf": "三类压力容器气密性试验",
        ...VesselFixedA
    },
    "43": {
        "Prf": "超高压容器耐压试验",
        ...VesselFixedC
    },
}
export const ContainerDesignClsTil = {
    "1": "0.02≤PV＜0.2",
    "2": "0.2≤PV＜2",
    "3": "2≤PV＜5",
    "4": "5≤PV＜30",
    "5": "30≤PV＜80",
    "6": "PV≥80",
}
const 设计审查项 = {
    "21": {
        "0": "",
        "Prf": "压力容器设计技术资料审查",
        ...ContainerDesignClsTil
    },
    "22": {
        "0": "",
        "Prf": "压力容器补出受压元件总图",
        ...ContainerDesignClsTil
    },
    "23": {
        "0": "",
        "Prf": "压力容器补做强度计算书",
        ...ContainerDesignClsTil
    },
    "24": {
        "0": "",
        "Prf": "压力容器强度校核",
        ...ContainerDesignClsTil
    },
    "11": {
        "0": "",
        "Prf": "锅炉修理方案审查",
        ...BolierFixedE
    },
    "12": {
        "0": "",
        "Prf": "锅炉改造方案审查",
        ...BolierFixedE
    },
    "13": {
        "0": "",
        "Prf": "锅炉设计技术资料审查",
        ...BolierFixedE
    },
    "14": {
        "0": "",
        "Prf": "锅炉补出受压元件总图",
        ...BolierFixedE
    },
    "15": {
        "0": "",
        "Prf": "锅炉补做强度计算书",
        ...BolierFixedE
    },
    "16": {
        "0": "",
        "Prf": "锅炉强度校核",
        ...BolierFixedE
    },
    "31": {
        "0": "",
        "Prf": "锅炉设计鉴定文件及节能审查",
        ...BolierFixedE
    },
    "32": {
        "0": "锅炉设计文件备案"
    },
}

const 水质项目 = {
    "210": "电站锅炉水汽质量检验",
    "220": "电站锅炉水冷壁管割管垢样定期检验分析",
}

//第一个字符固定索引。非手动选的收费项，只能后端服务器计算。而手选收费项代码映射另外组织。
const FeeTitles = {
    "2":{
        "last": 1,   //最后截取几个字符。 0表示全部都用上。 2表示最后面2个字符，其它字符用于二级索引。
        "Vo": 压力容器项,
    },
    M:{
        "last": 1,
        "Vo": 设计审查项,
    },
    "1": {
        "last": 1,
        "Vo": 锅炉项目,
    },
    S: {
        "last": 0,
        "Vo": 水质项目,
    },
    H: {
        "100": "绝热性能测试采用真空度测试",
        "200": "绝热性能测试采用日蒸发率测量",
    },
    A: {
        ...加收收费项
    },
    //插入点在mod9的加收减免条款 ，"107"特殊
    B: {
        "82": "在毒性危害和爆炸危险或粉尘危害II级以上环境下加30%",
        "84": "加急检验（三个工作日取检验报告）加20%",
        "86": "受检单位要求在法定节假日检验的，加15%",
        "85": "受检单位要求双休日进行检验的，加10%",
        "88": "廉租住房、公共租赁住房、经济适用住房和棚户区改造安置住房等保障性安居工程免收",
        "87": "我省中小学安全工程建设中涉及特种设备的行政事业收费免除",
        "90": "对在用工业锅炉能效普查及环保监测可不收费",
        "107": "其它加收、减收条款（需说明理由）",
    },
    L: {
        "110": "机械性能（拉伸）",
        "120": "机械性能（弯曲）",
        "131": "机械性能-冲击（常温）",
        "132": "机械性能-冲击（时效）",
        "133": "机械性能-冲击（低温）",
        "134": "机械性能-冲击（压扁）",
        "135": "机械性能-冲击（扩口）",
        "210": "化学成分分析（低碳钢）",
        "220": "化学成分分析（合金钢、不锈钢）",
        "300": "光谱分析",
        "400": "宏观金相",
        "500": "微观金相",
        "600": "电镜",
    },
    W: {
        "110": "射线探伤（γ射线）",
        "120": "射线探伤（X射线）",
        "210": "超声波探伤（焊缝）",
        "211": "超声波探伤（焊缝）-B级",
        "212": "超声波探伤（焊缝）-C级",
        "220": "超声波探伤（钢板）" ,
        "230": "超声波探伤（锻件、管件）",
        "310": "磁粉探伤（焊缝）",
        "311": "磁粉探伤（焊缝）-双面",
        "320": "磁粉探伤（钢板）",
        "321": "磁粉探伤（钢板）-双面",
        "330": "磁粉探伤（螺栓、螺母、弹簧、角接头）L≤300",
        "331": "磁粉探伤（螺栓、螺母、弹簧、角接头）L>300",
        "410": "渗透探伤（焊缝）",
        "420": "渗透探伤（钢板）",
        "431": "角接头（L≤50mm）",
        "432": "角接头（50mm＜L≤100mm）",
        "433": "角接头（100mm＜L≤200mm）",
        "434": "角接头（200mm＜L≤300mm）",
        "435": "角接头（L＞300mm）",
        "500": "裂纹测深",
        "611": "应力应变测试-应变片（纸基）",
        "612": "应力应变测试-应变片（胶基）",
        "621": "应力应变测试-应变花（纸基）",
        "622": "应力应变测试-应变花（胶基）",
        "700": "测厚",
        "800": "打硬度",
        "910": "钢丝绳无损检测（直径≤20mm）",
        "920": "钢丝绳无损检测（直径＞20mm）",
        "A00": "TOFD检测"
    }
}  as any;

/**将前端的收费代码映射出收费项名称
 * */
export function getFeeTitleFe(
    feecode: string
): string
{
    let chead= feecode[0];
    let objtyp= FeeTitles[chead];
    let codmpart= feecode.substring(1);
    let  middlestr : string;
    let  tailidx : string;
    if(objtyp.last!!){
        let idwidth=objtyp.last;
       if(idwidth===1){
           middlestr=codmpart.slice(0,-1);
           tailidx=codmpart.slice(-1);
       }
       else if(idwidth===2){
           middlestr=codmpart.slice(0,-2);
           tailidx=codmpart.slice(-2);
       }
       else if(idwidth===0){
           return objtyp.Vo[codmpart];
       }
    }else{
        if(objtyp.last===0)
            return objtyp.Vo[codmpart];
        else
            return objtyp[codmpart];
    }
    //console.log("将后端给的收费代码映射出收费项名称1=",objtyp.Vo, middlestr!);
    let prf0obj=objtyp.Vo[middlestr!];
    //console.log("将后端给的收费代码映射出收费项名称2=",prf0obj,tailidx!);
    if(prf0obj.Prf!!)   return  prf0obj.Prf+prf0obj[tailidx!];
    else    return  prf0obj[tailidx!];
}
/**直接返回对象，免去重复输入收费编码了。
 * */
export function asFeeTitleFeOb(
    feecode: string
): {cod:string, til:string}
{
    return {cod: feecode, til: getFeeTitleFe(feecode) }
}
