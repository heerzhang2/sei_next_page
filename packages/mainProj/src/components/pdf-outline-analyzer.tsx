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

interface OutlineItem {
    title: string
    page: number
    level: number
}
export interface OutlineData {
    outline: OutlineItem[]
    totalPages: number
    title: string
}

interface PdfOutlineAnalyzerProps {
    rep?: any,
    original?: boolean
}

export default function PdfOutlineAnalyzer({rep, original}: PdfOutlineAnalyzerProps) {
    const pdf_job = createPdfJob(rep, original);
    const [htmlContent, setHtmlContent] = useState(`
  `)
    // const [outlineData, setOutlineData] = useState<OutlineData|null>(null)
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
                    extractElementIds: true,
                }),
            })

            const result = await response.json()
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
                </div>
            </div>
        ))
    }

    const [isGetMarking, handleSubmit, outlineData] = usePageMarkinfo(pdf_job)

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

                            <Button onClick={handleSubmit} disabled={isGetMarking}
                                    className="w-full">
                                {isGetMarking ? "分析中..." : "📄 分析PDF==handleSubmit==大纲"}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* PDF信息 */}
            {outlineData && (
                <Card>
                    <CardHeader>
                        <CardTitle>PDF信息</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <strong>总页数:</strong> {outlineData.totalPages || "未知"}
                            </div>
                            <div>
                                <strong>包含大纲:</strong>{" "}
                                {outlineData.title ? <Badge variant="default">是</Badge> :
                                    <Badge variant="secondary">否</Badge>}
                            </div>
                            <div>
                                <strong>标题数量:</strong> {outlineData?.outline?.length}
                            </div>
                            {outlineData.title && (
                                <div className="col-span-2">
                                    <strong>文档标题:</strong> {outlineData.title}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 大纲分析结果 */}
            {outlineData?.outline?.length! > 0 && (
                <div className="grid grid-cols-1 gap-6">
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outlineData?.outline?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">H{item.level}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">第 {item.page} 页</Badge>
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
                            <div className="space-y-1 max-h-96 overflow-y-auto">{renderOutlineTree(outlineData?.outline)}</div>
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
