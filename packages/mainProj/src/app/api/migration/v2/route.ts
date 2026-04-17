import { NextRequest, NextResponse } from 'next/server';
import { prismaMigrationEngine } from '@/lib/migration/prisma-engine';
import type { MigrationConfig } from '@/lib/migration/types';

// GET /api/migration/v2 - 获取所有迁移任务（使用 Prisma）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const includeLogs = searchParams.get('logs') === 'true';

    if (taskId) {
      const task = await prismaMigrationEngine.getTask(taskId);
      
      if (!task) {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }

      let logs = null;
      if (includeLogs) {
        logs = await prismaMigrationEngine.getTaskLogs(taskId);
      }

      return NextResponse.json({
        success: true,
        data: { task, logs },
      });
    }

    const tasks = await prismaMigrationEngine.getAllTasks();
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

// POST /api/migration/v2 - 创建新的迁移任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, config, handlerType } = body;

    if (!name || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, config' },
        { status: 400 }
      );
    }

    // 验证配置
    if (!config.sourceUrl || !config.targetTable || !config.fieldMapping) {
      return NextResponse.json(
        { success: false, error: 'Missing required config fields' },
        { status: 400 }
      );
    }

    const task = await prismaMigrationEngine.createTask(name, config as MigrationConfig);
    
    // 如果指定了立即启动
    if (body.autoStart) {
      prismaMigrationEngine.startMigration(task.id, handlerType).catch(error => {
        console.error(`迁移任务 ${task.id} 执行失败:`, error);
      });
    }
    
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

// PATCH /api/migration/v2 - 更新任务状态
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, action, handlerType } = body;

    if (!taskId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: taskId, action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        prismaMigrationEngine.startMigration(taskId, handlerType).catch(error => {
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

// DELETE /api/migration/v2 - 删除迁移任务
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
