/**
 * 扫描单个 .docx 模板，列出其中所有占位符名字。
 *
 * 用法：
 *   node scripts/scan-template.mjs <模板.docx 路径>
 *
 * 例：
 *   node scripts/scan-template.mjs src/app/api/oa-proxy/_templates/docx/fawen.docx
 *
 * 它会：
 *   1) 解析 .docx（ZIP）里所有 XML 部件（正文、页眉、页脚等）
 *   2) 把同一段落里被 Word 拆成多个 run 的文本拼接起来，再找占位符
 *   3) 列出所有 {占位符} 名字
 *   4) 检测「可疑被拆开」的占位符（只有 { 没有 }，或只有 } 没有 {）
 *
 * 分隔符默认 { }，与运行时 fill-docx.ts 保持一致。
 */

import fs from 'node:fs';
import path from 'node:path';
import PizZip from 'pizzip';

const START = '{';
const END = '}';

function fail(msg) {
  console.error(`\x1b[31m错误：${msg}\x1b[0m`);
  process.exit(1);
}

const inputArg = process.argv[2];
if (!inputArg) {
  fail('请提供 .docx 模板路径。用法：node scripts/scan-template.mjs <模板.docx 路径>');
}

const filePath = path.resolve(process.cwd(), inputArg);
if (!fs.existsSync(filePath)) {
  fail(`文件不存在：${filePath}`);
}
if (!filePath.toLowerCase().endsWith('.docx')) {
  fail('只支持 .docx 文件（旧 .doc 请先用 Word 宏转换为 .docx）');
}

let zip;
try {
  zip = new PizZip(fs.readFileSync(filePath));
} catch (e) {
  fail(`不是有效的 .docx (ZIP) 文件：${e.message}`);
}

// 收集所有需要扫描的 XML 部件：正文 + 页眉 + 页脚
const xmlParts = Object.keys(zip.files).filter(
  (name) =>
    name === 'word/document.xml' ||
    /^word\/(header|footer)\d*\.xml$/.test(name),
);

if (xmlParts.length === 0) {
  fail('未找到 word/document.xml，文件可能损坏');
}

/**
 * 把一段 XML 里所有 <w:t> 文本拼成连续字符串。
 * 这样即使占位符被 Word 拆成多个 run，也能正确识别。
 */
function extractText(xml) {
  const matches = xml.match(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g) || [];
  return matches
    .map((m) => m.replace(/<w:t\b[^>]*>/, '').replace(/<\/w:t>/, ''))
    .join('')
    // 反转义 XML 实体
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

const found = new Map(); // 占位符名字 -> 出现次数
const suspicious = new Set(); // 可疑被拆开的片段

for (const partName of xmlParts) {
  const xml = zip.files[partName].asText();

  // 1) 用拼接后的整段文本找完整占位符
  const text = extractText(xml);
  const re = new RegExp(`${escapeRe(START)}([^${escapeRe(START)}${escapeRe(END)}]+?)${escapeRe(END)}`, 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim();
    found.set(name, (found.get(name) || 0) + 1);
  }

  // 2) 检测可疑：拼接文本里 { 与 } 数量不一致，说明可能有断开/缺失
  const openCount = (text.match(new RegExp(escapeRe(START), 'g')) || []).length;
  const closeCount = (text.match(new RegExp(escapeRe(END), 'g')) || []).length;
  if (openCount !== closeCount) {
    suspicious.add(
      `${partName}: 检测到 ${openCount} 个 "${START}" 与 ${closeCount} 个 "${END}"，数量不匹配，可能有占位符被拆开或漏写`,
    );
  }
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 输出结果
const names = [...found.keys()].sort((a, b) => a.localeCompare(b, 'zh'));

console.log('');
console.log(`\x1b[1m模板文件：\x1b[0m ${path.relative(process.cwd(), filePath)}`);
console.log(`\x1b[1m扫描部件：\x1b[0m ${xmlParts.join(', ')}`);
console.log('');

if (names.length === 0) {
  console.log('\x1b[33m未发现任何占位符。请确认模板里的书签已转成 {占位符} 形式。\x1b[0m');
} else {
  console.log(`\x1b[1m\x1b[32m发现 ${names.length} 个占位符：\x1b[0m`);
  for (const name of names) {
    const count = found.get(name);
    console.log(`  • {${name}}${count > 1 ? `  (出现 ${count} 次)` : ''}`);
  }
}

console.log('');

if (suspicious.size > 0) {
  console.log(`\x1b[1m\x1b[33m⚠ 可疑提示：\x1b[0m`);
  for (const s of suspicious) {
    console.log(`  ! ${s}`);
  }
  console.log('');
  console.log('  若占位符被 Word 拆开，运行时将无法匹配。');
  console.log('  修正方法：在 Word 里整体复制一个已有占位符，再改名字，避免手敲导致断开。');
  console.log('');
}

// 以纯文本形式再列一遍，便于直接复制到 template-map.ts 核对
if (names.length > 0) {
  console.log('\x1b[2m占位符列表（纯文本）：\x1b[0m');
  console.log(names.map((n) => `'${n}'`).join(', '));
  console.log('');
}
