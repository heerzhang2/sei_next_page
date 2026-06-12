import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * GET /api/oa-proxy/doc-info?unid=xxx&jsessionId=xxx
 *
 * 获取待办文件的编辑页面信息，提取 document_button 中第二个按钮的文字
 * 用于识别当前文件的操作类型（起草正文/批阅正文/办理情况等）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unid = searchParams.get('unid') || '';
    const jsessionId = searchParams.get('jsessionId') || '';

    if (!unid) {
      return NextResponse.json({ success: false, error: '缺少参数 unid' }, { status: 400 });
    }
    if (!jsessionId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const cookie = `JSESSIONID=${jsessionId}`;
    const headers = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    };

    // 先尝试发文编辑页
    let html = await tryFetch(`${OA_BASE}/foa/odpsbaseinfo_edit.action?unid=${unid}`, headers);
    let editType = 'odpsbaseinfo_edit';

    // 如果返回的是纯 HTML（含 document_button），说明发文编辑页可用
    if (!html || !html.includes('document_button')) {
      // 尝试收文编辑页
      html = await tryFetch(`${OA_BASE}/foa/docreceived_edit.action?unid=${unid}`, headers);
      editType = 'docreceived_edit';
    }

    if (!html) {
      return NextResponse.json({ success: false, error: '无法获取文书编辑页' }, { status: 502 });
    }

    // 从 document_button 中提取第二个 button 的文字
    const btnMatch = html.match(/<span\s+id="document_button">[\s\S]*?<button[^>]*>([^<]+)<\/button>[\s\S]*?<button[^>]*>([^<]+)<\/button>/);
    let actionName = '';
    let actionFunction = '';
    let allButtons: { name: string; onclick: string }[] = [];

    if (btnMatch) {
      // btnMatch[1] = 第一个按钮文字, btnMatch[2] = 第二个按钮文字
      actionName = (btnMatch[2] || '').trim();
    }

    // 提取所有按钮的 onclick 和文字，方便后续使用
    const allBtnRegex = /<button[^>]*onclick="([^"]*)"[^>]*>([^<]+)<\/button>/g;
    let m: RegExpExecArray | null;
    while ((m = allBtnRegex.exec(html)) !== null) {
      allButtons.push({ onclick: m[1].trim(), name: m[2].trim() });
    }

    // 查找 doDraft 或 toDoOpinion 等关键函数
    for (const btn of allButtons) {
      actionFunction = actionFunction || btn.onclick;
    }

    // 从 odpsbaseinfoJson 中提取 agency_unid 和 item_unid
    let agencyUnid = '';
    let itemUnid = '';
    let doctypeValue = '2';
    const jsonMatch = html.match(/var\s+(odpsbaseinfoJson|odpsBaseInfoJson)\s*=\s*({[^;]+});/);
    if (jsonMatch) {
      try {
        const info = JSON.parse(jsonMatch[2]);
        agencyUnid = info.agency_unid || '';
        itemUnid = info.item_unid || '';
        doctypeValue = info.doctype_value || '2';
      } catch { /* 忽略 */ }
    }

    return NextResponse.json({
      success: true,
      data: {
        unid,
        editType,
        actionName,
        actionFunction,
        allButtons,
        agencyUnid,
        itemUnid,
        doctypeValue,
      },
    });

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}

async function tryFetch(url: string, headers: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) return null;
    const text = await res.text();
    // 检查是否包含 document_button 或表单内容（非登录页）
    if (text.includes('document_button') || text.includes('odpsbaseinfoJson')) {
      return text;
    }
    return null;
  } catch {
    return null;
  }
}
