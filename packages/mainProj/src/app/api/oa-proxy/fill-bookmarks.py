#!/usr/bin/env python3
"""
LibreOffice UNO 脚本：填充 .doc 书签
在 Linux Docker 中通过 UNO 桥接修改 Word 文档的书签内容

使用方法:
  python3 fill-bookmarks.py <doc_path> <bookmark_json> [--out <output_path>]

参数:
  doc_path       - 原始 .doc 文件路径
  bookmark_json  - JSON 字符串，格式为 {"书签名": "替换值", ...}
  --out          - 输出文件路径（默认覆盖原文件）
"""

import sys
import json
import os
import time
import socket
from pathlib import Path

# LibreOffice UNO 导入
import uno
from com.sun.star.beans import PropertyValue


def ensure_socket_available():
    """检查 LibreOffice soffice 的 UNO 套接字是否可用"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        result = sock.connect_ex(('127.0.0.1', 2002))
        return result == 0
    finally:
        sock.close()


def create_property(name, value):
    """创建 UNO PropertyValue 对象"""
    prop = PropertyValue()
    prop.Name = name
    prop.Value = value
    return prop


def fill_bookmarks(doc_path, bookmark_values, output_path=None):
    """
    使用 LibreOffice UNO 填充 Word 文档的书签

    Args:
        doc_path: .doc 文件的绝对路径
        bookmark_values: 字典，格式为 {"书签名": "新值", ...}
        output_path: 输出路径。如为 None，则覆盖原文件

    Returns:
        dict: {"success": bool, "message": str, "file_size": int}
    """
    if output_path is None:
        output_path = doc_path

    try:
        # 获取 UNO component context
        local_context = uno.getComponentContext()
        resolver = local_context.ServiceManager.createInstanceWithContext(
            "com.sun.star.bridge.UnoUrlResolver", local_context)

        # 连接到 LibreOffice soffice 实例（必须已启动）
        try:
            ctx = resolver.resolve(
                "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext")
        except Exception:
            return {
                "success": False,
                "message": "无法连接到 LibreOffice UNO 套接字。请确保 soffice 已以下列方式启动:\n"
                           "  soffice --headless --accept='socket,host=127.0.0.1,port=2002;urp;'",
                "file_size": 0
            }

        smgr = ctx.ServiceManager
        desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)

        # 打开文档
        file_url = f"file://{os.path.abspath(doc_path)}"
        props = [
            create_property("Hidden", True),  # 隐形打开
            create_property("UpdateDocMode", 0),  # 不更新字段
        ]
        doc = desktop.loadComponentFromURL(file_url, "_blank", 0, tuple(props))

        if not doc:
            return {"success": False, "message": f"打开文档失败: {doc_path}", "file_size": 0}

        # 获取所有书签
        bookmarks = doc.getBookmarks()
        replaced_count = 0
        errors = []

        for bookmark_name, new_value in bookmark_values.items():
            try:
                if bookmarks.hasByName(bookmark_name):
                    bookmark = bookmarks.getByName(bookmark_name)
                    # 获取书签的范围
                    bookmark_range = bookmark.getAnchor()
                    # 替换文本内容
                    bookmark_range.setString(str(new_value))
                    replaced_count += 1
                else:
                    errors.append(f"书签未找到: {bookmark_name}")
            except Exception as e:
                errors.append(f"填充书签 '{bookmark_name}' 时出错: {str(e)}")

        # 保存文档
        try:
            # 使用 _ods_save 直接保存，保留原格式
            props_save = [
                create_property("Overwrite", True),
            ]
            doc.storeToURL(file_url, tuple(props_save))
        except Exception as e:
            # 如果直接保存失败，尝试另存为
            try:
                output_url = f"file://{os.path.abspath(output_path)}"
                doc.storeToURL(output_url, tuple([]))
            except Exception as e2:
                doc.close(True)
                return {
                    "success": False,
                    "message": f"保存文档失败: {str(e2)}",
                    "file_size": 0
                }

        # 关闭文档
        doc.close(True)

        # 获取保存后的文件大小
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
        else:
            file_size = 0

        message = f"成功替换 {replaced_count} 个书签"
        if errors:
            message += f"，{len(errors)} 个错误: " + "; ".join(errors)

        return {
            "success": True,
            "message": message,
            "file_size": file_size,
            "replaced_count": replaced_count,
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"UNO 处理失败: {str(e)}",
            "file_size": 0
        }


def main():
    """命令行入口"""
    if len(sys.argv) < 3:
        print("用法: python3 fill-bookmarks.py <doc_path> <bookmark_json> [--out <output_path>]")
        print("示例: python3 fill-bookmarks.py /tmp/doc.doc '{\"书签1\": \"值1\"}' --out /tmp/out.doc")
        sys.exit(1)

    doc_path = sys.argv[1]
    bookmark_json_str = sys.argv[2]
    output_path = doc_path  # 默认覆盖

    # 解析 --out 参数
    if len(sys.argv) >= 5 and sys.argv[3] == '--out':
        output_path = sys.argv[4]

    # 验证文件存在
    if not os.path.exists(doc_path):
        print(json.dumps({
            "success": False,
            "message": f"文件不存在: {doc_path}"
        }))
        sys.exit(1)

    # 解析 JSON
    try:
        bookmark_values = json.loads(bookmark_json_str)
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "message": f"JSON 解析失败: {str(e)}"
        }))
        sys.exit(1)

    # 执行填充
    result = fill_bookmarks(doc_path, bookmark_values, output_path)
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
