/**
 * 旧平台检验情况查询 API
 * 根据设备代码从旧平台查询检验历史数据
 * Admin-Token 使用当前登录用户的个人 token（从 uSERS.AUTH_RESPONSE 读取）
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { auth } from '@/app/auth';
import { OLD_PLATFORM_API } from '../../task-extraction/old-tasks/route';
import { prisma } from '@/lib/prisma';
import { DEFAULT_UNIT_ID } from '@/lib/migration/division-data';
import { toGlobalId } from '@/lib/global-id';

// 旧平台 API 配置
const OLD_PLATFORM_URL = `${OLD_PLATFORM_API.baseUrl}/busimge/dataQuery/ispQuery`;
interface OldPlatformIspRecord {
  createUserId?: string;
  createTime?: string;
  updateUserId?: string;
  updateTime?: string;
  chkUserId?: string;
  apprUserId?: string;
  jyMen?: string;
  ispDate?: string;
  reportCod?: string;
  actualEqpCode?: string;
  [key: string]: any;
}

interface UserMappingResult {
  oldPtUserId?: string;
  oldName?: string;
  localUserId?: string;
  localUsername?: string;
  localPersonName?: string;
  found: boolean;
  multipleMatches?: boolean;
  error?: string;
}

interface ProcessedIspRecord {
  originalData: OldPlatformIspRecord;
  chkUser?: UserMappingResult;
  apprUser?: UserMappingResult;
  jyMenUsers?: UserMappingResult[];
  exceptions: string[];
}

/**
 * 获取当前登录用户的个人 Admin-Token
 * 从 uSERS.AUTH_RESPONSE 字段读取
 */
async function getAdminToken(): Promise<string | null> {
    try {
        const session = await auth();
        if (session?.user?.name) {
            console.log(`[OldPlatformIspQuery] Looking up personal token for user: ${session.user.name}`);
            const userRecord = await prisma.uSERS.findUnique({
                where: { USERNAME: session.user.name },
                select: { AUTH_RESPONSE: true },
            });
            if (userRecord?.AUTH_RESPONSE) {
                let authData: any;
                if (typeof userRecord.AUTH_RESPONSE === 'string') {
                    authData = JSON.parse(userRecord.AUTH_RESPONSE);
                } else {
                    authData = userRecord.AUTH_RESPONSE;
                }
                if (authData?.access_token) {
                    console.log('[OldPlatformIspQuery] Using personal token from AUTH_RESPONSE');
                    return authData.access_token;
                }
            }
            console.log('[OldPlatformIspQuery] No personal token found for user');
        }
    } catch (error: any) {
        console.warn('[OldPlatformIspQuery] Failed to get personal token:', error.message);
    }
    return null;
}

/**
 * 根据旧平台账号查找本地用户
 */
async function findLocalUserByOldAuthName(oldPtUserId: string): Promise<UserMappingResult> {
  try {
    // 这里应该查询数据库，暂时返回模拟数据
    // 实际实现：SELECT u.* FROM seipf.USERS AS u WHERE authName = ? AND authType = '旧平台Cod' AND unit_id = ?
    
    // 模拟查询 - 实际项目中替换为真实数据库查询
    const mockUsers = await prismaQueryUserByAuthName(oldPtUserId);
    
    if (mockUsers.length === 0) {
      return {
        oldPtUserId,
        found: false,
        error: `未找到旧平台账号 "${oldPtUserId}" 对应的本地用户`,
      };
    }
    
    if (mockUsers.length > 1) {
      return {
        oldPtUserId,
        found: true,
        multipleMatches: true,
        localUserId: mockUsers[0].id,
        localUsername: mockUsers[0].username,
        localPersonName: mockUsers[0].Person?.name,
        error: `旧平台账号 "${oldPtUserId}" 匹配到多个本地用户`,
      };
    }
    
    return {
      oldPtUserId,
      found: true,
      localUserId: mockUsers[0].id,
      localUsername: mockUsers[0].username,
      localPersonName: mockUsers[0].Person?.name,
    };
  } catch (error: any) {
    return {
      oldPtUserId,
      found: false,
      error: `查询旧平台账号 "${oldPtUserId}" 时出错: ${error.message}`,
    };
  }
}

/**
 * 根据姓名查找本地用户
 */
async function findLocalUserByName(name: string): Promise<UserMappingResult> {
  try {
    // 实际实现：SELECT u.* FROM seipf.USERS AS u WHERE firstname = ? AND authType = '旧平台Cod' AND unit_id = ?
    
    const mockUsers = await prismaQueryUserByName(name);
    
    if (mockUsers.length === 0) {
      return {
        oldName: name,
        found: false,
        error: `未找到姓名 "${name}" 对应的本地用户`,
      };
    }
    
    if (mockUsers.length > 1) {
      return {
        oldName: name,
        found: true,
        multipleMatches: true,
        localUserId: mockUsers[0].id,
        localUsername: mockUsers[0].username,
        localPersonName: mockUsers[0].Person?.name,
        error: `姓名 "${name}" 匹配到多个本地用户`,
      };
    }
    
    return {
      oldName: name,
      found: true,
      localUserId: mockUsers[0].id,
      localUsername: mockUsers[0].username,
      localPersonName: mockUsers[0].Person?.name,
    };
  } catch (error: any) {
    return {
      oldName: name,
      found: false,
      error: `查询姓名 "${name}" 时出错: ${error.message}`,
    };
  }
}

/**
 * 根据旧平台账号查询本地用户
 * 对应 SQL: SELECT u.* FROM seipf.USERS AS u WHERE authName = ? AND authType = '旧平台Cod' AND unit_id = ?
 */
async function prismaQueryUserByAuthName(oldPtUserId: string): Promise<any[]> {
  const users = await (prisma as any).uSERS.findMany({
    where: {
      authName: oldPtUserId,
      authType: '旧平台Cod',
      unit_id: DEFAULT_UNIT_ID,
    },
    include: { Person: true },
  });
  return users;
}

/**
 * 根据姓名查询本地用户
 * 对应 SQL: SELECT u.* FROM seipf.USERS AS u WHERE firstname = ? AND authType = '旧平台Cod' AND unit_id = ?
 */
async function prismaQueryUserByName(name: string): Promise<any[]> {
  const users = await (prisma as any).uSERS.findMany({
    where: {
      firstname: name,
      authType: '旧平台Cod',
      unit_id: DEFAULT_UNIT_ID,
    },
    include: { Person: true },
  });
  return users;
}

/**
 * 处理检验人员（jyMen）字段
 * 格式："戴少武,曾溢恒"
 */
async function processJyMen(jyMenStr?: string): Promise<{ users: UserMappingResult[]; exceptions: string[] }> {
  const users: UserMappingResult[] = [];
  const exceptions: string[] = [];
  
  if (!jyMenStr || jyMenStr.trim() === '') {
    return { users, exceptions };
  }
  
  const names = jyMenStr.split(',').map(n => n.trim()).filter(n => n);
  
  for (const name of names) {
    const result = await findLocalUserByName(name);
    users.push(result);
    
    if (!result.found || result.multipleMatches) {
      exceptions.push(result.error || `检验人员 "${name}" 关联失败`);
    }
  }
  
  return { users, exceptions };
}

/**
 * 处理单条检验记录
 */
async function processIspRecord(record: OldPlatformIspRecord): Promise<ProcessedIspRecord> {
  const exceptions: string[] = [];
  
  // 处理检验人员（主检）
  let chkUser: UserMappingResult | undefined;
  if (record.chkUserId) {
    chkUser = await findLocalUserByOldAuthName(record.chkUserId);
    if (!chkUser.found || chkUser.multipleMatches) {
      exceptions.push(chkUser.error || `检验人员 "${record.chkUserId}" 关联失败`);
    }
  }
  
  // 处理审核人员
  let apprUser: UserMappingResult | undefined;
  if (record.apprUserId) {
    apprUser = await findLocalUserByOldAuthName(record.apprUserId);
    if (!apprUser.found || apprUser.multipleMatches) {
      exceptions.push(apprUser.error || `审核人员 "${record.apprUserId}" 关联失败`);
    }
  }
  
  // 处理检验人员列表
  const { users: jyMenUsers, exceptions: jyMenExceptions } = await processJyMen(record.jyMen);
  exceptions.push(...jyMenExceptions);
  
  return {
    originalData: record,
    chkUser,
    apprUser,
    jyMenUsers,
    exceptions,
  };
}

/**
 * POST /api/old-platform/isp-query
 * Body: { eqpCod: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eqpCod, taskDatabase: reqTaskDatabase } = body;
    
    if (!eqpCod) {
      return NextResponse.json(
        { success: false, error: '缺少设备代码 eqpCod' },
        { status: 400 }
      );
    }
    
    // 构建请求体:
    //旧平台的 taskDatabase :取值：0=制造业务， 1=关联Eqp表中常规的设备业务， 2=单独出报告业务(通常不去关联Eqp表设备的)；
    const taskDatabase = reqTaskDatabase || '1';
    const requestBody = {
      dictQueryModels: [],
      taskDatabase,
      menuId: "207",
      ifFj: null,
      ispType: null,
      buildName: null,
      eqpCod: eqpCod,
      factoryCod: null,
      useUntName: null,
      mantUntName: null,
      ispDeptTemp: [],
      ispDeptId: ["1", "2", "3", "4", "5", "8", "9", "10", "11", "12", "13", "14", "15", "16", "18", "20", "21", "22", "40", "41", "42", "52", "55", "62", "63", "64", "65", "67", "122", "165", "262", "264", "709", "1006", "3824", "3801"],
      ispDeptIdLev3: [],
      jyMen: [],
      currNode: null,
      busiType: null,
      opeType: [],
      repType: null,
      reportCod: null,
      ispConclu: [],
      jhMen: null,
      eqpType: null,
      eqpSort: null,
      eqpVart: null,
      subEqpVart: null,
      eqpAreaCod: null,
      reIsp: null,
      ifRepgoback: null,
      eqpUsecertCod: null,
      oidno: null,
      logUptag: null,
      ifFixrep: null,
      eqpName: null,
      chkUserIds: null,
      apprUserIds: null,
      buildUntName: null,
      ifOpe: null,
      ifBrakeTask: null,
      instUntId: null,
      instUntName: null,
      endDate: null,
      beginEndDate: null,
      endEndDate: null,
      beginCreateDate: "2024-01-01",
      endCreateDate: "2027-12-31",
      beginTaskDate: null,
      endTaskDate: null,
      ispDate: null,
      beginInpBegDate: null,
      endInpBegDate: null,
      OpeTypeName: null,
      ifNew: "1",
      ifContainJoinIsp: null,
      seipEqpType: null,
      createTime: ["2024-01-01", "2027-12-31"],
      pageSize: 50,
      pageNum: 1,
      safeLevels: [],
    };
    
    // 获取当前用户的个人 Token
    const token = await getAdminToken();
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '无法获取访问令牌，请检查配置或登录状态' },
        { status: 401 }
      );
    }
    
    // 调用旧平台 API： 但只能查本部门的数据！
    const timestamp = Date.now();
    const url = `${OLD_PLATFORM_URL}?pageNum=1&pageSize=50&curMenuId=10001831&curMenuName=${encodeURIComponent('检验情况查询')}&time=${timestamp}`;
    
    // 使用 https 模块发送请求（支持自签名证书）
    const data = await new Promise<any>((resolve, reject) => {
      const postData = JSON.stringify(requestBody);
      const parsedUrl = new URL(url);
      
      const options: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    if (data.code !== 200) {
      // Token 过期时给出明确提示
      if (data.code === 401 || data.msg?.includes('token') || data.msg?.includes('登录状态已过期')) {
        console.warn('[OldPlatformIspQuery] Token expired, user should re-login via /report/third-party-login');
        return NextResponse.json(
          { success: false, error: '旧平台的接口无法访问，请重新登录旧平台账户' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: data.msg || '旧平台查询失败' },
        { status: 502 }
      );
    }
    
    const rows: OldPlatformIspRecord[] = data.rows || [];
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '未找到该设备的检验历史记录',
      });
    }
    
    // 处理每条记录
    const processedRecords: ProcessedIspRecord[] = [];
    for (const record of rows) {
      const processed = await processIspRecord(record);
      processedRecords.push(processed);
    }
    
    // 将数字字符串 localUserId 转换为 GlobalID
    const serializedRecords = processedRecords.map(record => ({
      ...record,
      chkUser: record.chkUser ? {
        ...record.chkUser,
        localUserId: record.chkUser.localUserId ? toGlobalId("User", BigInt(record.chkUser.localUserId)) : undefined,
      } : undefined,
      apprUser: record.apprUser ? {
        ...record.apprUser,
        localUserId: record.apprUser.localUserId ? toGlobalId("User", BigInt(record.apprUser.localUserId)) : undefined,
      } : undefined,
      jyMenUsers: record.jyMenUsers?.map(user => ({
        ...user,
        localUserId: user.localUserId ? toGlobalId("User", BigInt(user.localUserId)) : undefined,
      })),
    }));
    
    return NextResponse.json({
      success: true,
      data: serializedRecords,
      total: rows.length,
    });
    
  } catch (error: any) {
    console.error('[OldPlatform] 查询失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
