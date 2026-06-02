/**
 * 单位同步服务
 * 从旧平台同步单位信息到本地 Unit/Company/Person 实体
 */

import https from 'node:https';
import { Prisma } from '@prisma/client';
import prisma from './prisma';

// ============================================================
// 常量
// ============================================================

const OLD_PLATFORM_API = {
    baseUrl: process.env.OLD_PLATFORM_API_URL || 'https://36.212.134.165:10443/prod-api',
};

// 旧平台单位数据接口
interface OldPlatformUnit {
    untName: string;
    untOrgCod: string;
    untLkmen?: string;
    untMobile?: string;
    untPhone?: string;
    untLat?: number;
    untLong?: number;
    untPropCod?: string;
    untState?: string;
    untTypes?: string[];
    webAddr?: string;
    untAddr?: string;
}

// ============================================================
// HTTP 辅助
// ============================================================

/** 使用 https 发送 GET 请求（支持自签名证书） */
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
// 单位同步
// ============================================================

/**
 * 从旧平台同步单位信息到本地Unit实体
 * @param useUntId 旧平台单位ID
 * @param accessToken 访问令牌
 * @returns 本地Unit实体ID
 */
export async function syncUnitFromOldPlatform(
  useUntId: string,
  accessToken: string,
  tx?: Prisma.TransactionClient,
): Promise<bigint> {
  // 使用传入的事务或默认客户端，确保 FK 可见性
  const db = tx || prisma;
  const timestamp = Date.now();
  const url = `${OLD_PLATFORM_API.baseUrl}/busimge/untmge/${useUntId}?time=${timestamp}`;

  console.log(`[UnitSync] Fetching unit data from old platform: ${useUntId}`);

  const result = await httpsGetJson(url, {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  });

  if (result.code !== 200 || !result.data) {
    throw new Error(`Failed to fetch unit data: ${result.msg || 'Unknown error'}`);
  }

  const unitData: OldPlatformUnit = result.data;
  console.log(`[UnitSync] Unit data fetched: ${unitData.untName} (${useUntId})`);

  const isCompanyName = unitData.untName?.includes('有限公司')
    || unitData.untName?.includes('有限责任公司');
  const isPerson = !isCompanyName && (
    unitData.untPropCod === 'Z01' ||
    (unitData.untName?.length || 0) <= 3 ||
    (unitData.untOrgCod?.length === 18 && unitData.untOrgCod.startsWith('35'))
  );

  let companyId: bigint | null = null;
  let personId: bigint | null = null;

  if (!isPerson) {
    const existingCompany = await db.company.findFirst({
      where: { name: unitData.untName },
      select: { id: true },
    });
    if (existingCompany) {
      companyId = existingCompany.id;
      await db.company.update({
        where: { id: companyId },
        data: { address: unitData.untAddr, linkMen: unitData.untLkmen, phone: unitData.untMobile || unitData.untPhone, tel: unitData.untPhone, lat: unitData.untLat, lon: unitData.untLong },
      });
      console.log(`[UnitSync] Updated existing Company ${companyId}`);
    } else {
      const newCompany = await db.company.create({
        data: { name: unitData.untName, no: unitData.untOrgCod, address: unitData.untAddr, linkMen: unitData.untLkmen, phone: unitData.untMobile || unitData.untPhone, tel: unitData.untPhone, lat: unitData.untLat, lon: unitData.untLong },
      });
      companyId = newCompany.id;
      console.log(`[UnitSync] Created new Company ${companyId}`);
    }
  } else {
    const existingPerson = await db.person.findFirst({
      where: { no: unitData.untOrgCod },
      select: { id: true },
    });
    if (existingPerson) {
      personId = existingPerson.id;
      await db.person.update({
        where: { id: personId },
        data: { name: unitData.untName, address: unitData.untAddr, phone: unitData.untMobile || unitData.untPhone, lat: unitData.untLat, lon: unitData.untLong },
      });
      console.log(`[UnitSync] Updated existing Person ${personId}`);
    } else {
      const newPerson = await db.person.create({
        data: { name: unitData.untName, no: unitData.untOrgCod, address: unitData.untAddr, phone: unitData.untMobile || unitData.untPhone, lat: unitData.untLat, lon: unitData.untLong },
      });
      personId = newPerson.id;
      console.log(`[UnitSync] Created new Person ${personId}`);
    }
  }

  let unitId: bigint;
  if (companyId) {
    const existingUnit = await db.unit.findFirst({ where: { company_id: companyId }, select: { id: true } });
    if (existingUnit) {
      unitId = existingUnit.id;
      await db.unit.update({
        where: { id: unitId },
        data: { indCod: unitData.untPropCod, cancel: unitData.untState === '2', useu: unitData.untTypes?.includes('11'), maitu: unitData.untTypes?.includes('91') },
      });
      console.log(`[UnitSync] Updated existing Unit ${unitId} for Company ${companyId}`);
    } else {
      const newUnit = await db.unit.create({
        data: { company_id: companyId, indCod: unitData.untPropCod, cancel: unitData.untState === '2', useu: unitData.untTypes?.includes('11'), maitu: unitData.untTypes?.includes('91') },
      });
      unitId = newUnit.id;
      console.log(`[UnitSync] Created new Unit ${unitId} for Company ${companyId}`);
    }
  } else if (personId) {
    const existingUnit = await db.unit.findFirst({ where: { person_id: personId }, select: { id: true } });
    if (existingUnit) {
      unitId = existingUnit.id;
      await db.unit.update({ where: { id: unitId }, data: { indCod: unitData.untPropCod, cancel: unitData.untState === '2', useu: true } });
      console.log(`[UnitSync] Updated existing Unit ${unitId} for Person ${personId}`);
    } else {
      const newUnit = await db.unit.create({ data: { person_id: personId, indCod: unitData.untPropCod, cancel: unitData.untState === '2', useu: true } });
      unitId = newUnit.id;
      console.log(`[UnitSync] Created new Unit ${unitId} for Person ${personId}`);
    }
  } else {
    throw new Error('Neither company nor person was created/updated');
  }

  console.log(`[UnitSync] Unit sync completed: ${unitId}`);
  return unitId;
}

/**
 * 根据单位名称查找或创建本地 Unit 实体（仅在本地数据库操作）
 *缘由：旧平台的监察单位，不是普通单位表的 )JC_UNT_ID; 两张特殊表：监察机构自己,检验机构 PMT永久单位表
 * 流程：
 * 1. 以 unitName 在 company 表查找
 * 2. 找到 → 返回关联的 unit.id
 * 3. 没找到 → 新建 company + 新建关联 unit → 返回新 unit.id
 *
 * @param unitName 单位名称
 * @returns 本地 Unit 实体 ID
 */
export async function findOrCreateUnitByName(
  unitName: string,
  tx?: Prisma.TransactionClient,
): Promise<bigint> {
    console.log(`[UnitSync] Looking up unit by company name: ${unitName}`);
    const db = tx || prisma;

    const existingCompany = await db.company.findFirst({
        where: { name: unitName },
        select: { id: true },
    });

    if (existingCompany) {
        const existingUnit = await db.unit.findFirst({
            where: { company_id: existingCompany.id },
            select: { id: true },
        });
        if (existingUnit) {
            console.log(`[UnitSync] Found existing Unit ${existingUnit.id} for company ${unitName}`);
            return existingUnit.id;
        }
        const newUnit = await db.unit.create({
            data: { company_id: existingCompany.id, useu: true } as any,
        });
        console.log(`[UnitSync] Created Unit ${newUnit.id} linked to existing Company ${existingCompany.id}`);
        return newUnit.id;
    }

    const newCompany = await db.company.create({
        data: { name: unitName } as any,
    });
    console.log(`[UnitSync] Created new Company ${newCompany.id} for ${unitName}`);

    const newUnit = await db.unit.create({
        data: { company_id: newCompany.id, useu: true } as any,
    });
    console.log(`[UnitSync] Created Unit ${newUnit.id} for new Company ${newCompany.id}`);
    return newUnit.id;
}

