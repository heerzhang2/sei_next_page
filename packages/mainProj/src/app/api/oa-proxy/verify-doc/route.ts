import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * GET /api/oa-proxy/verify-doc?unid=xxx&app_unid=xxx
 *
 * 从旧 OA 的 file_download_byUrl.jsp 下载指定文书的正文文件
 * 用于验证 OA 服务器上实际存的是什么版本的文件
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unid = searchParams.get('unid');
    const app_unid = searchParams.get('app_unid');

    if (!unid) {
      return NextResponse.json({ success: false, error: '缺少参数 unid' }, { status: 400 });
    }

    // 先用 odpsbaseinfo.action 查文书信息，获取 filename 和 create_time
    const infoRes = await fetch(
      `${OA_BASE}/foa/odoc/MicrosoftOffice/odpsbaseinfo.action?fn=queryById&unid=${unid}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: new URLSearchParams({ unid, fn: 'queryById' }).toString(),
        redirect: 'manual',
      }
    );
    const infoText = await infoRes.text();

    // 尝试解析 JSON，获取 file_name 和 create_time
    let fileName = `${unid}.doc`;
    let createTime = '';
    try {
      const info = JSON.parse(infoText);
      if (info.result && info.odpsBaseInfo) {
        fileName = info.odpsBaseInfo.file_name || fileName;
        createTime = info.odpsBaseInfo.create_time || '';
      }
    } catch {
      // JSON 解析失败，用默认值
    }

    // 构造 fileurl：根据 create_time 计算目录
    let datePath = '';
    if (createTime) {
      const dt = new Date(createTime.replace(' ', 'T'));
      datePath = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    }

    const fileurl = datePath
      ? `/core/upload/${datePath}/${unid}.doc`
      : `/core/upload/${unid}.doc`;

    const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : '.doc';

    // 从 OA 下载文件
    const downloadUrl = `${OA_BASE}/foa/core/file/file_download_byUrl.jsp` +
      `?filename=${encodeURIComponent(fileName)}` +
      `&fileType=${encodeURIComponent(fileExt)}` +
      `&fileurl=${encodeURIComponent(fileurl)}` +
      `&appid=${encodeURIComponent(app_unid || unid)}` +
      `&randomstr=${Date.now()}`;

    const fileRes = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      },
      redirect: 'manual',
    });

    const fileBuffer = await fileRes.arrayBuffer();
    const fileSize = fileBuffer.byteLength;

    // 返回文件信息和前 32 字节 hex 用于校验
    const fileBytes = new Uint8Array(fileBuffer);
    const hexPrefix = Array.from(fileBytes.slice(0, Math.min(32, fileSize)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return NextResponse.json({
      success: fileRes.ok,
      status: fileRes.status,
      contentType: fileRes.headers.get('content-type'),
      contentDisposition: fileRes.headers.get('content-disposition'),
      fileurl,
      downloadUrl: downloadUrl.substring(0, 200) + '...',
      fileSize,
      hexPrefix,
      fileName,
      createTime,
      odpsInfo: infoText.slice(0, 500),
    });

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}
