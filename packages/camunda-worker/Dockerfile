# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

# 从构建阶段复制依赖和构建产物
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 创建临时目录用于锁文件
RUN mkdir -p /tmp

# 切换到非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app /tmp

USER nodejs

# 使用 dumb-init 启动
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
