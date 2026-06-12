import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

const OA_BASE = 'http://27.151.117.66:8866';
const CACHE_DIR = path.join(process.cwd(), '.oa-cache');

/**
 * 自动检测 LibreOffice / soffice 可执行路径。
 * - 优先用 PATH 上的 `libreoffice` 或 `soffice`
 * - Windows 下搜索常见安装目录
 */
function findLibreOfficeExecutable(): string {
  // 尝试直接运行 libreoffice（Linux / 已配 PATH 的 Windows）
  try {
    execSync('libreoffice --version', { stdio: 'pipe', timeout: 5000 });
    return 'libreoffice';
  } catch { /* 忽略 */ }

  // 尝试 soffice（某些发行版或安装方式）
  try {
    execSync('soffice --version', { stdio: 'pipe', timeout: 5000 });
    return 'soffice';
  } catch { /* 忽略 */ }

  // Windows 下枚举常见安装路径
  const candidates = [
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice 26\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice 24\\program\\soffice.exe',
    'C:\\Program Files\\LibreOffice 25\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice 5\\program\\soffice.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // 还是找不到，返回默认名称，让调用方报错
  return 'libreoffice';
}

const LIBREOFFICE_EXE = findLibreOfficeExecutable();

/** 确保本地缓存目录存在 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * 上传后验证：尝试从 OA 重新下载该文书并比较文件大小/前 32 字节
 * 用于确认 AppFile.action 确实更新了文件
 * @param knownCreateTime - 可选，已知的 create_time（如从 OA 页面取到）
 */
async function verifyOaFileAfterUpload(
  unid: string, app_unid: string, cachedFile: Buffer,
  headers: Record<string, string>,
  knownCreateTime = '',
) {
  try {
    // ===== 1) 获取 create_time =====
    let createTime = knownCreateTime;
    let fileName = `${unid}.doc`;

    // 如果没有传入已知 createTime，尝试抓 JSP 页面提取
    if (!createTime) {
      const jspUrl = `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp` +
        `?revision=false&isReadOnly=0&unid=${encodeURIComponent(unid)}&file_type=doc_fw`;
      const jspRes = await fetch(jspUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
          'Referer': `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp?unid=${unid}`,
        },
      });
      const jspHtml = await jspRes.text();
      // 从 HTML 中提取 odpsBaseInfoJson
      const jsonMatch = jspHtml.match(/var\s+odpsBaseInfoJson\s*=\s*({[^;]+});/);
      if (jsonMatch) {
        try {
          const info = JSON.parse(jsonMatch[1]);
          createTime = info.create_time || '';
          fileName = info.file_name || fileName;
        } catch { /* 忽略 */ }
      }
    }

    // ===== 2) 构造 fileurl =====
    let datePath = '';
    if (createTime) {
      const dt = new Date(createTime.replace(' ', 'T'));
      datePath = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    }
    const fileurl = datePath
      ? `/core/upload/${datePath}/${unid}.doc`
      : `/core/upload/${unid}.doc`;

    const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : '.doc';

    // ===== 3) 下载文件比较 =====
    const downloadUrl = `${OA_BASE}/foa/core/file/file_download_byUrl.jsp` +
      `?filename=${encodeURIComponent(fileName)}` +
      `&fileType=${encodeURIComponent(fileExt)}` +
      `&fileurl=${encodeURIComponent(fileurl)}` +
      `&appid=${encodeURIComponent(app_unid || unid)}` +
      `&randomstr=${Date.now()}`;

    const fileRes = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp?unid=${unid}`,
      },
    });

    const oaFileBuffer = await fileRes.arrayBuffer();
    const oaFileSize = oaFileBuffer.byteLength;
    const uploadedSize = cachedFile.length;

    const oaPrefix = Buffer.from(oaFileBuffer.slice(0, Math.min(32, oaFileSize))).toString('hex');
    const uploadedPrefix = cachedFile.slice(0, Math.min(32, uploadedSize)).toString('hex');

    return {
      verified: oaFileSize === uploadedSize && oaPrefix === uploadedPrefix,
      oaFileSize,
      uploadedSize,
      oaHexPrefix: oaPrefix,
      uploadedHexPrefix: uploadedPrefix,
      fileurl,
      createTime,
      contentType: fileRes.headers.get('content-type'),
      contentDisposition: fileRes.headers.get('content-disposition'),
    };
  } catch (e: any) {
    return { verified: false, error: e.message };
  }
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
    } = body;

    if (!jsessionId || !unid || !file_name || !fileBuffer) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数: jsessionId, unid, file_name, fileBuffer' },
        { status: 400 }
      );
    }

    const fileExt = file_name.includes('.')
      ? file_name.split('.').pop()!.toLowerCase()
      : 'doc';
    const commonHeaders = {
      'Cookie': fullCookie || `JSESSIONID=${jsessionId}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
    };

    const results: Record<string, any> = {};
    const fileRaw = Buffer.from(fileBuffer, 'base64');

    // 缓存上传的文件到本地，用于后续验证
    ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, unid);
    fs.writeFileSync(cachePath, fileRaw);
    results._cachePath = cachePath;

    // ========== 第一步：上传 .doc 文件到 AppFile.action ==========
    if (step === 'all' || step === 'upload') {
      results.upload = await stepUploadDoc(fileRaw, file_name, fileExt, file_type,
        unid, app_unid, file_creator, commonHeaders, known_create_time);
      if (!results.upload.ok) {
        return NextResponse.json({
          success: false,
          step: 'upload',
          error: results.upload.oaErrorMsg || `OA 返回 HTTP ${results.upload.status}，可能 JSESSIONID 已过期，请重新登录`,
          results,
        }, { status: 502 });
      }
      // 上传后验证：重新下载对比文件内容
      results.verify = await verifyOaFileAfterUpload(unid, app_unid || unid, fileRaw, commonHeaders, known_create_time);
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
      results.pdf = await stepConvertAndUploadPdf(fileRaw, file_name, fileExt, file_type,
        unid, app_unid, file_creator, tmpDir, commonHeaders, known_create_time);
      if (!results.pdf.ok) {
        return NextResponse.json({ success: false, step: 'pdf', error: results.pdf.error, results }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true, step, results });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || '未知错误' }, { status: 500 });
  } finally {
    // 清理临时目录
    if (tmpDir) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* 忽略 */ }
    }
  }
}

// ========================== 第一步：上传 .doc（模拟 NTKO OCX） ==========================

async function stepUploadDoc(
  fileRaw: Buffer, file_name: string, fileExt: string, file_type: string,
  unid: string, app_unid: string, file_creator: string,
  headers: Record<string, string>,
  knownCreateTime = '',
) {
  // 精确复制 NTKO OCX 的 boundary 格式
  const boundary = '------------------NTKO' + Date.now();
  // 使用和 OCX 相同的 file_createtime（从隐藏域来的值，非 create_time）
  const fileCreateTime = knownCreateTime
    ? knownCreateTime.replace('T', ' ').slice(0, 19)
    : new Date().toISOString().replace('T', ' ').slice(0, 19);

  // OCX 发送的文本字段按顺序排列
  const textFields: Record<string, string> = {
    fileType: `.${fileExt}`,
    fn: 'updateNew',
    unid,
    app_unid: app_unid || unid,
    file_unid: unid,
    file_belongto: unid,
    file_name,
    file_ext: fileExt,
    file_type,
    file_creator: file_creator || '',
    file_createtime: fileCreateTime,
    is_draft: '1',
    isReadOnly: '0',
  };

  // 构建 multipart body：纯 ASCII 文本用 utf-8 编码，文件用原始二进制
  const lines: (string | Buffer)[] = [];
  for (const [key, value] of Object.entries(textFields)) {
    lines.push(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`);
  }
  lines.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file_name}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
  lines.push(fileRaw);
  lines.push(`\r\n--${boundary}--\r\n`);

  // 合并所有部分
  const chunks: Buffer[] = [];
  for (const item of lines) {
    chunks.push(typeof item === 'string' ? Buffer.from(item, 'utf-8') : item);
  }
  const multipartBody = Buffer.concat(chunks);

  // 使用 OCX 同样的请求头（不带多余的 Accept/Language/Encoding）
  const res = await fetch(`${OA_BASE}/foa/AppFile.action`, {
    method: 'POST',
    headers: {
      'Host': '27.151.117.66:8866',
      'User-Agent': headers['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      'Cookie': headers['Cookie'] || '',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
    },
    body: multipartBody,
  });
  const text = await res.text();

  // 解析 OA 响应：OCX 正常返回 {"success":true,"unid":"...","result":{"success":true,"unid":"..."}}
  let oaResult = false;
  let oaSuccess = false;
  let oaUnid = '';
  let oaErrorMsg = '';
  try {
    const parsed = JSON.parse(text);
    // OCX 标准的成功响应有 success:true 且 unid 匹配
    oaSuccess = parsed.success === true && parsed.unid === unid;
    oaUnid = parsed.unid || '';
    // result 为 truthy 也确认成功
    oaResult = oaSuccess || !!parsed.result;
    if (!oaResult) {
      oaErrorMsg = parsed.error || parsed.msg || 'OA 返回非标准响应（可能未保存文件）';
    }
  } catch {
    oaErrorMsg = 'OA 返回非 JSON 响应';
  }

  return {
    ok: res.ok && oaResult,
    status: res.status,
    oaResult,
    oaSuccess,
    oaUnid,
    oaErrorMsg,
    response: text.slice(0, 2000),
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

async function stepConvertAndUploadPdf(
  fileRaw: Buffer, file_name: string, fileExt: string, file_type: string,
  unid: string, app_unid: string, file_creator: string,
  tmpDir: string, headers: Record<string, string>,
  knownCreateTime = '',
) {
  // 1) 写临时文件
  const docPath = path.join(tmpDir, file_name);
  fs.writeFileSync(docPath, fileRaw);

  // 2) LibreOffice 转 PDF
  const pdfFileName = file_name.replace(new RegExp(`\\.${fileExt}$`), '.pdf');
  const pdfPath = path.join(tmpDir, pdfFileName);

  try {
    execSync(
      `"${LIBREOFFICE_EXE}" --headless --convert-to pdf --outdir "${tmpDir}" "${docPath}"`,
      { timeout: 120000, stdio: 'pipe' }
    );
  } catch (e: any) {
    // 检查是否生成了 PDF（libreoffice 有时生成了但还是 exit code 1）
    if (!fs.existsSync(pdfPath)) {
      return { ok: false, error: `PDF 转换失败: ${e.message || e}` };
    }
  }

  if (!fs.existsSync(pdfPath)) {
    return { ok: false, error: 'PDF 转换失败: 未生成 PDF 文件' };
  }

  const pdfRaw = fs.readFileSync(pdfPath);

  // 3) 上传 PDF 到 NtkoDocToPdfServlet
  const boundary = '----NTKOProxyPdf' + Date.now();
  const fileCreateTime = knownCreateTime
    ? knownCreateTime
    : new Date().toISOString().replace('T', ' ').slice(0, 19);
  const textFields: Record<string, string> = {
    PdfFileName: unid,
    fn: 'updateNew',
    unid,
    app_unid: app_unid || unid,
    file_unid: unid,
    file_belongto: unid,
    file_name,
    file_ext: fileExt,
    file_type,
    file_creator: file_creator || '',
    file_createtime: fileCreateTime,
    is_draft: '1',
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
