/**
 * 第三方系统登录 API
 * 使用 SM2 加密密码后调用第三方登录接口
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { encrypt } from '@/lib/sm2-crypto';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

// 第三方系统配置
const THIRD_PARTY_CONFIG = {
  baseUrl: process.env.THIRD_PARTY_API_URL || 'https://36.212.134.165:10443/prod-api',
  //对方验证的加密公钥
  publicKey: process.env.THIRD_PARTY_SM2_PUBLIC_KEY || '04a4369be75ad6e433515fddd9e38f8288b5a29b22c12a37f767c08474dff6e4ea4f5e48ab235ed81466e760e5cecfb62140ef7006b82d05a4124b0b1103f57a54',
  timeout: 30000,
};

// 使用 https 模块发送请求（支持自签名证书）
function httpsPostJson(
  url: string,
  data: any,
  headers: Record<string, string> = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const parsedUrl = new URL(url);
    
    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
      rejectUnauthorized: false, // 允许自签名证书
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve({ raw: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * POST /api/third-party/login
 * 第三方系统登录
 * 
 * 请求体:
 * {
 *   username: string;  // 用户名
 *   password: string;  // 明文密码
 *   uuid?: string;     // 可选，设备标识
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, uuid } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    console.log(`[ThirdPartyLogin] Attempting login for user: ${username}`);

    // 生成 UUID（用于二次加密和请求）
    const requestUuid = uuid || generateUUID();
    // 第一次 SM2 加密：原始密码
    const firstEncrypted = encrypt(password, THIRD_PARTY_CONFIG.publicKey, {
      mode: 0,              // C1C3C2 模式
      inputEncoding: 'utf8',
      outputEncoding: 'hex',
      // pc: true,             // 包含 04 前缀
    });

    console.log(`[ThirdPartyLogin] First encryption done, length: ${firstEncrypted.length}`);
    // 第二次 SM2 加密：时间戳 + UUID + 第一次加密结果
    const finalEncryptedPassword = pwdSecondaryEncrypt(firstEncrypted, requestUuid, THIRD_PARTY_CONFIG.publicKey);

    console.log(`[ThirdPartyLogin] Secondary encryption done, length: ${finalEncryptedPassword.length},uuid长度：${requestUuid.length}`);

    // 构建登录请求
    const loginData = {
      username,
      password: finalEncryptedPassword,
      uuid: requestUuid,
      containerId: "",
      digCertSign: "",
      loginType: "1",
      userType: "10",
    };

    // 调用第三方登录接口
    // 注意：这里的接口路径需要根据实际第三方系统文档调整
    const loginUrl = `${THIRD_PARTY_CONFIG.baseUrl}/auth/login`;
    
    console.log(`[ThirdPartyLogin] Calling: ${loginUrl}`);
    const result = await httpsPostJson(loginUrl, loginData);

    console.log(`[ThirdPartyLogin] Response:`, result);

    // 处理登录结果
    if (result.code === 200 && result.data && result.data.access_token) {
      // 登录成功
      
      // 获取当前登录用户的 session
      const session = await auth();
      if (session?.user?.name) {
        const currentUsername = session.user.name;
        console.log(`[ThirdPartyLogin] Current system user: ${currentUsername}, Third-party user: ${username}`);
        
        // 查找当前用户的数据库记录
        const userRecord = await prisma.uSERS.findUnique({
          where: { USERNAME: currentUsername },
          select: { id: true, oldAccount: true, ENABLED: true }
        });
        
        if (userRecord) {
          console.log(`[ThirdPartyLogin] User record found: oldAccount=${userRecord.oldAccount}, ENABLED=${userRecord.ENABLED}`);
          
          // 如果第三方用户名匹配 oldAccount 且账户未启用，则自动启用
          if (userRecord.oldAccount === username && !userRecord.ENABLED) {
            console.log(`[ThirdPartyLogin] Enabling user account for: ${currentUsername}`);
            await prisma.uSERS.update({
              where: { id: userRecord.id },
              data: { ENABLED: true }
            });
            console.log(`[ThirdPartyLogin] User account enabled successfully`);
            return NextResponse.json({
              success: true,
              data: {
                token: result.data.access_token,
                userInfo: result.data,
              },
            });
          }
        } else {
          console.warn(`[ThirdPartyLogin] User record not found for: ${currentUsername}`);
        }
      } else {
        console.warn(`[ThirdPartyLogin] No session found, cannot enable user account`);
      }
      
      return NextResponse.json({
        success: false,
        error: '登录成功，但账户无法匹配关联本系统用户',
        data: {
          token: result.data.access_token,
          userInfo: result.data,
        },
      });
    } else {
      // 登录失败
      return NextResponse.json({
        success: false,
        error: result.msg || result.message || '登录失败',
        code: result.code,
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error('[ThirdPartyLogin] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '登录请求失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/third-party/login
 * 获取公钥（用于前端加密）
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      publicKey: THIRD_PARTY_CONFIG.publicKey,
      // 返回部分公钥信息（隐藏完整密钥）
      publicKeyHint: THIRD_PARTY_CONFIG.publicKey.slice(0, 10) + '...',
    },
  });
}

// 生成 UUID (32位小写，不带横线)
// 格式: f236711372ed49c6bbf9ab8bac89c8d6
function generateUUID(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 格式化日期时间
 * 格式: {y}{m}{d}{h}{i}{s} -> 20260423072318
 */
function parseTime(date: Date, format: string): string {
  const i = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };

  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (match, key) => {
    const value = i[key as keyof typeof i];
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    // 补齐前导零
    return match.length > 0 && value < 10 ? '0' + value : String(value);
  });
}

/**
 * 密码二次加密
 * 拼接: 时间戳 + UUID + 第一次加密结果，然后再次加密
 */
function pwdSecondaryEncrypt(firstEncryptedPwd: string, uuid: string, publicKey: string): string {
  // 获取当前时间戳: 20260423072318
  const timestamp = parseTime(new Date(), '{y}{m}{d}{h}{i}{s}');

  // 拼接字符串: 时间戳 + UUID + 第一次加密结果
  const combinedString = timestamp + uuid + firstEncryptedPwd;

  console.log(`[ThirdPartyLogin] Secondary encrypt - timestamp: ${timestamp}, uuid: ${uuid}`);
  console.log(`[ThirdPartyLogin] Combined string length: ${combinedString.length}`);

  // 第二次加密（使用相同的 SM2 加密函数）
  const secondEncrypted = encrypt(combinedString, publicKey, {
    mode: 0,              // C1C3C2 模式
    inputEncoding: 'utf8',
    outputEncoding: 'hex',
    // pc: true,             // 包含 04 前缀
  });

  return secondEncrypted;
}
