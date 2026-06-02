#!/bin/bash
# 用于 Linux/Mac 的 schema 修复脚本

SCHEMA_FILE="prisma/schema.prisma"

# 备份原文件
cp "$SCHEMA_FILE" "${SCHEMA_FILE}.backup.$(date +%s)"

# 使用 sed 为所有 id BigInt @id 添加 @default(autoincrement())
# 注意：这个正则只处理还没有 @default(autoincrement()) 的情况
sed -i 's/\(id\s\+BigInt\s\+@id\)\(?!.*@default(autoincrement()))/\1 @default(autoincrement())/g' "$SCHEMA_FILE"

echo "Schema fixed!"
