# Camunda Worker Dockerfile
# Sidecar 模式与 page2pdf-server 捆绑部署

FROM node:20-alpine

# 安装依赖
RUN apk add --no-cache dumb-init

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY dist ./dist
COPY src ./src

# 创建非 root 用户
RUN addgroup -g appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

# 切换用户
USER appuser

# 暴露端口（如果有 HTTP 接口）
# EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')"

# 启动
CMD ["node", "dist/index.js"]
