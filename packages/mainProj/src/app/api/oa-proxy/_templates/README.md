# 预转换 .docx 模板说明

本目录存放“预转换 .docx”模板，是整套**严格不扰动格式**方案的核心。

## 为什么这样做

旧 OA 的 `.doc` 模板，在 Linux/Docker 上运行时无法做到“格式绝不乱”：任何免费库
（LibreOffice、Apache POI）保存 `.doc` 时都要过有损的导出过滤器。

本方案把“有损步骤”一次性挪到离线、用**真正的 Microsoft Word** 完成：

```
【离线·一次性·真 Word】                 【运行时·Linux·无损】
.doc 模板 → Word 另存为 .docx          docxtemplater 仅替换占位符文本节点
          → 宏把书签转成 {占位符}        不经过任何排版引擎 → 格式数学级不变
```

`.docx` 本质是 ZIP + XML，运行时只改 XML 文本节点，表格/分节/域/样式的 XML 原封不动。

## 目录结构

```
_templates/
├── README.md            ← 本文件
├── template-map.ts      ← fileUnid -> .docx 文件名 映射（需手工登记）
├── fill-docx.ts         ← 运行时无损填充逻辑（无需改动）
├── convert-macro.bas    ← Word 宏：把书签转占位符 + 另存 .docx
└── docx/                ← 放转换好的 .docx 模板
    └── fawen-putong.docx
```

## 离线转换步骤（在装有 Word 的 Windows 上做一次）

### 方式 A：用宏批量转换（推荐）

1. 把所有原始 `.doc` 模板放进一个文件夹，例如 `C:\oa-templates\src\`。
2. 打开 Word → 按 `Alt+F11` 打开 VBA 编辑器 → `文件 > 导入文件` 选择
   `convert-macro.bas`。
3. 修改宏顶部的 `srcFolder` 和 `dstFolder` 路径。
4. 按 `F5` 运行 `ConvertAllDocToDocx`。它会：
   - 打开每个 `.doc`
   - 把每个书签替换成占位符文本 `{书签名}`（保留书签所在位置的格式）
   - 另存为同名 `.docx`
5. 把生成的 `.docx` 拷到本项目的 `_templates/docx/` 目录。

### 方式 B：手工转换（模板很少时）

1. Word 打开 `.doc`。
2. 对每个书签：选中书签位置，输入 `{书签名}`（花括号 + 书签原名）。
   - 用“插入 > 书签”可查看所有书签名。
   - 占位符名必须与 OA 的 `documentFieldJSON` 里的 key 完全一致，如
     `{主送单位}`、`{密级}`、`{发文年号}`。
3. `文件 > 另存为` → 选择 `.docx` 格式。
4. 放进 `_templates/docx/`。

## 登记映射

编辑 `template-map.ts`，把 OA 的 `fileUnid` 映射到对应 `.docx` 文件名：

```ts
export const TEMPLATE_MAP: Record<string, string> = {
  '20180103130508XX93D18667093740A7': 'fawen-putong.docx',
  // ...
};
```

## 占位符分隔符

默认用单花括号 `{书签名}`。如果你的正文里本身含有大量 `{` `}`（少见），
可改用 `{{书签名}}`，同时把 `fill-docx.ts` 里的 `delimiters` 改成 `{{ }}`，
并在宏里相应修改。

## 校验

转换完成后，建议用 Word 再打开一次生成的 `.docx`，确认：

- [ ] 排版、表格、分节、页眉页脚、域 完全和原 `.doc` 一致
- [ ] 每个书签位置都变成了 `{书签名}` 占位符
- [ ] 占位符名与 OA `documentFieldJSON` 的 key 一一对应
