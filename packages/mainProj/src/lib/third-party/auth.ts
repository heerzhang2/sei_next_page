/**
 * 第三方系统认证工具
 * 支持从环境变量读取配置，自动获取 access_token
 */

import https from 'https';

// 第三方登录配置接口
export interface ThirdPartyAuthConfig {
  baseUrl: string;
  username: string;
  password: string;
  userType: string;
  loginType: string;
  userUuid: string;
}

// 登录响应接口
export interface LoginResponse {
  code: number;
  msg: string | null;
  data: {
    access_token: string;
    brief_token: string;
    expires_in: number;
    pwd_expired: boolean;
    login_type: string;
  } | null;
}

// Token 缓存
let tokenCache: {
  accessToken: string;
  briefToken: string;
  expiresAt: number;
} | null = null;

/**
 * 从环境变量获取认证配置
 */
export function getAuthConfig(): ThirdPartyAuthConfig {
  const config = {
    baseUrl: process.env.THIRD_PARTY_API_URL || 'https://36.212.134.165:10443/prod-api',
    username: process.env.THIRD_PARTY_USERNAME || '',
    password: process.env.THIRD_PARTY_PASSWORD || '',
    userType: process.env.THIRD_PARTY_USER_TYPE || '10',
    loginType: process.env.THIRD_PARTY_LOGIN_TYPE || '1',
    userUuid: process.env.THIRD_PARTY_USER_UUID || '',
  };

  // 调试日志（仅在开发环境显示）
  if (process.env.NODE_ENV === 'development') {
    console.log('[ThirdPartyAuth] Config check:', {
      baseUrl: config.baseUrl,
      username: config.username ? '***' : '(empty)',
      password: config.password ? '***' : '(empty)',
      userType: config.userType,
      loginType: config.loginType,
      userUuid: config.userUuid ? '***' : '(empty)',
      envUsername: process.env.THIRD_PARTY_USERNAME ? 'set' : 'not set',
      envPassword: process.env.THIRD_PARTY_PASSWORD ? 'set' : 'not set',
      envUserUuid: process.env.THIRD_PARTY_USER_UUID ? 'set' : 'not set',
    });
  }

  if (!config.username || !config.password || !config.userUuid) {
    throw new Error(
      'Third-party auth configuration missing. ' +
      'Please set THIRD_PARTY_USERNAME, THIRD_PARTY_PASSWORD, and THIRD_PARTY_USER_UUID in .env file'
    );
  }

  return config;
}

/**
 * 生成 UUID
 */
function generateUUID(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 使用 https 模块发送登录请求（支持自签名证书）
 */
function loginRequest(
  authConfig: ThirdPartyAuthConfig,
  loginData: any
): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(loginData);
    const timestamp = Date.now();
    const url = new URL(`${authConfig.baseUrl}/auth/login?time=${timestamp}`);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Origin': authConfig.baseUrl,
        'Referer': `${authConfig.baseUrl}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // 允许自签名证书
      rejectUnauthorized: false,
    };

    // 如果有缓存的 token，添加到 Cookie
    if (tokenCache) {
      options.headers!['Cookie'] = `Admin-Token=${tokenCache.accessToken}; Brief-Token=${tokenCache.briefToken}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result: LoginResponse = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 登录第三方系统获取 access_token
 */
export async function loginThirdParty(
  config?: ThirdPartyAuthConfig
): Promise<LoginResponse['data']> {
  const authConfig = config || getAuthConfig();

  const loginData = {
    //不要加这  code: '0',
    containerId: '',
    digCertSign: '',
    loginType: authConfig.loginType,
    password: authConfig.password,
    userType: authConfig.userType,
    username: authConfig.username,
    uuid: authConfig.userUuid,
  };

  try {
    const result = await loginRequest(authConfig, loginData);

    if (result.code !== 200 || !result.data) {
      console.error('[ThirdPartyAuth] Login failed:', {
        code: result.code,
        msg: result.msg,
        username: authConfig.username,
      });
      throw new Error(`Login failed: ${result.msg || 'Unknown error'}`);
    }

    // 缓存 token
    tokenCache = {
      accessToken: result.data.access_token,
      briefToken: result.data.brief_token,
      expiresAt: Date.now() + result.data.expires_in * 1000 * 60,   //一般返回expires_in= 60 分钟
    };

    console.log('[ThirdPartyAuth] Login successful, token cached');
    return result.data;
  } catch (error: any) {
    console.error('[ThirdPartyAuth] Login failed:', error);
    throw error;
  }
}

/**
 * 获取有效的 access_token
 * 如果缓存的 token 已过期，自动重新登录
 */
export async function getAccessToken(): Promise<string> {
  // 检查缓存的 token 是否有效
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    // Token 还有效（预留 60 秒缓冲）
    return tokenCache.accessToken;
  }

  // Token 已过期或不存在，重新登录
  const loginResult = await loginThirdParty();
  return loginResult.access_token;
}

/**
 * 获取有效的 brief_token
 */
export async function getBriefToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.briefToken;
  }

  const loginResult = await loginThirdParty();
  return loginResult.brief_token;
}

/**
 * 清除 token 缓存
 */
export function clearTokenCache(): void {
  tokenCache = null;
  console.log('[ThirdPartyAuth] Token cache cleared');
}

/**
 * 检查 token 是否有效
 */
export function isTokenValid(): boolean {
  return tokenCache !== null && tokenCache.expiresAt > Date.now();
}
