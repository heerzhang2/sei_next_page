import { NextRequest, NextResponse } from 'next/server';
import { resolveTemplatePath } from '../_templates/template-map';
import { fillDocxBookmarks } from '../_templates/fill-docx';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * POST /api/oa-proxy/draft
 * 处理"起草正文"流程
 *
 * 请求体:
 *   step: "check"  | "templates" | "start"
 *   unid, jsessionId, agency_unid, doctype_value, itemUnid, fileUnid?, docFileType?
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, unid, jsessionId, agency_unid, doctype_value, itemUnid, fileUnid, docFileType = 'doc_fw' } = body;

    if (!unid || !jsessionId) {
      return NextResponse.json({ success: false, error: '缺少必填参数' }, { status: 400 });
    }

    const cookie = `JSESSIONID=${jsessionId}; rmbUser=false; LOGIN_PATH=loginAction.action`;
    const baseHeaders = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    };

    // ===== Step 1: 检查是否需要选择模板 =====
    if (step === 'check') {
      const params = new URLSearchParams({
        unid, agency_unid: agency_unid || '', doctype_value: doctype_value || '2',
        fn: 'isOpenTemplate', itemUnid: itemUnid || '',
      });
      const res = await fetch(`${OA_BASE}/foa/odpsbaseinfo.action`, {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${OA_BASE}/foa/odpsbaseinfo_edit.action?unid=${unid}`,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
        body: params.toString(),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = {}; }

      return NextResponse.json({
        success: data.result === true,
        data: {
          isExists: data.isExists === true,
          isOpen: data.isOpen === true,
          fileUnid: data.fileUnid || '',
          needTemplate: data.isExists === true && data.isOpen === true,
        },
      });
    }

    // ===== Step 2: 获取模板列表 =====
    if (step === 'templates') {
      const templateUrl = `${OA_BASE}/foa/odoc/jsp/odpsbaseinfo/doctemplate.jsp` +
        `?unid=${encodeURIComponent(unid)}` +
        `&agencyUnid=${encodeURIComponent(agency_unid || '')}` +
        `&docFileType=${encodeURIComponent(docFileType)}`;

      const res = await fetch(templateUrl, {
        method: 'GET',
        headers: {
          ...baseHeaders,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Referer': `${OA_BASE}/foa/odpsbaseinfo_edit.action?unid=${unid}`,
        },
      });
      const html = await res.text();

      // 提取模板列表：radio 的 value 和对应的模板名称
      const templateRegex = /<input[^>]*name="radioClass"[^>]*value="([^"]*)"[^>]*\/>[\s\S]*?<td[^>]*class='in'[^>]*>([^<]+)<\/td>/g;
      const templates: { fileUnid: string; name: string }[] = [];
      let m: RegExpExecArray | null;
      while ((m = templateRegex.exec(html)) !== null) {
        templates.push({ fileUnid: m[1].trim(), name: m[2].trim() });
      }

      return NextResponse.json({
        success: templates.length > 0,
        data: { templates },
      });
    }

    // ===== Step 3: 开始起草（提取书签值 + 用预转换 .docx 无损填充） =====
    if (step === 'start') {
      let templateFile: string | null = null;
      let templateSize = 0;
      let outputFormat: 'docx' | 'doc' | null = null;
      let bookmarkValues: Record<string, string> = {};
      let fillResult: any = null;
      let templateMissing: string[] = [];

      if (fileUnid) {
        // 请求 OCX 页面，从中提取 documentFieldJSON（书签值）
        const ocxUrl = `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp` +
          `?revision=false&isReadOnly=0` +
          `&unid=${encodeURIComponent(unid)}` +
          `&operate=QiCaoZhengWen` +
          `&file_type=${encodeURIComponent(docFileType)}` +
          `&fileUnid=${encodeURIComponent(fileUnid)}` +
          `&is_draft=0`;

        const ocxRes = await fetch(ocxUrl, {
          method: 'GET',
          headers: {
            ...baseHeaders,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': `${OA_BASE}/foa/odpsbaseinfo_edit.action?unid=${unid}`,
          },
        });

        if (ocxRes.ok) {
          const ocxHtml = await ocxRes.text();

          // 提取 documentFieldJSON（书签值）
          const jsonMatch = ocxHtml.match(/var\s+documentFieldJSON\s*=\s*({[^;]+});/);
          if (jsonMatch) {
            try {
              const raw = JSON.parse(jsonMatch[1]);
              // 去掉"全部书签域"（它不是书签名）
              for (const [k, v] of Object.entries(raw)) {
                if (k !== '全部书签域' && v) bookmarkValues[k] = String(v);
              }
            } catch {}
          }
        }

        // 用预转换 .docx 模板做无损填充（不经过任何排版引擎，格式不变）
        const templatePath = resolveTemplatePath(fileUnid);
        if (!templatePath) {
          return NextResponse.json({
            success: false,
            error: `fileUnid=${fileUnid} 还没有登记预转换 .docx 模板。` +
              `请把该模板用 Word 离线转成 .docx（书签转占位符），放入 _templates/docx/，` +
              `并在 _templates/template-map.ts 中登记映射。`,
            data: { bookmarkKeys: Object.keys(bookmarkValues) },
          }, { status: 404 });
        }

        const result = fillDocxBookmarks(templatePath, bookmarkValues);
        if (result.ok && result.buffer) {
          templateFile = result.buffer.toString('base64');
          templateSize = result.buffer.length;
          outputFormat = 'docx';
          templateMissing = result.missing || [];
          fillResult = { ok: true, missing: result.missing };
        } else {
          fillResult = { ok: false, error: result.error };
          return NextResponse.json({
            success: false,
            error: `书签填充失败: ${result.error}`,
            data: { bookmarkKeys: Object.keys(bookmarkValues) },
          }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          templateBase64: templateFile,
          templateSize,
          outputFormat,
          bookmarkKeys: Object.keys(bookmarkValues),
          templateMissing,
          fillResult,
        },
      });
    }

    return NextResponse.json({ success: false, error: '未知的 step' }, { status: 400 });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || '未知错误' }, { status: 500 });
  }
}
