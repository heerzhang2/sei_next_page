/**
 * 独立运行：同步管道装置下的管道单元
 *
 * 用法：
 *   npx ts-node src/test-sync-piping-units.ts <设备代码> [pipeId]
 *
 * 示例：
 *   npx ts-node src/test-sync-piping-units.ts 3501D100029
 *   npx ts-node src/test-sync-piping-units.ts 3501D100029 12345
 *
 * 前置条件：
 *  - 已配置 .env.local 或 .env 中的第三方 API 登录信息
 *  - 数据库连接正常
 *  - pipeId 可选，不传则尝试从数据库查找该 eqpCod 对应的 Eqp ID
 */

import https from 'node:https';
import path from 'node:path';

// ============================================================
// 环境变量加载（必须在其他导入前执行！）
// ============================================================
const dotenv = require('dotenv');
const fs = require('fs');

const envLocal = path.join(__dirname, '../.env.local');
if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal, override: true });
} else {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

// 所有业务模块使用动态导入（静态 import 会导致 prisma 提前加载）
let _syncPipingUnits: typeof import('./lib/piping-unit-sync').syncPipingUnits;
let _prisma: typeof import('./lib/prisma').default;

async function getSyncPipingUnits() {
    if (!_syncPipingUnits) {
        _syncPipingUnits = (await import('./lib/piping-unit-sync')).syncPipingUnits;
    }
    return _syncPipingUnits;
}

async function getPrisma() {
    if (!_prisma) {
        _prisma = (await import('./lib/prisma')).default;
    }
    return _prisma;
}

// ============================================================
// 常量
// ============================================================
const OLD_PLATFORM_API = {
    baseUrl: process.env.OLD_PLATFORM_API_URL || 'https://36.212.134.165:10443/prod-api',
};

interface ThirdPartyAuthConfig {
    baseUrl: string;
    username: string;
    password: string;
    userType: string;
    loginType: string;
    userUuid: string;
}

function getAuthConfig(): ThirdPartyAuthConfig {
    return {
        baseUrl: process.env.THIRD_PARTY_API_URL || 'https://36.212.134.165:10443/prod-api',
        username: process.env.THIRD_PARTY_USERNAME || '',
        password: process.env.THIRD_PARTY_PASSWORD || '',
        userType: process.env.THIRD_PARTY_USER_TYPE || '10',
        loginType: process.env.THIRD_PARTY_LOGIN_TYPE || '1',
        userUuid: process.env.THIRD_PARTY_USER_UUID || '',
    };
}

// ============================================================
// HTTP 辅助函数
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

/** 使用 https 发送 POST 请求（支持自签名证书） */
function httpsPostJson(url: string, headers: Record<string, string>, body: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: `${parsedUrl.pathname}${parsedUrl.search}`,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Length': Buffer.byteLength(body),
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
        req.write(body);
        req.end();
    });
}

// ============================================================
// 第三方平台认证
// ============================================================

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

async function loginToThirdParty(): Promise<{ access_token: string; expires_in: number }> {
    const authConfig = getAuthConfig();

    if (!authConfig.username || !authConfig.password || !authConfig.userUuid) {
        throw new Error(
            '第三方认证配置缺失。请设置环境变量：\n' +
            '  THIRD_PARTY_USERNAME\n' +
            '  THIRD_PARTY_PASSWORD\n' +
            '  THIRD_PARTY_USER_UUID'
        );
    }

    const loginData = {
        containerId: '',
        digCertSign: '',
        loginType: authConfig.loginType,
        password: authConfig.password,
        userType: authConfig.userType,
        username: authConfig.username,
        uuid: authConfig.userUuid,
    };

    const postData = JSON.stringify(loginData);
    const timestamp = Date.now();
    const url = new URL(`${authConfig.baseUrl}/auth/login?time=${timestamp}`);

    console.log(`[Test] Logging in to ${authConfig.baseUrl}/auth/login ...`);

    const result = await httpsPostJson(
        url.toString(),
        { 'Content-Type': 'application/json' },
        postData
    );

    if (result.code !== 200 || !result.data) {
        throw new Error(`登录失败: ${result.msg || '未知错误'}`);
    }

    console.log(`[Test] Login successful, token expires_in=${result.data.expires_in} minutes`);
    return result.data;
}

async function getAccessToken(): Promise<string> {
    if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
        console.log('[Test] Using cached access token');
        return tokenCache.accessToken;
    }

    console.log('[Test] Fetching new access token...');
    const loginResult = await loginToThirdParty();

    tokenCache = {
        accessToken: loginResult.access_token,
        expiresAt: Date.now() + loginResult.expires_in * 1000 * 60,
    };

    return loginResult.access_token;
}

// ============================================================
// 主流程
// ============================================================

async function main() {
    const eqpCod = process.argv[2];

    if (!eqpCod || eqpCod.trim() === '') {
        console.error('用法: yarn test-sync-piping <设备代码>');
        console.error('  or: npx ts-node src/test-sync-piping-units.ts <设备代码>');
        console.error('示例: yarn test-sync-piping 3501D100029');
        process.exit(1);
    }

    const trimmedEqpCod = eqpCod.trim();
    console.log('='.repeat(60));
    console.log('  管道单元同步测试');
    console.log('='.repeat(60));
    console.log(`  设备代码: ${trimmedEqpCod}`);
    console.log('='.repeat(60));

    try {
        // 1. 获取 accessToken
        console.log('\n[Step 1/3] 获取第三方平台访问令牌...');
        const accessToken = await getAccessToken();
        console.log('[Step 1/3] 令牌获取成功');

        // 2. 从数据库查找 pipeId
        console.log('\n[Step 2/3] 从数据库查找管道装置 Eqp ID...');
        const db = await getPrisma();
        const eqp = await db.eqp.findFirst({
            where: { cod: trimmedEqpCod },
            select: { id: true },
        });
        if (!eqp) {
            throw new Error(`数据库中未找到设备代码为 ${trimmedEqpCod} 的 Eqp 记录`);
        }
        const pipeId = eqp.id;
        console.log(`  查得 pipeId: ${pipeId}`);

        // 3. 同步管道单元
        console.log(`\n[Step 3/3] 同步管道单元（pipeId=${pipeId}）...`);
        const syncPipingUnits = await getSyncPipingUnits();
        const result = await db.$transaction(async (tx) => {
            return await syncPipingUnits(tx, trimmedEqpCod, pipeId, accessToken);
        }, { maxWait: 120000, timeout: 300000 });

        // 输出结果
        console.log('\n' + '='.repeat(60));
        console.log(`  ✅ 设备代码 : ${trimmedEqpCod}`);
        console.log(`  pipeId     : ${pipeId}`);
        console.log(`  总记录数   : ${result.total}`);
        console.log(`  已处理     : ${result.processed}`);
        console.log(`  失败       : ${result.errors}`);
        console.log(`  成功       : ${result.success ? '是' : '否'}`);
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('\n❌ 测试失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        try {
            const db = await getPrisma();
            await db.$disconnect();
            console.log('\n[Test] 数据库连接已关闭');
        } catch {
            // ignore disconnect errors
        }
    }
}

main();
