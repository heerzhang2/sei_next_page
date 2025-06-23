"use client"

import {useState, useRef} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Textarea} from "@/components/ui/textarea"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {usePageMarkinfo, usePrintPdf} from "@/hooks/usePrintPdf";
import {createPdfJob} from "@/report/footer/job";

export interface OutlineItem {
    title: string
    page: number
    level: number
    elementId?: string
    hasChildren?: boolean
    isOpen?: boolean
}

interface PdfOutlineAnalyzerProps {
    rep?: any,
    original?: boolean
}

export default function PdfOutlineAnalyzer({rep, original}: PdfOutlineAnalyzerProps) {
    const pdf_job = createPdfJob(rep, original);
    const [htmlContent, setHtmlContent] = useState(`
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
            const response = await fetch("http://localhost:9389/api/pageSeq", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic YWRtaW46Q2VyNmpzJGt3OWUwV2E=",
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

    const [isMutating, handleSubmit, outlineData2] = usePageMarkinfo(pdf_job)

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

                            <Button onClick={handleSubmit} disabled={isAnalyzing || !pdfFile}
                                    className="w-full">
                                {isAnalyzing ? "分析中..." : "📄 分析PDFhandleSubmit大纲"}
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
                                {pdfInfo.hasOutline ? <Badge variant="default">是</Badge> :
                                    <Badge variant="secondary">否</Badge>}
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
