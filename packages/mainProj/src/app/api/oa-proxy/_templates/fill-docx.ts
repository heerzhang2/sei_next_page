/**
 * 无损 .docx 书签填充
 *
 * 关键原理：.docx 本质是 ZIP + XML。本模块用 docxtemplater 仅替换占位符对应的
 * 文本节点，完全不调用任何排版/渲染引擎，因此表格、分节、域、样式等 XML 结构
 * 原封不动 —— 格式数学级保证不被扰动。
 *
 * 前提：模板必须是“预转换 .docx”，且书签已转成占位符 token（默认分隔符 { }）。
 */

import * as fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export interface FillResult {
  ok: boolean;
  /** 填充后的 .docx 字节流（成功时存在） */
  buffer?: Buffer;
  /** 实际用到的占位符 -> 值 */
  used?: Record<string, string>;
  /** 模板里出现、但本次没有提供值的占位符 */
  missing?: string[];
  error?: string;
}

/**
 * 用书签值填充预转换的 .docx 模板。
 *
 * @param templatePath 预转换 .docx 模板的绝对路径
 * @param values       占位符值，如 { '主送单位': '...', '密级': '...' }
 */
export function fillDocxBookmarks(
  templatePath: string,
  values: Record<string, string>,
): FillResult {
  if (!fs.existsSync(templatePath)) {
    return { ok: false, error: `模板文件不存在: ${templatePath}` };
  }

  let content: Buffer;
  try {
    content = fs.readFileSync(templatePath);
  } catch (e: any) {
    return { ok: false, error: `读取模板失败: ${e.message}` };
  }

  let zip: PizZip;
  try {
    zip = new PizZip(content);
  } catch (e: any) {
    return { ok: false, error: `模板不是有效的 .docx (ZIP) 文件: ${e.message}` };
  }

  // 收集模板里实际存在的占位符，便于报告缺失项
  const missing: string[] = [];

  let doc: Docxtemplater;
  try {
    doc = new Docxtemplater(zip, {
      // 占位符分隔符：{主送单位}。如离线宏用的是 {{ }}，把这里改成 { start:'{{', end:'}}' }
      delimiters: { start: '{', end: '}' },
      // 保留段落结构；遇到未提供的占位符时不抛错，渲染为空字符串并记录
      paragraphLoop: true,
      linebreaks: true,
      nullGetter(part: any) {
        if (part && part.value && !missing.includes(part.value)) {
          missing.push(part.value);
        }
        return '';
      },
    });
  } catch (e: any) {
    return { ok: false, error: `解析模板占位符失败: ${e.message}` };
  }

  // 规范化：确保所有值都是字符串
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    data[k] = v == null ? '' : String(v);
  }

  try {
    doc.render(data);
  } catch (e: any) {
    // docxtemplater 的多重错误聚合
    const detail = e.properties?.errors
      ? e.properties.errors.map((err: any) => err.properties?.explanation || err.message).join('; ')
      : e.message;
    return { ok: false, error: `渲染失败: ${detail}` };
  }

  let out: Buffer;
  try {
    out = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  } catch (e: any) {
    return { ok: false, error: `生成 .docx 失败: ${e.message}` };
  }

  return { ok: true, buffer: out, used: data, missing };
}
