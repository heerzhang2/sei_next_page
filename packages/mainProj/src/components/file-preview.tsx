'use client'

import React, { useMemo } from 'react'
import { Download, File, FileImage, FileVideo, FileText, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

export interface FileStore {
    name: string
    url: string
    mimeType?: string
}

interface FilePreviewProps {
    file: FileStore
    ossEndpoint?: string
    maxWidth?: string
    maxHeight?: string
}

// MIME 类型分类
const MIME_TYPES = {
    // 图片类型
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    // 视频类型
    videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    // PDF
    pdf: ['application/pdf'],
    // 音频
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
    // 文档
    documents: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
}

// 根据文件名获取 MIME 类型
export const getMimeTypeFromFile = (file: FileStore): string | null => {
    if (file.mimeType) {
        return file.mimeType
    }

    // 从文件名扩展名推断
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeTypeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogv: 'video/ogg',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
        mkv: 'video/x-matroska',
        pdf: 'application/pdf',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    }

    return mimeTypeMap[extension || ''] || null
}

// 判断文件类型
const getFileType = (mimeType: string | null): string => {
    if (!mimeType) return 'other'

    if (MIME_TYPES.images.includes(mimeType)) return 'image'
    if (MIME_TYPES.videos.includes(mimeType)) return 'video'
    if (MIME_TYPES.pdf.includes(mimeType)) return 'pdf'
    if (MIME_TYPES.audio.includes(mimeType)) return 'audio'
    if (MIME_TYPES.documents.includes(mimeType)) return 'document'

    return 'other'
}

// 获取合适的文件图标
const getFileIcon = (fileType: string, className = 'w-8 h-8') => {
    switch (fileType) {
        case 'image':
            return <FileImage className={className} />
        case 'video':
            return <FileVideo className={className} />
        case 'pdf':
            return <FileText className={`${className} text-red-500`} />
        case 'audio':
            return <FileText className={`${className} text-blue-500`} />
        case 'document':
            return <FileText className={`${className} text-blue-600`} />
        default:
            return <File className={className} />
    }
}

// 图片预览组件
const ImagePreview: React.FC<{ file: FileStore; maxWidth?: string; maxHeight?: string }> = ({
                                                                                                file,
                                                                                                maxWidth = '300px',
                                                                                                maxHeight = '300px',
                                                                                            }) => {
    const [imageError, setImageError] = React.useState(false)

    if (imageError) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg" style={{ maxWidth, maxHeight }}>
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-sm text-gray-600">图片加载失败</p>
                <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                >
                    点击下载
                </a>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <img
                src={file.url || "/placeholder.svg"}
                alt={file.name}
                onError={() => setImageError(true)}
                style={{ maxWidth, maxHeight }}
                className="rounded-lg border border-gray-200 shadow-sm object-contain"
            />
            <p className="text-xs text-gray-600 text-center break-all">{file.name}</p>
        </div>
    )
}

// 视频预览组件
const VideoPreview: React.FC<{ file: FileStore; maxWidth?: string }> = ({ file, maxWidth = '400px' }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <video
                controls
                style={{ maxWidth }}
                className="rounded-lg border border-gray-200 shadow-sm"
            >
                <source src={file.url} type={file.mimeType || 'video/mp4'} />
                您的浏览器不支持此视频格式
            </video>
            <p className="text-xs text-gray-600 text-center break-all">{file.name}</p>
        </div>
    )
}

// 音频预览组件
const AudioPreview: React.FC<{ file: FileStore }> = ({ file }) => {
    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-full bg-gray-100 rounded-lg p-4 border border-gray-200">
                <audio
                    controls
                    className="w-full"
                >
                    <source src={file.url} type={file.mimeType || 'audio/mpeg'} />
                    您的浏览器不支持此音频格式
                </audio>
            </div>
            <p className="text-xs text-gray-600 text-center break-all">{file.name}</p>
        </div>
    )
}

// PDF 预览组件
const PDFPreview: React.FC<{ file: FileStore; maxWidth?: string }> = ({ file, maxWidth = '400px' }) => {
    return (
        <div className="flex flex-col items-center gap-3" style={{ maxWidth }}>
            <div className="flex items-center justify-center w-full bg-red-50 rounded-lg p-6 border-2 border-red-200">
                <FileText className="w-12 h-12 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-700 text-center break-all">{file.name}</p>
            <Button
                asChild
                variant="default"
                size="sm"
                className="w-full gap-2"
            >
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                    预览 / 下载
                </a>
            </Button>
        </div>
    )
}

// 文档预览组件
const DocumentPreview: React.FC<{ file: FileStore }> = ({ file }) => {
    const getDocumentTypeLabel = (mimeType?: string): string => {
        if (!mimeType) return '文档'
        if (mimeType.includes('word')) return 'Word 文档'
        if (mimeType.includes('spreadsheet')) return '电子表格'
        if (mimeType.includes('presentation')) return '演示文稿'
        return '文档'
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-24 h-24 bg-blue-50 rounded-lg border-2 border-blue-200">
                <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{getDocumentTypeLabel(file.mimeType)}</p>
                <p className="text-xs text-gray-500 break-all">{file.name}</p>
            </div>
            <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full gap-2"
            >
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                    下载
                </a>
            </Button>
        </div>
    )
}

// 其他文件预览组件
const OtherFilePreview: React.FC<{ file: FileStore }> = ({ file }) => {
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '文件'

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-300">
                <File className="w-12 h-12 text-gray-600" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{fileExtension} 文件</p>
                <p className="text-xs text-gray-500 break-all max-w-xs">{file.name}</p>
            </div>
            <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full gap-2"
            >
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                    下载
                </a>
            </Button>
        </div>
    )
}

// 主组件
export const FilePreview: React.FC<FilePreviewProps> = ({
                                                            file,
                                                            ossEndpoint,
                                                            maxWidth = '300px',
                                                            maxHeight = '300px',
                                                        }) => {
    const mimeType = useMemo(() => getMimeTypeFromFile(file), [file])
    const fileType = useMemo(() => getFileType(mimeType), [mimeType])

    // 验证文件 URL
    if (!file?.url) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <p className="text-sm text-gray-600">无效的文件地址</p>
            </div>
        )
    }
    const ossFile={...file, url: ossEndpoint+"/"+file.url }
    return (
        <div className="flex justify-center items-center">
            {fileType === 'image' && (
                <ImagePreview file={ossFile} maxWidth={maxWidth} maxHeight={maxHeight} />
            )}
            {fileType === 'video' && (
                <VideoPreview file={ossFile} maxWidth={maxWidth} />
            )}
            {fileType === 'audio' && (
                <AudioPreview file={ossFile} />
            )}
            {fileType === 'pdf' && (
                <PDFPreview file={ossFile} maxWidth={maxWidth} />
            )}
            {fileType === 'document' && (
                <DocumentPreview file={ossFile} />
            )}
            {fileType === 'other' && (
                <OtherFilePreview file={ossFile} />
            )}
        </div>
    )
}

export default FilePreview
