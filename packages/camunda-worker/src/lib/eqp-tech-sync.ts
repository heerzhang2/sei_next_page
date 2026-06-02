/**
 * 设备类型特有技术参数转换
 * 
 * 对应 Java InfRecvConvert 中各类型 fill 函数（fillElevator/fillVessel/fillCrane 等）。
 * 根据旧平台返回的设备类型 (eqpType)，将 techParam 中的类型特有参数
 * 转换为 Eqp 标量字段 + pa JSON 字段。
 * 
 * 参考：
 *   special-equipment-backend/src/main/java/org/fjsei/yewu/service/third/InfRecvConvert.java
 *   #fillEqpBase -> dispatch(L460-505) -> fillElevator(L698)/fillVessel(L752)/fillCrane(L819)/...
 * 
 * 注意：旧平台接口返回的设备技术参数（techParam）字段名与 Java 实体字段名不同。
 *       本文件根据 Java ElvPara/VesPara/CraPara 等类的 getter 方法名推断字段名。
 *       若实际接口返回字段名不同，需调整对应映射。
 */

import type { ExtractedEquipment } from '../types/task-extraction';

// ============================================================
// 辅助工具
// ============================================================

function toFloat(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function toShort(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? Math.floor(n) : undefined;
}

function toBool(val: any): boolean | undefined {
  if (val === null || val === undefined) return undefined;
  return val === '1' || val === '是' || val === true;
}

function setNum(obj: Record<string, any>, key: string, val: any): void {
  const n = toFloat(val);
  if (n !== undefined) obj[key] = n;
}

function setShort(obj: Record<string, any>, key: string, val: any): void {
  const n = toShort(val);
  if (n !== undefined) obj[key] = n;
}

function setBool(obj: Record<string, any>, key: string, val: any): void {
  const b = toBool(val);
  if (b !== undefined) obj[key] = b;
}

function setStr(obj: Record<string, any>, key: string, val: any): void {
  if (val !== null && val !== undefined && val !== '') {
    obj[key] = String(val);
  }
}

function toDate(val: any): Date | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

function setDate(obj: Record<string, any>, key: string, val: any): void {
  const d = toDate(val);
  if (d !== undefined) obj[key] = d;
}

// ============================================================
// 返回类型
// ============================================================

export interface TechSyncResult {
  /** Eqp 标量字段（如 elev.flo, vessel.vol, crane.span 等） */
  eqpFields: Record<string, any>;
  /** 合并到 pa JSON 中的字段（类型特有 svp/pam 参数） */
  paFields: Record<string, any>;
}

// ============================================================
// 各设备类型的 fill 函数
// ============================================================

/**
 * 电梯 (3000) 技术参数
 * Java 参考: fillElevator() L698-749
 * OldDeviceSkel<ElvPara>
 */
export function fillElevator(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  // Eqp 标量字段（对应 Java: eqpBld.flo().hlf().vl()...）
  setShort(eqpFields, 'flo', tp.elefloornumber);
  setNum(eqpFields, 'hlf', tp.eleheight);
  setStr(eqpFields, 'vl', tp.runvelocity);
  setBool(eqpFields, 'nnor', tp.ifUnnormal);
  setStr(eqpFields, 'cpm', tp.conscrtype);
  setStr(eqpFields, 'tm', tp.tracangtype);
  setStr(eqpFields, 'mtm', tp.elecType);
  setStr(eqpFields, 'buff', tp.bufferMode);
  setStr(eqpFields, 'rtl', tp.ratedload);
  setStr(eqpFields, 'aap', tp.ifAdddevice);
  setStr(eqpFields, 'prot', tp.carProtectType);
  setStr(eqpFields, 'doop', tp.doorOpenType);
  setStr(eqpFields, 'limm', tp.reestspeedtype);
  setStr(eqpFields, 'opm', tp.controlType);
  setNum(eqpFields, 'lesc', tp.slidwayUseLeng);
  setStr(eqpFields, 'wesc', tp.nomiWidth);
  setBool(eqpFields, 'spec', equipment.ifSpecEqp);
  setBool(eqpFields, 'oldb', tp.ifOldbuildInst);
  // 制动试验日期
  setDate(eqpFields, 'lbkd', equipment.lastBrakeTaskDate);
  setDate(eqpFields, 'nbkd', equipment.nextBrakeTaskDate);

  // pa 中 svp 部分字段 — 电梯特有 svp 参数
  const svpFields: Record<string, any> = {};
  setStr(svpFields, '电动机类', tp.elecStyle);
  setStr(svpFields, '屏号', tp.contrscrcode);
  setStr(svpFields, '曳引号', tp.tracangleafacnumber);
  setStr(svpFields, '主机号', tp.elecCod);
  setNum(svpFields, '电机功率', toFloat(tp.electropower));
  setNum(svpFields, '电机转速', toFloat(tp.elecRev));
  setShort(svpFields, '电梯门数', toShort(tp.eledoornumber));
  setShort(svpFields, '电梯站数', toShort(tp.elestadenumber));
  setNum(svpFields, '顶层高度', toFloat(tp.topheight));
  setNum(svpFields, '对重轨距', toFloat(tp.coupOrbDist));
  setShort(svpFields, '对重块数', toShort(tp.coupNum));
  setStr(svpFields, '额定载人', tp.ratedPeople);
  setNum(svpFields, '轿厢轨距', toFloat(tp.carOrbDist));
  setStr(svpFields, '速比', tp.vpropor);
  setStr(svpFields, '拖动', tp.dragMode);
  setStr(svpFields, '曳引比', tp.dragPropor);
  setNum(svpFields, '轮节径', toFloat(tp.dragPitchDia));
  setShort(svpFields, '绳数', toShort(tp.dragNum));
  setStr(svpFields, '上护型号', tp.upProtectType);

  // 钢带/绳直径特殊处理
  let 绳直径: number | undefined;
  let 是钢带 = false;
  if (tp.dragDia) {
    const txt = String(tp.dragDia);
    if (txt.includes('*') || txt.includes('×') || txt.includes('X')) {
      是钢带 = true;
    }
    if (!是钢带) 绳直径 = toFloat(txt);
  }
  setBool(svpFields, '是钢带', 是钢带);
  setNum(svpFields, '绳直径', 绳直径);
  setStr(svpFields, '钢带规格', tp.dragDia);

  setStr(svpFields, '顶升形式', tp.topPatterns);
  setStr(svpFields, '导轨型式', tp.counorbtype);
  setNum(svpFields, '轿厢高', toFloat(tp.carHigh));
  setNum(svpFields, '轿厢宽', toFloat(tp.carWidth));
  setNum(svpFields, '轿厢深', toFloat(tp.carDeep));
  setStr(svpFields, '区域防爆', tp.fbArealevel);
  setStr(svpFields, '驱动方式', tp.drivApproach);
  setBool(svpFields, '船梯', toBool(tp.ifShip));
  setBool(svpFields, '汽车电梯', toBool(tp.ifCar));
  setNum(svpFields, '梯级宽度', toFloat(tp.rundlebreadth));
  setShort(svpFields, '悬挂绳数', toShort(tp.wireRopNum));
  setNum(svpFields, '悬挂绳径', toFloat(tp.wireRopDia));
  setShort(svpFields, '油缸数', toShort(tp.cylinderNum));
  setStr(svpFields, '油缸形式', tp.cylinderStyle);
  setStr(svpFields, '防爆标志', tp.fbMachineflag);
  setNum(svpFields, '倾斜角度', toFloat(tp.dipAngle));
  setNum(svpFields, '泵功率', toFloat(tp.pumpPower));
  setStr(svpFields, '上护装置', tp.upProtectModeandtype);

  // pa 中 pam 部分字段 — 电梯特有 pam 参数
  const pamFields: Record<string, any> = {};
  setStr(pamFields, '上护编号', tp.upProtectCod);
  setStr(pamFields, '钳型号', tp.safeclamtype);
  setStr(pamFields, '钳编号', tp.safeclamnum);
  setNum(pamFields, '底坑深度', toFloat(tp.bottomdepth));
  setStr(pamFields, '补偿方式', tp.compentype);
  setStr(pamFields, '对限速号', tp.coupLimitCod);
  setStr(pamFields, '对限速型', tp.coupLimitType);
  setNum(pamFields, '额定电流', toFloat(tp.ratedCurrent));
  setStr(pamFields, '缓型号', tp.buffertype);
  setStr(pamFields, '缓编号', tp.buffernumber);
  setStr(pamFields, '缓厂家', tp.bufferMakeUnt);
  setNum(pamFields, '上限电速', toFloat(tp.carUplimitEv));
  setNum(pamFields, '上限机速', toFloat(tp.carUplimitMv));
  setNum(pamFields, '下限电速', toFloat(tp.carDownlimitEv));
  setNum(pamFields, '下限机速', toFloat(tp.carDownlimitMv));
  setStr(pamFields, '移护型', tp.carProtectType);
  setStr(pamFields, '移护号', tp.carProtectCod);
  setStr(pamFields, '锁型号', tp.lockType);
  setStr(pamFields, '限速器号', tp.reestspleafacnumber);
  setNum(pamFields, '限绳直径', toFloat(tp.limitRopDia));
  setStr(pamFields, '爆炸物质', tp.fbSubstance);
  setNum(pamFields, '上行额速', toFloat(tp.upRatedV));
  setNum(pamFields, '下额定速', toFloat(tp.downRatedV));
  setNum(pamFields, '限机械速', toFloat(tp.limitMv));
  setStr(pamFields, '泵编号', tp.pumpCod);
  setNum(pamFields, '泵流量', toFloat(tp.pumpFlux));
  setStr(pamFields, '泵型号', tp.pumpType);
  setNum(pamFields, '泵转速', toFloat(tp.pumpSpeed));
  setStr(pamFields, '液油型号', tp.oilType);
  setStr(pamFields, '防爆证号', tp.fbHgcod);
  setStr(pamFields, '层门型号', tp.floordoortype);
  setStr(pamFields, '装修', tp.carDecorateSta);

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 压力容器 (2000) 技术参数
 * Java 参考: fillVessel() L752-800
 * OldDeviceSkel<VesPara>
 */
export function fillVessel(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  setStr(eqpFields, 'vol', tp.containervolume);
  setStr(eqpFields, 'prs', tp.despre);
  setShort(eqpFields, 'pnum', toShort(tp.capablimitnum));
  setStr(eqpFields, 'highs', tp.containerheight);
  setNum(eqpFields, 'weig', toFloat(tp.tankcartowei));
  setNum(eqpFields, 'rtlf', toFloat(tp.loadweig));
  setNum(eqpFields, 'fulw', toFloat(tp.fullyloadwei));
  setStr(eqpFields, 'mdi', tp.tinamplmedi);
  setStr(eqpFields, 'jakm', tp.covermedium);
  setStr(eqpFields, 'form', tp.carstrform);
  setStr(eqpFields, 'insul', tp.temppremode);
  setStr(eqpFields, 'mont', tp.insform);
  setStr(eqpFields, 'plat', tp.carsign);

  // SVP 字段
  const svpFields: Record<string, any> = {};
  setStr(svpFields, '结构', tp.mainstrform);
  setStr(svpFields, '支座', tp.basestyle);
  setBool(svpFields, '是换热', toBool(tp.ifContainervolume));
  setNum(svpFields, '内径', toFloat(tp.coninndia));
  setNum(svpFields, '许工作压', toFloat(tp.permPress));
  setNum(svpFields, '许工作温', toFloat(tp.permTemp));
  setStr(svpFields, '许工作介', tp.permMedium);
  setStr(svpFields, '设计介', tp.designMedium);
  setNum(svpFields, '壳设压', toFloat(tp.shelldesignpress));
  setStr(svpFields, '壳设温', tp.shelldesigntemperatrue);
  setStr(svpFields, '壳介', tp.shellmedium);
  setNum(svpFields, '管设压', toFloat(tp.tubedesignpress));
  setStr(svpFields, '管设温', tp.tubedesigntemperatrue);
  setStr(svpFields, '管介', tp.tubemedium);
  setNum(svpFields, '夹设压', toFloat(tp.coverdesignpress));
  setStr(svpFields, '夹设温', tp.coverdesigntemperatrue);
  setNum(svpFields, '筒厚', toFloat(tp.canisterply));
  setNum(svpFields, '头厚', toFloat(tp.sealply));
  setNum(svpFields, '衬厚', toFloat(tp.innerply));
  setNum(svpFields, '夹厚', toFloat(tp.coverply));
  setNum(svpFields, '人均容', toFloat(tp.avgArea));
  setNum(svpFields, '舱容限', toFloat(tp.capablimit));
  setNum(svpFields, '人均', toFloat(tp.capablimitEvery));
  setBool(svpFields, '有保温', tp.ynheatpreins === '1' || tp.ynheatpreins === '保温层');
  setNum(svpFields, '舱设压', toFloat(tp.designpress));
  setStr(svpFields, '加压式', tp.pressmode);
  setStr(svpFields, '规格', tp.vesselMod);
  setNum(svpFields, '车空重', toFloat(tp.kzzl));
  setStr(svpFields, '罐材内', tp.innjarmat);
  setStr(svpFields, '罐材外', tp.outjarmat);
  setStr(svpFields, '罐材头', tp.envjarmat);
  setNum(svpFields, '罐设压', toFloat(tp.tindesipress));
  setStr(svpFields, '底盘号', tp.tanjarbatnum);
  setNum(svpFields, '罐设温', toFloat(tp.tindesitemp));
  setNum(svpFields, '罐厚筒', toFloat(tp.bamjarwalthi));
  setNum(svpFields, '罐厚头', toFloat(tp.envjarwalthi));
  setNum(svpFields, '罐厚外筒', toFloat(tp.bamjarwalthio));
  setNum(svpFields, '罐厚外头', toFloat(tp.envjarwalthio));
  setStr(svpFields, '底盘型', tp.batholithmodel);
  setStr(svpFields, '时速', tp.designvelocityloadsurface);
  setStr(svpFields, '时速弯', tp.designvelocitycorner);
  setNum(svpFields, '罐容积', toFloat(tp.tincubage));
  setStr(svpFields, '人孔位', tp.tinholeposi);
  setNum(svpFields, '罐外内径', toFloat(tp.tinoutlineinner));
  setNum(svpFields, '罐外壁厚', toFloat(tp.tinoutlineply));
  setNum(svpFields, '罐外长', toFloat(tp.tinoutlinelength));
  setNum(svpFields, '盖厚', toFloat(tp.topPly));
  setStr(svpFields, '盖材料', tp.topMeterial);
  setStr(svpFields, '盖形式', tp.topMod);
  setStr(svpFields, '筒料球', tp.bodyMeterial);
  setNum(svpFields, '壁厚', toFloat(tp.wallThick));
  setStr(svpFields, '力类别', tp.presort);
  setStr(svpFields, '封头型', tp.sealtype);
  setBool(svpFields, '是快开', toBool(tp.ynqopen));
  setStr(svpFields, '监检式', tp.inspectform);
  setStr(svpFields, '制规范', tp.manufacturecriterion);

  // PAM 字段
  const pamFields: Record<string, any> = {};
  setNum(pamFields, '充重', toFloat(tp.loadweight));
  setNum(pamFields, '工作压', toFloat(tp.workPress));
  setNum(pamFields, '工作温', toFloat(tp.workTemp));
  setStr(pamFields, '工作介', tp.workMedium);
  setStr(pamFields, '筒料', tp.silomater);
  setStr(pamFields, '封料', tp.sealmater);
  setStr(pamFields, '衬料', tp.innermater);
  setStr(pamFields, '夹料', tp.covermater);
  setNum(pamFields, '壳用压', toFloat(tp.shellusepress));
  setNum(pamFields, '壳高压', toFloat(tp.shelltoppress));
  setNum(pamFields, '壳用温', toFloat(tp.shellusetemperatrue));
  setNum(pamFields, '管用压', toFloat(tp.tubeusepress));
  setNum(pamFields, '管高压', toFloat(tp.tubetoppress));
  setNum(pamFields, '管用温', toFloat(tp.tubetemperatrue));
  setNum(pamFields, '夹用压', toFloat(tp.coverusepress));
  setNum(pamFields, '夹高压', toFloat(tp.covertoppress));
  setNum(pamFields, '夹用温', toFloat(tp.covertemperatrue));
  setNum(pamFields, '筒腐裕', toFloat(tp.bodyRustGrade));
  setNum(pamFields, '头腐裕', toFloat(tp.headRustGrade));
  setNum(pamFields, '壳体重', toFloat(tp.chitinheft));
  setNum(pamFields, '内件重', toFloat(tp.innerheft));
  setNum(pamFields, '舱高压', toFloat(tp.topworkpress));
  setNum(pamFields, '舱用压', toFloat(tp.useworkpress));
  setStr(pamFields, '空调式', tp.airconform);
  setStr(pamFields, '照明', tp.oxycablig);
  setStr(pamFields, '测氧', tp.meaoxymod);
  setStr(pamFields, '空调机', tp.airelemac);
  setStr(pamFields, '表量程', tp.pressurerange);
  setStr(pamFields, '表精度', tp.pressureapparprecision);
  setStr(pamFields, '医疗登记', tp.enregisterno);
  setStr(pamFields, '联合国号', tp.jarundanno);
  setNum(pamFields, '罐高压', toFloat(tp.tiptoptem));
  setNum(pamFields, '罐试压', toFloat(tp.tanjarexapre));
  setNum(pamFields, '功率', toFloat(tp.enginepower));
  setStr(pamFields, '侧稳定角', tp.empsteaangel);
  setNum(pamFields, '车形长', toFloat(tp.wholecaroutlinelength));
  setNum(pamFields, '车形宽', toFloat(tp.wholecaroutlinewidth));
  setNum(pamFields, '车形高', toFloat(tp.wholecaroutlineheigth));
  setStr(pamFields, '轴荷前', tp.frfullaxisdist);
  setStr(pamFields, '轴荷后', tp.bafullaxisdist);
  setStr(pamFields, '轴荷中', tp.mifullaxisdist);
  setNum(pamFields, '充系数', toFloat(tp.tinamplmodu));
  setNum(pamFields, '充重量', toFloat(tp.tinamplweig));
  setNum(pamFields, '腐裕', toFloat(tp.tinerode));
  setStr(pamFields, '保温料', tp.tinheatpresmate);
  setStr(pamFields, '热处', tp.tinheattreafash);
  setNum(pamFields, '耐试压', toFloat(tp.tintestpress));
  setStr(pamFields, '气试压', tp.tingastestpress);
  setStr(pamFields, '铭牌位', tp.namplapos);
  setStr(pamFields, '罐色', tp.jarbodcor);
  setStr(pamFields, '运行态', tp.motionSta);
  setStr(pamFields, '安全', tp.securityLev);
  setStr(pamFields, '装卸位', tp.loaugropos);
  setStr(pamFields, '装卸式', tp.mediassemode);
  setStr(pamFields, '危险介', tp.dangerMedType);

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 起重机械 (4000) 技术参数
 * Java 参考: fillCrane() L819-877
 * OldDeviceSkel<CraPara>
 */
export function fillCrane(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  setBool(eqpFields, 'nnor', toBool(tp.ifUnnormal));
  setNum(eqpFields, 'rtlf', toFloat(tp.chaengloa));
  setStr(eqpFields, 'vls', tp.ratedspeed);
  setStr(eqpFields, 'rvl', tp.runV);
  setStr(eqpFields, 'mvl', tp.liftespeedmain);
  setStr(eqpFields, 'cvl', tp.lCarV);
  setStr(eqpFields, 'scv', tp.sCarV);
  setStr(eqpFields, 'lmv', tp.lanmovspe);
  setStr(eqpFields, 'rtv', tp.rotatesvelocity);
  setStr(eqpFields, 'luff', tp.alterrangevelocity);
  setShort(eqpFields, 'flo', toShort(tp.tcFloornum));
  setShort(eqpFields, 'pnum', toShort(tp.bernus));
  setNum(eqpFields, 'hlfm', toFloat(tp.eleheightmain));
  setNum(eqpFields, 'hlf', toFloat(tp.eleheight));
  setStr(eqpFields, 'rang', tp.range);
  setNum(eqpFields, 'span', toFloat(tp.span));
  setBool(eqpFields, 'two', toBool(tp.ifTwoCab));
  setBool(eqpFields, 'twoc', toBool(tp.ifTwoLcar));
  setBool(eqpFields, 'grab', toBool(tp.ifGrabB));
  setBool(eqpFields, 'suck', toBool(tp.ifSuctorial));
  setBool(eqpFields, 'cotr', toBool(tp.ifContainH));
  setBool(eqpFields, 'walk', toBool(tp.ifXzs));
  setStr(eqpFields, 'mom', tp.chaadvmom);
  setBool(eqpFields, 'whole', toBool(tp.ifZjcc));
  setStr(eqpFields, 'pcs', tp.tcCarsize);
  setStr(eqpFields, 'pcw', tp.tcCarweight);
  setNum(eqpFields, 'miot', toFloat(tp.tcIoMaxtime));
  setStr(eqpFields, 'opm', tp.operStytle);
  setStr(eqpFields, 'luf', tp.alterrangemode);
  setStr(eqpFields, 'jobl', tp.workgrade);
  setStr(eqpFields, 'highs', tp.tcEqphigh);
  setStr(eqpFields, 'part', tp.upBody);
  setBool(eqpFields, 'metl', toBool(tp.ifMetallurgy));
  setStr(eqpFields, 'cap', tp.maxratedcarrymass);
  setBool(eqpFields, 'auxh', toBool(tp.ifViceLoad));
  setBool(eqpFields, 'wjib', toBool(tp.ifViceArm));

  // 使用场所
  setStr(eqpFields, 'occa', equipment.eqpUseOcca);

  const svpFields: Record<string, any> = {};
  setStr(svpFields, '臂构式', tp.qmBjstyle);
  setStr(svpFields, '臂类', tp.qmBjtype);
  setStr(svpFields, '变幅施', tp.qmAlterrangemode);
  setStr(svpFields, '节联接', tp.qmBzjlstyle);
  setStr(svpFields, '层站数', tp.layerstage);
  setStr(svpFields, '搭载式', tp.carryMethod);
  setStr(svpFields, '底架型', tp.basetype);
  setStr(svpFields, '吊臂型', tp.cranearmtype);
  setNum(svpFields, '钩时额量', toFloat(tp.dgMaxratedcarrymass));
  setStr(svpFields, '钩时幅', tp.dgRange);
  setNum(svpFields, '斗时额量', toFloat(tp.zdMaxratedcarrymass));
  setStr(svpFields, '斗时幅', tp.zdRange);
  setNum(svpFields, '专时额量', toFloat(tp.zyMaxratedcarrymass));
  setStr(svpFields, '专时幅', tp.zyRange);
  setStr(svpFields, '主吊具', tp.qmMainupType);
  setNum(svpFields, '额起升速', toFloat(tp.liftespeedvalue));
  setNum(svpFields, '制动载荷', toFloat(tp.ratbraloa));
  setStr(svpFields, '防爆', tp.exSign);
  setStr(svpFields, '防爆级', tp.explosiveLevel);
  setStr(svpFields, '附装名', tp.auxiName);
  setStr(svpFields, '附装品', tp.auxiType);
  setNum(svpFields, '工半径', toFloat(tp.workradius));
  setStr(svpFields, '工环境', tp.workcondition);
  setStr(svpFields, '轨长', tp.raillenth);
  setStr(svpFields, '轨长桥', tp.trackLen);
  setNum(svpFields, '轨距', toFloat(tp.gauge));
  setStr(svpFields, '回转', tp.qmHzstyle);
  setNum(svpFields, '架桥承', toFloat(tp.jqjRatebearing));
  setStr(svpFields, '架设式', tp.spanmode);
  setStr(svpFields, '架设跨', tp.spabesdia);
  setStr(svpFields, '监检式', tp.inspectform);
  setNum(svpFields, '门跨度', toFloat(tp.spanLen));
  setStr(svpFields, '门结构', tp.qmMjstyle);
  setNum(svpFields, '平衡重', toFloat(tp.counterbalance));
  setNum(svpFields, '副钩高', toFloat(tp.eleheightvice));
  setNum(svpFields, '起升速', toFloat(tp.liftespeed));

  // PAM 字段（起重特有）
  const pamFields: Record<string, any> = {};
  setNum(pamFields, '充重限', toFloat(tp.loadweight)); // TODO: 确认字段名
  setStr(pamFields, '车方法', tp.carMode);
  setStr(pamFields, '工作幅', tp.workRange);
  setNum(pamFields, '工作幅', toFloat(tp.workRange));
  setStr(pamFields, '悬长', tp.overhangLen);
  setNum(pamFields, '悬2长', toFloat(tp.overhangLen2));
  setStr(pamFields, '移动型', tp.qmMovetype);
  setStr(pamFields, '有监控', tp.ifMonitor);
  setNum(pamFields, '架铰高', toFloat(tp.jiaojiaoHeight));
  setStr(pamFields, '监系单', tp.monitorUnit);
  setStr(pamFields, '监系号', tp.monitorCod);
  setStr(pamFields, '监系型', tp.monitorType);
  setStr(pamFields, '导支跨度', tp.guideSpan);
  setNum(pamFields, '深度', toFloat(tp.downDeep));
  setNum(pamFields, '降速', toFloat(tp.downSpeed));
  setNum(pamFields, '驶速度', toFloat(tp.runningspeed));
  setStr(pamFields, '走范围', tp.movrange);
  setNum(pamFields, '走速度', toFloat(tp.movingvelocity));
  setNum(pamFields, '效半径', toFloat(tp.effRadius));
  setNum(pamFields, '效重量', toFloat(tp.expcarrymass));
  setNum(pamFields, '车运行时', toFloat(tp.runTime));
  setStr(pamFields, '轨道', tp.runTrack);
  setNum(pamFields, '总功', toFloat(tp.wholemachinetotalpower));
  setNum(pamFields, '钩1重', toFloat(tp.chaengloamain));
  setNum(pamFields, '钩2重', toFloat(tp.chaengloamain2));
  setNum(pamFields, '余冲程', toFloat(tp.cypStr));
  setNum(pamFields, '自由高', toFloat(tp.freeehigh));
  setNum(pamFields, '独立高', toFloat(tp.qmMaxhigh));
  setNum(pamFields, '外伸距', toFloat(tp.maxOutlen));
  setStr(pamFields, '最小幅监', tp.minMargins);
  setStr(pamFields, '最小幅', tp.minworkrange);
  setNum(pamFields, '附着', toFloat(tp.attachFloor));

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 锅炉 (1000) 技术参数
 * Java 参考: fillBoiler() L924-962
 * 
 * TODO: 锅炉具体字段需根据实际接口返回调整
 */
export function fillBoiler(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  // Eqp 标量字段 (Java L2324-2326)
  setBool(eqpFields, 'wall', toBool(tp.ifBoilWall));      // wall: "是".equals(pjy.getIfBoilWall())
  setNum(eqpFields, 'power', toFloat(tp.ratcon));          // power: ratcon
  setStr(eqpFields, 'form', tp.mainstrform);               // form: mainstrform
  setStr(eqpFields, 'fuel', tp.burningtype);               // fuel: burningtype
  setStr(eqpFields, 'pres', tp.desworkpress);              // pres: desworkpress
  setStr(eqpFields, 'bmod', tp.burnmode);                  // bmod: burnmode
  setBool(eqpFields, 'asemb', toBool(tp.factoryType === '整组装'));

  // SVP 字段（锅炉技术参数）— 字段名对应 Java BoilerDat getter
  const svpFields: Record<string, any> = {};
  setStr(svpFields, '加热方式', tp.heatupmode);             // getHeatupmode()
  setStr(svpFields, '水循环', tp.watercircletype);          // getWatercircletype()
  setStr(svpFields, '工作介质', tp.workMedium);             // getWorkMedium()
  setStr(svpFields, '安装况', tp.instCon);                  // getInstCon()
  setStr(svpFields, '炉房型', tp.stokeholdtype);            // getStokeholdtype()
  setStr(svpFields, '汽水分离', tp.gaswaterapartmode);      // getGaswaterapartmode()
  setStr(svpFields, '用途', tp.sepurp);                     // getSepurp()
  setStr(svpFields, '主体材料', tp.mainmate);               // getMainmate()
  setStr(svpFields, '过热调温', tp.steamtemptype);          // getSteamtemptype()
  setStr(svpFields, '介名', tp.mediumName);                 // getMediumName()
  setStr(svpFields, '介牌号', tp.mediumCod);                // getMediumCod()
  setNum(svpFields, '介许温', toFloat(tp.mediumAllowTemp)); // getMediumAllowTemp()
  setStr(svpFields, '予热器构', tp.warmupstrform);          // getWarmupstrform()
  setStr(svpFields, '燃器布置', tp.burntlaytype);           // getBurntlaytype()
  setStr(svpFields, '烧设备', tp.burequ);                   // getBurequ()
  setStr(svpFields, '设标准', tp.dessta);                   // getDessta()
  setStr(svpFields, '设出口温', tp.desexptem);              // getDesexptem()
  setStr(svpFields, '设出口压', tp.desexpstr);              // getDesexpstr()
  setStr(svpFields, '设规范', tp.designcriterion);          // getDesigncriterion()
  setStr(svpFields, '设挥发', tp.burntvolati);              // getBurntvolati()
  setNum(svpFields, '设热效', toFloat(tp.desithereffi));    // getDesithereffi()
  setNum(svpFields, '设低热', toFloat(tp.lowburnvalue));    // getLowburnvalue()
  setStr(svpFields, '设低热位', tp.lowburnunit);            // getLowburnunit()
  setStr(svpFields, '状态', tp.usestates);                  // getUsestates()
  setStr(svpFields, '水处式', tp.waterdealtype);            // getWaterdealtype()
  setStr(svpFields, '水处设型', tp.waterClMod);             // getWaterClMod()
  setNum(svpFields, '制水能力', toFloat(tp.woEqpPress));    // getWoEqpPress()
  setStr(svpFields, '水处造单', tp.waterEqpMakeUntName);    // getWaterEqpMakeUntName()
  setStr(svpFields, '水源种', tp.fousor);                   // getFousor()
  setStr(svpFields, '烟尘式', tp.sootavoidmode);            // getSootavoidmode()
  setStr(svpFields, '许用压', tp.usestr);                    // getUsestr()
  setStr(svpFields, '有载牌号', tp.orghcarbno);             // getOrghcarbno()
  setStr(svpFields, '许工温', tp.allwortem);                // getAllwortem()
  setStr(svpFields, '再热调温', tp.resteamtemptype);        // getResteamtemptype()
  setStr(svpFields, '蒸汽用途', tp.steamfor);               // getSteamfor()
  setStr(svpFields, '制造范', tp.manufacturecriterion);     // getManufacturecriterion()

  // PAM 字段（优先采信旧检验平台: pms = null==pjy ? pjc : pjy）
  const pamFields: Record<string, any> = {};
  setNum(pamFields, '饱和温度', toFloat(tp.sattem));               // getSattem()
  setStr(pamFields, '补给水', tp.addwaterdealtype);                 // getAddwaterdealtype()
  setStr(pamFields, '出口温', tp.expwortem);                        // getExpwortem()
  setStr(pamFields, '出口压', tp.expworstr);                        // getExpworstr()
  setStr(pamFields, '出热量', tp.outHot);                           // getOutHot()
  setNum(pamFields, '出水温度', toFloat(tp.comwattem));             // getComwattem()
  setStr(pamFields, '出渣', tp.drosstype);                          // getDrosstype()
  setStr(pamFields, '除氧', tp.deoxidizemode);                      // getDeoxidizemode()
  setNum(pamFields, '司炉数', toFloat(tp.boilernum));               // getBoilernum()
  setStr(pamFields, '电站情况', tp.othpara);                        // getOthpara()
  setNum(pamFields, '额定出力', toFloat(tp.heatPow));               // getHeatPow()
  setStr(pamFields, '给水温', tp.feedwatertem);                     // getFeedwatertem()
  setStr(pamFields, '给水压', tp.feewatstr);                        // getFeewatstr()
  setStr(pamFields, '工作温度', tp.workTemp);                       // getWorkTemp()
  setStr(pamFields, '筒工作压', tp.siloworkpress);                  // getSiloworkpress()
  setStr(pamFields, '过热温', tp.steamexporttem);                   // getSteamexporttem()
  setStr(pamFields, '过热压', tp.steamexportpress);                 // getSteamexportpress()
  setStr(pamFields, '回水温', tp.bacwattem);                        // getBacwattem()
  setStr(pamFields, '介出温', tp.mediexporttemp);                   // getMediexporttemp()
  setStr(pamFields, '介验日', tp.mediumAssayDate);                  // getMediumAssayDate()
  setStr(pamFields, '试验介质', tp.compressTryMedium);              // getCompressTryMedium()
  setStr(pamFields, '压验日', tp.compressTryDate);                  // getCompressTryDate()
  setNum(pamFields, '试压力', toFloat(tp.strexmstr));               // getStrexmstr()
  setNum(pamFields, '再热出温', toFloat(tp.resteamexporttem));      // getResteamexporttem()
  setStr(pamFields, '能效测标', tp.nxcod);                          // getNxcod()
  setStr(pamFields, '能效评价', tp.effEval);                        // getEffEval()
  setStr(pamFields, '省煤构', tp.pinchstrform);                     // getPinchstrform()
  setNum(pamFields, '蒸发量', toFloat(tp.workPower));               // getWorkPower()
  setNum(pamFields, '使用年限', toFloat(tp.workAge));               // getWorkAge()
  setBool(pamFields, '有过热器', toBool(tp.steamif === '是' || tp.steamif === '有'));  // getSteamif()
  setStr(pamFields, '使用压力', tp.workPress);                      // getWorkPress()
  setStr(pamFields, '受热布置', tp.beheatMachType);                 // getBeheatMachType()
  setStr(pamFields, '水处模式', tp.waterYxms);                      // getWaterYxms()
  setStr(pamFields, '水压试日', tp.watPrsDate);                     // getWatPrsDate()
  setNum(pamFields, '水压试力', toFloat(tp.watPrs));                // getWatPrs()
  setStr(pamFields, '水油联话', tp.userWaLinkphone);                // getUserWaLinkphone()
  setStr(pamFields, '水油联人', tp.userWaLinkman);                  // getUserWaLinkman()
  setNum(pamFields, '水员数', toFloat(tp.waterdealnum));            // getWaterdealnum()
  setStr(pamFields, '液验介', tp.hydrDressTryMedium);               // getHydrDressTryMedium()
  setStr(pamFields, '液验日', tp.hydrDressTryDate);                 // getHydrDressTryDate()
  setNum(pamFields, '液验压', toFloat(tp.hydrDressTryPress));       // getHydrDressTryPress()
  setNum(pamFields, '再热入温', toFloat(tp.resteamimporttem));      // getResteamimporttem()
  setNum(pamFields, '再热出压', toFloat(tp.resteamexportpress));    // getResteamexportpress()
  setNum(pamFields, '再热入压', toFloat(tp.resteamimportpress));    // getResteamimportpress()
  setNum(pamFields, '再汽流', toFloat(tp.reheatflux));              // getReheatflux()
  setNum(pamFields, '直启动流', toFloat(tp.direboilerstartflux));   // getDireboilerstartflux()
  setNum(pamFields, '直启动压', toFloat(tp.direboilerstartpress));  // getDireboilerstartpress()
  setStr(pamFields, '最连蒸', tp.mostvapovalue);                    // getMostvapovalue()

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 场(厂)内机动车辆 (5000) 技术参数
 * Java 参考: fillFactoryVehicle() L965-987
 */
export function fillFactoryVehicle(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  setStr(eqpFields, 'pow', tp.dynamicmode);
  setNum(eqpFields, 'rtlf', toFloat(tp.ratedloadweig));
  setStr(eqpFields, 'mtm', tp.enginemodel);

  const svpFields: Record<string, any> = {};
  setStr(svpFields, '牌型', tp.brandmodel);
  setStr(svpFields, '防爆级', tp.explosiveLevel);
  setStr(svpFields, '车类型', tp.cartype);
  setShort(svpFields, '厢数', toShort(tp.carNum));
  setStr(svpFields, '传动', tp.drivApproach);
  setStr(svpFields, '底盘号', tp.batnum);
  setStr(svpFields, '电机号', tp.motornum);
  setStr(svpFields, '机编号', tp.engnum);
  setNum(svpFields, '机功率', toFloat(tp.enginePower));
  setNum(svpFields, '机转速', toFloat(tp.engineV));
  setStr(svpFields, '后轮距', tp.rearTrack);
  setShort(svpFields, '驾员', toShort(tp.cabquota));
  setNum(svpFields, '升最高', toFloat(tp.maxlifheightWithoutLoad));
  setStr(svpFields, '前轮距', tp.frontGauge);
  setStr(svpFields, '燃料', tp.burkin);
  setStr(svpFields, '电压', tp.systemVoltage);
  setStr(svpFields, '行装置', tp.carriDevic);
  setNum(svpFields, '最坡度', toFloat(tp.maxDriveSlope));
  setNum(svpFields, '时速', toFloat(tp.tiptopmph));

  const pamFields: Record<string, any> = {};
  setStr(pamFields, '环境', tp.vehicUseEnv);
  setStr(pamFields, '用区域', tp.carUseArea);
  setNum(pamFields, '车空重', toFloat(tp.emptyWeight));
  setStr(pamFields, '胎型', tp.tyreType);
  setShort(pamFields, '厢座位', toShort(tp.carriageSeatsNum));
  setShort(pamFields, '头座位', toShort(tp.frontSeatsNum));
  setNum(pamFields, '引力', toFloat(tp.dragPower));
  setStr(pamFields, '驱动', tp.driver);
  setStr(pamFields, '油类', tp.fueltype);
  setStr(pamFields, '场防爆级', tp.fbArealevel);
  setStr(pamFields, '区域型', tp.useArea);
  setStr(pamFields, '颜色', tp.color);
  setBool(pamFields, '有拖', toBool(tp.trailer));
  setNum(pamFields, '速度', toFloat(tp.runspeed));
  setNum(pamFields, '载心距', toFloat(tp.loadCenter));

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 大型游乐设施 (6000) 技术参数
 * Java 参考: fillAmusement() L990-1018
 */
export function fillAmusement(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  // 等级在 fillEqpBase 中已处理
  setStr(eqpFields, 'angl', tp.swingangle);
  setNum(eqpFields, 'leng', toFloat(tp.length));
  setShort(eqpFields, 'pnum', toShort(tp.ratedpassengernum));
  setStr(eqpFields, 'vl', tp.ratedvelocity);
  setStr(eqpFields, 'sdia', tp.turningdiameter);
  setStr(eqpFields, 'grad', tp.grade);
  setBool(eqpFields, 'mbig', toBool(tp.ifShift));
  setNum(eqpFields, 'high', toFloat(tp.height));
  setNum(eqpFields, 'hlf', toFloat(tp.movHigh));

  const svpFields: Record<string, any> = {};
  setNum(svpFields, '半径', toFloat(tp.radii));
  setStr(svpFields, '蹦极', tp.jumpType);
  setNum(svpFields, '场面积', toFloat(tp.carageArea));
  setStr(svpFields, '电压', tp.pressure);
  setNum(svpFields, '额载荷', toFloat(tp.ratedload));
  setNum(svpFields, '副速度', toFloat(tp.subvelocity));
  setNum(svpFields, '绳直径', toFloat(tp.wireropedia));
  setNum(svpFields, '高差', toFloat(tp.heigdiff));
  setNum(svpFields, '轨长', toFloat(tp.raiwaylen));
  setNum(svpFields, '轨高', toFloat(tp.trackheigh));
  setShort(svpFields, '轨数', toShort(tp.raiwaynum));
  setNum(svpFields, '轨距', toFloat(tp.gauge));
  setStr(svpFields, '提送', tp.slidewayMachine);
  setStr(svpFields, '道种类', tp.slidewayType);
  setStr(svpFields, '道材索根', tp.slidewayStuff);
  setShort(svpFields, '索数', toShort(tp.slideNum));
  setStr(svpFields, '回收式', tp.backType);
  setStr(svpFields, '驱动式', tp.driveform);
  setNum(svpFields, '设备高', toFloat(tp.eqpHigh));
  setNum(svpFields, '深度', toFloat(tp.depth));
  setBool(svpFields, '小蹦', toBool(tp.ifMinJump));
  setStr(svpFields, '池型', tp.poolType);
  setNum(svpFields, '池深', toFloat(tp.carniewterdeep));
  setNum(svpFields, '舱高', toFloat(tp.seatheight));
  setShort(svpFields, '舱数', toShort(tp.seacabnum));

  const pamFields: Record<string, any> = {};
  setShort(pamFields, '车数', toShort(tp.carShpNum));
  setNum(pamFields, '电动机转速', toFloat(tp.eleMotoRev));
  setNum(pamFields, '副功率', toFloat(tp.subpower));
  setNum(pamFields, '轨距长', toFloat(tp.gaugelength));
  setStr(pamFields, '回收装', tp.recovery);
  setNum(pamFields, '主功率', toFloat(tp.drivemainpower));
  setNum(pamFields, '滑梯高', toFloat(tp.waterslideheight));
  setNum(pamFields, '平距', toFloat(tp.lineWidth));
  setNum(pamFields, '线速度', toFloat(tp.linevelocity));
  setNum(pamFields, '圆速度', toFloat(tp.cirspe));
  setNum(pamFields, '直半径', toFloat(tp.diarad));

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 压力管道 (8000) 技术参数
 * Java 参考: fillPipeline() L1021-1050
 */
export function fillPipeline(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  setStr(eqpFields, 'level', tp.pipelineLevel);
  setStr(eqpFields, 'matr', tp.pipelineMedium);
  setStr(eqpFields, 'mdi', tp.workMedium);
  setStr(eqpFields, 'temp', tp.designTemp);
  setStr(eqpFields, 'prs', tp.designPress);

  // 设备名称（如有需要）
  // setStr(eqpFields, 'titl', equipment.eqpName || tp.boxName);

  const svpFields: Record<string, any> = {};
  setStr(svpFields, '保温式', tp.adiabaticType);
  setStr(svpFields, '腐材料', tp.embalmment);
  setNum(svpFields, '腐裕量', toFloat(tp.rotAmount));
  setNum(svpFields, '工作温', toFloat(tp.workTemp));
  setNum(svpFields, '工作压', toFloat(tp.workPress));
  setNum(svpFields, '公壁厚', toFloat(tp.nominalPly));
  setNum(svpFields, '公直径', toFloat(tp.nominalDia));
  setNum(svpFields, '衬厚', toFloat(tp.innerPly));
  setStr(svpFields, '起点', tp.startPlace);
  setStr(svpFields, '止点', tp.endPlace);
  setStr(svpFields, '管道设备名', equipment.eqpName);
  setNum(svpFields, '最高温', toFloat(tp.topWorkTemp));
  setNum(svpFields, '最高压', toFloat(tp.topWorkPress));
  setStr(svpFields, '附属设', equipment.ifFsEqp);

  const pamFields: Record<string, any> = {};
  setNum(pamFields, '保装数', toFloat(tp.safeMecNum));
  setStr(pamFields, '腐施单', tp.antisepsisUnt);
  setNum(pamFields, '根数', toFloat(tp.pipeNum));
  setNum(pamFields, '总长', toFloat(tp.length));
  setStr(pamFields, '敷设', tp.layMode);
  setStr(pamFields, '管规', tp.pipelineSpec);
  setNum(pamFields, '管厚', toFloat(tp.pipelinePly));
  setStr(pamFields, '管材牌', tp.pipelineDatumSign);
  setNum(pamFields, '焊口数', toFloat(tp.hkNum));
  setStr(pamFields, '绝热材', tp.adiabaticMedium);
  setNum(pamFields, '绝热厚', toFloat(tp.adiabaticPly));
  setStr(pamFields, '衬料', tp.innerMedium);
  setNum(pamFields, '实用时', toFloat(tp.useTime));
  setNum(pamFields, '试压', toFloat(tp.tryPress));
  setStr(pamFields, '输送介', tp.sendMedium);
  setNum(pamFields, '探伤比', toFloat(tp.falwRadio));
  setStr(pamFields, '保温', tp.ifSavetemp);

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 升降机 (4800) 技术参数（归入 Crane 子类）
 * Java 参考: fillCrane升降机() L881-921
 */
export function fillCraneLift(equipment: ExtractedEquipment): TechSyncResult {
  // 对应 Java MaintenanceMutation.fillCrane升降机 L2284-2312
  // 使用 IlifsParg 参数表，字段与 Crane 不同
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  // Eqp 标量字段 (Java L2284-2288)
  setNum(eqpFields, 'flo', toFloat(tp.floorNum));          // flo: floorNum
  setStr(eqpFields, 'vls', tp.ratedV);                     // vls: ratedV
  setNum(eqpFields, 'rtlf', toFloat(tp.ratedLoad));        // rtlf: ratedLoad
  setStr(eqpFields, 'jobl', tp.workLevl);                  // jobl: workLevl
  setStr(eqpFields, 'opm', tp.controlType);                // opm: controlType
  setStr(eqpFields, 'cpi', tp.conScreenCod);               // cpi: conScreenCod
  setStr(eqpFields, 'cpm', tp.conScreenType);              // cpm: conScreenType
  setNum(eqpFields, 'mom', toFloat(tp.maxMoment));         // mom: maxMoment
  setBool(eqpFields, 'nnor', toBool(tp.ifUnnormal === '是')); // nnor: ifUnnormal
  setBool(eqpFields, 'twoc', toBool(tp.ifTwoHois === '是')); // twoc: ifTwoHois
  setNum(eqpFields, 'hlf', toFloat(tp.upHigh));            // hlf: upHigh
  setStr(eqpFields, 'tm', tp.dragType);                    // tm: dragType
  setStr(eqpFields, 'tno', tp.dragCod);                    // tno: dragCod
  setNum(eqpFields, 'ns', toFloat(tp.stationNum));         // ns: stationNum
  setStr(eqpFields, 'occa', equipment.eqpUseOcca);         // occa: (from jcb/jyb)

  // SVP 字段 (Java L2291-2299)
  const svpFields: Record<string, any> = {};
  setStr(svpFields, '节联接', tp.connectType);              // 节联接: connectType
  setStr(svpFields, '层门型', tp.doorPattern);              // 层门型: doorPattern
  setStr(svpFields, '层门式', tp.doorStytle);               // 层门式: doorStytle
  setStr(svpFields, '传动', tp.drivApproach);               // 传动: drivApproach
  setStr(svpFields, '葫芦号', tp.hoistCod);                 // 葫芦号: hoistCod
  setStr(svpFields, '葫芦型', tp.hoistType);                // 葫芦型: hoistType
  setStr(svpFields, '电机号', tp.elecCod);                  // 电机号: elecCod
  setStr(svpFields, '电动机类', tp.elecStyle);              // 电动机类: elecStyle
  setStr(svpFields, '电机型', tp.elecType);                 // 电机型: elecType
  setNum(svpFields, '笼数', toFloat(tp.hoisNum));           // 笼数: hoisNum
  setStr(svpFields, '对重块数', tp.coupNum);                // 对重块数: coupNum
  setStr(svpFields, '对绳径', tp.coupRopDia);               // 对绳径: coupRopDia
  setStr(svpFields, '额定载人', tp.ratedPeople);            // 额定载人: ratedPeople
  setStr(svpFields, '坠保护', tp.fallProtect);              // 坠保护: fallProtect
  setStr(svpFields, '附属种', tp.auxiType);                 // 附属种: auxiType
  setStr(svpFields, '工作式', tp.operStytle);               // 工作式: operStytle
  setStr(svpFields, '缓冲器', tp.bufferMode);               // 缓冲器: bufferMode
  setStr(svpFields, '限速器型', tp.carlimitVType);          // 限速器型: carlimitVType
  setStr(svpFields, '门式', tp.doorCloseType);              // 门式: doorCloseType
  setStr(svpFields, '门驱动', tp.doorDriveType);            // 门驱动: doorDriveType
  setStr(svpFields, '门方向', tp.doorOpenDict);             // 门方向: doorOpenDict
  setStr(svpFields, '伸展', tp.spanStruct);                 // 伸展: spanStruct
  setBool(svpFields, '是防爆', toBool(tp.ifExplosive === '是')); // 是防爆: ifExplosive
  setBool(svpFields, '绝缘', toBool(tp.ifInsulation === '是')); // 绝缘: ifInsulation
  setBool(svpFields, '有附装', toBool(tp.ifAuxi === '是')); // 有附装: ifAuxi
  setStr(svpFields, '拖动', tp.dragMode);                   // 拖动: dragMode
  setStr(svpFields, '绳数', tp.dragNum);                    // 绳数: dragNum
  setNum(svpFields, '绳直径', toFloat(tp.dragDia));         // 绳直径: dragDia
  setNum(svpFields, '最大幅', toFloat(tp.margins));         // 最大幅: margins
  setNum(svpFields, '最工幅', toFloat(tp.trackLen));        // 最工幅: trackLen

  // PAM 字段 (Java L2301-2311)
  const pamFields: Record<string, any> = {};
  setStr(pamFields, '钳编号', tp.safeCod);                  // 钳编号: safeCod
  setStr(pamFields, '钳型号', tp.safeType);                 // 钳型号: safeType
  setStr(pamFields, '电机功率', tp.elecPower);               // 电机功率: elecPower
  setStr(pamFields, '电机转速', tp.elecRev);                // 电机转速: elecRev
  setStr(pamFields, '笼行程', tp.hoisTrip);                 // 笼行程: hoisTrip
  setNum(pamFields, '顶层高度', toFloat(tp.topHigh));       // 顶层高度: topHigh
  setNum(pamFields, '对重轨距', toFloat(tp.coupOrbDist));   // 对重轨距: coupOrbDist
  setStr(pamFields, '额定电流', tp.ratedCurrent);            // 额定电流: ratedCurrent
  setStr(pamFields, '防爆标志', tp.blastsign);               // 防爆标志: blastsign
  setStr(pamFields, '坠安号', tp.fallSaveCod);              // 坠安号: fallSaveCod
  setStr(pamFields, '坠安型', tp.fallSaveType);             // 坠安型: fallSaveType
  setStr(pamFields, '缓编号', tp.bufferCod);                // 缓编号: bufferCod
  setStr(pamFields, '缓型号', tp.bufferType);               // 缓型号: bufferType
  setStr(pamFields, '缓厂家', tp.bufferMakeUnt);            // 缓厂家: bufferMakeUnt
  setNum(pamFields, '轨架高', toFloat(tp.counorbHeightIsping)); // 轨架高: counorbHeightIsping
  setNum(pamFields, '笼数检', toFloat(tp.hoisNumIsping));   // 笼数检: hoisNumIsping
  setStr(pamFields, '对块数检', tp.coupNumIsping);          // 对块数检: coupNumIsping
  setNum(pamFields, '附墙架', toFloat(tp.wallNumIsping));   // 附墙架: wallNumIsping
  setNum(pamFields, '轿厢轨距', toFloat(tp.carOrbDist));    // 轿厢轨距: carOrbDist
  setStr(pamFields, '下限电速', tp.carDownlimitEv);         // 下限电速: carDownlimitEv
  setStr(pamFields, '下限机速', tp.carDownlimitMv);         // 下限机速: carDownlimitMv
  setStr(pamFields, '限速器号', tp.carlimitVCod);           // 限速器号: carlimitVCod
  setNum(pamFields, '门数', toFloat(tp.doorNum));           // 门数: doorNum
  setStr(pamFields, '环境', tp.taskCondition);              // 环境: taskCondition
  setStr(pamFields, '速比', tp.vPropor);                    // 速比: vPropor
  setNum(pamFields, '提绳径', toFloat(tp.upRopDia));        // 提绳径: upRopDia
  setStr(pamFields, '限机械速', tp.limitMv);                // 限机械速: limitMv
  setNum(pamFields, '限绳直径', toFloat(tp.limitRopDia));   // 限绳直径: limitRopDia
  setStr(pamFields, '型试样', tp.testInfo);                 // 型试样: testInfo
  setStr(pamFields, '曳引比', tp.dragPropor);               // 曳引比: dragPropor
  setStr(pamFields, '轮节径', tp.dragPitchDia);             // 轮节径: dragPitchDia
  setStr(pamFields, '用途', tp.eqpUse);                     // 用途: eqpUse
  setNum(pamFields, '自由高', toFloat(tp.feedHigh));        // 自由高: feedHigh
  setNum(pamFields, '独立高', toFloat(tp.mostTop));         // 独立高: mostTop
  setStr(pamFields, '作业人', tp.workMan);                  // 作业人: workMan

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

/**
 * 常压容器 (R000) 技术参数（归入 Vessel 子类）
 * Java 参考: fillVessel常() L803-816
 */
export function fillVesselNormal(equipment: ExtractedEquipment): TechSyncResult {
  const tp = equipment.techParam || {};
  const eqpFields: Record<string, any> = {};

  setStr(eqpFields, 'vol', tp.cubage);
  setNum(eqpFields, 'rtlf', toFloat(tp.ratedLoad));
  setStr(eqpFields, 'plat', tp.vehicNum);

  const svpFields: Record<string, any> = {};
  setStr(svpFields, '车辆类', tp.carType);
  setStr(svpFields, '车架', tp.cjNo);
  setStr(svpFields, '发动机', tp.engineCod);

  const pamFields: Record<string, any> = {};
  setStr(pamFields, '介质', tp.innerMedium);
  setStr(pamFields, '铭牌', tp.nameplateState);
  setStr(pamFields, '运输证', tp.sendCert);
  setStr(pamFields, '外尺寸', tp.shapeSize);
  setNum(pamFields, '额定压', toFloat(tp.designPress));
  setNum(pamFields, '价格', toFloat(equipment.eqpPrice));
  setNum(pamFields, '桶数', toFloat(tp.tubSum));
  setStr(pamFields, '桶规格', tp.tubType);

  return { eqpFields, paFields: { ...svpFields, ...pamFields } };
}

// ============================================================
// 设备类型分发映射
// ============================================================

/**
 * 设备类型 -> 技术参数转换函数映射
 * 
 * 旧平台 eqpType 编码对应关系：
 *   1000 -> Boiler (锅炉)
 *   2000 -> Vessel (压力容器)
 *   3000 -> Elevator (电梯)
 *   4000 -> Crane (起重机械)
 *   4800 -> Crane (升降机) — 归入起重子类
 *   5000 -> FactoryVehicle (场车)
 *   6000 -> Amusement (游乐设施)
 *   8000 -> Pipeline (管道)
 *   9000 -> Ropeway (客运索道 — 暂未实现)
 *   R000 -> Vessel (常压容器) — 归入容器子类
 */
const TECH_PARAM_DISPATCH: Record<string, (equipment: ExtractedEquipment) => TechSyncResult> = {
  '3000': fillElevator,
  '2000': fillVessel,
  'R000': fillVesselNormal,
  '4000': fillCrane,
  '4800': fillCraneLift,
  '1000': fillBoiler,
  '5000': fillFactoryVehicle,
  '6000': fillAmusement,
  '8000': fillPipeline,
};

/**
 * 根据设备类型提取技术参数
 * 
 * 对应 Java InfRecvConvert.java L460-505 的分发逻辑
 */
export function fillTechParams(
  eqpType: string,
  equipment: ExtractedEquipment
): TechSyncResult {
  // eqpType=4000 时需进一步按 eqpSort 区分：4800=升降机，其余=普通起重
  let actualType = eqpType;
  if (eqpType === '4000' && equipment.eqpSort === '4800') {
    actualType = '4800';
  }
  const fillFn = TECH_PARAM_DISPATCH[actualType];

  if (!fillFn) {
    console.warn(`[EqpTechSync] No tech param fill function for eqpType=${eqpType}, skipping`);
    return { eqpFields: {}, paFields: {} };
  }

  try {
    const result = fillFn(equipment);
    const logType = actualType !== eqpType ? `${eqpType}->${actualType}` : eqpType;
    console.log(`[EqpTechSync] Applied tech params for eqpType=${logType}`);
    return result;
  } catch (error: any) {
    console.error(`[EqpTechSync] Failed to fill tech params for eqpType=${eqpType}:`, error.message);
    return { eqpFields: {}, paFields: {} };
  }
}
