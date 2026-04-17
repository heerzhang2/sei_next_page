import type { MigrationHandler, MigrationContext } from '../prisma-engine';
import { prisma } from '@/lib/prisma';
import { LogLevel } from '@prisma/client';

/**
 * 示例：用户数据迁移处理器
 * 演示如何处理复杂的关联查询和数据转换
 */
export const userMigrationHandler: MigrationHandler = {
  
  /**
   * 转换前处理：数据清洗和验证
   */
  async beforeTransform(rawData: any, context: MigrationContext): Promise<any> {
    // 示例：清理手机号格式
    if (rawData.phone) {
      rawData.phone = rawData.phone.replace(/[^\d]/g, '');
    }
    
    // 示例：验证必填字段
    if (!rawData.username && !rawData.name) {
      throw new Error('用户名和姓名不能同时为空');
    }
    
    return rawData;
  },

  /**
   * 自定义数据转换
   */
  async transform(rawData: any, context: MigrationContext): Promise<any> {
    return {
      username: rawData.username || rawData.name,
      email: rawData.email,
      phone: rawData.phone,
      realName: rawData.realName || rawData.name,
      // 状态转换
      status: rawData.status === 'active' ? 'ENABLED' : 'DISABLED',
      // 元数据
      metadata: {
        sourceId: rawData.id,
        sourceSystem: rawData.system || 'legacy',
        migratedAt: new Date().toISOString(),
      },
    };
  },

  /**
   * 关联实体解析：类似 JPA 的 @ManyToOne
   * 查询部门、角色等关联实体
   */
  async resolveRelations(data: any, context: MigrationContext): Promise<any> {
    // 1. 解析部门
    if (data.departmentCode) {
      const cacheKey = `department:${data.departmentCode}`;
      let department = context.entityCache.get(cacheKey);
      
      if (!department) {
        // 使用 Prisma 查询
        department = await prisma.department.findFirst({
          where: { code: data.departmentCode },
        });
        
        if (department) {
          context.entityCache.set(cacheKey, department);
        }
      }
      
      if (department) {
        data.departmentId = department.id;
      }
    }

    // 2. 解析角色列表
    if (data.roleCodes && Array.isArray(data.roleCodes)) {
      const roleIds: string[] = [];
      
      for (const roleCode of data.roleCodes) {
        const cacheKey = `role:${roleCode}`;
        let role = context.entityCache.get(cacheKey);
        
        if (!role) {
          role = await prisma.role.findFirst({
            where: { code: roleCode },
          });
          
          if (role) {
            context.entityCache.set(cacheKey, role);
          }
        }
        
        if (role) {
          roleIds.push(role.id);
        }
      }
      
      data.roleIds = roleIds;
    }

    // 3. 解析上级用户
    if (data.managerUsername) {
      const cacheKey = `user:${data.managerUsername}`;
      let manager = context.entityCache.get(cacheKey);
      
      if (!manager) {
        manager = await prisma.user.findFirst({
          where: { username: data.managerUsername },
        });
        
        if (manager) {
          context.entityCache.set(cacheKey, manager);
        }
      }
      
      if (manager) {
        data.managerId = manager.id;
      }
    }

    return data;
  },

  /**
   * 保存前处理：最终数据校验
   */
  async beforeSave(data: any, context: MigrationContext): Promise<any> {
    // 检查用户名是否已存在
    const existing = await prisma.user.findFirst({
      where: { username: data.username },
    });
    
    if (existing) {
      // 标记为更新操作
      data._existingId = existing.id;
    }
    
    return data;
  },

  /**
   * 自定义保存逻辑：处理关联关系
   */
  async save(data: any, context: MigrationContext): Promise<any> {
    const { _existingId, roleIds, departmentId, managerId, metadata, ...userData } = data;
    
    let user;
    
    if (_existingId) {
      // 更新现有用户
      user = await prisma.user.update({
        where: { id: _existingId },
        data: {
          ...userData,
          updatedAt: new Date(),
        },
      });
      
      // 记录为更新
      context.stats.updated++;
    } else {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          ...userData,
        },
      });
      
      context.stats.inserted++;
    }

    // 保存关联关系
    
    // 1. 部门关联
    if (departmentId) {
      await prisma.userDepartment.upsert({
        where: {
          userId_departmentId: {
            userId: user.id,
            departmentId: departmentId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          departmentId: departmentId,
        },
      });
    }

    // 2. 角色关联
    if (roleIds && roleIds.length > 0) {
      // 先删除旧的角色关联
      await prisma.userRole.deleteMany({
        where: { userId: user.id },
      });
      
      // 创建新的角色关联
      for (const roleId of roleIds) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: roleId,
          },
        });
      }
    }

    // 3. 记录迁移历史
    await prisma.migratedRecord.create({
      data: {
        externalId: metadata.sourceId,
        sourceSystem: metadata.sourceSystem,
        dataType: 'user',
        rawData: data,
        processedData: user,
        refId: user.id,
        refType: 'user',
        status: 'COMPLETED',
        migratedAt: new Date(),
      },
    });

    return { ...user, _action: _existingId ? 'update' : 'create' };
  },

  /**
   * 保存后处理：清理缓存、发送通知等
   */
  async afterSave(savedData: any, rawData: any, context: MigrationContext): Promise<void> {
    // 将新创建的用户加入缓存
    if (savedData.username) {
      context.entityCache.set(`user:${savedData.username}`, savedData);
    }
    
    // 可以在这里发送通知、更新统计等
    console.log(`用户 ${savedData.username} 迁移完成`);
  },
};

/**
 * 示例：订单数据迁移处理器
 * 演示如何处理更复杂的业务逻辑
 */
export const orderMigrationHandler: MigrationHandler = {
  
  async beforeTransform(rawData: any, context: MigrationContext): Promise<any> {
    // 数据验证
    if (!rawData.orderNo && !rawData.orderNumber) {
      throw new Error('订单号不能为空');
    }
    
    return rawData;
  },

  async transform(rawData: any, context: MigrationContext): Promise<any> {
    return {
      orderNo: rawData.orderNo || rawData.orderNumber,
      amount: parseFloat(rawData.amount) || 0,
      currency: rawData.currency || 'CNY',
      status: this.mapOrderStatus(rawData.status),
      createTime: new Date(rawData.createTime || rawData.createdAt),
      customerName: rawData.customerName,
      customerPhone: rawData.customerPhone,
      // 保留原始数据用于后续处理
      _raw: rawData,
    };
  },

  async resolveRelations(data: any, context: MigrationContext): Promise<any> {
    const raw = data._raw;
    
    // 解析客户信息
    if (raw.customerId || raw.customerCode) {
      const customer = await prisma.migratedRecord.findFirst({
        where: {
          dataType: 'customer',
          externalId: raw.customerId || raw.customerCode,
        },
      });
      
      if (customer) {
        data.customerRefId = customer.refId;
      }
    }
    
    // 解析产品信息
    if (raw.productCodes && Array.isArray(raw.productCodes)) {
      const products = await prisma.migratedRecord.findMany({
        where: {
          dataType: 'product',
          externalId: { in: raw.productCodes },
        },
      });
      
      data.productRefIds = products.map(p => p.refId);
    }
    
    delete data._raw;
    return data;
  },

  async save(data: any, context: MigrationContext): Promise<any> {
    // 使用 Prisma 事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 保存订单主表
      const order = await tx.migratedRecord.create({
        data: {
          externalId: data.orderNo,
          sourceSystem: 'order_system',
          dataType: 'order',
          rawData: data,
          processedData: {
            amount: data.amount,
            currency: data.currency,
            status: data.status,
          },
          refId: data.customerRefId,
          refType: 'customer',
          status: 'COMPLETED',
        },
      });
      
      // 2. 保存订单明细（如果有）
      if (data.productRefIds) {
        for (const productId of data.productRefIds) {
          await tx.migratedRecord.create({
            data: {
              externalId: `${data.orderNo}_${productId}`,
              sourceSystem: 'order_system',
              dataType: 'order_item',
              rawData: { orderId: order.id, productId },
              refId: order.id,
              refType: 'order',
              status: 'COMPLETED',
            },
          });
        }
      }
      
      return order;
    });
    
    return { ...result, _action: 'create' };
  },

  // 辅助方法：映射订单状态
  private mapOrderStatus(sourceStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'paid': 'PAID',
      'shipped': 'SHIPPED',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED',
    };
    return statusMap[sourceStatus?.toLowerCase()] || 'PENDING';
  },
};
