/**
 * 用户同步任务 API
 * 触发从第三方系统同步部门用户到本地数据库
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUserSyncJob, createBatchUserSyncJob, JobPriority } from '@/lib/queue';

/**
 * POST /api/queue/user-sync
 * 创建用户同步任务（支持单部门或批量部门）
 *
 * 单部门模式请求体:
 * {
 *   deptId: string;      // 部门ID（第三方系统）
 *   deptName?: string;   // 部门名称
 *   accessToken?: string; // 第三方系统的访问令牌（可选，不传则使用环境变量自动登录）
 *   unitId?: string;     // 本地单位ID（可选，默认使用系统默认值）
 *   priority?: number;   // 优先级 1-5（可选）
 * }
 *
 * 批量部门模式请求体:
 * {
 *   divisions: { id: string; name: string }[];  // 部门列表
 *   accessToken?: string;
 *   unitId?: string;
 *   priority?: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deptId, deptName, divisions, accessToken, unitId, priority = 3 } = body;

    // 判断是批量模式还是单部门模式
    if (divisions && Array.isArray(divisions) && divisions.length > 0) {
      // 批量部门模式
      const jobId = await createBatchUserSyncJob(
        divisions,
        accessToken,
        unitId,
        priority as JobPriority
      );

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          message: `Batch user sync task created for ${divisions.length} departments`,
          authMode: accessToken ? 'provided_token' : 'env_credentials',
          departmentCount: divisions.length,
        },
      });
    }

    // 单部门模式
    if (!deptId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: deptId or divisions' },
        { status: 400 }
      );
    }

    // 创建用户同步任务
    // 如果没有传入 accessToken，将使用环境变量中的凭证自动登录
    const jobId = await createUserSyncJob(
      deptId,
      deptName,
      accessToken,
      unitId,
      priority as JobPriority
    );

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        message: `User sync task created for dept ${deptId}`,
        authMode: accessToken ? 'provided_token' : 'env_credentials',
      },
    });

  } catch (error: any) {
    console.error('[API] Failed to create user sync task:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/queue/user-sync
 * 获取用户同步任务信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deptId = searchParams.get('deptId');

    if (!deptId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: deptId' },
        { status: 400 }
      );
    }

    // 返回 API 信息
    return NextResponse.json({
      success: true,
      data: {
        api: 'User Sync Task API',
        endpoint: 'POST /api/queue/user-sync',
        parameters: {
          deptId: 'Department ID (required)',
          deptName: 'Department name (optional)',
          accessToken: 'Third-party access token (optional, if not provided will use env credentials)',
          unitId: 'Local unit ID (optional)',
          priority: 'Task priority 1-5 (optional, default: 3)',
        },
        example: {
          deptId: '2',
          deptName: '福州检验二部',
          unitId: '2738188573441261569',
          priority: 3,
        },
        envConfig: {
          required: [
            'THIRD_PARTY_USERNAME',
            'THIRD_PARTY_PASSWORD',
          ],
          optional: [
            'THIRD_PARTY_API_URL',
            'THIRD_PARTY_USER_TYPE',
            'THIRD_PARTY_LOGIN_TYPE',
          ],
        },
      },
    });

  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
