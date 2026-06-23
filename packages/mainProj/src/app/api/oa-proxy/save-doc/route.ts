import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * 自动检测 LibreOffice / soffice 可执行路径（懒加载，避免模块顶层触发 NFT 追踪）
 */
let _libreOfficeExe = '';
function getLibreOfficeExe(): string {
  if (_libreOfficeExe) return _libreOfficeExe;
  try {
    execSync('libreoffice --version', { stdio: 'pipe', timeout: 5000 });
    _libreOfficeExe = 'libreoffice';
    return _libreOfficeExe;
  } catch { /* 忽略 */ }

  try {
    execSync('soffice --version', { stdio: 'pipe', timeout: 5000 });
    _libreOfficeExe = 'soffice';
    return _libreOfficeExe;
  } catch { /* 忽略 */ }

  const candidates = [
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice 26\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice 24\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice 25\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice 5\\program\\soffice.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      _libreOfficeExe = p;
      return _libreOfficeExe;
    }
  }
  _libreOfficeExe = 'libreoffice';
  return _libreOfficeExe;
}

/**
 * POST /api/oa-proxy/save-doc
 * 代理旧 OA 保存文件流程的三个步骤
 *
 * 请求体（JSON）：
 *   jsessionId   - 登录后获取的 JSESSIONID
 *   unid         - 文书唯一 ID
 *   app_unid     - 应用 ID
 *   file_name    - 文件名（含扩展名）
 *   file_type    - 文件类型分类，如 "doc_fw"
 *   file_creator - 创建人 ID
 *   fileBuffer   - .doc/.docx 文件内容的 Base64
 *   title        - 文书标题（第二步用）
 *   lord_sent    - 主办部门（第二步用）
 *   copy_sent    - 抄送部门（第二步用）
 *   step         - "upload" | "meta" | "pdf" | "all"（默认 all）
 *   fn           - "updateNew"（批阅正文，默认）| "addNew"（起草正文）
 *   fileUnid     - 模板文件 UNID（仅 addNew 时需要）
 */
export async function POST(request: NextRequest) {
  let tmpDir = '';
  try {
    const body = await request.json();
    const {
      jsessionId,
      fullCookie,
      unid,
      app_unid,
      file_name,
      file_type = 'doc_fw',
      file_creator,
      fileBuffer,
      title = '',
      lord_sent = '',
      copy_sent = '',
      known_create_time = '',
      step = 'all',
      fn = 'updateNew',
      fileUnid = '',
    } = body;

    if (!jsessionId || !unid || !file_name || !fileBuffer) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数: jsessionId, unid, file_name, fileBuffer' },
        { status: 400 }
      );
    }

    const rawExt = file_name.includes('.')
      ? file_name.split('.').pop()!.toLowerCase()
      : 'doc';
    const fileExt = 'doc';
    const oaFileName = rawExt === 'docx'
      ? file_name.replace(/\.docx$/i, '.doc')
      : file_name;
    const commonHeaders = {
      'Cookie': fullCookie || `JSESSIONID=${jsessionId}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
    };

    const results: Record<string, any> = {};
    const fileRaw = Buffer.from(fileBuffer, 'base64');

    // ========== 第 0 步：OCX 页面初始化（仅 addNew/起草正文 时需要） ==========
    let ocxAppUnid = '';
    if ((step === 'all' || step === 'upload') && fn === 'addNew') {
      results.initOcx = await stepInitOcxDocPage(unid, file_type, fileUnid, commonHeaders);
      ocxAppUnid = results.initOcx?.ocxAppUnid || '';
    }
    const realAppUnid = ocxAppUnid || app_unid || unid;

    // ========== 第 0.5 步：自动获取原始 create_time（updateNew 用） ==========
    let effectiveCreateTime = known_create_time;
    if (fn === 'updateNew' && !effectiveCreateTime) {
      try {
        const metaRes = await fetch(
          `${OA_BASE}/foa/odoc/MicrosoftOffice/odpsbaseinfo.action`,
          {
            method: 'POST',
            headers: {
              ...commonHeaders,
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: new URLSearchParams({ unid, fn: 'queryById' }).toString(),
          }
        );
        const metaText = await metaRes.text();
        const metaJson = JSON.parse(metaText);
        if (metaJson.result && metaJson.odpsBaseInfo) {
          effectiveCreateTime = metaJson.odpsBaseInfo.create_time || '';
        }
      } catch { /* 忽略 */ }
    }

    // ========== 第一步：上传 .doc 文件到 AppFile.action ==========
    if (step === 'all' || step === 'upload') {
      results.upload = await stepUploadDoc(fileRaw, oaFileName, fileExt, file_type,
        unid, realAppUnid, file_creator, commonHeaders, effectiveCreateTime, fn);
      if (!results.upload.ok) {
        return NextResponse.json({
          success: false, step: 'upload',
          error: `文件上传失败：${results.upload.oaErrorMsg || `HTTP ${results.upload.status}`}`,
          results,
        }, { status: 502 });
      }
    }

    // ========== 第二步：更新元数据到 odpsbaseinfo.action ==========
    if (step === 'all' || step === 'meta') {
      results.meta = await stepUpdateMeta(unid, title, lord_sent, copy_sent, commonHeaders);
      if (!results.meta.ok) {
        return NextResponse.json({ success: false, step: 'meta', error: results.meta.error, results }, { status: 502 });
      }
    }

    // ========== 第三步：转 PDF + 上传到 NtkoDocToPdfServlet ==========
    if (step === 'all' || step === 'pdf') {
      tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'oa-pdf-'));
      results.pdf = await stepConvertAndUploadPdf(fileRaw, oaFileName, fileExt, file_type,
        unid, realAppUnid, file_creator, tmpDir, commonHeaders, effectiveCreateTime, fn);
      if (!results.pdf.ok) {
        return NextResponse.json({ success: false, step: 'pdf', error: results.pdf.error, results }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true, step, results });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || '未知错误' }, { status: 500 });
  } finally {
    if (tmpDir) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* 忽略 */ }
    }
  }
}

/** 生成 OA 兼容的 UNID：YYYYMMDDHHMMSSXX + 16 位随机十六进制 = 32 字符 */
function generateOaUnid(): string {
  const now = new Date();
  const ts = now.getFullYear()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
    + String(now.getSeconds()).padStart(2, '0')
    + 'XX';
  const randomHex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
  return ts + randomHex;
}

// ========================== 第 0 步：OCX 页面初始化（起草正文专用） ==========================

/**
 * 起草正文（addNew）前，先向 OA 的 newstartoffice_doc.jsp 发送初始化请求。
 * OCX 在保存文件前必须先访问此页面，否则 AppFile.action 会返回"文件不存在"。
 */
async function stepInitOcxDocPage(
  unid: string,
  file_type: string,
  fileUnid: string,
  headers: Record<string, string>,
) {
  const initUrl = `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp` +
    `?revision=false&isReadOnly=0` +
    `&unid=${encodeURIComponent(unid)}` +
    `&operate=QiCaoZhengWen` +
    `&file_type=${encodeURIComponent(file_type)}` +
    (fileUnid ? `&fileUnid=${encodeURIComponent(fileUnid)}` : '') +
    `&is_draft=0` +
    `&randomstr=${Date.now()}`;

  const res = await fetch(initUrl, {
    method: 'GET',
    headers: {
      'Host': '27.151.117.66:8866',
      ...headers,
      'User-Agent': headers['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  });

  const text = await res.text();

  let ocxAppUnid = '';
  let ocxFileCreator = '';
  let ocxCreateTime = '';
  let ocxIntializeUrl = '';

  const pageMatch = text.match(/intializePage\("([^"]+)"\)/);
  if (pageMatch) {
    ocxIntializeUrl = pageMatch[1];
    const appidMatch = ocxIntializeUrl.match(/[?&]appid=([^&]+)/);
    if (appidMatch) {
      ocxAppUnid = decodeURIComponent(appidMatch[1]);
    }
  }

  const jsonMatch = text.match(/var\s+(odpsBaseInfoJson|odpsbaseinfoJson)\s*=\s*({[^;]+});/);
  if (jsonMatch) {
    try {
      const info = JSON.parse(jsonMatch[2]);
      if (!ocxAppUnid) ocxAppUnid = info.app_unid || info.issue_unid || '';
      ocxFileCreator = info.creater_unid || '';
      ocxCreateTime = info.create_time || '';
    } catch { /* 忽略 */ }
  }

  // 模拟 OCX 页面自动发出的模板文件下载请求（触发 OA 后端初始化文件状态）
  let templateDownload: any = null;
  if (ocxIntializeUrl) {
    const downloadUrl = ocxIntializeUrl.startsWith('http')
      ? ocxIntializeUrl
      : `${OA_BASE}${ocxIntializeUrl}`;
    try {
      const dlRes = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Host': '27.151.117.66:8866',
          ...headers,
          'User-Agent': headers['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate',
          'Referer': initUrl,
          'Connection': 'keep-alive',
        },
      });
      const dlBody = await dlRes.arrayBuffer();
      templateDownload = { ok: dlRes.ok, status: dlRes.status, size: dlBody.byteLength, downloadUrl: ocxIntializeUrl };
    } catch (e: any) {
      templateDownload = { ok: false, error: e.message };
    }
  }

  return {
    ok: res.ok,
    status: res.status,
    hasIntializePage: text.includes('intializePage'),
    templateDownload,
    ocxAppUnid,
    ocxFileCreator,
    ocxCreateTime,
    responseLength: text.length,
    response: text.slice(0, 500),
  };
}

// ========================== 第一步：上传 .doc（模拟 NTKO OCX） ==========================

async function stepUploadDoc(
  fileRaw: Buffer, file_name: string, fileExt: string, file_type: string,
  unid: string, app_unid: string, file_creator: string,
  headers: Record<string, string>,
  knownCreateTime = '',
  fnValue = 'updateNew',
) {
  const boundary = '------------------NTKO' + Date.now();
  const fileCreateTime = (fnValue === 'addNew')
    ? new Date().toISOString().replace('T', ' ').slice(0, 19)
    : (knownCreateTime
        ? knownCreateTime.replace('T', ' ').slice(0, 19)
        : new Date().toISOString().replace('T', ' ').slice(0, 19));

  const fileUnidValue = (fnValue === 'addNew')
    ? generateOaUnid()
    : unid;

  const textFields: Record<string, string> = {
    fileType: `.${fileExt}`,
    fn: fnValue,
    unid,
    app_unid: app_unid || unid,
    file_unid: fileUnidValue,
    file_belongto: unid,
    file_name,
    file_ext: fileExt,
    file_type,
    file_creator: file_creator || '',
    file_createtime: fileCreateTime,
    is_draft: fnValue === 'addNew' ? '0' : '1',
    isReadOnly: '0',
  };

  const lines: (string | Buffer)[] = [];
  for (const [key, value] of Object.entries(textFields)) {
    lines.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`);
  }
  lines.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file_name}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
  lines.push(fileRaw);
  lines.push(`\r\n--${boundary}--\r\n`);

  const chunks: Buffer[] = [];
  for (const item of lines) {
    chunks.push(typeof item === 'string' ? Buffer.from(item, 'utf-8') : item);
  }
  const multipartBody = Buffer.concat(chunks);

  const res = await fetch(`${OA_BASE}/foa/AppFile.action`, {
    method: 'POST',
    headers: {
      'Host': '27.151.117.66:8866',
      'User-Agent': headers['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Cookie': headers['Cookie'] || '',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    },
    body: multipartBody,
    redirect: 'manual',
  });
  const text = await res.text();

  let oaResult = false;
  let oaSuccess = false;
  let oaUnid = '';
  let oaErrorMsg = '';
  let oaParsed: any = null;
  try {
    oaParsed = JSON.parse(text);
    oaSuccess = oaParsed.success === true && oaParsed.unid === unid;
    oaUnid = oaParsed.unid || '';
    oaResult = oaSuccess || !!oaParsed.result;
    if (!oaResult) {
      oaErrorMsg = oaParsed.error || oaParsed.msg || 'OA 返回非标准响应';
    }
  } catch {
    oaErrorMsg = 'OA 返回非 JSON 响应';
  }

  return {
    ok: res.ok && oaResult,
    status: res.status,
    statusText: res.statusText,
    redirected: res.redirected,
    oaResult,
    oaSuccess,
    oaUnid,
    oaErrorMsg,
    response: text.slice(0, 2000),
    contentType: res.headers.get('content-type'),
    oaParsed,
    _diagnostics: { fileCreateTime, fileUnidValue, app_unid, sentFileSize: fileRaw.length },
  };
}

// ========================== 第二步：更新元数据 ==========================

async function stepUpdateMeta(
  unid: string, title: string, lord_sent: string, copy_sent: string,
  headers: Record<string, string>,
) {
  const params = new URLSearchParams();
  params.set('unid', unid);
  params.set('fn', 'updateFromOffice');
  params.set('modId', '');
  params.set('moduleName', '待办发文');
  params.set('title', title);
  params.set('lord_sent', lord_sent);
  params.set('copy_sent', copy_sent);
  params.set('fen_sent', '');
  params.set('dispatch_number', '');
  params.set('qfr_name', '');
  params.set('yfr_date', '');

  const res = await fetch(
    `${OA_BASE}/foa/odoc/MicrosoftOffice/odpsbaseinfo.action`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp?unid=${unid}`,
      },
      body: params.toString(),
      redirect: 'manual',
    }
  );
  const text = await res.text();
  return { ok: res.ok, status: res.status, response: text.slice(0, 500) };
}

// ========================== 第三步：PDF 转换 + 上传 ==========================

/**
 * 通过 Gotenberg 将 .doc 转为 PDF
 * 环境变量 GOTENBERG_URL 指向 Gotenberg 服务地址（如 http://localhost:3000）
 * Gotenberg API: POST /forms/libreoffice/convert, 文件字段名 "files"
 */
async function convertToPdfViaGotenberg(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
  const gotenbergUrl = process.env.GOTENBERG_URL;
  if (!gotenbergUrl) {
    throw new Error('GOTENBERG_URL 环境变量未设置');
  }

  const url = `${gotenbergUrl.replace(/\/$/, '')}/forms/libreoffice/convert`;
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'application/msword' });
  formData.append('files', blob, fileName);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Gotenberg 返回 HTTP ${res.status}: ${errBody.slice(0, 200)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function stepConvertAndUploadPdf(
  fileRaw: Buffer, file_name: string, fileExt: string, file_type: string,
  unid: string, app_unid: string, file_creator: string,
  tmpDir: string, headers: Record<string, string>,
  knownCreateTime = '',
  fnValue = 'updateNew',
) {
  // ===== 1) .doc 转 PDF（优先 Gotenberg，后备 LibreOffice） =====
  let pdfRaw: Buffer;

  if (process.env.GOTENBERG_URL) {
    try {
      pdfRaw = await convertToPdfViaGotenberg(fileRaw, file_name);
      console.log(`[stepConvertAndUploadPdf] Gotenberg 转换成功: size=${pdfRaw.length} (unid=${unid})`);
    } catch (e: any) {
      return { ok: false, error: `PDF 转换失败（Gotenberg）: ${e.message}` };
    }
  } else {
    // 后备：本地 LibreOffice
    const docPath = path.join(tmpDir, file_name);
    fs.writeFileSync(docPath, fileRaw);

    const pdfFileName = file_name.replace(new RegExp(`\\.${fileExt}$`), '.pdf');
    const pdfPath = path.join(tmpDir, pdfFileName);

    try {
      execSync(
        `"${getLibreOfficeExe()}" --headless --convert-to pdf --outdir "${tmpDir}" "${docPath}"`,
        { timeout: 120000, stdio: 'pipe' }
      );
    } catch (e: any) {
      if (!fs.existsSync(pdfPath)) {
        return { ok: false, error: `PDF 转换失败（LibreOffice）: ${e.message || e}` };
      }
    }

    if (!fs.existsSync(pdfPath)) {
      return { ok: false, error: 'PDF 转换失败（LibreOffice）: 未生成 PDF 文件' };
    }

    pdfRaw = fs.readFileSync(pdfPath);
  }

  // ===== 2) 上传 PDF 到 OA NtkoDocToPdfServlet =====
  const boundary = '----NTKOProxyPdf' + Date.now();
  const fileCreateTime = (fnValue === 'addNew')
    ? new Date().toISOString().replace('T', ' ').slice(0, 19)
    : (knownCreateTime || new Date().toISOString().replace('T', ' ').slice(0, 19));
  const fileUnidValue = (fnValue === 'addNew')
    ? generateOaUnid()
    : unid;
  const textFields: Record<string, string> = {
    PdfFileName: unid,
    fn: fnValue,
    unid,
    app_unid: app_unid || unid,
    file_unid: fileUnidValue,
    file_belongto: unid,
    file_name,
    file_ext: fileExt,
    file_type,
    file_creator: file_creator || '',
    file_createtime: fileCreateTime,
    is_draft: fnValue === 'addNew' ? '0' : '1',
    isReadOnly: '0',
  };

  const parts: string[] = [];
  for (const [key, value] of Object.entries(textFields)) {
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}`);
  }
  parts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="uploadPdf"; filename="${unid}"\r\nContent-Type: application/octet-stream\r\n\r\n`
  );

  const endBoundary = `\r\n--${boundary}--\r\n`;
  const multipartBody = Buffer.concat([
    Buffer.from(parts.join(''), 'utf-8'),
    pdfRaw,
    Buffer.from(endBoundary, 'utf-8'),
  ]);

  const res = await fetch(
    `${OA_BASE}/foa/servlets/NtkoDocToPdfServlet?flowType=fw&docunid=${unid}`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: multipartBody,
      redirect: 'manual',
    }
  );
  const text = await res.text();
  return { ok: res.ok, status: res.status, response: text.slice(0, 500) };
}
