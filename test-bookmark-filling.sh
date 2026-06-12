#!/bin/bash
# 测试脚本：验证 LibreOffice UNO 书签填充功能
# 
# 使用方法:
#   bash test-bookmark-filling.sh [doc_file] [output_dir]
#
# 示例:
#   bash test-bookmark-filling.sh /tmp/template.doc /tmp/output

set -e

DOC_FILE="${1:-/tmp/test_template.doc}"
OUTPUT_DIR="${2:-/tmp/bookmark_test_output}"

echo "============================================"
echo "LibreOffice UNO 书签填充 - 测试脚本"
echo "============================================"
echo ""

# 步骤 1：检查环境
echo "[步骤 1] 检查环境..."

if ! command -v python3 &> /dev/null; then
    echo "❌ python3 未安装"
    exit 1
fi
echo "✓ python3 OK"

if ! command -v libreoffice &> /dev/null; then
    echo "❌ libreoffice 未安装"
    exit 1
fi
echo "✓ libreoffice OK"

if ! python3 -c "import uno" 2>/dev/null; then
    echo "❌ python3-uno 未安装或不可用"
    exit 1
fi
echo "✓ python3-uno OK"

echo ""

# 步骤 2：创建测试 .doc 文件（如果不存在）
echo "[步骤 2] 准备测试文件..."

if [ ! -f "$DOC_FILE" ]; then
    echo "❌ 测试文件不存在: $DOC_FILE"
    echo ""
    echo "请准备一个包含以下书签的 .doc 文件："
    echo "  - 主送单位"
    echo "  - 密级"
    echo "  - 拟稿人"
    echo "  - 拟稿日期"
    echo ""
    exit 1
fi

DOC_SIZE=$(stat -f%z "$DOC_FILE" 2>/dev/null || stat -c%s "$DOC_FILE")
echo "✓ 测试文件: $DOC_FILE ($DOC_SIZE 字节)"

echo ""

# 步骤 3：启动 LibreOffice（如果未运行）
echo "[步骤 3] 启动 LibreOffice Headless..."

if ! python3 -c "import socket; s = socket.socket(); s.connect(('127.0.0.1', 2002)); s.close()" 2>/dev/null; then
    echo "→ LibreOffice 不在线，启动..."
    soffice --headless --norestore --accept="socket,host=127.0.0.1,port=2002;urp;" &
    SOFFICE_PID=$!
    echo "  PID: $SOFFICE_PID"
    
    # 等待启动
    for i in {1..30}; do
        if python3 -c "import socket; s = socket.socket(); s.connect(('127.0.0.1', 2002)); s.close()" 2>/dev/null; then
            echo "✓ LibreOffice 已启动"
            break
        fi
        echo "  等待中... ($i/30)"
        sleep 1
    done
else
    echo "✓ LibreOffice 已在线"
fi

echo ""

# 步骤 4：运行书签填充
echo "[步骤 4] 填充书签..."

mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="$OUTPUT_DIR/filled_$(date +%s).doc"

# 准备书签值
BOOKMARK_JSON='{
    "主送单位": "中央人民政府",
    "密级": "秘密",
    "拟稿人": "张三",
    "拟稿日期": "2026-06-12",
    "分送单位": "省委、省政府",
    "保密期限": "30年"
}'

echo "书签值:"
echo "$BOOKMARK_JSON" | python3 -m json.tool | sed 's/^/  /'
echo ""

SCRIPT_PATH="packages/mainProj/src/app/api/oa-proxy/fill-bookmarks.py"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ 找不到脚本: $SCRIPT_PATH"
    exit 1
fi

python3 "$SCRIPT_PATH" "$DOC_FILE" "$BOOKMARK_JSON" --out "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ]; then
    OUTPUT_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE")
    echo "✓ 填充成功: $OUTPUT_FILE ($OUTPUT_SIZE 字节)"
else
    echo "❌ 输出文件未生成"
    exit 1
fi

echo ""

# 步骤 5：验证输出
echo "[步骤 5] 验证输出文件..."

# 检查文件大小是否合理
if [ $OUTPUT_SIZE -lt 1000 ]; then
    echo "⚠ 警告：输出文件过小，可能有问题"
else
    echo "✓ 文件大小合理"
fi

# 尝试转为 PDF 来验证内容
echo ""
echo "[步骤 6] 将输出文件转为 PDF 以验证..."

PDF_FILE="$OUTPUT_DIR/filled_$(date +%s).pdf"

if libreoffice --headless --convert-to pdf --outdir "$OUTPUT_DIR" "$OUTPUT_FILE" 2>&1 | grep -q "convert"; then
    if [ -f "$PDF_FILE" ]; then
        PDF_SIZE=$(stat -f%z "$PDF_FILE" 2>/dev/null || stat -c%s "$PDF_FILE")
        echo "✓ PDF 生成成功: $PDF_FILE ($PDF_SIZE 字节)"
    else
        # 可能文件名不同，查找最新的 PDF
        LATEST_PDF=$(ls -t "$OUTPUT_DIR"/*.pdf 2>/dev/null | head -1)
        if [ -n "$LATEST_PDF" ]; then
            echo "✓ PDF 生成成功: $LATEST_PDF"
        fi
    fi
fi

echo ""
echo "============================================"
echo "✓ 测试完成！"
echo "============================================"
echo ""
echo "输出文件位置: $OUTPUT_DIR"
echo ""
echo "后续步骤："
echo "1. 打开 $OUTPUT_FILE 验证书签是否被正确替换"
echo "2. 检查文档格式和样式是否保留"
echo "3. 如有问题，查看 LIBREOFFICE_SETUP.md 的故障排查部分"
echo ""
