import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * POST /api/oa-proxy/scan-templates
 * 从 OA 获取所有模板配置列表（不需要 td_cookie，服务端请求已处理好 cookie）
 *
 * 请求体: { jsessionId }
 * 返回: { agencies: [...], templates: { agencyUnid: [{ fileUnid, name }] } }
 */
export async function POST(request: NextRequest) {
  try {
    const { jsessionId } = await request.json();
    if (!jsessionId) {
      return NextResponse.json({ success: false, error: '缺少 jsessionId' }, { status: 400 });
    }

    const cookie = `rmbUser=false; JSESSIONID=${jsessionId}; LOGIN_PATH=loginAction.action`;
    const baseHeaders = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    };

    // === Step 1: 获取所有 agency ===
    const treeUrl = `${OA_BASE}/foa/odoc/jsp/docwordconfig/tree.action?fn=tree&class=com.linewell.core.tree.impl.DocWordConfigTree`;
    const treeHeaders = {
      ...baseHeaders,
      'Accept': 'text/plain, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': `${OA_BASE}/foa/odoc/jsp/docwordconfig/docwordconfig_tree.jsp?fn=update&revId=agency_unid&revName=agency_code&muti=0`,
    };

    // Warmup + fetch tree
    await fetch(treeUrl, { method: 'POST', headers: treeHeaders, body: 'id=0' });
    await new Promise(r => setTimeout(r, 1000));
    const treeRes = await fetch(treeUrl, { method: 'POST', headers: treeHeaders, body: 'id=0' });
    const treeText = await treeRes.text();
    // 处理非标准 JSON（键没引号）
    const fixedJson = treeText.replace(/(\w+)(\s*:\s*)/g, '"$1"$2');
    let agencies: { id: string; name: string }[] = [];
    try { agencies = JSON.parse(fixedJson); } catch { agencies = []; }

    // === Step 2: 对每个 agency 获取模板列表 ===
    const templates: Record<string, { fileUnid: string; name: string }[]> = {};
    const allTemplates: Record<string, { fileUnid: string; name: string; agency: string }> = {};

    for (const ag of agencies) {
      const tmplUrl = `${OA_BASE}/foa/odoc/jsp/odpsbaseinfo/doctemplate.jsp?unid=20260611084142XX699307D7E60F416D&agencyUnid=${ag.id}&docFileType=doc_fw`;
      const tmplHeaders = {
        ...baseHeaders,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': tmplUrl,
      };

      // Warmup + fetch
      await fetch(tmplUrl, { method: 'GET', headers: tmplHeaders });
      await new Promise(r => setTimeout(r, 800));
      const tmplRes = await fetch(tmplUrl, { method: 'GET', headers: tmplHeaders });
      const html = await tmplRes.text();

      // 提取模板
      const regex = /<input[^>]*name="radioClass"[^>]*value="([^"]*)"[^>]*\/>[\s\S]*?<td[^>]*class='in'[^>]*>([^<]+)</g;
      const perAgency: { fileUnid: string; name: string }[] = [];
      let m: RegExpExecArray | null;
      while ((m = regex.exec(html)) !== null) {
        const fuid = m[1].trim();
        const tname = m[2].trim();
        perAgency.push({ fileUnid: fuid, name: tname });
        if (!allTemplates[fuid]) {
          allTemplates[fuid] = { fileUnid: fuid, name: tname, agency: ag.name };
        }
      }
      templates[ag.id] = perAgency;
    }

    return NextResponse.json({
      success: true,
      data: {
        agencies: agencies.map(a => ({ id: a.id, name: a.name })),
        templates,
        allTemplates: Object.values(allTemplates),
        total: Object.keys(allTemplates).length,
      },
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || '未知错误' }, { status: 500 });
  }
}
