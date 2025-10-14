import { NextRequest, NextResponse } from 'next/server';
import {createServerUrqlClient} from "@/auth/urql";
import { auth, unstable_update as updateSession } from "@/app/auth"

const REFRESH_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
        id
      }
    }
  }
`;

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.refreshToken) {
            return NextResponse.json({ error: '未找到刷新令牌' }, { status: 401 });
        }
        // 从会话中获取设备ID
        const deviceId = session.user.deviceId;
        console.log('刷新Token API，设备ID:', deviceId);

        // 使用带设备ID的客户端
        const client = createServerUrqlClient(deviceId);
        const result = await client
            .mutation(REFRESH_MUTATION, {
                refreshToken: session.user.refreshToken,
            })
            .toPromise();

        if (result.error) {
            console.error('Token刷新GraphQL错误:', result.error);
            return NextResponse.json({ error: 'Token刷新失败' }, { status: 401 });
        }

        if (!result.data?.refreshToken) {
            return NextResponse.json({ error: '未返回刷新令牌数据' }, { status: 401 });
        }

        const refreshData = result.data.refreshToken;

        return NextResponse.json({
            success: true,
            accessToken: refreshData.accessToken,
            refreshToken: refreshData.refreshToken,
        });

    } catch (error) {
        console.error('Token刷新API错误:', error);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}
