/**
 * 用户同步任务处理器
 * 从第三方 API 获取部门人员列表，同步到本地 USERS 表
 */

import https from 'https';
import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { QueueName, JobPriority } from '../bullmq-config';
import { queueManager } from '../queue-manager';
import { getAccessToken } from '@/lib/third-party/auth';
import { DEFAULT_UNIT_ID } from '@/lib/migration/division-data';

// 部门信息
interface DivisionInfo {
  id: string;
  name: string;
}

// 用户同步任务数据类型
export interface UserSyncJobData {
  taskType: 'user_sync';
  deptId: string;
  deptName?: string;
  unitId?: string;
  batchSize?: number;
  options?: {
    accessToken?: string; // 可选，优先使用传入的 token
    useEnvCredentials?: boolean; // 是否使用环境变量中的凭证自动登录
  };
}

// 批量用户同步任务数据类型
export interface BatchUserSyncJobData {
  taskType: 'batch_user_sync';
  divisions: DivisionInfo[];  // 部门列表
  unitId?: string;
  batchSize?: number;
  options?: {
    accessToken?: string;
    useEnvCredentials?: boolean;
  };
}

// 第三方 API 用户数据类型
interface ThirdPartyUser {
  userId: number;
  userName: string;
  nickName?: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  avatar?: string;
  password?: string;
  status?: string;
  delFlag?: string;
  loginIp?: string;
  loginDate?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  deptId?: number;      // 科室ID（第三方）
  deptName?: string;    // 科室名称
  idNum?: string;       // 身份证号
  mobile?: string;      // 手机号
  phone?: string;       // 电话
  jobStatus?: string;   // 在职状态
  ifAsschk?: boolean;   // 是否考核
  loginCod?: string;    // 登录代码
  oldUserId?: number;   // 旧用户ID
  roleIds?: number[];
  postIds?: number[];
  roles?: any[];
}

// 同步进度类型
export interface UserSyncProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  currentItem?: string;
  percentage: number;
}

// 第三方 API 基础配置
const THIRD_PARTY_API = {
  baseUrl: 'https://36.212.134.165:10443/prod-api',
  timeout: 30000,
};

/**
 * 使用 https 模块发送请求（支持自签名证书）
 */
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
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // 允许自签名证书
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

/**
 * 从第三方 API 获取部门用户列表
 */
async function fetchDeptUsers(deptId: string, accessToken: string): Promise<ThirdPartyUser[]> {
  const timestamp = Date.now();
  const url = `${THIRD_PARTY_API.baseUrl}/system/user/list?status=1&pageSize=1000&pageNum=1&deptId=${deptId}&userType=10&curMenuId=100&time=${timestamp}`;
  
  console.log(`[UserSyncProcessor] Fetching users for dept ${deptId} from ${url}`);
  
  try {
    const result = await httpsGetJson(url, {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    
    if (result.code !== 200) {
      throw new Error(`API error: ${result.msg || 'Unknown error'}`);
    }

    // 处理分页数据
    const rows = result.rows || [];
    console.log(`[UserSyncProcessor] Fetched ${rows.length} users for dept ${deptId}`);
    
    return rows;
  } catch (error: any) {
    console.error(`[UserSyncProcessor] Failed to fetch users for dept ${deptId}:`, error);
    throw error;
  }
}

/**
 * 根据身份证号查找或创建 Person
 */
async function findOrCreatePerson(
  idNum: string,
  userName: string,
  phone?: string
): Promise<{ id: bigint; isNew: boolean }> {
  // 先根据身份证号查找
  let person = await (prisma as any).person.findUnique({
    where: { no: idNum },
  });

  if (person) {
    console.log(`[UserSyncProcessor] Found existing person: ${userName} (idNum: ${idNum})`);
    return { id: person.id, isNew: false };
  }

  // 创建新 Person
  person = await (prisma as any).person.create({
    data: {
      name: userName,
      no: idNum,
      phone: phone || null,
      gender: null,
    },
  });

  console.log(`[UserSyncProcessor] Created new person: ${userName} (idNum: ${idNum})`);
  return { id: person.id, isNew: true };
}

/**
 * 根据部门名称和单位ID查找本地 Division 部门
 */
async function findDivisionByName(
  deptName: string,
  unitId: string
): Promise<{ id: bigint; name: string } | null> {
  const division = await (prisma as any).division.findFirst({
    where: {
      name: deptName,
      unit_id: BigInt(unitId),
    },
  });

  if (division) {
    console.log(`[UserSyncProcessor] Found division: ${deptName} (id: ${division.id})`);
    return { id: division.id, name: division.name };
  }

  console.warn(`[UserSyncProcessor] Division not found: ${deptName} (unitId: ${unitId})`);
  return null;
}

/**
 * 根据第三方科室ID查找或创建 Office
 */
async function findOrCreateOffice(
  thirdPartyDeptId: number,
  deptName: string,
  divisionId: string
): Promise<{ id: bigint; isNew: boolean }> {
  // 尝试查找已存在的科室（通过名称和部门ID匹配）
  let office = await (prisma as any).office.findFirst({
    where: {
      name: deptName,
      dep_id: BigInt(divisionId),
    },
  });

  if (office) {
    console.log(`[UserSyncProcessor] Found existing office: ${deptName}`);
    return { id: office.id, isNew: false };
  }

  // 创建新科室
  office = await (prisma as any).office.create({
    data: {
      name: deptName,
      dep_id: BigInt(divisionId),
      lare_id: null,
    },
  });

  console.log(`[UserSyncProcessor] Created new office: ${deptName} (deptId: ${thirdPartyDeptId})`);
  return { id: office.id, isNew: true };
}

/**
 * 同步用户到本地数据库
 * 流程：
 * 1. 根据 idNum 查找或创建 Person
 * 2. 根据 deptId 判断是否等于传入的部门ID，不等于则视为科室
 * 3. 查找或创建 Office（科室）
 * 4. 根据 Person 查找 USERS（通过 person_id）
 * 5. 创建或更新 USERS，关联 Person、Division、Office、Unit
 * 
 * @param user 第三方用户数据
 * @param realDivisionId 本地真实的部门ID（根据部门名称查找到的）
 * @param thirdPartyDeptId 第三方系统的部门ID（用于比较判断是否为科室）
 * @param unitId 单位ID
 */
async function syncUserToLocal(
  user: ThirdPartyUser,
  realDivisionId: bigint,  // 本地真实的部门ID
  thirdPartyDeptId: string, // 第三方系统的部门ID
  unitId: string
): Promise<{ success: boolean; action: 'created' | 'updated' | 'skipped' | 'failed'; error?: string }> {
  try {
    // 必须有身份证号才能同步
    if (!user.idNum) {
      console.warn(`[UserSyncProcessor] Skipping user ${user.userName}: no idNum provided`);
      return { success: false, action: 'skipped', error: 'Missing idNum (身份证号)' };
    }

    // 1. 查找或创建 Person（根据身份证号）
    const { id: personId, isNew: isNewPerson } = await findOrCreatePerson(
      user.idNum,
      user.userName,
      user.mobile || user.phone || user.phonenumber
    );

    // 2. 判断用户的 deptId 是否为科室
    // 如果 user.deptId 存在且不等于传入的第三方部门ID，则视为子科室
    let officeId: bigint | null = null;
    const userDeptId = user.deptId ? String(user.deptId) : null;
    
    if (userDeptId && userDeptId !== thirdPartyDeptId && user.deptName) {
      // 用户属于子科室，需要创建/查找科室
      const { id: oid } = await findOrCreateOffice(user.deptId!, user.deptName, String(realDivisionId));
      officeId = oid;
    }

    // 3. 根据 Person 查找已存在的用户账户
    const existingUser = await (prisma as any).uSERS.findFirst({
      where: { person_id: personId },
    });

    // 准备用户数据
    const userData = {
      USERNAME: user.loginCod,    //默认是用第三方平台的 loginCod 作为用户名
      // firstname: user.userName,
      lastname: '',
      email: user.email || null,
      authName: String(user.userId),      //第三方平台的账户用户的id
      oldAccount: user.loginCod,    //第三方平台的账户
      mobile: user.mobile || user.phone || user.phonenumber || null,
      password: user.password || '',
      ENABLED: false,   //默认禁用，管理员可以手动启用后用户才能登录
      photoURL: user.avatar || null,
      // 关联字段
      person_id: personId,
      dep_id: realDivisionId,  // 使用传入的真实部门ID
      office_id: officeId,
      unit_id: BigInt(unitId),
      ispu_id: BigInt(DEFAULT_UNIT_ID),
      authType: "旧平台Cod",    //从老平台的 loginCod 直接迁移过来的账户
    };

    if (existingUser) {
      // 更新现有用户
      await (prisma as any).uSERS.update({
        where: { id: existingUser.id },
        data: {
          ...userData,
        },
      });
      console.log(`[UserSyncProcessor] User ${user.userName} updated (personId: ${personId}, divisionId: ${realDivisionId})`);
      return { success: true, action: 'updated' };
    } else {
      // 创建新用户 - id 由数据库自动生成
      await (prisma as any).uSERS.create({
        data: userData,
      });
      console.log(`[UserSyncProcessor] User ${user.userName} created (personId: ${personId}, divisionId: ${realDivisionId}, newPerson: ${isNewPerson})`);
      return { success: true, action: 'created' };
    }
  } catch (error: any) {
    console.error(`[UserSyncProcessor] Failed to sync user ${user.userName}:`, error);
    return { success: false, action: 'failed', error: error.message };
  }
}

/**
 * 用户同步任务处理器
 */
async function processUserSync(job: Job<UserSyncJobData>): Promise<any> {
  const { deptId, deptName, unitId = DEFAULT_UNIT_ID } = job.data;
  const batchSize = job.data.batchSize || 10;
  
  console.log(`[UserSyncProcessor] Starting user sync for dept ${deptId} (${deptName || 'Unknown'})`);

  // 更新任务状态为处理中
  await updateUserSyncTask(job.id!, 'PROCESSING', { 
    totalCount: 0,
    deptId,
    deptName,
  });

  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // 获取 accessToken
    let accessToken: string;
    
    if (job.data.options?.accessToken) {
      // 优先使用传入的 token
      accessToken = job.data.options.accessToken;
    } else if (job.data.options?.useEnvCredentials !== false) {
      // 默认使用环境变量凭证自动获取 token
      accessToken = await getAccessToken();
    } else {
      throw new Error('Access token is required. Please provide it in options.accessToken or set useEnvCredentials to true');
    }

    // 获取第三方用户列表
    const users = await fetchDeptUsers(deptId, accessToken);
    results.total = users.length;

    // 更新总数量
    await updateUserSyncTask(job.id!, 'PROCESSING', { 
      totalCount: results.total,
      deptId,
      deptName,
    });

    // 根据部门名称查找本地 Division 部门（真实部门ID）
    if (!deptName) {
      throw new Error('deptName is required to find local division');
    }
    const division = await findDivisionByName(deptName, unitId);
    if (!division) {
      throw new Error(`Division not found for deptName: ${deptName} (unitId: ${unitId})`);
    }
    const realDivisionId = division.id;
    console.log(`[UserSyncProcessor] Found local division: ${deptName} -> id: ${realDivisionId}`);

    // 分批处理
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      for (const user of batch) {
        const result = await syncUserToLocal(user, realDivisionId, deptId, unitId);
        
        switch (result.action) {
          case 'created':
            results.created++;
            break;
          case 'updated':
            results.updated++;
            break;
          case 'skipped':
            results.skipped++;
            break;
          case 'failed':
            results.failed++;
            if (result.error) {
              results.errors.push(`Failed to sync ${user.userName}: ${result.error}`);
            }
            break;
        }

        // 更新进度
        const processed = results.created + results.updated + results.skipped + results.failed;
        const progress: UserSyncProgress = {
          total: results.total,
          processed,
          succeeded: results.created + results.updated + results.skipped,
          failed: results.failed,
          currentItem: user.userName,
          percentage: Math.round((processed / results.total) * 100),
        };

        await job.updateProgress(progress);
        await updateUserSyncTask(job.id!, 'PROCESSING', { 
          processedCount: processed,
          failCount: results.failed,
          deptId,
          deptName,
        });
      }

      // 每批处理完后短暂暂停
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 更新最终状态
    const finalStatus = results.failed === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS';
    await updateUserSyncTask(job.id!, finalStatus, {
      processedCount: results.created + results.updated + results.skipped,
      failCount: results.failed,
      errorMessage: results.failed > 0 ? JSON.stringify(results.errors.slice(0, 5)) : null,
      deptId,
      deptName,
    });

    console.log(`[UserSyncProcessor] User sync completed for dept ${deptId}:`, results);
    return results;

  } catch (error: any) {
    console.error(`[UserSyncProcessor] User sync failed for dept ${deptId}:`, error);
    
    await updateUserSyncTask(job.id!, 'FAILED', {
      errorMessage: error.message,
      deptId,
      deptName,
    });
    
    throw error;
  }
}

/**
 * 更新用户同步任务状态到数据库
 */
async function updateUserSyncTask(
  jobId: string,
  status: string,
  updates: {
    totalCount?: number;
    processedCount?: number;
    failCount?: number;
    errorMessage?: string | null;
    deptId?: string;
    deptName?: string;
  }
): Promise<void> {
  try {
    // 找到最新的 PENDING 或 PROCESSING 状态的任务记录
    const latestTask = await (prisma as any).migration_task.findFirst({
      where: {
        taskType: 'USER_SYNC',
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      orderBy: { createTime: 'desc' },
    });

    if (latestTask) {
      const updateData: any = {
        status,
        updateTime: new Date(),
      };

      if (updates.totalCount !== undefined) updateData.totalCount = BigInt(updates.totalCount);
      if (updates.processedCount !== undefined) updateData.processedCount = BigInt(updates.processedCount);
      if (updates.failCount !== undefined) updateData.failCount = BigInt(updates.failCount);
      if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;

      // 计算进度
      if (updates.totalCount && updates.processedCount) {
        updateData.progress = Math.round((updates.processedCount / updates.totalCount) * 100);
      }

      // 完成时设置完成时间
      if (status === 'COMPLETED' || status === 'COMPLETED_WITH_ERRORS' || status === 'FAILED') {
        updateData.completeTime = new Date();
      }

      await (prisma as any).migration_task.update({
        where: { id: latestTask.id },
        data: updateData,
      });
    }
  } catch (error) {
    console.error('[UserSyncProcessor] Failed to update task status:', error);
  }
}

/**
 * 批量用户同步任务处理器
 * 依次处理多个部门的用户同步
 */
async function processBatchUserSync(job: Job<BatchUserSyncJobData>): Promise<any> {
  const { divisions, unitId = DEFAULT_UNIT_ID } = job.data;
  const batchSize = job.data.batchSize || 10;

  console.log(`[UserSyncProcessor] Starting batch user sync for ${divisions.length} departments`);

  const overallResults = {
    totalDepartments: divisions.length,
    processedDepartments: 0,
    totalUsers: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    departmentResults: [] as { deptId: string; deptName: string; success: boolean; userCount: number; error?: string }[],
  };

  try {
    // 获取 accessToken（批量任务只获取一次）
    let accessToken: string;

    if (job.data.options?.accessToken) {
      accessToken = job.data.options.accessToken;
    } else if (job.data.options?.useEnvCredentials !== false) {
      accessToken = await getAccessToken();
    } else {
      throw new Error('Access token is required. Please provide it in options.accessToken or set useEnvCredentials to true');
    }

    // 依次处理每个部门
    for (let i = 0; i < divisions.length; i++) {
      const division = divisions[i];
      console.log(`[UserSyncProcessor] Processing department ${i + 1}/${divisions.length}: ${division.name} (ID: ${division.id})`);

      // 更新进度
      await job.updateProgress({
        total: divisions.length,
        processed: i,
        currentDepartment: division.name,
        percentage: Math.round((i / divisions.length) * 100),
      });

      try {
        // 获取该部门的用户列表
        const users = await fetchDeptUsers(division.id, accessToken);
        overallResults.totalUsers += users.length;

        // 根据部门名称查找本地 Division 部门（真实部门ID）
        const localDivision = await findDivisionByName(division.name, unitId);
        if (!localDivision) {
          console.warn(`[UserSyncProcessor] Division not found for ${division.name}, skipping`);
          overallResults.departmentResults.push({
            deptId: division.id,
            deptName: division.name,
            success: false,
            userCount: 0,
            error: 'Division not found in local database',
          });
          continue;
        }

        const realDivisionId = localDivision.id;
        console.log(`[UserSyncProcessor] Found local division: ${division.name} -> id: ${realDivisionId}`);

        // 处理该部门的所有用户
        const deptResults = {
          created: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
        };

        for (let j = 0; j < users.length; j += batchSize) {
          const batch = users.slice(j, j + batchSize);

          for (const user of batch) {
            const result = await syncUserToLocal(user, realDivisionId, division.id, unitId);

            switch (result.action) {
              case 'created':
                deptResults.created++;
                overallResults.created++;
                break;
              case 'updated':
                deptResults.updated++;
                overallResults.updated++;
                break;
              case 'skipped':
                deptResults.skipped++;
                overallResults.skipped++;
                break;
              case 'failed':
                deptResults.failed++;
                overallResults.failed++;
                break;
            }
          }

          // 每批处理后短暂暂停
          if (j + batchSize < users.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        overallResults.processedDepartments++;
        overallResults.departmentResults.push({
          deptId: division.id,
          deptName: division.name,
          success: true,
          userCount: users.length,
        });

        console.log(`[UserSyncProcessor] Completed department ${division.name}:`, deptResults);

      } catch (error: any) {
        console.error(`[UserSyncProcessor] Failed to process department ${division.name}:`, error);
        overallResults.departmentResults.push({
          deptId: division.id,
          deptName: division.name,
          success: false,
          userCount: 0,
          error: error.message,
        });
      }

      // 部门之间暂停一下，避免请求过快
      if (i < divisions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 更新最终进度
    await job.updateProgress({
      total: divisions.length,
      processed: divisions.length,
      percentage: 100,
    });

    console.log(`[UserSyncProcessor] Batch user sync completed:`, overallResults);
    return overallResults;

  } catch (error: any) {
    console.error(`[UserSyncProcessor] Batch user sync failed:`, error);
    throw error;
  }
}

/**
 * 主用户同步处理器
 */
export async function userSyncProcessor(job: Job<UserSyncJobData | BatchUserSyncJobData>): Promise<any> {
  console.log(`[UserSyncProcessor] Processing job ${job.id}, type: ${job.data.taskType}`);

  if (job.data.taskType === 'user_sync') {
    return processUserSync(job as Job<UserSyncJobData>);
  } else if (job.data.taskType === 'batch_user_sync') {
    return processBatchUserSync(job as Job<BatchUserSyncJobData>);
  } else {
    throw new Error(`Unknown user sync task type: ${job.data.taskType}`);
  }
}

/**
 * 注册用户同步处理器
 */
export function registerUserSyncProcessor(): void {
  queueManager.registerProcessor(
    QueueName.DATA_MIGRATION,
    userSyncProcessor,
    {
      onCompleted: (job, result) => {
        console.log(`[UserSyncProcessor] Job ${job.id} completed successfully:`, result);
      },
      onFailed: (job, err) => {
        console.error(`[UserSyncProcessor] Job ${job.id} failed:`, err);
      },
      onProgress: (job, progress) => {
        console.log(`[UserSyncProcessor] Job ${job.id} progress:`, progress);
      },
    }
  );
}

/**
 * 创建用户同步任务
 * @param deptId 部门ID（第三方系统）
 * @param deptName 部门名称
 * @param accessToken 第三方系统的访问令牌（可选，不传则使用环境变量自动登录）
 * @param unitId 本地单位ID
 * @param priority 任务优先级
 */
export async function createUserSyncJob(
  deptId: string,
  deptName?: string,
  accessToken?: string,
  unitId?: string,
  priority: JobPriority = JobPriority.NORMAL
): Promise<string> {
  // 先添加到 BullMQ 队列获取 jobId
  const job = await queueManager.addJob(
    QueueName.DATA_MIGRATION,
    `user-sync-${deptId}`,
    {
      taskType: 'user_sync',
      deptId,
      deptName,
      unitId: unitId || DEFAULT_UNIT_ID,
      batchSize: 10,
      options: {
        accessToken,
        useEnvCredentials: !accessToken, // 如果没有传入 token，则使用环境变量自动登录
      },
    },
    {
      priority,
      timeout: 600000, // 10分钟超时
    }
  );

  // 在数据库中创建任务记录
  await (prisma as any).migration_task.create({
    data: {
      taskName: `用户同步 - ${deptName || deptId}`,
      taskType: 'USER_SYNC',
      status: 'PENDING',
      totalCount: 0,
      processedCount: 0,
      failCount: 0,
      createTime: new Date(),
      updateTime: new Date(),
    },
  });

  return job.id!;
}

/**
 * 创建批量用户同步任务
 * @param divisions 部门列表（包含 id 和 name）
 * @param accessToken 第三方系统的访问令牌（可选，不传则使用环境变量自动登录）
 * @param unitId 本地单位ID
 * @param priority 任务优先级
 */
export async function createBatchUserSyncJob(
  divisions: { id: string; name: string }[],
  accessToken?: string,
  unitId?: string,
  priority: JobPriority = JobPriority.NORMAL
): Promise<string> {
  // 先添加到 BullMQ 队列获取 jobId
  const job = await queueManager.addJob(
    QueueName.DATA_MIGRATION,
    `batch-user-sync-${Date.now()}`,
    {
      taskType: 'batch_user_sync',
      divisions,
      unitId: unitId || DEFAULT_UNIT_ID,
      batchSize: 10,
      options: {
        accessToken,
        useEnvCredentials: !accessToken,
      },
    },
    {
      priority,
      timeout: 3600000, // 1小时超时（批量任务需要更长时间）
    }
  );

  // 在数据库中创建任务记录
  await (prisma as any).migration_task.create({
    data: {
      taskName: `批量用户同步 - ${divisions.length}个部门`,
      taskType: 'USER_SYNC',
      status: 'PENDING',
      totalCount: BigInt(divisions.length),
      processedCount: 0,
      failCount: 0,
      createTime: new Date(),
      updateTime: new Date(),
    },
  });

  return job.id!;
}
