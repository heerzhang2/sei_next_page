import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const OA_BASE = 'http://27.151.117.66:8866';

/** 用 Windows Word（COM 自动化，通过 PowerShell）给 .doc 填充书签 */
function fillBookmarksWithWord(docPath: string, bookmarkValues: Record<string, string>): { ok: boolean; error?: string } {
  const tmpDir = path.dirname(docPath);
  const valuesPath = path.join(tmpDir, 'bookmark_values.json');
  fs.writeFileSync(valuesPath, JSON.stringify(bookmarkValues, null, 2), 'utf-8');

  const outPath = docPath.replace(/\.doc$/i, '_filled.doc');

  // 用 base64 编码路径和值避免转义问题
  const docPathB64 = Buffer.from(docPath, 'utf-8').toString('base64');
  const valuesPathB64 = Buffer.from(valuesPath, 'utf-8').toString('base64');
  const outPathB64 = Buffer.from(outPath, 'utf-8').toString('base64');

  const psScript = path.join(tmpDir, 'fill_bookmarks.ps1');
  const psCode = [
    'param()',
    '$ErrorActionPreference = "Stop"',
    // 用 base64 解码获取真实路径
    `$docPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${docPathB64}'))`,
    `$valPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${valuesPathB64}'))`,
    `$outPath = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${outPathB64}'))`,
    'try {',
    '  $vals = Get-Content $valPath -Encoding UTF8 | ConvertFrom-Json',
    '  $app = New-Object -ComObject Word.Application',
    '  $app.Visible = $false',
    '  $app.DisplayAlerts = 0',
    '  $doc = $app.Documents.Open($docPath)',
    '  for ($i = 1; $i -le $doc.Bookmarks.Count; $i++) {',
    '    $bm = $doc.Bookmarks.Item($i)',
    '    $key = $bm.Name',
    '    if ($vals.$key) { $bm.Range.Text = $vals.$key }',
    '  }',
    '  $doc.SaveAs([ref]$outPath, [ref]0)',
    '  $doc.Close()',
    '  $app.Quit()',
    '  if (Test-Path $outPath) { exit 0 } else { exit 2 }',
    '} catch {',
    '  Write-Host $_.Exception.Message',
    '  exit 1',
    '}',
  ].join('\n');
  fs.writeFileSync(psScript, psCode, 'utf-8');

  try {
    const stdout = execSync(
      `powershell -ExecutionPolicy Bypass -File "${psScript}"`,
      { timeout: 60000, stdio: 'pipe' }
    );
    const out = stdout.toString().trim();

    if (!fs.existsSync(outPath)) return { ok: false, error: `未生成输出文件: ${out}` };
    fs.copyFileSync(outPath, docPath);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.stdout ? e.stdout.toString().trim() : e.message };
  } finally {
    try { fs.unlinkSync(psScript); } catch {}
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
  }
}

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

    // ===== Step 3: 开始起草（下载模板 + 填充书签） =====
    if (step === 'start') {
      let templateFile: string | null = null;
      let templateSize = 0;
      let bookmarkValues: Record<string, string> = {};
      let tmpDir = '';
      let fillResult: any = null;

      if (fileUnid) {
        // 请求 OCX 页面，从 onload 中提取文件下载 URL 和 documentFieldJSON
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

          // 从 onload 中提取 file_download_byUrl.jsp URL
          const urlMatch = ocxHtml.match(/intializePage\("([^"]+)"\)/);
          let downloadUrl = '';
          if (urlMatch) {
            downloadUrl = urlMatch[1];
            if (downloadUrl.startsWith('/')) {
              downloadUrl = `${OA_BASE}${downloadUrl}`;
            }
          }

          if (downloadUrl) {
            const fileRes = await fetch(downloadUrl, {
              method: 'GET',
              headers: {
                ...baseHeaders,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Referer': ocxUrl,
              },
            });
            if (fileRes.ok) {
              const buf = Buffer.from(await fileRes.arrayBuffer());

              // 如果有书签值，用 LibreOffice 填充
              if (Object.keys(bookmarkValues).length > 0) {
                tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'oa-draft-'));
                const docPath = path.join(tmpDir, 'template.doc');
                fs.writeFileSync(docPath, buf);

                fillResult = fillBookmarksWithWord(docPath, bookmarkValues);
                if (fillResult.ok && fs.existsSync(docPath)) {
                  const filledBuf = fs.readFileSync(docPath);
                  templateFile = filledBuf.toString('base64');
                  templateSize = filledBuf.length;
                } else {
                  templateFile = buf.toString('base64');
                  templateSize = buf.length;
                  console.warn('LibreOffice 填充书签失败:', fillResult?.error);
                }
              } else {
                templateFile = buf.toString('base64');
                templateSize = buf.length;
              }
            }
          }
        }
      }

      // 清理临时目录
      if (tmpDir) {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      }

      return NextResponse.json({
        success: true,
        data: {
          templateBase64: templateFile,
          templateSize,
          bookmarkKeys: Object.keys(bookmarkValues),
          fillResult,
        },
      });
    }

    return NextResponse.json({ success: false, error: '未知的 step' }, { status: 400 });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || '未知错误' }, { status: 500 });
  }
}
