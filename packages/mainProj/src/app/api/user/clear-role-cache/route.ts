/**
 * 清除当前用户角色缓存 API
 * 用于在 Redis 缓存过期前手动刷新角色数据
 */

import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { UserInfoCache } from '@/lib/redis';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
    }

    await UserInfoCache.clearUserRoles(session.user.id);
    console.log(`[ClearRoleCache] 已清除用户 ${session.user.name} 的角色缓存`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ClearRoleCache] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
