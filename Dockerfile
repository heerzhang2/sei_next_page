# Next.js 前端 Dockerfile
# 多阶段构建：builder -> runner

# ==================== 构建阶段 ====================
FROM node:24-alpine AS builder

WORKDIR /app

# 设置 npm 镜像源为淘宝镜像
RUN npm config set registry https://registry.npmmirror.com

# 设置环境变量（不设置 NODE_ENV=production，以确保 devDependencies 被安装）
ENV NEXT_TELEMETRY_DISABLED=1
# 设置网络超时和重试
ENV YARN_NETWORK_CONCURRENCY=1
ENV YARN_NETWORK_TIMEOUT=300000

# 构建时环境变量参数
ARG NEXT_PUBLIC_BASE_PATH=/report
ARG NEXT_PUBLIC_BACK_END
ARG NEXT_PUBLIC_WEBSOCKET_END
ARG NEXT_PUBLIC_OSS_ENDP
ARG NEXT_PUBLIC_TUS_UPLOAD_ENDP
ARG NEXT_PUBLIC_APP_WEB

ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_PUBLIC_BACK_END=${NEXT_PUBLIC_BACK_END}
ENV NEXT_PUBLIC_WEBSOCKET_END=${NEXT_PUBLIC_WEBSOCKET_END}
ENV NEXT_PUBLIC_OSS_ENDP=${NEXT_PUBLIC_OSS_ENDP}
ENV NEXT_PUBLIC_TUS_UPLOAD_ENDP=${NEXT_PUBLIC_TUS_UPLOAD_ENDP}
ENV NEXT_PUBLIC_APP_WEB=${NEXT_PUBLIC_APP_WEB}

# 复制依赖文件
COPY package.json yarn.lock ./
COPY packages/mainProj/package.json ./packages/mainProj/
COPY packages/shared-auth-config/package.json ./packages/shared-auth-config/
COPY tsconfig.json ./

# 安装依赖（devDependencies 也会被安装）
RUN yarn install --frozen-lockfile

# 复制源代码
COPY packages/mainProj ./packages/mainProj
COPY packages/shared-auth-config ./packages/shared-auth-config

# 构建项目（使用 ARG 设置的 ENV 环境变量）
WORKDIR /app/packages/mainProj
RUN yarn build

# ==================== 运行阶段 ====================
FROM node:24-alpine AS runner

# 创建非 root 用户（先创建，后续复制文件时指定用户）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NEXT_PUBLIC_BASE_PATH=/report

# 复制完整的 node_modules（指定用户，避免后续 chown）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# 复制工作区包（指定用户）
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# 复制构建产物（指定用户）
COPY --from=builder --chown=nextjs:nodejs /app/packages/mainProj/public ./packages/mainProj/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/mainProj/.next ./packages/mainProj/.next
COPY --from=builder --chown=nextjs:nodejs /app/packages/mainProj/server.mjs ./packages/mainProj/server.mjs

USER nextjs

# 暴露端口
EXPOSE 3765

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3765/health', (r) => {if(r.statusCode !== 200) process.exit(1)})"

# 启动命令
WORKDIR /app/packages/mainProj
CMD ["node", "server.mjs"]
