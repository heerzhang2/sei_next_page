/**
 * 管道单元同步服务
 * 
 * 当同步管道装置 (eqpType='8000') 时，额外从旧平台获取该装置下的所有管道单元 (PipingUnit)，
 * 创建或更新到本地数据库，并将技术参数存入 pa JSON。
 * 
 * 参考 Java: MaintenanceMutation.syncPipeDevice()
 * 旧平台接口: GET /busimge/pipelineunit/list?pageNum=1&eqpCod={eqpCod}&pageSize=20000
 */

import https from 'node:https';
import { Prisma } from '@prisma/client';
import { syncUnitFromOldPlatform } from './unit-sync-service';

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
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ============================================================
// 类型定义
// ============================================================

/** 旧平台管道单元 API 返回的单条记录 */
interface OldPlatformPipingUnit {
  eqpCod?: string;
  eqpCode?: string;          // 管道编号
  boxName?: string;          // 管道单元名称
  eqpName?: string;
  projName?: string;         // 工程名称
  startPlace?: string;
  endPlace?: string;
  pipelineLevel?: string;    // 管道级别
  layMode?: string;          // 敷设方式
  pipelineMedium?: string;   // 管道材质
  sendMedium?: string;       // 输送介质
  workMedium?: string;
  nominalDia?: string;       // 公称直径(mm)
  nominalPly?: string;       // 公称壁厚(mm)
  length?: string;           // 管道长度(m)
  designPress?: string;      // 设计压力
  designTemp?: string;       // 设计温度
  workPress?: string;        // 工作压力
  workTemp?: string;         // 工作温度
  eqpUntRegcod?: string;     // 管道单元登记编号
  useSta?: string;           // 使用状态
  eqpRegSta?: string;        // 注册状态
  regDate?: string;          // 注册日期
  eqpFinmakeDate?: string;   // 投用日期
  eqpInstDate?: string;      // 安装日期
  nextIspDate?: string;      // 定检下检日期
  yearNextIspDate?: string;  // 年检下检日期
  safeLevel?: string;        // 安全等级
  incpNextIspDate?: string;  // 监检下检日期
  incpIspConclu?: string;
  incpIspDate?: string;
  incpIspReportCod?: string;
  ispReportCod?: string;
  ispDate?: string;
  ispConclu?: string;
  // pa 相关字段
  adiabaticMedium?: string;  // 绝热材料
  adiabaticPly?: string;     // 绝热厚度
  embalmment?: string;       // 防腐材料
  embalmHd?: string;         // 防腐等级
  embalmLevel?: string;
  rotAmount?: string;        // 腐蚀裕量
  safeMecNum?: string;       // 安全保护装置数量
  memo?: string;
  picNo?: string;            // 图号
  pipelineSpec?: string;     // 管道规格
  tryPress?: string;         // 试压
  hkNum?: string;            // 焊口数量
  useTime?: string;          // 实用时间
  oidno?: string;
  eqpId?: string;            // 旧平台 Eqp ID
  pipelineUnitParaId?: string;
  // 单位
  useUntId?: string;
  useUntName?: string;
  instUntId?: string;
  instUnit?: string;
  designUntId?: string;
  designUnit?: string;
  regUntId?: string;
  unitAreaCod?: string;
  // Isp
  ispId?: string;
  ispUntName?: string;
  ispDeptId?: string;
  // 分类
  eqpSort?: string;
  eqpVart?: string;
  subEqpVart?: string;
  vPipelineDia?: string;
  vLayMode?: string;
  vPipelineLevel?: string;
  vPipelineMedium?: string;
  [key: string]: any;
}

/** 旧平台 API 返回的列表包装 */
interface PipingUnitListResponse {
  code: number;
  msg: string;
  total: number;
  rows: OldPlatformPipingUnit[];
}

// ============================================================
// 辅助工具
// ============================================================

function toFloat(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function toInt(val: any): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? Math.floor(n) : undefined;
}

function strToDate(val: any): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function setNum(obj: Record<string, any>, key: string, val: any): void {
  const n = toFloat(val);
  if (n !== undefined) obj[key] = n;
}

function setStr(obj: Record<string, any>, key: string, val: any): void {
  if (val !== null && val !== undefined && val !== '') {
    obj[key] = String(val);
  }
}

/**
 * 将旧平台使用状态字符串映射到 UseState enum 数值
 * Java 参考: UseState_Enum.values()[String2Int(bsd.getEqpUseSta())]
 */
function mapUseState(useSta: string | undefined): number | undefined {
  if (!useSta) return undefined;
  return toInt(useSta);
}

// ============================================================
// 主函数
// ============================================================

/**
 * 同步管道装置下的所有管道单元
 * 
 * @param tx Prisma 事务客户端
 * @param eqpCod 管道装置设备代码
 * @param pipeId 本地 Pipeline (Eqp) ID
 * @param accessToken 第三方平台访问令牌
 */
export async function syncPipingUnits(
  tx: Prisma.TransactionClient,
  eqpCod: string,
  pipeId: bigint,
  accessToken?: string
): Promise<{
  success: boolean;
  total: number;
  processed: number;
  errors: number;
}> {
  const result = { success: true, total: 0, processed: 0, errors: 0 };

  if (!accessToken) {
    console.warn('[PipingUnitSync] No accessToken available, skipping piping unit sync');
    return { ...result, success: false };
  }

  try {
    // ====== 1. 从旧平台获取管道单元列表 ======
    console.log(`[PipingUnitSync] Fetching piping units for eqpCod=${eqpCod}`);
    const url = `${OLD_PLATFORM_API.baseUrl}/busimge/pipelineunit/list?pageNum=1&eqpCod=${encodeURIComponent(eqpCod)}&pageSize=20000&curMenuId=10001629&time=${Date.now()}`;
    
    const response: PipingUnitListResponse = await httpsGetJson(url, {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    if (response.code !== 200 || !response.rows) {
      throw new Error(`API error: ${response.msg || 'Unknown error'}`);
    }

    const units = response.rows;
    
    // ====== 安全检查：如果单元总数 >= 20000，抛出异常 ======
    if (units.length >= 20000) {
      throw new Error(`[PipingUnitSync] Too many piping units (${units.length}) for eqpCod=${eqpCod}. Maximum allowed is 19999.`);
    }
    
    result.total = units.length;
    console.log(`[PipingUnitSync] Got ${units.length} piping units for eqpCod=${eqpCod}`);

    // ====== 2. 获取已存在的 PipingUnit 列表 ======
    const existingUnits = await tx.pipingUnit.findMany({
      where: { pipe_id: pipeId },
      select: { id: true, code: true, start: true, stop: true, name: true, rno: true },
    });

    // 收集所有本地 ID，用于后续判断哪些被旧平台删除
    const allLocalIds = new Set<bigint>();
    // 构建查找 Map：用 (code 或 start+stop+name) 作为唯一键
    const existingMap = new Map<string, bigint>();
    for (const eu of existingUnits) {
      allLocalIds.add(eu.id);
      if (eu.rno) {
        existingMap.set(`rno:${eu.rno}`, eu.id);
      }
      if (eu.code) {
        existingMap.set(`code:${eu.code}`, eu.id);
      }
      existingMap.set(`key:${eu.code || ''}:${eu.start || ''}:${eu.stop || ''}:${eu.name || ''}`, eu.id);
    }

    // ====== 3. 逐条处理 ======
    const syncedIds = new Set<bigint>();
    // 单位 ID & Isp ID 缓存，避免同一管道装置内重复调用旧平台 API
    const unitIdCache = new Map<string, bigint>();
    const ispCache = new Map<string, bigint>(); // key: "类型:报告号"
    for (const unit of units) {
      try {
        // console.log('[PipingUnitSync] Processing unit:', JSON.stringify(unit, null, 2));
        const syncedId = await upsertPipingUnit(tx, unit, pipeId, existingMap, accessToken, unitIdCache, ispCache);
        if (syncedId) syncedIds.add(syncedId);
        result.processed++;
      } catch (unitError: any) {
        result.errors++;
        console.error(`[PipingUnitSync] Failed to sync unit:`, unitError.message);
      }
    }

    // ====== 4. 旧平台已删除的单元 → 标记 deleted=true ======
    // 本地存在但未在本次同步结果中的单元，视为旧平台已删除，标记而不物理删除
    const deletedIds: bigint[] = [];
    for (const localId of allLocalIds) {
      if (!syncedIds.has(localId)) {
        deletedIds.push(localId);
      }
    }
    if (deletedIds.length > 0) {
      await tx.pipingUnit.updateMany({
        where: { id: { in: deletedIds } },
        data: { deleted: true },
      });
      console.log(`[PipingUnitSync] Marked ${deletedIds.length} piping units as deleted (no longer in old platform)`);
    }

    console.log(`[PipingUnitSync] Completed: ${result.processed} processed, ${result.errors} errors, ${deletedIds.length} deleted out of ${result.total}`);
    result.success = result.errors === 0;
    return result;
  } catch (error: any) {
    console.error(`[PipingUnitSync] Failed to sync piping units for eqpCod=${eqpCod}:`, error.message);
    return { ...result, success: false, errors: result.total > 0 ? result.total : 1 };
  }
}

/**
 * 根据单位名称解析 Isp 检验单位 ID（ispu_id）
 *
 * 规则：
 *   1. untName 为空 → 默认"福建省特种设备检验研究院"
 *   2. untName 含"福建省锅炉压力容器检验研究院" → 也视为默认单位（分院归总院）
 *   3. 否则按 Company.name 查找 → 取关联的 Unit.id
 *   4. 找不到 → 抛异常提醒手动处理
 */
const DEFAULT_ISP_UNIT_NAME = '福建省特种设备检验研究院';
// 静态缓存：已查过的公司名 → Unit ID，减少重复 DB 查询
const ispuNameCache = new Map<string, bigint>();
async function resolveIspuIdByName(
  tx: Prisma.TransactionClient,
  untName: string | null | undefined,
): Promise<bigint> {
  const name = (untName || '').trim();
  let lookupName: string;

  // 空名或分院 → 使用默认单位
  if (!name || name.includes('福建省锅炉压力容器检验研究院')) {
    lookupName = DEFAULT_ISP_UNIT_NAME;
  } else {
    lookupName = name;
  }

  // 查缓存
  if (ispuNameCache.has(lookupName)) return ispuNameCache.get(lookupName)!;

  // 查 Company.name → Company.id → Unit (company_id)
  const company = await tx.company.findFirst({ where: { name: lookupName } });
  if (!company) {
    if (lookupName === DEFAULT_ISP_UNIT_NAME) {
      throw new Error(`默认检验单位 "${DEFAULT_ISP_UNIT_NAME}" 在 Company 表中不存在，请先添加`);
    }
    throw new Error(`检验单位 "${name}" 在 Company 表中不存在，请手动确认后添加。提示：若是分院或下属机构，设为"${DEFAULT_ISP_UNIT_NAME}"`);
  }

  const unit = await tx.unit.findFirst({ where: { company_id: company.id } });
  if (!unit) {
    throw new Error(`Company "${lookupName}" (id=${company.id}) 未关联到 Unit 记录，请检查`);
  }

  ispuNameCache.set(lookupName, unit.id);
  return unit.id;
}

/**
 * 查找或创建 Isp（检验报告）记录，返回 Isp.id
 *
 * 参考 Java MaintenanceMutation.fillPipeUnitPrm L2634-2677
 *   1) 按 dev_id (管道ID) + no (报告编号) 查是否已存在
 *   2) 不存在则新建 Isp；存在则复用
 *   3) 更新 ispDate / conclusion / bsType
 *
 * @param bsType BusinessCat_Enum  ordinal: INSTA=2  REGUL=3  ANNUAL=8
 */
async function findOrCreateIsp(
  tx: Prisma.TransactionClient,
  pipeId: bigint,
  reportNo: string,
  conclusion: string | null | undefined,
  ispDate: string | null | undefined,
  bsType: number,
  ispuId: bigint,
): Promise<bigint> {
  let isp = await tx.isp.findFirst({
    where: { dev_id: pipeId, no: reportNo },
  });

  const updateData: Record<string, any> = {
    bsType,
    conclusion: conclusion || null,
    ispDate: strToDate(ispDate),
    dev_id: pipeId,
    no: reportNo,
    ispu_id: ispuId,
  };

  if (isp) {
    await tx.isp.update({ where: { id: isp.id }, data: updateData });
    return isp.id;
  }

  const created = await tx.isp.create({ data: updateData as any });
  return created.id;
}

async function upsertPipingUnit(
  tx: Prisma.TransactionClient,
  unit: OldPlatformPipingUnit,
  pipeId: bigint,
  existingMap: Map<string, bigint>,
  accessToken?: string,
  unitIdCache?: Map<string, bigint>,
  ispCache?: Map<string, bigint>,
): Promise<bigint | undefined> {
  // ====== 处理敷设方式（参考 Java MaintenanceMutation.java L2678-2684）=====
  let layMode: string | null = null;
  const rawLayMode = unit.vLayMode;
  
  if (rawLayMode && typeof rawLayMode === 'string' && rawLayMode.trim() !== '') {
    const hasOverhead = rawLayMode.includes('架空');
    const hasBuried = rawLayMode.includes('埋地');
    
    if (hasOverhead && hasBuried) {
      layMode = '埋地+架空';
    } else if (hasOverhead) {
      layMode = '架空';
    } else if (hasBuried) {
      layMode = '埋地';
    } else {
      layMode = '其它';
    }
  }

  // ====== 构建标量字段 ======
  const scalarFields: Record<string, any> = {
    code: unit.eqpCode || null,
    name: unit.boxName || unit.eqpName || null,
    proj: unit.projName || null,
    start: unit.startPlace || null,
    stop: unit.endPlace || null,
    level: unit.vPipelineLevel || null,     //不用pipelineLevel字段
    lay: layMode,                           //处理后的敷设方式
    matr: unit.vPipelineMedium || null,     //不用pipelineMedium
    mdi: unit.sendMedium || unit.workMedium || null,
    rno: unit.eqpUntRegcod || null,
    safe: unit.safeLevel || null,
  };

  // 数值字段  
  setNum(scalarFields, 'dia', unit.vPipelineDia);         //不用nominalDia字段
  setStr(scalarFields, 'thik', unit.nominalPly);
  setNum(scalarFields, 'leng', unit.length);

  // 枚举字段
  scalarFields.ust = mapUseState(unit.useSta);
  scalarFields.reg = unit.eqpRegSta ? toInt(unit.eqpRegSta) : null;

  // 日期字段
  scalarFields.used = strToDate(unit.eqpFinmakeDate);
  scalarFields.insd = strToDate(unit.eqpInstDate);
  scalarFields.regd = strToDate(unit.regDate);
  scalarFields.nxtd1 = strToDate(unit.yearNextIspDate);     //年度在线检验的
  scalarFields.nxtd2 = strToDate(unit.nextIspDate);       //未考虑会受到监检 incpNextIspDate的影响，需要监察机构直接处理重置日期
  // ====== 构建 pa JSON（合并原 svp + pam 参数） ======
  const paData: Record<string, any> = {};

  // （原 svp 部分）设计/工作参数
  setStr(paData, '规格', unit.pipelineSpec);
  setStr(paData, '设压', unit.designPress);
  setStr(paData, '设温', unit.designTemp);
  setStr(paData, '工作压', unit.workPress);
  setStr(paData, '工作温', unit.workTemp);
  setStr(paData, '直径', unit.nominalDia);
  setStr(paData, '材料', unit.pipelineMedium);
  setStr(paData, '焊数', unit.hkNum);
  setStr(paData, '腐蚀', unit.rotAmount);

  // （原 pam 部分）防腐/绝热/试压
  setStr(paData, '工压', unit.workPress);
  setStr(paData, '工温', unit.workTemp);
  setStr(paData, '工介', unit.sendMedium || unit.workMedium);
  setStr(paData, '绝材', unit.adiabaticMedium);
  setStr(paData, '绝厚', unit.adiabaticPly);
  setStr(paData, '防腐材', unit.embalmment);
  setStr(paData, '防腐厚', unit.embalmHd);
  setStr(paData, '防腐级', unit.embalmLevel);
  setStr(paData, '试压', unit.tryPress);
  setStr(paData, '保数', unit.safeMecNum);
  setStr(paData, '实用时', unit.useTime);
  setStr(paData, '图号', unit.picNo);
  setStr(paData, '备注', unit.memo);

  // ====== 安装单位 insu_id / 设计单位 desu_id（存入 relationConnects） ======
  // 参考 Java fillPipeUnitPrm L2622-2632：先查缓存，没有再调旧平台 API 同步
  // 注意：Prisma 不允许直接设置 FK 字段，必须用 relation connect
  const relationConnects: Record<string, any> = {};
  if (accessToken && unitIdCache) {
    if (unit.instUntId && !unitIdCache.has(`inst:${unit.instUntId}`)) {
      try {
        const localId = await syncUnitFromOldPlatform(unit.instUntId, accessToken, tx);
        unitIdCache.set(`inst:${unit.instUntId}`, localId);
      } catch (e: any) {
        console.warn(`[PipingUnitSync] Failed to sync instUntId ${unit.instUntId}: ${e.message}`);
      }
    }
    if (unit.instUntId && unitIdCache.has(`inst:${unit.instUntId}`)) {
      relationConnects.Unit_PipingUnit_insu_idToUnit = { connect: { id: unitIdCache.get(`inst:${unit.instUntId}`) } };
    }
    if (unit.designUntId && !unitIdCache.has(`des:${unit.designUntId}`)) {
      try {
        const localId = await syncUnitFromOldPlatform(unit.designUntId, accessToken, tx);
        unitIdCache.set(`des:${unit.designUntId}`, localId);
      } catch (e: any) {
        console.warn(`[PipingUnitSync] Failed to sync designUntId ${unit.designUntId}: ${e.message}`);
      }
    }
    if (unit.designUntId && unitIdCache.has(`des:${unit.designUntId}`)) {
      relationConnects.Unit_PipingUnit_desu_idToUnit = { connect: { id: unitIdCache.get(`des:${unit.designUntId}`) } };
    }
  }

  // ====== 检验报告 Isp 关联（存入 relationConnects） ======
  // 参考 Java fillPipeUnitPrm L2634-2677：按报告编号查/建 Isp，设 ispX_id
  // ispu_id 根据单位名称解析：isp1/isp2 用 ispUntName，ispsv 用 incpUntName
  // Isp 关联映射：fieldKey → Prisma relation name
  const ISP_RELATION_MAP: Record<string, string> = {
    isp1_id: 'Isp_PipingUnit_isp1_idToIsp',
    isp2_id: 'Isp_PipingUnit_isp2_idToIsp',
    ispsv_id: 'Isp_PipingUnit_ispsv_idToIsp',
  };
  if (ispCache) {
    const tryCreateIsp = async (type: string, reportCod: string | undefined, conclu: string | null | undefined, dt: string | null | undefined, bsType: number, untName: string | null | undefined, fieldKey: string) => {
      if (!reportCod) return;
      const ck = `${fieldKey}:${reportCod}`;
      if (ispCache!.has(ck)) { relationConnects[ISP_RELATION_MAP[fieldKey]] = { connect: { id: ispCache!.get(ck)! } }; return; }
      let ispuId: bigint;
      try {
        ispuId = await resolveIspuIdByName(tx, untName);
      } catch (e: any) {
        console.warn(`[PipingUnitSync] Isp(${type}) ${reportCod}: 跳过，${e.message}`);
        return;
      }
      try {
        const id = await findOrCreateIsp(tx, pipeId, reportCod, conclu, dt, bsType, ispuId);
        ispCache!.set(ck, id);
        relationConnects[ISP_RELATION_MAP[fieldKey]] = { connect: { id } };
      } catch (e: any) {
        console.warn(`[PipingUnitSync] Isp(${type}) ${reportCod}: ${e.message}`);
      }
    };

    await Promise.all([
      tryCreateIsp('REGUL', unit.ispReportCod, unit.ispConclu, unit.ispDate, 3, unit.ispUntName, 'isp2_id'),
      tryCreateIsp('ANNUAL', unit.yearIspReportCod, unit.yearIspConclu, unit.yearIspDate, 8, unit.ispUntName, 'isp1_id'),
      tryCreateIsp('INSTA', unit.incpIspReportCod, unit.incpIspConclu, unit.incpIspDate, 2, unit.incpUntName, 'ispsv_id'),
    ]);
  }

  // TODO: ad_id — 监管行政区域，需根据 unitAreaCod 查 Adminunit

  // ====== 查找已有记录 ID ======
  let existingId: bigint | undefined;

  // 优先用 rno（注册登记码）
  if (unit.eqpUntRegcod) {
    existingId = existingMap.get(`rno:${unit.eqpUntRegcod}`);
  }
  // 其次用 code
  if (!existingId && unit.eqpCode) {
    existingId = existingMap.get(`code:${unit.eqpCode}`);
  }
  // 最后用组合键
  if (!existingId) {
    existingId = existingMap.get(`key:${unit.eqpCode || ''}:${unit.startPlace || ''}:${unit.endPlace || ''}:${unit.boxName || unit.eqpName || ''}`);
  }

  // ====== 写入/更新 ======
  // svp 已合并到 pa，不再单独存储
  // FK 字段（insu_id/desu_id/isp1_id/isp2_id/ispsv_id）通过 relationConnects 设置，不放在 scalarFields 中
  const finalData = {
    ...scalarFields,
    pa: Object.keys(paData).length > 0 ? paData as Prisma.InputJsonValue : Prisma.JsonNull,
    ...relationConnects,
  };

  if (existingId) {
    await tx.pipingUnit.update({
      where: { id: existingId },
      data: { ...finalData, deleted: false } as any,
    });
    console.log(`[PipingUnitSync] Updated PipingUnit ${existingId} for code=${unit.eqpCode}`);
    return existingId;
  }
  const created = await tx.pipingUnit.create({
    data: {
      ...finalData,
      crDate: new Date(),
      Eqp: { connect: { id: pipeId } },
    } as any,
  });
  console.log(`[PipingUnitSync] Created PipingUnit ${created.id} for code=${unit.eqpCode}`);
  return created.id;
}
