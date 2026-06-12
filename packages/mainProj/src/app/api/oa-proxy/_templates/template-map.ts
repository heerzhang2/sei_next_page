/**
 * 预转换 .docx 模板映射表
 *
 * 背景：旧 OA 的 .doc 模板在运行时（Linux/Docker）无法做到“格式绝不扰动”的书签替换。
 * 解决方案：把每个 .doc 模板用真正的 Word 一次性另存为 .docx，并用 Word 宏把书签
 *           转成占位符 token（如 {主送单位}）。运行时仅对 .docx 做无损的 XML
 *           文本节点替换，不经过任何排版引擎，格式数学级保持不变。
 *
 * 用法：
 *   1. 离线把 OA 模板转换成 .docx（见 _templates/README 的宏脚本），文件放在
 *      本目录下的 docx/ 子目录。
 *   2. 在下面的 TEMPLATE_MAP 中登记 fileUnid -> 文件名 的映射。
 *   3. 运行时根据请求里的 fileUnid 找到对应 .docx 模板。
 */

import * as path from 'path';

/** 模板文件所在目录（相对本文件） */
export const TEMPLATE_DIR = path.join(process.cwd(), 'src/app/api/oa-proxy/_templates/docx');

/**
 * fileUnid -> 预转换 .docx 模板文件名 的映射
 *
 * key:   OA 模板的 fileUnid（draft 请求里的 fileUnid 字段）
 * value: 放在 _templates/docx/ 下的 .docx 文件名
 *
 * 示例（请按实际模板补充）：
 */
export const TEMPLATE_MAP: Record<string, string> = {
  // 普通发文模板（示例 fileUnid，对应您给的请求里的 fileUnid）
  '20180103130508XX93D18667093740A7': 'fawen-putong.docx',

  // 在此继续登记其他模板：
  // 'XXXXXXXX': 'qingshi.docx',
  // 'YYYYYYYY': 'baogao.docx',
};

/**
 * 根据 fileUnid 解析出预转换模板的绝对路径。
 * 返回 null 表示该 fileUnid 还没有登记预转换模板。
 */
export function resolveTemplatePath(fileUnid: string): string | null {
  const fileName = TEMPLATE_MAP[fileUnid];
  if (!fileName) return null;
  return path.join(TEMPLATE_DIR, fileName);
}
