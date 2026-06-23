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

    // 从 odpsbaseinfoJson 中提取关键字段
    let agencyUnid = '';
    let itemUnid = '';
    let doctypeValue = '2';
    let isDraft = ''; // "1"=已初始化, "0"=未初始化
    let fileUnids = '';
    let appUnid = '';
    let fileCreator = '';
    let createTime = '';
    let lordSent = '';
    let copySent = '';
    let title = '';
    const jsonMatch = html.match(/var\s+(odpsbaseinfoJson|odpsBaseInfoJson)\s*=\s*({[^;]+});/);
    if (jsonMatch) {
      try {
        const info = JSON.parse(jsonMatch[2]);
        agencyUnid = info.agency_unid || '';
        itemUnid = info.item_unid || '';
        doctypeValue = info.doctype_value || '2';
        isDraft = String(info.is_draft ?? '');
        fileUnids = info.file_unids || '';
        // 后续 save-upload / piyue 需要的信息
        // 注意：odpsbaseinfoJson 中可能没有 app_unid 字段，需在 HTML 中另寻
        appUnid = info.app_unid || info.issue_unid || '';
        fileCreator = info.creater_unid || '';
        createTime = info.create_time || '';
        lordSent = info.lord_sent || '';
        copySent = info.copy_sent || '';
        title = info.title || '';
      } catch { /* 忽略 */ }
    }

    // 如果 JSON 中没有 app_unid，尝试从 HTML 中搜索隐藏字段或 URL 中的 appid
    if (!appUnid) {
      // 搜索 <input type="hidden" name="app_unid" value="..." />
      const hiddenMatch = html.match(/<input[^>]*name=["']app_unid["'][^>]*value=["']([^"']+)["']/i);
      if (hiddenMatch) {
        appUnid = hiddenMatch[1];
      }
    }
    if (!appUnid) {
      // 搜索 URL 中的 appid= 参数（例如 intializePage URL 或脚本请求 URL）
      const appidMatch = html.match(/[?&]appid=([^&"'\s]+)/);
      if (appidMatch) {
        appUnid = decodeURIComponent(appidMatch[1]);
      }
    }

    // ===== 根据 editType 和 is_draft 判定操作类型 =====
    // is_draft="1" → 文件已初始化并存储 → 操作类型为"批阅正文"
    // is_draft="0" → 文件未初始化 → 操作类型为"起草正文"
    // docreceived_edit → 待办收文，直接跳转到 OA 平台查看
    let actionName: string;
    let actionType: 'piyue' | 'qicao' | 'view_oa';
    if (editType === 'docreceived_edit') {
      actionName = '查看正文（附件请到旧OA平台查看）';
      actionType = 'view_oa';
    } else if (isDraft === '1') {
      actionName = '批阅正文';
      actionType = 'piyue';
    } else {
      actionName = '起草正文';
      actionType = 'qicao';
    }

    // 提取所有按钮的 onclick 和文字，方便后续使用
    const allBtnRegex = /<button[^>]*onclick="([^"]*)"[^>]*>([^<]+)<\/button>/g;
    const allButtons: { name: string; onclick: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = allBtnRegex.exec(html)) !== null) {
      allButtons.push({ onclick: m[1].trim(), name: m[2].trim() });
    }

    // 查找 doDraft 或 toDoOpinion 等关键函数
    let actionFunction = '';
    for (const btn of allButtons) {
      actionFunction = actionFunction || btn.onclick;
    }

    // 收文查看的外部跳转链接
    const viewOaUrl = editType === 'docreceived_edit'
      ? `http://27.151.117.66:8866/foa/odoc/jsp/docreceived/docreceived_document.jsp?unid=${unid}`
      : '';

    return NextResponse.json({
      success: true,
      data: {
        unid,
        editType,
        actionName,
        actionType,
        actionFunction,
        allButtons,
        agencyUnid,
        itemUnid,
        doctypeValue,
        isDraft,
        fileUnids,
        appUnid,
        fileCreator,
        createTime,
        lordSent,
        copySent,
        title,
        viewOaUrl,
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
