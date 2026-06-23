import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * POST /api/oa-proxy/login
 * 代理旧 OA 两步登录，返回 JSESSIONID
 */
export async function POST(request: NextRequest) {
  try {
    let { userName, password, siteUnid } = await request.json();

    // 剥离前端用于区分 Chrome 密码存储的用户名后缀
    if (userName && userName.endsWith('@旧OA')) {
      userName = userName.slice(0, -'@旧OA'.length);
    }

    if (!userName || !password || !siteUnid) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数: userName, password, siteUnid' },
        { status: 400 }
      );
    }

    // 第一步：获取加密密码
    const encryptRes = await fetch(
      `${OA_BASE}/foa/rtx_getEncryptPassword.action`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
        },
        body: new URLSearchParams({ pwd: password }).toString(),
      }
    );

    if (!encryptRes.ok) {
      return NextResponse.json(
        { success: false, error: '加密密码接口失败: ' + encryptRes.status },
        { status: 502 }
      );
    }

    const encryptData = await encryptRes.json();
    const encryptedPwd: string = encryptData.pwd;

    if (!encryptedPwd) {
      return NextResponse.json(
        { success: false, error: '加密密码接口返回异常: ' + JSON.stringify(encryptData) },
        { status: 502 }
      );
    }

    // 第二步：登录
    const loginBody = new URLSearchParams({
      userName,
      password: encryptedPwd,
      siteUnid,
    });

    const loginRes = await fetch(`${OA_BASE}/foa/login.action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      },
      body: loginBody.toString(),
      redirect: 'manual',
    });

    const loginData = await loginRes.json();

    if (!loginData.loginPass) {
      return NextResponse.json(
        { success: false, error: loginData.errorMsg || '登录失败' },
        { status: 401 }
      );
    }

    // 从 Set-Cookie 头中提取 JSESSIONID
    const setCookieHeader = loginRes.headers.get('set-cookie') || '';
    const jsessionIdMatch = setCookieHeader.match(/JSESSIONID=([^;]+)/);
    const jsessionId = jsessionIdMatch ? jsessionIdMatch[1] : '';

    if (!jsessionId) {
      return NextResponse.json(
        { success: false, error: '登录成功但未获取到 JSESSIONID' },
        { status: 500 }
      );
    }

    // 从 Set-Cookie 中提取所有 cookie 名值对，组装成完整 Cookie 字符串
    const allCookies: string[] = [];
    // 可能有多条 Set-Cookie
    const cookieLines = setCookieHeader.split(/\n|,\s*(?![^=]*;)/);
    for (const line of cookieLines) {
      const parts = line.split(';')[0]; // 取第一个分号之前（cookie名=值）
      if (parts && parts.includes('=')) {
        allCookies.push(parts.trim());
      }
    }
    const fullCookieString = allCookies.join('; ');

    // 返回 JSESSIONID + 完整 Cookie + 用户信息
    return NextResponse.json({
      success: true,
      data: {
        jsessionId,
        fullCookie: fullCookieString,
        loginData,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}
