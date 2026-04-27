import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// 从 DATABASE_URL 解析连接信息
// 格式: mysql://user:password@host:port/database
const parseDatabaseUrl = (url: string) => {
  try {
    const httpUrl = url.replace(/^mysql:\/\//, 'http://');
    const parsed = new URL(httpUrl);
    
    return {
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : 3306,
      database: parsed.pathname.replace(/^\//, '').split('?')[0],
    };
  } catch (e) {
    throw new Error(`Invalid DATABASE_URL format: ${e}`);
  }
};

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL || '');

// 调试日志（仅在开发环境显示）
if (process.env.NODE_ENV === 'development') {
  console.log('[Prisma] Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
  });
}

// 创建 Prisma Driver Adapter（直接传入配置对象）
const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 10,
});

// 防止开发环境下热重载创建多个 PrismaClient 实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 检查全局实例是否使用了 adapter，如果没有则强制重新创建
const needsNewInstance = !globalForPrisma.prisma || 
  !(globalForPrisma.prisma as any)._engineConfig?.adapter;

export const prisma = needsNewInstance 
  ? new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    })
  : globalForPrisma.prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
