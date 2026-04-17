import { NextRequest, NextResponse } from 'next/server';
import { prismaMigrationEngine } from '@/lib/migration/prisma-engine';
import type { MigrationConfig } from '@/lib/migration/types';

// GET /api/migration - 获取所有迁移任务
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // 获取单个任务
      const task = prismaMigrationEngine.getTask(taskId);
      const progress = prismaMigrationEngine.getProgress(taskId);
      
      if (!task) {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { task, progress },
      });
    }

    // 获取所有任务
    const tasks = prismaMigrationEngine.getAllTasks();
    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('获取迁移任务失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch migration tasks' },
      { status: 500 }
    );
  }
}

// POST /api/migration - 创建新的迁移任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, config } = body;

    if (!name || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, config' },
        { status: 400 }
      );
    }

    // 验证配置
    if (!config.sourceUrl || !config.targetTable || !config.fieldMapping) {
      return NextResponse.json(
        { success: false, error: 'Missing required config fields: sourceUrl, targetTable, fieldMapping' },
        { status: 400 }
      );
    }

    const task = await prismaMigrationEngine.createTask(name, config as MigrationConfig);
    
    return NextResponse.json({
      success: true,
      data: task,
      message: 'Migration task created successfully',
    });
  } catch (error) {
    console.error('创建迁移任务失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create migration task' 
      },
      { status: 500 }
    );
  }
}

// PATCH /api/migration - 更新任务状态（启动/取消）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, action } = body;

    if (!taskId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: taskId, action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        // 异步启动迁移
        prismaMigrationEngine.startMigration(taskId).catch(error => {
          console.error(`迁移任务 ${taskId} 执行失败:`, error);
        });
        
        return NextResponse.json({
          success: true,
          message: 'Migration started',
        });

      case 'cancel':
        await prismaMigrationEngine.cancelMigration(taskId);
        return NextResponse.json({
          success: true,
          message: 'Migration cancelled',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use "start" or "cancel"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('更新迁移任务失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update migration task' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/migration - 删除迁移任务
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: taskId' },
        { status: 400 }
      );
    }

    await prismaMigrationEngine.deleteTask(taskId);
    
    return NextResponse.json({
      success: true,
      message: 'Migration task deleted successfully',
    });
  } catch (error) {
    console.error('删除迁移任务失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete migration task' 
      },
      { status: 500 }
    );
  }
}
