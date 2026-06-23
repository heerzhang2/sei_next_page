import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * GET /api/oa-proxy/todo-list?page=1&perPage=15
 *
 * 获取旧 OA 的"待办文件"列表
 * 代理 view_getView.action，提取 viewPadding 中的 JSON 数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '5';

    // 通过查询参数传递 jsessionId（浏览器禁止前端设置 Cookie 头）
    const jsessionId = searchParams.get('jsessionId') || '';
    const fullCookie = searchParams.get('fullCookie') || '';
    const finalCookie = fullCookie || (jsessionId ? `JSESSIONID=${jsessionId}` : '');

    if (!finalCookie) {
      return NextResponse.json(
        { success: false, error: '请先登录以获取 JSESSIONID' },
        { status: 401 }
      );
    }

    // 构造 view_getView.action 请求
    const viewUrl = `${OA_BASE}/foa/view_getView.action` +
      `?fn=grid` +
      `&viewId=20170112103329XX0B311C75913E4273` +
      `&viewAlias=homedoc` +
      `&moduleUnid=6474BA409ED9165F020F01539889D28A` +
      `&leafUnid=C269DBB9393563945750165C1D7034A8` +
      `&PER_PAGE=${perPage}` +
      `&RNM=${Date.now()}` +
      `&now_page=${page}`;

    const res = await fetch(viewUrl, {
      method: 'GET',
      headers: {
        'Cookie': finalCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `OA 返回 ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // 从 HTML 中提取 var viewPadding = [...] 的 JSON 数据
    const match = html.match(/var\s+viewPadding\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) {
      return NextResponse.json(
        { success: false, error: '无法从 OA 响应中解析 viewPadding 数据，所属单位选择错误，无法登录', htmlPreview: html.slice(0, 500) },
        { status: 502 }
      );
    }

    let viewData: any;
    try {
      viewData = JSON.parse(match[1]);
    } catch {
      return NextResponse.json(
        { success: false, error: 'viewPadding JSON 解析失败' },
        { status: 502 }
      );
    }

    // 提取表格 HTML 中的分页信息
    const totalMatch = html.match(/共(\d+)条记录/);
    const pageMatch = html.match(/name="allPage"\s+value="(\d+)"/);
    const currentPageMatch = html.match(/name="now_page"\s+value="(\d+)"/);

    return NextResponse.json({
      success: true,
      data: {
        total: viewData[0]?.total || 0,
        allPage: pageMatch ? parseInt(pageMatch[1]) : 1,
        nowPage: currentPageMatch ? parseInt(currentPageMatch[1]) : parseInt(page),
        items: viewData[0]?.rows || [],
      },
    });

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}
