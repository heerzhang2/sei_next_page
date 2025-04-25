import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'POST');
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'PATCH');
}

export async function HEAD(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'HEAD');
}

export async function OPTIONS(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, 'OPTIONS');
}

//也不用了：
async function handleRequest(
    request: NextRequest,
    { params }: { params: { path: string[] } },
    method: string
) {
  // 获取服务器端会话
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.user.accessToken;
  const path = params.path.join('/');
  const tusServerUrl = `https://your-tus-server.com/${path}`;

  // 创建新的请求头，添加授权令牌
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  // 转发请求到Tus服务器
  const response = await fetch(tusServerUrl, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' ? await request.blob() : undefined,
  });

  // 返回Tus服务器的响应
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
