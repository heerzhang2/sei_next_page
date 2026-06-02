/**
 * 设备基础信息填充服务
 * 
 * 对应 Java InfRecvConvert.fillEqpBase() 的 TypeScript 实现。
 * 将旧平台设备基础数据（OldDeviceSkel等效）转换为 Eqp 实体各字段，
 * 包含各设备种类共用的 svp(服务参数)、pam(公共参数) JSON 初始化。
 * 
 * 参考：
 *   special-equipment-backend/src/main/java/org/fjsei/yewu/service/third/InfRecvConvert.java
 *   #fillEqpBase(Eqp eqp, OldDeviceSkel bsd, Unit ispu)  L515~691
 */

import https from 'node:https';
import type { ExtractedEquipment } from '../types/task-extraction';
import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { syncUnitFromOldPlatform } from './unit-sync-service';
import { DEFAULT_UNIT_ID, mapBusinessType } from './constants';

// ============================================================
// API 配置
// ============================================================
const OLD_PLATFORM_API = {
  baseUrl: process.env.OLD_PLATFORM_API_URL || 'https://36.212.134.165:10443/prod-api',
};

// ============================================================
// HTTP 辅助
// ============================================================
function httpsGetJson(url: string, headers: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: 'GET',
      headers: {
        ...headers,
        Accept: '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`Failed to parse response: ${e}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ============================================================
// 辅助工具
// ============================================================

function toInt(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? Math.floor(n) : undefined;
}

function toFloat(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function toBoolean(val: any): boolean | undefined {
  if (val === null || val === undefined) return undefined;
  return val === '1' || val === '是' || val === true;
}

function setIfDefined(obj: Record<string, any>, key: string, value: any): void {
  if (value !== undefined && value !== null) {
    obj[key] = value;
  }
}

function strToDate(val: any): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * 安全等级转换 (cpa)
 * 
 * Java 参考：safeLev -> icpa
 *   - 优先用 safeLev (安全等级)
 *   - 否则用 acciType 折算 (6 - acciType)
 *   - 最终约束到 1~5
 */
function calcCpa(safeLev?: any, acciType?: any): number | undefined {
  let icpa = 0;
  if (safeLev != null) {
    icpa = toInt(safeLev) || 0;
  } else if (acciType != null) {
    const at = toInt(acciType) || 0;
    if (at > 0) icpa = 6 - at;
  }
  return (icpa >= 1 && icpa <= 5) ? icpa : undefined;
}

/**
 * 进口类型转换 (impt)
 * 
 * 旧检验平台编码：0='国产', 1='部件进口', 2='整机进口'
 * 监察平台编码：1='国产', 2='部件进口', 3='整机进口'
 */
function calcImpt(importType?: any): number {
  if (importType == null) return 1;
  const s = String(importType);
  if (s === '3' || s === '整机进口') return 3;
  if (s === '2' || s === '部件进口') return 2;
  return 1;
}

// ============================================================
// 单位 JSON 辅助（用于嵌入 svp 中的设计单位/型试单位等）
// ============================================================

/** 单位迷你 JSON 格式 (对应 Java AjsonUnit, 短字段名 i/n 节省存储) */
export interface AjsonUnit {
  i: bigint;
  n: string;
}

/**
 * 根据旧平台单位 ID 解析本地 Unit 实体并返回 AjsonUnit
 * 
 * 流程：
 * 1. 调用 syncUnitFromOldPlatform() 从旧平台同步单位到本地表，返回本地 Unit.id
 * 2. 查询 Unit 关联的 Company 或 Person，获取单位名称
 * 3. 返回 {id: Unit.id, name: 单位名称}
 * 
 * @param oldUnitId 旧平台单位ID（字符串格式）
 * @param accessToken 第三方平台访问令牌
 * @returns AjsonUnit | null
 */
export async function resolveUnitAjson(
  oldUnitId: string | undefined | null,
  accessToken?: string,
  tx?: Prisma.TransactionClient,
): Promise<AjsonUnit | null> {
  if (!oldUnitId || !accessToken) return null;
  const dbu = tx || prisma;

  try {
    // 步骤 1: 从旧平台同步单位到本地，获取本地 Unit ID
    const unitId = await syncUnitFromOldPlatform(oldUnitId, accessToken, tx);

    // 步骤 2: 查询 Unit 关联的 Company 或 Person 名称
    const unit = await dbu.unit.findUnique({
      where: { id: unitId },
      select: {
        Company: { select: { name: true } },
        Person: { select: { name: true } },
      },
    });

    if (!unit) {
      console.warn(`[EqpBaseSync] Unit ${unitId} not found after sync for oldUnitId=${oldUnitId}`);
      return null;
    }

    // 优先用 Company.name，其次 Person.name
    const unitName = unit.Company?.name || unit.Person?.name;
    if (!unitName) {
      console.warn(`[EqpBaseSync] Unit ${unitId} has no company/person name for oldUnitId=${oldUnitId}`);
      return { i: unitId, n: '' };
    }

    console.log(`[EqpBaseSync] Resolved unit ${unitId} (${unitName}) for oldUnitId=${oldUnitId}`);
    return { i: unitId, n: unitName };
  } catch (error: any) {
    console.warn(`[EqpBaseSync] Failed to resolve unit for oldUnitId=${oldUnitId}:`, error.message);
    return null;
  }
}

/**
 * 解析使用单位下的分支机构/安全部门 -> Division (部门/分支机构)
 * 
 * TODO: 需要接入 Division 实体查询逻辑。
 *       Java 参考：fillEqpBase L651~686
 *       - mgeDeptType=2: UntSecudept (分支机构)
 *       - mgeDeptType=1: UntDept (安全部门)
 * @returns Division ID | null
 */
export async function resolveDivisionByUseUnit(
  _useUnitId: bigint | undefined,
  _mgeDeptType: number | undefined,
  _secudeptId: string | undefined,
  _safeDeptId: string | undefined
): Promise<bigint | null> {
  // TODO: 实现 Division 查找
  //   if mgeDeptType === 2 → UntSecudept → divisionRepository.findByUnitAndName(unit, name)
  //   if mgeDeptType === 1 → UntDept → divisionRepository.findByUnitAndName(unit, name)
  //   验证 useUnit 与 dept.UNT_ID 匹配
  console.warn(`[EqpBaseSync] resolveDivisionByUseUnit 未实现！`);
  return null;
}

/**
 * 解析检验部门 (Isp Dept) -> Division
 * 
 * Java 参考：fillEqpBase L681~686
 *   HrDeptinfo → hrDeptinfo.getDivision() → divisionRepository
 * @returns Division ID | null
 */
export async function resolveIspDivision(
  _ispDeptId: string | undefined
): Promise<bigint | null> {
  // TODO: 实现：HrDeptinfo → Division
  console.warn(`[EqpBaseSync] resolveIspDivision  未实现！`);
  return null;
}

/**
 * 解析行政区划 (Adminunit) ID
 * 
 * Java 参考：fillEqpBase L575
 *   adminunitRepository.findTopByAreacode(bsd.getEqpAreaCod())
 * @param areaCode 行政区划代码
 * @returns Adminunit ID | null
 */
export async function resolveAdminunitByAreaCode(
  areaCode: string | undefined,
  tx?: Prisma.TransactionClient,
): Promise<bigint | null> {
  if (!areaCode) return null;
  const dbu = tx || prisma;
  const admin = await dbu.adminunit.findFirst({ where: { areacode: areaCode }, select: { id: true } });
  if (!admin) {
    console.warn(`[EqpBaseSync] Adminunit关联能力暂未实现 areaCode=${areaCode}`);
    return null;
  }
  return admin.id;
}

/**
 * 解析 Village (村/社区) ID
 *
 * 参考 Java MaintenanceMutation.makeInf导楼盘小区vL：
 *   1) 按 oldId 查已存在的 Village
 *   2) 不存在则新建
 *   3) 填充 name / type / address / oldId
 *   4) 按 areaCod 关联 Adminunit（检测同名去重）
 *
 * @param buildId 旧平台楼盘ID（字符串）
 * @param accessToken 第三方访问令牌
 * @param tx 事务客户端
 * @returns Village ID | null
 */
export async function resolveVillageByOldId(
  buildId: string | undefined | null,
  accessToken?: string,
  tx?: Prisma.TransactionClient,
): Promise<bigint | null> {
  if (!buildId) return null;
  const dbu = tx || prisma;

  // 1. 从旧平台 API 获取楼盘数据
  const url = `${OLD_PLATFORM_API.baseUrl}/busimge/housemge/${buildId}?curMenuId=100019&curMenuName=设备台账&time=${Date.now()}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let resp: any;
  try { resp = await httpsGetJson(url, headers); } catch (e: any) {
    console.warn(`[EqpBaseSync] Failed to fetch building ${buildId}: ${e.message}`);
    return null;
  }
  if (resp.code !== 200 || !resp.data) {
    console.warn(`[EqpBaseSync] Building API error for ${buildId}: ${resp.msg || 'Unknown'}`);
    return null;
  }

  const data = resp.data;

  // 2. 解析 Adminunit
  let aid: bigint | null = null;
  if (data.areaCod) {
    aid = await resolveAdminunitByAreaCode(data.areaCod, tx);
  }

  // 3. 查找或创建 Village（参考 Java: villageRepository.save()，双向同步数据）
  const existing = await dbu.village.findFirst({ where: { oldId: BigInt(buildId) }, select: { id: true } });
  const villageData = {
    name: data.buildName || null,
    type: data.instBuildType || null,
    address: data.buildAddr || null,
    oldId: BigInt(buildId),
    aid: aid,
  };

  if (existing) {
    await dbu.village.update({ where: { id: existing.id }, data: villageData });
    console.log(`[EqpBaseSync] Updated Village ${existing.id} for buildId=${buildId} (${data.buildName || ''})`);
    return existing.id;
  }

  try {
    const created = await dbu.village.create({ data: villageData });
    console.log(`[EqpBaseSync] Created Village ${created.id} for buildId=${buildId} (${data.buildName || ''})`);
    return created.id;
  } catch (e: any) {
    // 唯一约束冲突（name+aid 重复）→ 查 existing
    const existing2 = await dbu.village.findFirst({ where: { oldId: BigInt(buildId) }, select: { id: true } });
    if (existing2) return existing2.id;
    console.warn(`[EqpBaseSync] Failed to create Village for buildId=${buildId}: ${e.message}`);
    return null;
  }
}

// ============================================================
// 坐标校验
// ============================================================

/**
 * 校验纬度值是否在合法范围 [-90, 90]
 */
function validateLatitude(lat: any): number | undefined {
  const n = toFloat(lat);
  if (n !== undefined && n >= -90 && n <= 90) return n;
  if (lat != null) console.warn(`[EqpBaseSync] Invalid latitude: ${lat}`);
  return undefined;
}

/**
 * 校验经度值是否在合法范围 [-180, 180]
 */
function validateLongitude(lon: any): number | undefined {
  const n = toFloat(lon);
  if (n !== undefined && n >= -180 && n <= 180) return n;
  if (lon != null) console.warn(`[EqpBaseSync] Invalid longitude: ${lon}`);
  return undefined;
}

// ============================================================
// 设备使用场所映射
// ============================================================

/**
 * 设备使用场所编码映射
 * Java 参考：mapFromEqpUsePlace(String2Int(bsd.getEqpUsePlace()))
 * 
 * TODO: 需要根据实际枚举值完善映射表
 */
function mapEqpUsePlace(placeCode: number | undefined): string | undefined {
  if (placeCode == null) return undefined;
  // 场所分类映射（对应 Java: plclsArr + 新字典 seip_eqp_use_place）
  // 旧平台: private String[] plclsArr={"学校","幼儿园","医院","车站","客运码头","商场","体育场馆","展览馆","公园","其它公众聚集场所"};
  //一部分是界面上配置的动态添加？新字典新增分类 (11-15): /prod-api/system/dict/data/type/seip_eqp_use_place (dictValue: 11-15)
  const PLACE_MAP: Record<number, string> = {
    1: '学校',
    2: '幼儿园',
    3: '医院',
    4: '车站',
    5: '客运码头',
    6: '商场',
    7: '体育场馆',
    8: '展览馆',
    9: '公园',
    10: '其它公众聚集场所',
    11: '住宅',
    12: '办公',
    13: '工厂（含厂内办公用房）',
    14: '公众聚集场所',
    15: '其他',
  };
  return PLACE_MAP[placeCode];
}

// ============================================================
// 导出类型
// ============================================================

/** fillEqpBase 的返回结果 */
export interface FillEqpBaseResult {
  /** 直接映射到 Eqp 实体标量字段 */
  eqpFields: Record<string, any>;
  /** DeviceComnSvp + DeviceComnPam -> 合并到 Eqp.pa 的 JSON（svp 和 pam 内容合并） */
  pa: Record<string, any>;
  /** 需要异步查找的关联实体（调用方在外层统一解析） */
  asyncRefs: {
    /** pa 中嵌入的设计单位 AjsonUnit */
    designUnit: AjsonUnit | null;
    /** pa 中嵌入的型试单位 AjsonUnit */
    testUnit: AjsonUnit | null;
    /** 使用单位的 Division（分支机构/安全部门）ID */
    useDivisionId: bigint | null;
    /** 检验部门的 Division ID */
    ispDivisionId: bigint | null;
    /** Adminunit 行政区划 ID */
    adminunitId: bigint | null;
    /** Village 村/社区 ID */
    villageId: bigint | null;
    /** 产权人单位 AjsonUnit（Java: owner(getUnitfromOldUnitId(propUntId))）*/
    ownerUnit: AjsonUnit | null;
    /** 维保单位 AjsonUnit（Java: mtu(getUnitfromOldUnitId(mantUntId))）*/
    maintenanceUnit: AjsonUnit | null;
    /** 制造单位 AjsonUnit（Java: makeu(getUnitfromOldUnitId(makeUntId))）*/
    manufacturingUnit: AjsonUnit | null;
    /** 安装单位 AjsonUnit（Java: insu(getUnitfromOldUnitId(instUntId))）*/
    installationUnit: AjsonUnit | null;
    /** 改造单位 AjsonUnit（Java: remu(getUnitfromOldUnitId(altUntId))）*/
    alterationUnit: AjsonUnit | null;
    /** 维修单位 AjsonUnit（Java: repu(getUnitfromOldUnitId(ovhUntId))）*/
    repairUnit: AjsonUnit | null;
    /** 最近一次定期检验 Isp ID */
    isp2Id: bigint | null;
    /** 最近一次年度/在线检验 Isp ID */
    isp1Id: bigint | null;
    /** 待创建 Isp 数据（在 Eqp 创建后处理，使用真实 dev_id） */
    pendingIsps?: Array<{
      reportNo: string;
      conclusion: string | null;
      ispDate: string | null;
      bsType: number;
      ispuId: bigint;
      fieldKey: 'isp1Id' | 'isp2Id';
    }>;
  };
}

// ============================================================
// 主函数：fillEqpBase
// ============================================================

/**
 * 填充设备基础信息（对应 Java InfRecvConvert.fillEqpBase）
 * 
 * 将旧平台原始设备数据转换为 Eqp 实体字段值，包含：
 * 1. DeviceComnSvp 服务参数 + DeviceComnPam 公共参数（合并到 pa JSON）
 * 2. Eqp 标量字段映射
 * 3. 关联实体引用标记（由调用方异步解析）
 * 
 * 注意：svp 与 pam 已合并存储到 Eqp.pa 字段（本地数据库无 svp 列）
 * 
 * @param equipment 旧平台原始设备数据（OldDeviceSkel 格式）
 * @returns 结构化结果，包含 eqpFields / pa(含svp+pam) / asyncRefs
 */
export function fillEqpBase(equipment: ExtractedEquipment): FillEqpBaseResult {
  // ============================================================
  // 1. 构建 pa JSON —— 设备通用参数（svp + pam 合并）
  //    svp: 服务参数（年限/重监控/制造国/周期/设计参数等）
  //    pam: 公共参数（联系人/电话等）
  // ============================================================
  const pa: Record<string, any> = {};

  // ---- svp 部分：设备通用服务参数 ----
  setIfDefined(pa, '年限', toInt(equipment.designUseYear));
  setIfDefined(pa, '重监控', toBoolean(equipment.ifMajctl));
  setIfDefined(pa, '制造国', equipment.makeCountry);
  setIfDefined(pa, '大修周期', toInt(equipment.altCycle));
  setIfDefined(pa, '维周期', toInt(equipment.mantCycle));
  setIfDefined(pa, '设计日期', equipment.designDate);
  setIfDefined(pa, '竣验日', equipment.compeAccpDate);
  setIfDefined(pa, '产品标准', equipment.productMeasure);
  setIfDefined(pa, '设计图号', equipment.designPic);
  setIfDefined(pa, '总重量', toFloat(equipment.eqpWeight));
  setIfDefined(pa, '装项负责', equipment.instLeader);
  setIfDefined(pa, '装联电', equipment.instLkphone);
  setIfDefined(pa, '型试报告', equipment.testRepcod);

  // pa 中的单位引用（设计单位 / 设鉴单位 / 型试单位）
  // 这些字段需要转换为 AjsonUnit {i, n} 后再嵌入
  // Java 参考 L523-524:
  //   Unit 设计单位 = getUnitfromOldUnitId(usjc, bsd.getDesignUntId())
  //   Unit 型试单位 = getUnitfromOldUnitId(usjc, bsd.getTestUntId())
  // 设鉴单位(designChkunt) 直接用字符串，不需要查表

  // TODO: 设计单位 —— 需接入 resolveUnitAjson(equipment.designUntId, accessToken)
  // pa['设计单位'] = { id: ..., name: ... }

  // TODO: 型试单位 —— 同上   testUntId
  // pa['型试单位'] = { id: ..., name: ... }

  setIfDefined(pa, '设鉴单位', equipment.designChkunt);

  // Java 参考 L525 (被注释): Unit 造监检单 = getUnitfromOldUnitId(usjc, bsd.getMakeIspUntId())
  // setIfDefined(pa, '造监检单', ...);

  // ---- pam 部分：设备公共参数（联系人/电话） ----
  setIfDefined(pa, '急救电', equipment.emergencyTel);
  setIfDefined(pa, '维保电', equipment.mantPhone);
  setIfDefined(pa, '急救人', equipment.emergencyUserName);
  setIfDefined(pa, '联系电', equipment.usePhone);
  setIfDefined(pa, '联系人', equipment.useLkmen);

  // ============================================================
  // 2. 构建 Eqp 标量字段映射
  // ============================================================
  const eqpFields: Record<string, any> = {};

  // === 设备种类 ===
  // vart: 取前3位 (Java L539: bsd.getEqpVart().substring(0,3))
  // 注：vars 已在 syncEquipment 中处理，这里补充 subv
  setIfDefined(eqpFields, 'subv', equipment.subEqpVart);

  // === 状态字段 ===
  // uscd: 使用状态变更日期 (Java L554)
  setIfDefined(eqpFields, 'uscd', strToDate(equipment.usestaChgDate));
  // cerd: 注册发证日期 (Java L555: bsd.getRegDate())
  setIfDefined(eqpFields, 'cerd', strToDate(equipment.regDate));
  // regd: 注册日期 (Java L648)
  setIfDefined(eqpFields, 'regd', strToDate(equipment.regDate));
  // cand: 注销日期 (Java L649: bsd.getRegLogoutDate())
  setIfDefined(eqpFields, 'cand', strToDate(equipment.regLogoutDate));

  // === 编号字段 ===
  // rcod: 设备注册代码 (Java L647)
  setIfDefined(eqpFields, 'rcod', equipment.eqpRegCod);
  // plno: 设备内部编号/设备本体编号 (Java L556)
  setIfDefined(eqpFields, 'plno', equipment.eqpInnerCod);
  // fno: 出厂编号 (Java L557)
  setIfDefined(eqpFields, 'fno', equipment.factoryCod);
  // cert: 设备使用证编号/使用登记证号 (Java L646)
  setIfDefined(eqpFields, 'cert', equipment.eqpUsecertCod);
  // sno: 设备运行码 (Java L553: bsd.getEqpStationCod())
  setIfDefined(eqpFields, 'sno', equipment.eqpStationCod);
  // model: 设备型号 (Java L643: bsd.getEqpMod())
  setIfDefined(eqpFields, 'model', equipment.eqpMod);
  // oid: 旧平台设备编号 (Java L554: bsd.getOidno())
  setIfDefined(eqpFields, 'oid', equipment.oidno);

  // === 名称字段 ===
  // cnam: 注册人姓名 (Java L643: bsd.getRegUserName())
  setIfDefined(eqpFields, 'cnam', equipment.regUserName);
  // rnam: 注册人姓名 (Java L557)
  setIfDefined(eqpFields, 'rnam', equipment.regUserName);
  // titl: 设备名称 (Java L644: bsd.getEqpName())
  setIfDefined(eqpFields, 'titl', equipment.eqpName);

  // === 日期字段 ===
  // mkd: 制造日期 (Java L559)
  setIfDefined(eqpFields, 'mkd', strToDate(equipment.makeDate));
  // used: 首次使用日期 (Java L563)
  setIfDefined(eqpFields, 'used', strToDate(equipment.firstuseDate));
  // insd: 安装日期/竣工日期=竣验日 (Java L564: bsd.getCompeAccpDate())
  // 注：insd 同时用于 svp.竣验日 和 Eqp.insd，含义一致
  setIfDefined(eqpFields, 'insd', strToDate(equipment.compeAccpDate));
  // expire: 设计使用年限到期日 (Java L565)
  setIfDefined(eqpFields, 'expire', strToDate(equipment.designUseOveryear));
  // nxtd1: 下次检验日期1 (Java L556) 年度检验的
  setIfDefined(eqpFields, 'nxtd1', strToDate(equipment.nextIspDate1));
  // nxtd2: 下次检验日期2 (Java L557) 定期检验的
  setIfDefined(eqpFields, 'nxtd2', strToDate(equipment.nextIspDate2));
  //报告编制系统目前还未用到的： nxttd 下次需要检测的截至日 ，？是来自旧平台接口的 "nextChkDate"；

  // === 数值 / 枚举字段 ===
  // use_state: 使用状态 (Java L554)
  setIfDefined(eqpFields, 'use_state', toInt(equipment.eqpUseSta));
  // reg_state: 注册状态 (Java L555)
  setIfDefined(eqpFields, 'reg_state', toInt(equipment.eqpRegSta));
  // money: 设备原值 (Java L551)
  setIfDefined(eqpFields, 'money', toFloat(equipment.eqpPrice));
  // cpa: 安全等级 (Java L540-544)
  setIfDefined(eqpFields, 'cpa', calcCpa(equipment.safeLev, equipment.acciType));
  // impt: 进口类型 (Java L546-550)
  setIfDefined(eqpFields, 'impt', calcImpt(equipment.importType));

  // === 标志位字段 ===
  // move: 是否移动式设备 (Java L557)
  setIfDefined(eqpFields, 'move', toBoolean(equipment.isMoveeqp));
  // vital: 是否重大设备 (Java L558)
  setIfDefined(eqpFields, 'vital', toBoolean(equipment.ifMajeqp));
  // cping: 是否正在安装监检 (Java L552)
  setIfDefined(eqpFields, 'cping', toBoolean(equipment.ifIncping));
  // ocat: 是否目录外设备 (Java L648) - inCag="1"为目录内，"0"为目录外，需要取反
  setIfDefined(eqpFields, 'ocat', equipment.inCag === "0" ? true : equipment.inCag === "1" ? false : undefined);
  // dense: 是否人口密集区 (Java L589)
  setIfDefined(eqpFields, 'dense', toBoolean(equipment.ifPopulated));
  // seimp: 是否重要场所 (Java L590)
  setIfDefined(eqpFields, 'seimp', toBoolean(equipment.ifMajplace));
  // unqf1: 不合格标志1 (Java L591) 预期是 noteligibleFlag1  实际是 noteligibleFalg1 
  setIfDefined(eqpFields, 'unqf1', toBoolean(equipment.noteligibleFalg1));
  // unqf2: 不合格标志2 (Java L592)
  setIfDefined(eqpFields, 'unqf2', toBoolean(equipment.noteligibleFalg2));

  // === 联系方式 ===
  // lpho: 使用单位手机号 (Java L562)
  setIfDefined(eqpFields, 'lpho', equipment.useMobile);
  // plat: 车辆牌照/罐车牌号 (Java L562)
  setIfDefined(eqpFields, 'plat', equipment.catlicennum);

  // === 场所 / 区域 ===
  // plcls: 设备使用场所分类 (Java L589)
  setIfDefined(eqpFields, 'plcls', mapEqpUsePlace(toInt(equipment.eqpUsePlace)));

  // === 坐标（需校验范围） ===
  setIfDefined(eqpFields, 'lat', validateLatitude(equipment.eqpLat ?? 0));
  setIfDefined(eqpFields, 'lon', validateLongitude(equipment.eqpLong ?? 0));
  // address: 设备使用地址 (Java L384: address(bsd.getEqpUseAddr()))
  setIfDefined(eqpFields, 'address', equipment.eqpUseAddr);

  // === 设备级别（仅 4000 起重 / 游乐 / 管道 有） ===
  // Java L689: if("4".equals(eqp.getType()) ) eqp.setLevel(bsd.getEqpLevel());
  // 当前设备类型从 ExtractTask 中获取，调用方需根据 eqpType 决定是否设置
  setIfDefined(eqpFields, 'level', equipment.eqpLevel);

  // ============================================================
  // 3. 需要异步解析的关联实体引用（标记待实现）
  // ============================================================
  const asyncRefs: FillEqpBaseResult['asyncRefs'] = {
    // pa 中嵌入的设计单位
    designUnit: null,
    // pa 中嵌入的型试单位
    testUnit: null,
    // 使用单位的分支机构 Division ID (Java L651-673)
    useDivisionId: null,
    // 检验部门 Division ID (Java L681-686)
    ispDivisionId: null,
    // 行政区域 Adminunit ID (Java L575)
    adminunitId: null,
    // 村/社区 Village ID (Java L577)
    villageId: null,
    // 产权人单位 Unit ID (Java L567-568)
    ownerUnit: null,
    // 维保单位 Unit ID (Java L569-570: mtu(getUnitfromOldUnitId(mantUntId)))
    maintenanceUnit: null,
    // 制造单位 Unit ID (Java L582: makeu(getUnitfromOldUnitId(makeUntId)))
    manufacturingUnit: null,
    // 安装单位 Unit ID (Java L582: insu(getUnitfromOldUnitId(instUntId)))
    installationUnit: null,
    // 改造单位 Unit ID (Java L583: remu(getUnitfromOldUnitId(altUntId)))
    alterationUnit: null,
    // 维修单位 Unit ID (Java L583: repu(getUnitfromOldUnitId(ovhUntId)))
    repairUnit: null,
    // 最近一次定期检验 Isp ID（isp2）
    isp2Id: null,
    // 最近一次年度/在线检验 Isp ID（isp1）
    isp1Id: null,
  };

  return { eqpFields, pa, asyncRefs };
}

/**
 * 异步填充设备基础信息的关联引用
 * 
 * 同步解析 fillEqpBase 返回的 asyncRefs 中需要异步查询的部分，
 * 包括：设计单位/型试单位 AjsonUnit（嵌入 pa JSON）、Division、Adminunit、Village。
 * 
 * @param asyncRefs fillEqpBase 返回的 asyncRefs
 * @param equipment 原始设备数据（用于取 areaCode/oldBuildId 等）
 * @param accessToken 第三方平台令牌
 * @returns 补充后的 asyncRefs
 */
/**
 * 从旧平台 API 获取分支机构/安全部门列表，按 ID 匹配并同步 Division
 */
let divisionApiCache = new Map<string, any[]>();
async function syncDivisionFromOldPlatform(
  deptType: number,           // 2=分支机构, 1=安全部门
  deptId: string,
  oldPlatformUntId: string,   // 旧平台使用单位 ID（用于 API）
  useuId: bigint,             // 本地 Unit ID（用于 Division.unit_id FK）
  accessToken?: string,
  tx?: Prisma.TransactionClient,
): Promise<bigint | null> {
  const dbu = tx || prisma;
  const isBranch = deptType === 2;
  const apiPath = isBranch ? 'untSecudept' : 'untDept';

  // 从旧平台 API 获取列表
  const cacheKey = `${apiPath}_list_${oldPlatformUntId}`;
  if (!divisionApiCache.has(cacheKey)) {
    const url = `${OLD_PLATFORM_API.baseUrl}/busimge/${apiPath}/list?untId=${oldPlatformUntId}&curMenuId=100033&curMenuName=单位台账&time=${Date.now()}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    try {
      const resp = await httpsGetJson(url, headers);
      if (resp.code === 200 && Array.isArray(resp.rows)) {
        divisionApiCache.set(cacheKey, resp.rows);
      } else {
        console.warn(`[EqpBaseSync] Failed to fetch ${apiPath} list for untId=${useuId}`);
        return null;
      }
    } catch (e: any) {
      console.warn(`[EqpBaseSync] Failed to fetch ${apiPath} list: ${e.message}`);
      return null;
    }
  }

  const rows = divisionApiCache.get(cacheKey)!;
  const row = rows.find((r: any) => String(r[isBranch ? 'untSecudeptId' : 'untDeptId']) === deptId);
  if (!row) {
    console.warn(`[EqpBaseSync] ${isBranch ? '分支机构' : '安全部门'} ID ${deptId} not found in API list for untId=${useuId}`);
    return null;
  }

  // 解析 Adminunit
  const areaCod: string = row[isBranch ? 'secudeptAreaCod' : 'deptAreaCod'];
  let adId: bigint | null = null;
  if (areaCod) adId = await resolveAdminunitByAreaCode(areaCod, tx);

  // 查找或创建 Division（按 unit_id + name 唯一）
  const divisionName = row.name || '';
  let division = await dbu.division.findFirst({ where: { unit_id: useuId, name: divisionName } });

  const divisionData = {
    name: divisionName,
    unit_id: useuId,
    branch: isBranch,
    address: row[isBranch ? 'secudeptAddr' : 'deptAddr'] || null,
    ad_id: adId,
    linkMen: row.lkmen || null,
    phone: row.mobile || null,
    tel: row.phone || null,
    frot: isBranch ? '闽yS' : '闽yD',
  };

  if (division) {
    await dbu.division.update({ where: { id: division.id }, data: divisionData });
    console.log(`[EqpBaseSync] Updated Division ${division.id} (${divisionName}) for useuId=${useuId}`);
    return division.id;
  }
  const created = await dbu.division.create({ data: divisionData });
  console.log(`[EqpBaseSync] Created Division ${created.id} (${divisionName}) for useuId=${useuId}`);
  return created.id;
}

// ====== Isp 检验记录辅助函数 ======
export async function findOrCreateIsp(
  tx: Prisma.TransactionClient,
  devId: bigint,
  reportNo: string,
  conclusion: string | null | undefined,
  ispDate: string | null | undefined,
  bsType: number,
  ispuId: bigint,
): Promise<bigint> {
  let isp = await tx.isp.findFirst({ where: { dev_id: devId, no: reportNo } });
  const updateData: Record<string, any> = { bsType, conclusion: conclusion || null, ispDate: strToDate(ispDate), dev_id: devId, no: reportNo, ispu_id: ispuId };
  if (isp) { await tx.isp.update({ where: { id: isp.id }, data: updateData }); return isp.id; }
  const created = await tx.isp.create({ data: updateData as any });
  return created.id;
}

export async function resolveFillEqpRefs(
  asyncRefs: FillEqpBaseResult['asyncRefs'],
  equipment: ExtractedEquipment,
  accessToken?: string,
  tx?: Prisma.TransactionClient,
  useuId?: bigint,       // 使用单位本地 Unit ID（Division 关联需要）
): Promise<FillEqpBaseResult['asyncRefs']> {
  const refs = { ...asyncRefs };

  if (equipment.designUntId && accessToken) {
    refs.designUnit = await resolveUnitAjson(equipment.designUntId, accessToken, tx);
  }
  if (equipment.testUntId && accessToken) {
    refs.testUnit = await resolveUnitAjson(equipment.testUntId, accessToken, tx);
  }
  if (equipment.propUntId && accessToken) {
    refs.ownerUnit = await resolveUnitAjson(equipment.propUntId, accessToken, tx);
  }
  if (equipment.mantUntId && accessToken) {
    refs.maintenanceUnit = await resolveUnitAjson(equipment.mantUntId, accessToken, tx);
  }
  if (equipment.makeUntId && accessToken) {
    refs.manufacturingUnit = await resolveUnitAjson(equipment.makeUntId, accessToken, tx);
  }
  if (equipment.instUntId && accessToken) {
    refs.installationUnit = await resolveUnitAjson(equipment.instUntId, accessToken, tx);
  }
  if (equipment.altUntId && accessToken) {
    refs.alterationUnit = await resolveUnitAjson(equipment.altUntId, accessToken, tx);
  }
  if (equipment.ovhUntId && accessToken) {
    refs.repairUnit = await resolveUnitAjson(equipment.ovhUntId, accessToken, tx);
  }
  // 行政区域
  if (equipment.eqpAreaCod && !refs.adminunitId) {
    refs.adminunitId = await resolveAdminunitByAreaCode(equipment.eqpAreaCod, tx);
  }
  // 村/社区
  if (equipment.buildId) {
    refs.villageId = await resolveVillageByOldId(String(equipment.buildId), accessToken, tx);
  }
  // 分支机构 / 安全部门 → Division
  if (useuId && accessToken) {
    const mgeDeptType = Number(equipment.mgeDeptType);
    if (mgeDeptType === 2 && equipment.secudeptId) {
      refs.useDivisionId = await syncDivisionFromOldPlatform(2, String(equipment.secudeptId), String(equipment.useUntId), useuId, accessToken, tx);
    } else if (mgeDeptType === 1 && equipment.safeDeptId) {
      refs.useDivisionId = await syncDivisionFromOldPlatform(1, String(equipment.safeDeptId), String(equipment.useUntId), useuId, accessToken, tx);
    }
  }

  // ====== 历史检验记录 Isp 关联（暂存数据，Eqp 创建后由调用方处理） ======
  // 参考 piping-unit-sync.ts L510-538 与 Java fillEqpBase L596-643
  // isp1=年度/在线检验 bsType=ANNUAL=8, isp2=定期检验 bsType=REGUL=3
  // 注意：不在此处创建 Isp（dev_id 需要 Eqp 创建后的真实 ID），而是暂存数据，
  // 由调用方 syncEquipment 在 Eqp 创建/更新后，用真实 eqpId 创建 Isp 并更新 eqp.isp1_id/isp2_id
  if (tx) {
    // ===== 问题1: ispuId 固定为 福建省特检院 =====
    const ispuIdForEqp = BigInt(DEFAULT_UNIT_ID);

    // ===== 问题2: 管道设备跳过历史检验记录 =====
    if (equipment.eqpType === '8000') {
      console.log(`[EqpBaseSync] Pipeline eqpCod=${equipment.eqpCod}, skip historical Isp sync`);
    } else {
      // ===== 问题3: 遍历4组Isp数据,找出最新的定期检验和年度检验 =====
      type PendingIspItem = NonNullable<typeof refs.pendingIsps>[number];
      let bestRegul: PendingIspItem | null = null;
      let bestAnnual: PendingIspItem | null = null;

      for (let i = 1; i <= 4; i++) {
        const opeType = equipment[`lastIspopeType${i}`];
        const reportNo = equipment[`lastIspReport${i}`];
        const conclusion = equipment[`lastIspConclu${i}`];
        const ispDate = equipment[`lastIspDate${i}`];

        if (!reportNo || opeType === undefined || opeType === null) continue;

        const bsType = mapBusinessType(Number(opeType));

        if (bsType === 3) {
          // 定期检验 - 保留日期最新的
          if (!bestRegul || (ispDate && (!bestRegul.ispDate || ispDate > bestRegul.ispDate))) {
            bestRegul = { reportNo, conclusion, ispDate, bsType: 3, ispuId: ispuIdForEqp, fieldKey: 'isp2Id' };
          }
        } else if (bsType === 8) {
          // 年度/在线检验 - 保留日期最新的
          if (!bestAnnual || (ispDate && (!bestAnnual.ispDate || ispDate > bestAnnual.ispDate))) {
            bestAnnual = { reportNo, conclusion, ispDate, bsType: 8, ispuId: ispuIdForEqp, fieldKey: 'isp1Id' };
          }
        }
        // 其它 bsType 直接舍弃
      }

      const pendingIsps: NonNullable<typeof refs.pendingIsps> = [];
      if (bestRegul) pendingIsps.push(bestRegul);
      if (bestAnnual) pendingIsps.push(bestAnnual);
      if (pendingIsps.length > 0) {
        refs.pendingIsps = pendingIsps;
      }
    }
  }

  return refs;
}

/**
 * 将 fillEqpBase 的结果 merged 到 eqpData 对象中
 * 
 * pa JSON 合并规则：
 *   外部原始全量数据(含syncTime) + fillEqpBase 的 pa(含svp+pam)
 *   -> 优先用外部数据，fillEqpBase 的 pa 覆盖同名键（svp/pam 参数）
 * 
 * @param eqpData 目标 Eqp 数据对象（build 中的 data）
 * @param result fillEqpBase 返回值
 * @param enrichedPa 外部已准备好的 pa JSON（含原始全量设备数据）
 */
export function mergeFillEqpResult(
  eqpData: Record<string, any>,
  result: FillEqpBaseResult,
  enrichedPa?: Record<string, any> | null
): void {
  // 合并 eqp 标量字段
  Object.assign(eqpData, result.eqpFields);
  
  // 合并 pa JSON：外部原始全量数据(enrichedPa) + fillEqpBase 的 pa(含svp+pam)
  // 优先用外部数据，fillEqpBase 的 pa 覆盖同名键（svp/pam 参数）
  const mergedPa: Record<string, any> = {};
  
  // 先合并外部 enrichedPa（如果有）
  if (enrichedPa && Object.keys(enrichedPa).length > 0) {
    Object.assign(mergedPa, enrichedPa);
  }
  
  // 再合并 result.pa（覆盖同名键）
  if (Object.keys(result.pa).length > 0) {
    Object.assign(mergedPa, result.pa);
  }
  
  // 将合并后的 pa 赋值给 eqpData
  eqpData.pa = mergedPa as any;
}
