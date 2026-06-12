import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * 使用 LibreOffice UNO + Python 在 Linux/Docker 中填充 .doc 书签
 * 相比 PowerShell + Word COM，此方案在 Linux 中可用且格式保留更好
 */
function fillBookmarksWithLibreOffice(docPath: string, bookmarkValues: Record<string, string>): { ok: boolean; error?: string } {
  const tmpDir = path.dirname(docPath);
  const scriptPath = path.join(tmpDir, 'fill-bookmarks.py');
  
  // 获取 fill-bookmarks.py 脚本位置
  // 假设脚本与当前路由文件在同一目录
  const scriptSourcePath = path.join(path.dirname(require.main?.filename || __dirname), 'fill-bookmarks.py');
  
  // 如果找不到，尝试其他位置（相对于项目根目录）
  let actualScriptPath = scriptSourcePath;
  if (!fs.existsSync(actualScriptPath)) {
    const alternatives = [
      path.join(process.cwd(), 'src/app/api/oa-proxy/fill-bookmarks.py'),
      path.join(process.cwd(), 'packages/mainProj/src/app/api/oa-proxy/fill-bookmarks.py'),
      '/app/src/app/api/oa-proxy/fill-bookmarks.py',  // Docker 容器中的路径
    ];
    for (const alt of alternatives) {
      if (fs.existsSync(alt)) {
        actualScriptPath = alt;
        break;
      }
    }
  }

  if (!fs.existsSync(actualScriptPath)) {
    return { 
      ok: false, 
      error: `找不到 fill-bookmarks.py 脚本。搜索路径: ${actualScriptPath}` 
    };
  }

  try {
    // 准备 JSON 参数
    const jsonStr = JSON.stringify(bookmarkValues);
    
    // 调用 Python 脚本
    // python3 fill-bookmarks.py <doc_path> <bookmark_json>
    const command = `python3 "${actualScriptPath}" "${docPath}" '${jsonStr.replace(/'/g, "'\\''")}'`;
    
    const stdout = execSync(command, { 
      timeout: 120000,  // 120 秒超时（LibreOffice 启动较慢）
      stdio: 'pipe',
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    
    const output = stdout.toString().trim();
    
    // 解析 Python 脚本的 JSON 输出
    try {
      const result = JSON.parse(output);
      if (result.success) {
        return { ok: true };
      } else {
        return { ok: false, error: result.message || '书签填充失败' };
      }
    } catch {
      // 如果输出不是 JSON，直接返回
      return { ok: false, error: `Python 输出解析失败: ${output}` };
    }
  } catch (e: any) {
    const stderr = e.stderr ? e.stderr.toString().trim() : '';
    const stdout = e.stdout ? e.stdout.toString().trim() : '';
    const errMsg = stderr || stdout || e.message;
    
    // 常见错误处理
    if (errMsg.includes('无法连接到 LibreOffice')) {
      return { 
        ok: false, 
        error: 'LibreOffice UNO 套接字不可用。请确保 soffice 已启动:\n' +
               '  soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;"'
      };
    }
    
    return { ok: false, error: errMsg };
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

              // 如果有书签值，用 LibreOffice UNO 填充
              if (Object.keys(bookmarkValues).length > 0) {
                tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'oa-draft-'));
                const docPath = path.join(tmpDir, 'template.doc');
                fs.writeFileSync(docPath, buf);

                fillResult = fillBookmarksWithLibreOffice(docPath, bookmarkValues);
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
