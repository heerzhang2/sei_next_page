import { NextRequest, NextResponse } from 'next/server';

const OA_BASE = 'http://27.151.117.66:8866';

/**
 * GET /api/oa-proxy/view-doc?unid=xxx&app_unid=xxx
 *
 * 从 OA 服务器下载指定文书的正文文件。
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unid = searchParams.get('unid');
    const app_unid = searchParams.get('app_unid') || unid || '';

    if (!unid) {
      return NextResponse.json({ success: false, error: '缺少参数 unid' }, { status: 400 });
    }

    // 查 odpsbaseinfo 获取文件信息
    const infoRes = await fetch(
      `${OA_BASE}/foa/odoc/MicrosoftOffice/odpsbaseinfo.action`,
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

    let fileName = `${unid}.doc`;
    let createTime = '';
    try {
      const info = JSON.parse(infoText);
      if (info.result && info.odpsBaseInfo) {
        fileName = info.odpsBaseInfo.file_name || fileName;
        createTime = info.odpsBaseInfo.create_time || '';
      }
    } catch { /* 忽略 */ }

    // 计算 fileurl
    let datePath = '';
    if (createTime) {
      const dt = new Date(createTime.replace(' ', 'T'));
      datePath = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    }
    const fileurl = datePath
      ? `/core/upload/${datePath}/${unid}.doc`
      : `/core/upload/${unid}.doc`;

    const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : '.doc';

    const downloadUrl = `${OA_BASE}/foa/core/file/file_download_byUrl.jsp` +
      `?filename=${encodeURIComponent(fileName)}` +
      `&fileType=${encodeURIComponent(fileExt)}` +
      `&fileurl=${encodeURIComponent(fileurl)}` +
      `&appid=${encodeURIComponent(app_unid)}` +
      `&randomstr=${Date.now()}`;

    const fileRes = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0',
      },
      redirect: 'manual',
    });

    if (!fileRes.ok) {
      return NextResponse.json(
        { success: false, error: `OA 返回 ${fileRes.status}` },
        { status: 502 }
      );
    }

    const fileBuffer = await fileRes.arrayBuffer();
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/msword',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || '未知错误' },
      { status: 500 }
    );
  }
}
