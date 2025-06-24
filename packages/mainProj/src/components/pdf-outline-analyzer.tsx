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
}

export default function PdfOutlineAnalyzer({rep}: PdfOutlineAnalyzerProps) {
    const pdf_job = createPdfJob(rep, true);
    const [pdfInfo, setPdfInfo] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    // const [pdfFile, setPdfFile] = useState<File | null>(null)

    // 渲染大纲树结构
    const renderOutlineTree = (items: OutlineItem[]) => {
        return items.map((item, index) => (
            <div key={index} className={`ml-${(item.level - 1) * 4} `}>
                <div className="flex items-center gap-0">
                    <span className="text-sm font-medium">{item.title}</span>
                    <Badge variant="secondary" className="ml-auto text-xs px-1 py-0">
                        第<span className="text-sm">{item.page}</span>页
                    </Badge>
                </div>
            </div>
        ))
    }
    const [isGetMarking, handleSubmit, outlineData] = usePageMarkinfo(pdf_job)

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="generate">报告的书签</TabsTrigger>
                    <TabsTrigger value="analyze">原始记录的书签</TabsTrigger>
                </TabsList>
                <TabsContent value="generate" className="space-y-4">
                    {outlineData?.outline?.length! > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>书签视图</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <strong>总页数:</strong> {outlineData!.totalPages || ""}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>标题:</strong> {outlineData!.title}
                                        </div>
                                    </div>
                                    <div className="space-y-0 max-h-96 overflow-y-auto">{renderOutlineTree(outlineData!.outline)}</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <Button onClick={handleSubmit} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? "分析中..." : "🎯 提取书签信息"}
                    </Button>
                </TabsContent>
                <TabsContent value="analyze" className="space-y-4">
                    {outlineData?.outline?.length! > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>书签视图</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <strong>总页数:</strong> {outlineData!.totalPages || ""}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>标题:</strong> {outlineData!.title}
                                        </div>
                                    </div>
                                    <div className="space-y-0 max-h-96 overflow-y-auto">{renderOutlineTree(outlineData!.outline)}</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <Button onClick={handleSubmit} disabled={isGetMarking}
                            className="w-full">
                        {isGetMarking ? "分析中..." : "📄 提取书签信息"}
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    )
}
