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

/**
 * 在已填充的 .docx 文件中直接替换真实 Word 书签的值。
 *
 * 与 fillDocxBookmarks 不同，这个函数不依赖 {placeholder} 占位符，
 * 而是直接操作 .docx 内部的 XML，找到真正的 Word 书签（<w:bookmarkStart>）并替换其文本。
 * 这样可以保留用户的所有手动编辑内容。
 *
 * @param fileBuffer  已填充的 .docx 文件内容
 * @param values      书签名 -> 新值
 */
export function replaceBookmarksInPlace(
  fileBuffer: Buffer,
  values: Record<string, string>,
): FillResult {
  let zip: PizZip;
  try {
    zip = new PizZip(fileBuffer);
  } catch (e: any) {
    return { ok: false, error: `不是有效的 .docx (ZIP) 文件: ${e.message}` };
  }

  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    return { ok: false, error: '.docx 中未找到 word/document.xml' };
  }

  let xml = docFile.asText();

  const missing: string[] = [];
  const used: Record<string, string> = {};

  for (const [bookmarkName, newValue] of Object.entries(values)) {
    if (!newValue) continue;

    // 查找 <w:bookmarkStart w:name="bookmarkName"> 或 w:name='bookmarkName'>
    // 注意：属性顺序可能不同，所以用更灵活的正则
    const nameAttr = `(?:w:name|w:name)\\s*=\\s*["']${escapeXmlAttr(bookmarkName)}["']`;
    const startTagRegex = new RegExp(
      `<w:bookmarkStart[^>]*${nameAttr}[^>]*\\/>`,
      'i'
    );
    const startMatch = xml.match(startTagRegex);

    if (!startMatch) {
      // 没找到这个书签，记录缺失
      if (!missing.includes(bookmarkName)) missing.push(bookmarkName);
      continue;
    }

    const startPos = startMatch.index!;
    const startTag = startMatch[0];

    // 从 startTag 中提取 w:id 属性，用于匹配对应的 bookmarkEnd
    const idMatch = startTag.match(/w:id\s*=\s*["'](\d+)["']/i);
    if (!idMatch) {
      if (!missing.includes(bookmarkName)) missing.push(bookmarkName);
      continue;
    }
    const bookmarkId = idMatch[1];

    // 找到对应的 bookmarkEnd
    const endTagRegex = new RegExp(`<w:bookmarkEnd\\s+w:id\\s*=\\s*["']${escapeXmlAttr(bookmarkId)}["'][^>]*\\/?>`, 'i');
    const endMatch = xml.slice(startPos).match(endTagRegex);
    if (!endMatch) {
      if (!missing.includes(bookmarkName)) missing.push(bookmarkName);
      continue;
    }
    const endPos = startPos + endMatch.index! + endMatch[0].length;

    // 在 bookmarkStart 和 bookmarkEnd 之间，查找第一个 <w:t> 元素并替换其文本
    const betweenXml = xml.slice(startPos + startTag.length, startPos + endMatch.index!);
    const textTagRegex = /<w:t[^>]*>([^<]*)<\/w:t>/i;
    const textMatch = betweenXml.match(textTagRegex);

    if (!textMatch) {
      if (!missing.includes(bookmarkName)) missing.push(bookmarkName);
      continue;
    }

    const oldText = textMatch[1];
    const textStartGlobal = startPos + startTag.length + (textMatch.index || 0);
    const textEndGlobal = textStartGlobal + textMatch[0].length;

    // 替换文本内容
    const newTextContent = escapeXmlContent(String(newValue));
    xml = xml.substring(0, textStartGlobal)
      + '<w:t>' + newTextContent + '</w:t>'
      + xml.substring(textEndGlobal);

    used[bookmarkName] = String(newValue);
  }

  // 写回修改后的 XML
  zip.file('word/document.xml', xml);

  let out: Buffer;
  try {
    out = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  } catch (e: any) {
    return { ok: false, error: `生成 .docx 失败: ${e.message}` };
  }

  return { ok: true, buffer: out, used, missing };
}

/** 转义 XML 属性值中的特殊字符 */
function escapeXmlAttr(s: string): string {
  return s.replace(/[&"']/g, function (c) {
    switch (c) {
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

/** 转义 XML 文本内容中的特殊字符 */
function escapeXmlContent(s: string): string {
  return s.replace(/[&<>]/g, function (c) {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      default: return c;
    }
  });
}
