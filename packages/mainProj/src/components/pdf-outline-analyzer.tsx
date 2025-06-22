"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OutlineItem {
  title: string
  page: number
  level: number
  elementId?: string
  hasChildren?: boolean
  isOpen?: boolean
}

export default function PdfOutlineAnalyzer() {
  const [htmlContent, setHtmlContent] = useState(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 20px; 
      line-height: 1.6;
    }
    
    /* 标题样式 */
    h1 { 
      color: #2c3e50; 
      border-bottom: 3px solid #3498db; 
      padding-bottom: 10px; 
      margin-top: 30px;
    }
    
    h2 { 
      color: #34495e; 
      border-left: 4px solid #e74c3c; 
      padding-left: 15px; 
      margin-top: 25px;
    }
    
    h3 { 
      color: #7f8c8d; 
      margin-top: 20px;
    }
    
    h4, h5, h6 { 
      color: #95a5a6; 
      margin-top: 15px;
    }
    
    .content-section {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    
    .spacer {
      height: 200px;
      background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
      margin: 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #7f8c8d;
      border-radius: 5px;
    }
    
    /* 打印样式 */
    @media print {
      body { margin: 0; padding: 20px; }
      .spacer { height: 150px; }
      h1 { page-break-before: auto; }
      h2 { page-break-before: avoid; }
    }
  </style>
</head>
<body>
  <h1 id="introduction">1. 项目介绍</h1>
  <div class="content-section">
    <p>这是一个基于PDF大纲功能的页面定位系统演示文档。通过利用PDF的outline特性，我们可以精确获取各个标题在PDF中的页码位置。</p>
    <p>这种方法比DOM分析更直接、更准确，因为它直接使用了PDF生成时创建的导航结构。</p>
  </div>
  
  <div class="spacer">内容填充区域 A</div>
  
  <h2 id="technical-overview">2. 技术概述</h2>
  <div class="content-section">
    <p>PDF大纲（Outline/Bookmarks）是PDF文档的内置导航功能，它记录了文档中各个章节标题及其对应的页面位置。</p>
  </div>
  
  <h3 id="core-features">2.1 核心特性</h3>
  <div class="content-section">
    <ul>
      <li>直接从PDF大纲提取页码信息</li>
      <li>支持多级标题结构</li>
      <li>自动识别元素ID</li>
      <li>100%准确的页面定位</li>
    </ul>
  </div>
  
  <h4 id="advantages">2.1.1 技术优势</h4>
  <div class="content-section">
    <p>相比DOM分析方法，PDF大纲方法具有以下优势：</p>
    <ul>
      <li>无需复杂的页面高度计算</li>
      <li>自动处理分页和布局变化</li>
      <li>支持所有PDF查看器的导航功能</li>
    </ul>
  </div>
  
  <div class="spacer">内容填充区域 B</div>
  
  <h2 id="implementation">3. 实现方案</h2>
  <div class="content-section">
    <p>实现步骤包括：PDF生成时启用outline选项，使用pdf-lib提取大纲信息，解析标题与页码的对应关系。</p>
  </div>
  
  <h3 id="pdf-generation">3.1 PDF生成配置</h3>
  <div class="content-section">
    <pre><code>await page.pdf({
  outline: true,  // 启用大纲生成
  tagged: true,   // 生成标记PDF
  // 其他配置...
});</code></pre>
  </div>
  
  <h3 id="outline-extraction">3.2 大纲信息提取</h3>
  <div class="content-section">
    <p>使用pdf-lib库解析PDF大纲结构，提取标题文本和对应的页码信息。</p>
  </div>
  
  <h4 id="data-structure">3.2.1 数据结构</h4>
  <div class="content-section">
    <p>大纲数据包含标题文本、页码、层级和可选的元素ID信息。</p>
  </div>
  
  <div class="spacer">内容填充区域 C</div>
  
  <h2 id="use-cases">4. 应用场景</h2>
  <div class="content-section">
    <p>这种方法特别适用于需要精确页面定位的场景。</p>
  </div>
  
  <h3 id="document-navigation">4.1 文档导航</h3>
  <div class="content-section">
    <p>为长文档提供快速导航功能，用户可以直接跳转到指定章节。</p>
  </div>
  
  <h3 id="content-indexing">4.2 内容索引</h3>
  <div class="content-section">
    <p>自动生成文档目录和索引，提高文档的可读性和可用性。</p>
  </div>
  
  <h4 id="automated-processing">4.2.1 自动化处理</h4>
  <div class="content-section">
    <p>支持批量文档处理，自动提取所有文档的结构信息。</p>
  </div>
  
  <div class="spacer">内容填充区域 D</div>
  
  <h2 id="conclusion">5. 总结</h2>
  <div class="content-section">
    <p>基于PDF大纲的页面定位方法提供了一种简单、准确、高效的解决方案。它充分利用了PDF格式的内置特性，避免了复杂的DOM分析和页面计算。</p>
  </div>
  
  <h3 id="future-work">5.1 未来发展</h3>
  <div class="content-section">
    <p>未来可以进一步扩展功能，支持更复杂的文档结构和交互式导航。</p>
  </div>
</body>
</html>
  `)

  const [outlineData, setOutlineData] = useState<OutlineItem[]>([])
  const [pdfInfo, setPdfInfo] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 生成PDF并提取大纲
  const generatePdfAndExtractOutline = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/pdf-outline-extractor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlContent,
          headerTemplate: `
            <div style="font-size: 10px; padding: 5px; width: 100%; text-align: center; color: #666;">
              <span>PDF大纲分析演示 - 第 <span class="pageNumber"></span> 页</span>
            </div>
          `,
          footerTemplate: `
            <div style="font-size: 10px; padding: 5px; width: 100%; text-align: center; color: #666;">
              <span>生成时间: <span class="date"></span></span>
            </div>
          `,
          fontcssHead: `<style>body { font-family: Arial, sans-serif; }</style>`,
          pdfOptions: {
            printBackground: true,
            margin: {
              top: "25mm",
              right: "20mm",
              bottom: "25mm",
              left: "20mm",
            },
          },
          extractElementIds: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setOutlineData(result.outline)
        setPdfInfo(result.pdfInfo)

        // 下载生成的PDF
        if (result.pdfBase64) {
          const pdfBlob = new Blob([Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0))], {
            type: "application/pdf",
          })

          const url = window.URL.createObjectURL(pdfBlob)
          const a = document.createElement("a")
          a.href = url
          a.download = "outline-analysis-demo.pdf"
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      } else {
        console.error("大纲提取失败:", result.error)
      }
    } catch (error) {
      console.error("请求失败:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 分析现有PDF的大纲
  const analyzeExistingPdfOutline = async () => {
    if (!pdfFile) {
      alert("请先上传PDF文件")
      return
    }

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append("pdf", pdfFile)

      const response = await fetch("/api/analyze-existing-pdf-outline", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setOutlineData(result.outline)
        setPdfInfo(result.pdfInfo)
      } else {
        console.error("现有PDF大纲分析失败:", result.error)
      }
    } catch (error) {
      console.error("请求失败:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 渲染大纲树结构
  const renderOutlineTree = (items: OutlineItem[]) => {
    return items.map((item, index) => (
      <div key={index} className={`ml-${(item.level - 1) * 4} py-1`}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            H{item.level}
          </Badge>
          <span className="font-medium">{item.title}</span>
          <Badge variant="secondary" className="ml-auto">
            第 {item.page} 页
          </Badge>
          {item.elementId && (
            <Badge variant="outline" className="text-xs">
              #{item.elementId}
            </Badge>
          )}
        </div>
      </div>
    ))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF大纲页面定位分析器</CardTitle>
          <p className="text-sm text-muted-foreground">
            利用PDF的outline特性直接获取标题页码，最简单、最准确的页面定位方案
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>核心优势：</strong>
              1. 直接使用PDF内置的大纲功能 2. 无需复杂的DOM分析和页面计算 3. 100%准确的页码定位 4.
              支持所有PDF查看器的导航功能
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">生成PDF并分析</TabsTrigger>
              <TabsTrigger value="analyze">分析现有PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <Button onClick={generatePdfAndExtractOutline} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? "生成并分析中..." : "🎯 生成PDF并提取大纲信息"}
              </Button>
            </TabsContent>

            <TabsContent value="analyze" className="space-y-4">
              <div className="space-y-2">
                <Label>上传PDF文件</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button onClick={analyzeExistingPdfOutline} disabled={isAnalyzing || !pdfFile} className="w-full">
                {isAnalyzing ? "分析中..." : "📄 分析PDF大纲"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* PDF信息 */}
      {pdfInfo && (
        <Card>
          <CardHeader>
            <CardTitle>PDF信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>文件大小:</strong> {Math.round((pdfInfo.size || 0) / 1024)}KB
              </div>
              <div>
                <strong>总页数:</strong> {pdfInfo.totalPages || "未知"}
              </div>
              <div>
                <strong>包含大纲:</strong>{" "}
                {pdfInfo.hasOutline ? <Badge variant="default">是</Badge> : <Badge variant="secondary">否</Badge>}
              </div>
              <div>
                <strong>标题数量:</strong> {outlineData.length}
              </div>
              {pdfInfo.title && (
                <div className="col-span-2">
                  <strong>文档标题:</strong> {pdfInfo.title}
                </div>
              )}
              {pdfInfo.author && (
                <div className="col-span-2">
                  <strong>作者:</strong> {pdfInfo.author}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 大纲分析结果 */}
      {outlineData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 表格视图 */}
          <Card>
            <CardHeader>
              <CardTitle>大纲表格视图</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>层级</TableHead>
                    <TableHead>页码</TableHead>
                    <TableHead>元素ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outlineData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">H{item.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">第 {item.page} 页</Badge>
                      </TableCell>
                      <TableCell>
                        {item.elementId ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            #{item.elementId}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 树形视图 */}
          <Card>
            <CardHeader>
              <CardTitle>大纲树形视图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto">{renderOutlineTree(outlineData)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HTML编辑器 */}
      <Card>
        <CardHeader>
          <CardTitle>HTML内容编辑器</CardTitle>
          <p className="text-sm text-muted-foreground">包含多级标题结构的演示文档，用于测试PDF大纲功能</p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={25}
            className="font-mono text-sm"
            placeholder="输入包含标题结构的HTML内容..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
