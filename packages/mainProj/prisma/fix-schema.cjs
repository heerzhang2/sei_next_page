#!/usr/bin/env node
/**
 * Post Prisma DB Pull 脚本
 * 1. 删除所有 QRTZ_ 相关的模型（Quartz 调度表，Prisma 不支持其复合主键结构）
 * 2. 为所有 id 字段添加 @default(autoincrement())
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.prisma not found!');
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

// ========== 步骤 1: 删除 QRTZ_ 相关的模型和枚举 ==========
console.log('🔍 Removing QRTZ_ tables...');

// 匹配 model QRTZ_XXX { ... } 和 enum QRTZ_XXX { ... }
// 使用非贪婪匹配，跨行
const qrtzModelRegex = /^model QRTZ_\w+\s*\{[\s\S]*?^\}/gm;
const qrtzEnumRegex = /^enum QRTZ_\w+\s*\{[\s\S]*?^\}/gm;

let removedCount = 0;

// 移除 QRTZ_ 模型
content = content.replace(qrtzModelRegex, (match) => {
  const modelName = match.match(/^model (\w+)/)?.[1] || 'unknown';
  console.log(`  ✂️  Removed model: ${modelName}`);
  removedCount++;
  return '';
});

// 移除 QRTZ_ 枚举
content = content.replace(qrtzEnumRegex, (match) => {
  const enumName = match.match(/^enum (\w+)/)?.[1] || 'unknown';
  console.log(`  ✂️  Removed enum: ${enumName}`);
  removedCount++;
  return '';
});

// ========== 步骤 2: 清理 QRTZ_ 相关的字段引用和外键 ==========
console.log('🔍 Cleaning up QRTZ_ field references...');

// 在模型定义中，移除包含 QRTZ_ 的字段行（外键引用）
const modelBlockRegex = /^(model \w+ \{)([\s\S]*?)(^\})/gm;

content = content.replace(modelBlockRegex, (match, modelDecl, modelBody, closing) => {
  const lines = modelBody.split('\n');
  const cleanedLines = lines.filter(line => {
    // 如果行包含 QRTZ_（字段类型或关系引用），则移除
    if (line.includes('QRTZ_')) {
      console.log(`  🧹 Removed field: ${line.trim().substring(0, 70)}...`);
      return false;
    }
    return true;
  });
  return modelDecl + cleanedLines.join('\n') + closing;
});

// ========== 步骤 3: 为所有 id 字段添加 @default(autoincrement()) ==========
console.log('🔍 Adding @default(autoincrement()) to id fields...');

let fixCount = 0;

// 在模型体内查找 id 字段并修复
content = content.replace(modelBlockRegex, (match, modelDecl, modelBody, closing) => {
  const lines = modelBody.split('\n');
  const newLines = lines.map(line => {
    // 匹配 id 字段定义行，但排除已经有 @default(autoincrement()) 的
    // 支持格式：
    //   id    BigInt  @id
    //   id    BigInt  @id  @map("_id")
    //   id    BigInt  @id  @default(autoincrement())  <- 已存在，跳过
    const idFieldRegex = /^(\s*id\s+BigInt\s+@id)(?!.*@default\(autoincrement\(\)\))/i;

    if (idFieldRegex.test(line)) {
      fixCount++;
      return line.replace(/^(\s*id\s+BigInt\s+@id)/i, '$1 @default(autoincrement())');
    }

    return line;
  });

  return modelDecl + newLines.join('\n') + closing;
});

// ========== 步骤 4: 清理多余的空行 ==========
// 将多个连续空行替换为单个空行
content = content.replace(/\n{3,}/g, '\n\n');

// ========== 保存结果 ==========
fs.writeFileSync(schemaPath, content);

console.log('\n✅ Schema fixed successfully!');
console.log(`   - Removed ${removedCount} QRTZ_ tables/enums`);
console.log(`   - Fixed ${fixCount} id fields with @default(autoincrement())`);
console.log('\n💡 Tip: Run "npx prisma validate" to verify the schema.');
