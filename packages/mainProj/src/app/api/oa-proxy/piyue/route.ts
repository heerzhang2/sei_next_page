import { NextRequest, NextResponse } from 'next/server';
import { replaceBookmarksInPlace } from '../_templates/fill-docx';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * POST /api/oa-proxy/piyue
 *
 * 批阅正文流程：当 is_draft=1 时调用。
 * 1. 向 OA 的 newstartoffice_doc.jsp 发 GET 请求（operate=PiYueZhengWen）
 * 2. 从返回 HTML 解析 intializePage(url) 获得文件下载地址
 * 3. 下载文件返回 Base64
 * 4. 若 replaceBookmarks=true，从 OCX 页面提取书签值并填入文件
 *
 * 请求体（JSON）：
 *   jsessionId       - 登录 JSESSIONID
 *   fullCookie       - 完整 Cookie（可选）
 *   unid             - 文书 UNID
 *   file_type        - 文件类型（默认 doc_fw）
 *   replaceBookmarks - 是否重新替换书签（可选，默认 false）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsessionId, fullCookie, unid, file_type = 'doc_fw', replaceBookmarks = false } = body;

    if (!jsessionId || !unid) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数: jsessionId, unid' },
        { status: 400 }
      );
    }

    const cookie = fullCookie || `JSESSIONID=${jsessionId}`;
    const headers = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Connection': 'keep-alive',
    };

    // ===== 1) 获取 OCX 页面（必须加缓存破坏参数，防止 OA 返回缓存旧页） =====
    const ocxUrl = `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp` +
      `?revision=false&isReadOnly=0` +
      `&unid=${encodeURIComponent(unid)}` +
      `&operate=PiYueZhengWen` +
      `&file_type=${encodeURIComponent(file_type)}` +
      `&randomstr=${Date.now()}`;

    const ocxRes = await fetch(ocxUrl, {
      method: 'GET',
      headers: {
        ...headers,
        'Host': '27.151.117.66:8866',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!ocxRes.ok) {
      return NextResponse.json(
        { success: false, error: `OCX 页面返回 HTTP ${ocxRes.status}` },
        { status: 502 }
      );
    }

    const ocxHtml = await ocxRes.text();

    // ===== 2) 解析 intializePage(url) =====
    const pageMatch = ocxHtml.match(/intializePage\("([^"]+)"\)/);
    if (!pageMatch) {
      return NextResponse.json(
        { success: false, error: '无法从 OCX 页面中解析 intializePage 地址', html: ocxHtml.slice(0, 2000) },
        { status: 502 }
      );
    }

    let downloadPath = pageMatch[1];
    const downloadUrl = downloadPath.startsWith('http')
      ? downloadPath
      : `${OA_BASE}${downloadPath}`;

    // ===== 3) 下载文件 =====
    const fileRes = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': ocxUrl,
      },
    });

    if (!fileRes.ok) {
      return NextResponse.json(
        { success: false, error: `文件下载返回 HTTP ${fileRes.status}`, downloadUrl },
        { status: 502 }
      );
    }

    const fileBuffer = Buffer.from(await fileRes.arrayBuffer());
    let fileName = decodeURIComponent(
      (downloadUrl.match(/filename=([^&]+)/) || [])[1] || `${unid}.doc`
    );

    // ===== 文件有效性检查：OA 可能返回 HTML 错误页而非实际文件 =====
    const isHtmlError = fileBuffer.length < 500
      || (fileBuffer.length > 0 && fileBuffer[0] === 0x3c); // '<'
    const fileHexPrefix = fileBuffer.slice(0, Math.min(32, fileBuffer.length)).toString('hex');
    if (isHtmlError) {
      // 返回文件内容诊断信息给调用方
      console.warn(`piyue 下载文件异常: size=${fileBuffer.length}, hexPrefix=${fileHexPrefix}, contentType=${fileRes.headers.get('content-type')}`);
    }

    // 根据文件内容魔数修正扩展名（OA 存储时可能强制为 .doc）
    const isPkZip = fileBuffer.length > 2 && !isHtmlError && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b;
    if (isPkZip && !fileName.endsWith('.docx')) {
      fileName = fileName.replace(/\.doc$/i, '.docx') || fileName + '.docx';
    }
    // 在响应中附加诊断信息
    const fileDiagnostics = {
      downloadSize: fileBuffer.length,
      hexPrefix: fileHexPrefix,
      isHtmlError,
    };

    // ===== 4) 从 OCX HTML 中提取其他元数据 =====
    let title = '';
    let createTime = '';
    let lordSent = '';
    let copySent = '';
    let appUnid = '';
    let fileCreator = '';
    let odpsCreateTime = '';

    // 提取 documentFieldJSON 中的 title / lord_sent / copy_sent / create_time 等
    const fieldMatch = ocxHtml.match(/var\s+documentFieldJSON\s*=\s*({[^;]+});/);
    if (fieldMatch) {
      try {
        const fieldJson = JSON.parse(fieldMatch[1]);
        title = fieldJson['标题'] || fieldJson['title'] || '';
        createTime = fieldJson['create_time'] || '';
        lordSent = fieldJson['lord_sent'] || fieldJson['主办部门'] || '';
        copySent = fieldJson['copy_sent'] || fieldJson['抄送部门'] || '';
      } catch { /* 忽略 */ }
    }

    // 从 intializePage URL 提取 appid 和 fileurl（用于诊断对比）
    const pageUrlMatch = ocxHtml.match(/intializePage\("([^"]+)"\)/);
    if (pageUrlMatch) {
      const pageUrl = pageUrlMatch[1];
      const appidParam = pageUrl.match(/[?&]appid=([^&]+)/);
      if (appidParam) {
        appUnid = decodeURIComponent(appidParam[1]);
      }
      // 提取 intializePage URL 中的 fileurl 参数（诊断用）
      const fileurlParam = pageUrl.match(/[?&]fileurl=([^&]+)/);
      if (fileurlParam) {
        fileDiagnostics.intializePageFileurl = decodeURIComponent(fileurlParam[1]);
      }
    }

    // 从 odpsBaseInfoJson 提取创建人、创建时间等
    const odpsMatch = ocxHtml.match(/var\s+odpsBaseInfoJson\s*=\s*({[^;]+});/);
    if (odpsMatch) {
      try {
        const odpsInfo = JSON.parse(odpsMatch[1]);
        odpsCreateTime = odpsInfo.create_time || '';
        if (!appUnid) appUnid = odpsInfo.app_unid || odpsInfo.issue_unid || '';
        fileCreator = odpsInfo.creater_unid || '';
      } catch { /* 忽略 */ }
    }

    const finalCreateTime = createTime || odpsCreateTime;

    // ===== 5) 可选：重新替换书签 =====
    // 直接在 OA 下载的文件中操作真实 Word 书签（<w:bookmarkStart>），替换其文本值。
    // 这种方式保留用户的所有手动编辑内容和非书签文本。
    let bookmarkValues: Record<string, string> = {};
    let fillResult: any = null;
    let finalFileBuffer = fileBuffer;
    let finalFileName = fileName;
    let originalFileBase64 = '';

    if (replaceBookmarks && isPkZip) {
      originalFileBase64 = fileBuffer.toString('base64');

      // 从 documentFieldJSON 提取书签值
      const docField = ocxHtml.match(/var\s+documentFieldJSON\s*=\s*({[^;]+});/);
      if (docField) {
        try {
          const raw = JSON.parse(docField[1]);
          for (const [k, v] of Object.entries(raw)) {
            if (k !== '全部书签域' && v) bookmarkValues[String(k)] = String(v);
          }
        } catch { /* 忽略 */ }
      }

      if (Object.keys(bookmarkValues).length === 0) {
        fillResult = { ok: false, error: '未从 OCX 页面提取到书签值' };
      } else {
        // 直接在已编辑文件中操作真实 Word 书签
        const result = replaceBookmarksInPlace(fileBuffer, bookmarkValues);
        if (result.ok && result.buffer) {
          finalFileBuffer = Buffer.from(result.buffer);
          fillResult = { ok: true, missing: result.missing };
        } else {
          fillResult = { ok: false, error: result.error };
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fileBase64: finalFileBuffer.toString('base64'),
        fileSize: finalFileBuffer.length,
        fileName: finalFileName,
        downloadUrl,
        title,
        createTime: finalCreateTime,
        lordSent,
        copySent,
        appUnid,
        fileCreator,
        bookmarkValues,
        fillResult,
        fileDiagnostics,
        // 如果做了书签替换，提供 OA 原始文件的 base64 作为备份
        originalFileBase64,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}
