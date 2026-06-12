import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * POST /api/oa-proxy/proxy
 * 通用代理：携带 JSESSIONID 向旧 OA 发请求
 * 用于后续的文件上传、元数据更新、PDF 上传等操作
 */
export async function POST(request: NextRequest) {
  try {
    const {
      path,       // 接口路径，如 '/foa/AppFile.action'
      method = 'POST',
      jsessionId,
      headers: extraHeaders = {},
      body,       // 如果是 JSON：传对象；如果是 multipart：传 Buffer
      contentType,
      isMultipart = false,
    } = await request.json();

    if (!path || !jsessionId) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数: path, jsessionId' },
        { status: 400 }
      );
    }

    const fetchHeaders: Record<string, string> = {
      'Cookie': `JSESSIONID=${jsessionId}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      ...extraHeaders,
    };

    if (contentType) {
      fetchHeaders['Content-Type'] = contentType;
    } else if (!isMultipart) {
      fetchHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      redirect: 'manual',
    };

    if (body) {
      if (isMultipart) {
        // multipart body：传 base64 编码的 Buffer
        const raw = Buffer.from(body, 'base64');
        fetchOptions.body = raw;
      } else if (typeof body === 'string') {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = new URLSearchParams(body).toString();
      }
    }

    const res = await fetch(`${OA_BASE}${path}`, fetchOptions);

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const responseText = await res.text();

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      headers: responseHeaders,
      data: responseText,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}
