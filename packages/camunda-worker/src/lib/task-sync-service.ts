/**
 * 任务同步服务
 * 将旧平台提取的任务数据同步到核心业务表
 *
 * 业务流程：
 * 1. 更新/创建设备台账 (Eqp) - 包含技术参数同步到 pa 字段
 * 2. 创建检验记录 (Isp)
 * 3. 创建业务详情 (Detail) 并关联 Isp
 * 4. 创建任务 (Task) 并关联多个 Detail
 * 5. 建立 Detail -> Task 关联
 */

import { Prisma } from '@prisma/client';
import type { ExtractedTask, ExtractedEquipment } from '../types/task-extraction';
import prisma from './prisma';
import { findOrCreateUnitByName, syncUnitFromOldPlatform } from './unit-sync-service';
import { fillEqpBase, resolveFillEqpRefs, mergeFillEqpResult, findOrCreateIsp } from './eqp-base-sync';
import { DEFAULT_UNIT_ID } from './constants';
import { fillTechParams } from './eqp-tech-sync';
import { syncPipingUnits } from './piping-unit-sync';

// 设备类型映射
const EQP_TYPE_MAP: Record<string, string> = {
  '3000': 'Elevator',      // 电梯
  '1000': 'Boiler',        // 锅炉
  '2000': 'Vessel',        // 压力容器
  '8000': 'Pipeline',      // 压力管道
  '4000': 'Crane',         // 起重机械
  '9000': 'Ropeway',       // 客运索道
  '6000': 'Amusement',     // 大型游乐设施
  '5000': 'FactoryVehicle', // 场(厂)内机动车辆
  "R000": "Vessel",     //常压容器

};

// 业务类型映射
const OPE_TYPE_MAP: Record<string, number> = {
  'DXJYZ': 1,   // 定期检验
  'JDJYZ': 2,   // 监督检验
  'FXJYZ': 3,   // 复检
  'AQYHP': 4,   // 安全评估
  'QZYX': 5,    // 取证延续
};

/**
 * 同步任务数据到核心业务表
 * @param task 提取的任务数据
 * @param equipment 设备台账数据
 * @param groupId 任务组ID
 * @param existingTaskId 已存在的Task实体ID（由外部预先创建）
 */
export async function syncTaskToCore(
  task: ExtractedTask,
  equipment: ExtractedEquipment | null,
  groupId: string,
  existingTaskId?: bigint,
  preSyncedEqpId?: bigint,
  accessToken?: string
): Promise<{
  success: boolean;
  taskId: string;
  eqpId?: bigint;
  ispId?: bigint;
  detailId?: bigint;
  coreTaskId?: bigint;
  error?: string;
}> {
  const taskId = task.taskId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ========== 步骤 1: 更新/创建设备台账 ==========
      // 如果外部已预同步设备（preSyncedEqpId），则跳过此步骤
      // 如果没有设备数据（equipment == null），则不关联任何 Eqp 记录
      const eqpId = preSyncedEqpId || (equipment ? await syncEquipment(tx, task, equipment, accessToken) : 0n);

      // ========== 步骤 2: 创建或复用 Task（前置到 Isp 之前） ==========
      // Isp 需要关联 Task，因此 Task 必须在 Isp 之前创建
      const coreTaskId = existingTaskId || await createTaskRecord(tx, task, groupId);

      // ========== 步骤 3: 创建或更新检验记录 (Isp) ==========
      const ispId = await createOrUpdateIspRecord(tx, task, eqpId, coreTaskId);

      // ========== 步骤 4: 创建或复用业务详情 (Detail) ==========
      const detailId = await createOrReuseDetailRecord(tx, task, ispId);

      // ========== 步骤 5: 关联到 Task（对已存在 Task 也会更新） ==========
      await linkDetailToTask(tx, detailId, coreTaskId);

      return { eqpId, ispId, detailId, coreTaskId };
    }, {
      // 增加事务超时时间到 30 秒
      maxWait: 10000, // 等待连接的最大时间
      timeout: 300000, // 事务执行超时时间，超时后是无法回滚已保存的数据的
    });

    console.log(`[TaskSync] Task ${taskId} synced to core tables successfully`);

    // ====== 若为管道装置(eqpType='8000')，额外同步管道单元 ======
    if (task.eqpType === '8000' && result.eqpId) {
      console.log(`[TaskSync] Starting piping unit sync for eqpCod=${task.eqpCod}, pipeId=${result.eqpId}`);
      // 管道单元同步在独立事务中执行，不影响主业务的事务
      // 管道单元数量可能很大，事务超时设为 5 分钟
      const pipingResult = await prisma.$transaction(async (tx) => {
        return await syncPipingUnits(tx, task.eqpCod, result.eqpId!, accessToken);
      }, { maxWait: 120000, timeout: 300000 });
      console.log(`[TaskSync] Piping unit sync result: ${pipingResult.processed}/${pipingResult.total} processed`);
    }

    return {
      success: true,
      taskId,
      ...result,
    };
  } catch (error: any) {
    console.error(`[TaskSync] Failed to sync task ${taskId}:`, error);
    return {
      success: false,
      taskId,
      error: error.message,
    };
  }
}

/**
 * 步骤 1: 更新/创建设备台账 (Eqp)
 */
export async function syncEquipment(
  tx: Prisma.TransactionClient,
  task: ExtractedTask,
  equipment: ExtractedEquipment | null,
  accessToken?: string
): Promise<bigint> {
  const eqpSortValue = (task.eqpSort || '').slice(0, 2);
  const eqpTypeValue = (task.eqpType || '').slice(0, 1);
  const eqpVartValue = (task.eqpVart || '').slice(0, 3);
  // 根据设备代码查找现有设备
  const existingEqp = await tx.eqp.findFirst({
    where: { cod: task.eqpCod },
    select: { id: true },
  });

  const paData = equipment ? {
    syncTime: new Date().toISOString(),
  } : null;

  // 解析 regUntId（注册单位ID）为本地单位实体ID，用于 Eqp.svu/regu 字段
  // 参考 Java Eqp 实体：@JoinColumn(name = "svu_id") private Unit svu;
  let regSvuId: bigint | undefined;
  const regUntId = equipment?.regUntId;
  if (regUntId && accessToken && equipment?.regUntName) {
    try {
      regSvuId = await findOrCreateUnitByName(equipment?.regUntName, tx);
      console.log(`[TaskSync] Resolved regUntId ${regUntId} to svu unit ID: ${regSvuId}`);
    } catch (unitSyncError: any) {
      console.warn(`[TaskSync] Failed to sync regUntId ${regUntId}:`, unitSyncError.message);
    }
  }

  // 解析 useUntId（使用单位ID）：从旧平台同步到本地 Unit 实体
  // 对应 Java: eqpBld.useu(getUnitfromOldUnitId(usjc, bsd.getUseUntId(), false))
  let resolvedUseuId: bigint | undefined;
  const useUntId = equipment?.useUntId;
  if (useUntId && accessToken) {
    try {
      resolvedUseuId = await syncUnitFromOldPlatform(useUntId, accessToken, tx);
      console.log(`[TaskSync] Resolved useu_id ${useUntId} to local Unit ID: ${resolvedUseuId}`);
    } catch (unitSyncError: any) {
      console.warn(`[TaskSync] Failed to sync useUntId ${useUntId}:`, unitSyncError.message);
    }
  }

  // ====== 调用 fillEqpBase 填充设备通用基础信息（svp/pam/各类标量字段） ======
  // 对应 Java InfRecvConvert.fillEqpBase()，处理各设备种类共用的字段映射
  let eqpFillResult: Awaited<ReturnType<typeof fillEqpBase>> | null = null;
  let techParams: Awaited<ReturnType<typeof fillTechParams>> | null = null;
  if (equipment) {
    eqpFillResult = fillEqpBase(equipment);
    // 异步解析关联实体引用（Division / Adminunit / Village / 单位Ajson）
    eqpFillResult.asyncRefs = await resolveFillEqpRefs(
      eqpFillResult.asyncRefs, equipment, accessToken, tx, resolvedUseuId
    );
    // ====== 调用 fillTechParams 提取设备类型特有技术参数 ======
    // 对应 Java InfRecvConvert.java L460-505 的分发逻辑
    // 根据 task.eqpType（如 '3000'/'2000'/'4000' 等）路由到对应 fill 函数
    techParams = fillTechParams(task.eqpType, equipment);
  }

  // ====== 步骤 1.5: 管道装置(eqpType='8000') 额外同步底下关联的管道单元 ======
  // 管道单元同步依赖设备台账创建后的 pipeId，在执行 fillEqpBase+fillTechParams 之后进行
  // 注：tPipingUnits 需要在 eqpData 最终确定后、实际写入前，由上一级 syncTaskToCore 中调用同步

  // 公共设备数据（update 和 create 共用）
  const eqpData: Record<string, any> = {
    DTYPE: EQP_TYPE_MAP[task.eqpType] || 'Eqp',
    vart: eqpVartValue,
    eqp_sort: eqpSortValue,
    // useu_id（使用单位）：通过 syncUnitFromOldPlatform 从旧平台同步到本地 Unit 实体
    useu_id: resolvedUseuId || null,
    // makeu_id（制造单位）、insu_id（安装单位）、remu_id（改造单位）和 repu_id（维修单位）将在下方通过 asyncRefs 设置
    makeu_id: null,
    insu_id: null,
    remu_id: null,
    repu_id: null,
    // regu_id（注册单位）：优先使用 regUntId 解析后的本地单位ID
    regu_id: regSvuId || null,
    // svu_id（监察机构/服务单位）：与 regu_id 一致（Java: eqpBld.regu(eqp.getSvu())）
    svu_id: regSvuId || null,
    pa: paData as Prisma.InputJsonValue | undefined,
  };

  // ====== 将 fillEqpBase 结果合并到 eqpData ======
  if (eqpFillResult) {
    // 将设计单位/型试单位 AjsonUnit 嵌入 pa 中
    const enrichedPa: Record<string, any> = { ...paData };
    if (eqpFillResult.asyncRefs.designUnit) {
      enrichedPa['设计单位'] = eqpFillResult.asyncRefs.designUnit;
    }
    if (eqpFillResult.asyncRefs.testUnit) {
      enrichedPa['型试单位'] = eqpFillResult.asyncRefs.testUnit;
    }

    // 统一合并 eqpFields + pa(含svp+pam) 到 eqpData
    mergeFillEqpResult(eqpData, eqpFillResult, enrichedPa);

    // 设置异步解析的关联实体 ID
    if (eqpFillResult.asyncRefs.adminunitId) eqpData.aid = eqpFillResult.asyncRefs.adminunitId;
    if (eqpFillResult.asyncRefs.villageId) eqpData.vid = eqpFillResult.asyncRefs.villageId;
    if (eqpFillResult.asyncRefs.useDivisionId) eqpData.usud_id = eqpFillResult.asyncRefs.useDivisionId;
    if (eqpFillResult.asyncRefs.ispDivisionId) eqpData.ispud_id = eqpFillResult.asyncRefs.ispDivisionId;
    if (eqpFillResult.asyncRefs.ownerUnit?.i) eqpData.owner_id = eqpFillResult.asyncRefs.ownerUnit.i;
    if (eqpFillResult.asyncRefs.maintenanceUnit?.i) eqpData.mtu_id = eqpFillResult.asyncRefs.maintenanceUnit.i;
    if (eqpFillResult.asyncRefs.manufacturingUnit?.i) eqpData.makeu_id = eqpFillResult.asyncRefs.manufacturingUnit.i;
    if (eqpFillResult.asyncRefs.installationUnit?.i) eqpData.insu_id = eqpFillResult.asyncRefs.installationUnit.i;
    if (eqpFillResult.asyncRefs.alterationUnit?.i) eqpData.remu_id = eqpFillResult.asyncRefs.alterationUnit.i;
    if (eqpFillResult.asyncRefs.repairUnit?.i) eqpData.repu_id = eqpFillResult.asyncRefs.repairUnit.i;
  }

  // ====== 合并设备类型特有技术参数到 eqpData ======
  // 对应 Java: fillEqpBase 后，按 eqpType 分发到 fillElevator/fillVessel/fillCrane 等
  if (techParams) {
    // eqpFields: 类型特有的 Eqp 标量字段（如电梯的 flo/hlf/vl，容器的 vol/prs 等）
    Object.assign(eqpData, techParams.eqpFields);

    // paFields: 类型特有的技术参数（svp+pam 合并），覆盖到 pa JSON 中
    // 注意：eqpData.pa 可能已有 mergeFillEqpResult 赋值的 svp/pam 基础字段，不可清空
    const currentPa = eqpData.pa ? { ...eqpData.pa as any } : {};
    if (Object.keys(techParams.paFields).length > 0) {
      eqpData.pa = { ...currentPa, ...techParams.paFields } as any;
    }
    // techParams.paFields 为空时保留 currentPa 已有数据（基础 svp/pam/同步时间等）

    console.log(`[TaskSync] Merged tech params for eqpType=${task.eqpType}:`,
      Object.keys(techParams.eqpFields).length, 'scalar fields,',
      Object.keys(techParams.paFields).length, 'pa fields');
  }

  let eqpId: bigint;
  if (existingEqp) {
    // 更新现有设备（不包含 cod、type、ispu_id，这些字段只能在创建时设置）
    await tx.eqp.update({
      where: { id: existingEqp.id },
      data: {
        ...eqpData,
        version: { increment: 1 },
      },
    });
    eqpId = existingEqp.id;
  } else {
    // 创建新设备 - TiDB AUTO_RANDOM 自动生成 id
    // 包含只能在创建时设置的字段：cod、type、ispu_id
    const newEqp = await tx.eqp.create({
      data: {
        ...eqpData,
        cod: task.eqpCod,
        type: eqpTypeValue,
        ispu_id: BigInt(DEFAULT_UNIT_ID),
        crDate: new Date(),
        version: 1,
      } as any,
    });
    eqpId = newEqp.id;
  }

  // ====== Eqp 创建/更新后，处理待创建 Isp 记录（使用真实 dev_id = eqpId） ======
  if (eqpFillResult?.asyncRefs.pendingIsps) {
    const updateFields: Record<string, bigint> = {};
    for (const pendingIsp of eqpFillResult.asyncRefs.pendingIsps) {
      try {
        const ispId = await findOrCreateIsp(tx, eqpId, pendingIsp.reportNo, pendingIsp.conclusion, pendingIsp.ispDate, pendingIsp.bsType, pendingIsp.ispuId);
        if (pendingIsp.fieldKey === 'isp1Id') {
          updateFields.isp1_id = ispId;
        } else if (pendingIsp.fieldKey === 'isp2Id') {
          updateFields.isp2_id = ispId;
        }
        console.log(`[TaskSync] Created/updated Isp ${pendingIsp.reportNo} (${pendingIsp.fieldKey}) for Eqp ${eqpId}`);
      } catch (e: any) {
        console.warn(`[TaskSync] Failed to create Isp ${pendingIsp.reportNo}: ${e.message}`);
      }
    }
    // 更新 Eqp 的 isp1_id / isp2_id 字段
    if (Object.keys(updateFields).length > 0) {
      await tx.eqp.update({
        where: { id: eqpId },
        data: updateFields,
      });
    }
  }

  console.log(`[TaskSync] Updated Eqp ${eqpId} for cod ${task.eqpCod}`);
  return eqpId;
}


/**
 * 步骤 2: 创建或更新检验记录 (Isp)
 * 通过 Detail 表的 outerId 和 task_id 检查是否已存在对应的 Isp 记录
 * 存在则更新，不存在则创建
 */
async function createOrUpdateIspRecord(
  tx: Prisma.TransactionClient,
  task: ExtractedTask,
  eqpId: bigint,
  existingTaskId: bigint | undefined
): Promise<bigint> {
  // 检查 existingTaskId 必须存在
  if (!existingTaskId) {
    throw new Error(`existingTaskId is required for creating/reusing Isp record. Task: ${task.taskId}`);
  }

  // 根据 jyMen (authName) 查询检验人员ID
  let checkMenId: bigint | null = null;
  if (task.jyMen) {
    const user = await tx.uSERS.findFirst({
      where: { authName: task.jyMen },
      select: { id: true },
    });
    if (user) {
      checkMenId = user.id;
      console.log(`[TaskSync] Found checkMen ${user.id} for authName ${task.jyMen}`);
    } else {
      console.warn(`[TaskSync] CheckMen not found for authName ${task.jyMen}, using null`);
    }
  }

  // 查询 Task 实体获取 bsType
  const taskEntity = await tx.task.findUnique({
    where: { id: existingTaskId },
    select: { bsType: true },
  });
  if (!taskEntity) {
    throw new Error(`Task not found for id ${existingTaskId}`);
  }
  const taskBsType = taskEntity.bsType;
  console.log(`[TaskSync] Got bsType ${taskBsType} from Task ${existingTaskId}`);

  // 构建 Isp 数据（公用部分）
  const ispData = {
    bsType: taskBsType,
    no: task.reportCod || null,
    ispDate: task.taskDate ? new Date(task.taskDate) : null,
    entrust: task.busiType === '2',
    checkMen_id: checkMenId,
  };

  // 通过 Detail 表的 outerId 和 task_id 查找已存在的 Isp 记录
  // outerId 存储原始任务的 taskId，用于识别同一任务
  const existingDetailWithIsp = await tx.detail.findFirst({
    where: {
      outerId: task.taskId,
      task_id: existingTaskId,
    },
    include: {
      Isp: true, // 包含关联的 Isp 记录
    },
  });

  // dev_id: 无设备数据时(eqpId===0n)设为null，清空旧设备关联
  const devIdValue = eqpId || null;

  if (existingDetailWithIsp?.Isp) {
    // 已存在对应的 Isp 记录，更新它（同时更新 dev_id 以清空旧的设备关联）
    const existingIspId = existingDetailWithIsp.Isp.id;
    await tx.isp.update({
      where: { id: existingIspId },
      data: { ...ispData, dev_id: devIdValue } as any,
    });
    console.log(`[TaskSync] Updated existing Isp ${existingIspId} for task ${task.taskId}`);
    return existingIspId;
  }

  // 创建新的 Isp 记录
  const isp = await tx.isp.create({
    data: {
      ...ispData,
      dev_id: devIdValue,
      ispu_id: BigInt(DEFAULT_UNIT_ID),
      servu_id: null,
      nextispdate: null,
    } as any,
  });

  console.log(`[TaskSync] Created new Isp ${isp.id} for Eqp ${eqpId}`);
  return isp.id;
}

/**
 * 步骤 3: 创建或复用业务详情 (Detail)
 * 
 * 注意：根据 JPA 实体设计，Detail 和 Isp 是双向一对一关系
 * - Detail.isp 指向 Isp
 * - Isp.bus_id 指向 Detail
 * 检查是否已存在该 Isp 关联的 Detail，存在则复用，不存在则创建
 */
async function createOrReuseDetailRecord(
  tx: Prisma.TransactionClient,
  task: ExtractedTask,
  ispId: bigint
): Promise<bigint> {
  //业务详情需要单独从旧平台的接口同步数据过来的！


  // 检查该 Isp 是否已有关联的 Detail（通过 Isp.bus_id 反向查询）
  const existingIsp = await tx.isp.findFirst({
    where: { id: ispId },
    select: { bus_id: true },
  });

  if (existingIsp?.bus_id) {
    // 如果已有关联 Detail，对于非标准设备更新 extra/ident/type/sort/vart
    if (task.taskDatabase === '2') {
      const eqpInnerCod = task.eqpInnerCod || '';
      const factoryCod = task.factoryCod || '';
      const eqpCod = task.eqpCod || '';
      const detailExtra = JSON.stringify({ eqpInnerCod, factoryCod, eqpCod });
      let detailIdent: string | undefined;
      if (eqpInnerCod) detailIdent = `内部:${eqpInnerCod}`;
      else if (factoryCod) detailIdent = `出厂:${factoryCod}`;
      else if (eqpCod) detailIdent = `系统:${eqpCod}`;
      await tx.detail.update({
        where: { id: existingIsp.bus_id },
        data: {
          extra: detailExtra,
          ident: detailIdent,
          type: task.eqpType ? task.eqpType.slice(0, 1) : null,
          sort: task.eqpSort ? task.eqpSort.slice(0, 2) : null,
          vart: task.eqpVart ? task.eqpVart.slice(0, 3) : null,
        } as any,
      });
      console.log(`[TaskSync] Updated Detail ${existingIsp.bus_id} extra/ident/type/sort/vart for non-standard device`);
    }
    console.log(`[TaskSync] Reusing existing Detail ${existingIsp.bus_id} for Isp ${ispId}`);
    return existingIsp.bus_id;
  }

  // 非标准设备（taskDatabase=2）：提取设备标识信息以及 type/sort/vart
  let detailExtra: string | undefined;
  let detailIdent: string | undefined;
  let detailType: string | undefined;
  let detailSort: string | undefined;
  let detailVart: string | undefined;
  if (task.taskDatabase === '2') {
    const eqpInnerCod = task.eqpInnerCod || '';
    const factoryCod = task.factoryCod || '';
    const eqpCod = task.eqpCod || '';
    detailExtra = JSON.stringify({ eqpInnerCod, factoryCod, eqpCod });
    if (eqpInnerCod) {
      detailIdent = `内部:${eqpInnerCod}`;
    } else if (factoryCod) {
      detailIdent = `出厂:${factoryCod}`;
    } else if (eqpCod) {
      detailIdent = `系统:${eqpCod}`;
    }
    // 旧平台设备分类：eqpType的首字符→type, eqpSort的前2位→sort, eqpVart的前3位→vart
    detailType = task.eqpType ? task.eqpType.slice(0, 1) : undefined;
    detailSort = task.eqpSort ? task.eqpSort.slice(0, 2) : undefined;
    detailVart = task.eqpVart ? task.eqpVart.slice(0, 3) : undefined;
    console.log(`[TaskSync] Non-standard device (taskDatabase=2), extra:`, detailExtra, `ident:`, detailIdent, `type:${detailType} sort:${detailSort} vart:${detailVart}`);
  }

  // 创建新的 Detail
  const detail = await tx.detail.create({
    data: {
      feeOk: false,
      apprp: false,
      cheap: false,
      impor: false,
      nsite: false,
      ntscop: false,
      online: false,
      test: false,
      tiron: 0,
      outerId: task.taskId,   // 存储旧平台的任务ID用于追踪
      version: 1,
      extra: detailExtra,
      ident: detailIdent,
      type: detailType,
      sort: detailSort,
      vart: detailVart,
    } as any,
  });

  // 更新 Isp 的 bus_id 关联到 Detail
  await tx.isp.update({
    where: { id: ispId },
    data: { bus_id: detail.id },
  });

  console.log(`[TaskSync] Created new Detail ${detail.id} and linked to Isp ${ispId}`);
  return detail.id;
}

/**
 * 步骤 4: 创建任务 (Task)
 * 
 * 注意：Task.id 使用数据库自增，不需要手动指定
 * 使用 oldTaskTag 字段存储 groupId 用于关联同一组的任务
 */
async function createTaskRecord(
  tx: Prisma.TransactionClient,
  task: ExtractedTask,
  groupId: string,
): Promise<bigint> {
  // 检查是否已存在该 groupId 的任务
  const existingTask = await tx.task.findFirst({
    where: {
      oldTaskTag: groupId,
    },
    select: { id: true },
  });

  if (existingTask) {
    console.log(`[TaskSync] Found existing Task ${existingTask.id} for group ${groupId}`);
    return existingTask.id;
  }

  // 根据 projUserId (authName) 查询用户ID
  let liablerId: bigint | null = null;
  if (task.projUserId) {
    const projUserIdValue = Array.isArray(task.projUserId)
      ? String(task.projUserId[0])
      : String(task.projUserId);

    const user = await tx.uSERS.findFirst({
      where: { authName: projUserIdValue },
      select: { id: true },
    });
    if (user) {
      liablerId = user.id;
      console.log(`[TaskSync] Found user ${user.id} for authName ${projUserIdValue}`);
    } else {
      console.warn(`[TaskSync] User not found for authName ${projUserIdValue}, using null`);
    }
  }

  if (!liablerId) {
    throw new Error(`No responsible user found for projUserId ${task.projUserId || '<missing>'}. Task cannot be created without a liabler.`);
  }

  // 创建新任务
  const newTask = await tx.task.create({
    data: {
      bsType: OPE_TYPE_MAP[task.opeType] || 1,
      date: task.taskDate ? new Date(task.taskDate) : new Date(),
      entrust: task.busiType === '2',
      feeOk: false,
      ispu_id: BigInt(DEFAULT_UNIT_ID),
      liabler_id: liablerId,
      oldTaskTag: groupId,
      status: 0,
    } as any,
  });

  console.log(`[TaskSync] Created Task ${newTask.id} for group ${groupId}`);
  return newTask.id;
}

/**
 * 步骤 5: 建立 Detail 与 Task 的关联
 */
async function linkDetailToTask(
  tx: Prisma.TransactionClient,
  detailId: bigint,
  taskId: bigint
): Promise<void> {
  await tx.detail.update({
    where: { id: detailId },
    data: {
      task_id: taskId,
    },
  });

  console.log(`[TaskSync] Linked Detail ${detailId} to Task ${taskId}`);
}

/**
 * 批量同步任务组
 */
export async function syncTaskGroup(
  tasks: ExtractedTask[],
  equipments: Map<string, ExtractedEquipment>,
  groupId: string,
  accessToken?: string
): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}> {
  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const task of tasks) {
    const equipment = equipments.get(task.eqpCod) || null;
    const result = await syncTaskToCore(task, equipment, groupId, undefined, undefined, accessToken);

    if (result.success) {
      processed++;
    } else {
      failed++;
      errors.push(`Task ${task.taskId}: ${result.error}`);
    }
  }

  return {
    success: failed === 0,
    processed,
    failed,
    errors,
  };
}

// 导出类型
export type { ExtractedTask, ExtractedEquipment };
