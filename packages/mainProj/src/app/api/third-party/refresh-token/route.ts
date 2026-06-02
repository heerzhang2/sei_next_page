/**
 * 第三方系统 Token 自动刷新 API
 * 主动检查当前用户的 token 有效期，必要时提前刷新
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

// 第三方 API 基础配置
const OLD_PLATFORM_API = 'https://36.212.134.165:10443/prod-api';

function httpsPostJson(url: string, body: Record<string, any>, headers: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const bodyStr = JSON.stringify(body);
    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr).toString(),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`Parse error: ${e}`)); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.name) {
      return NextResponse.json({ valid: false, error: '未登录' });
    }

    const userRecord = await prisma.uSERS.findUnique({
      where: { USERNAME: session.user.name },
      select: { AUTH_RESPONSE: true },
    });

    if (!userRecord?.AUTH_RESPONSE) {
      return NextResponse.json({ valid: false, error: '无第三方token', needLogin: true });
    }

    let authData: any;
    if (typeof userRecord.AUTH_RESPONSE === 'string') {
      authData = JSON.parse(userRecord.AUTH_RESPONSE);
    } else {
      authData = userRecord.AUTH_RESPONSE;
    }

    if (!authData?.access_token) {
      return NextResponse.json({ valid: false, error: 'token为空', needLogin: true });
    }

    const savedAt = new Date(authData.savedAt).getTime();
    const expiresIn = (authData.expires_in || 60) * 60 * 1000; // 转毫秒
    const now = Date.now();
    const elapsed = now - savedAt;
    const remaining = expiresIn - elapsed;

    // 如果剩余时间 > 10分钟，无需刷新
    if (remaining > 10 * 60 * 1000) {
      return NextResponse.json({
        valid: true,
        remaining: Math.round(remaining / 1000),
        refreshed: false,
      });
    }

    // 剩余时间不足，尝试刷新
    console.log(`[TokenRefresh] Token will expire in ${Math.round(remaining / 1000)}s, refreshing...`);
    const refreshResult = await httpsPostJson(
      `${OLD_PLATFORM_API}/auth/refresh`,
      {},
      { 'Authorization': `Bearer ${authData.access_token}` }
    );

    if (refreshResult.code !== 200) {
      console.error('[TokenRefresh] Refresh failed, JWT expired:', refreshResult.msg);
      return NextResponse.json({ valid: false, error: 'token已过期需重新登录', needLogin: true });
    }

    // 刷新成功，更新 savedAt
    const newSavedAt = new Date().toISOString();
    const updatedData = { ...authData, savedAt: newSavedAt };
    await prisma.uSERS.update({
      where: { USERNAME: session.user.name },
      data: { AUTH_RESPONSE: JSON.stringify(updatedData) as any },
    });

    console.log('[TokenRefresh] Token refreshed proactively, new expiry in 60min');
    return NextResponse.json({
      valid: true,
      remaining: expiresIn,
      refreshed: true,
    });
  } catch (error: any) {
    console.error('[TokenRefresh] Error:', error.message);
    return NextResponse.json({ valid: false, error: error.message });
  }
}
