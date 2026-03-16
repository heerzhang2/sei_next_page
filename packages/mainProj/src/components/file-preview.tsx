'use client'

import React, { useMemo } from 'react'
import { Download, File, FileImage, FileVideo, FileText, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import {ImageComponentNatural} from "@/components/natural";

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
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/avif'],
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
    //在OSS没提供的情况下：从文件名扩展名推断
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
                    download={file.name}
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
const AudioPreview: React.FC<{ file: FileStore; minWidth?: string }> = ({
                                                                            file,
                                                                            minWidth = '300px' // 设置默认最小宽度，与 VideoPreview 的 maxWidth 一致
                                                                        }) => {
    return (
        <div
            className="flex flex-col items-center gap-2 w-full"
            style={{ minWidth }} // 应用 minWidth 样式
        >
            <div className="w-full bg-gray-100 rounded-lg p-4 border border-gray-200">
                <audio controls className="w-full">
                    <source src={file.url} type={file.mimeType || 'audio/mpeg'} />
                    您的浏览器不支持此音频格式
                </audio>
            </div>
            <p className="text-xs text-gray-600 text-center break-all">{file.name}</p>
        </div>
    )
}
// PDF 预览组件
const PDFPreview: React.FC<{ file: FileStore; maxWidth?: string }> = ({ file, maxWidth = '100%' }) => {
    return (
        <div
            className="flex items-center gap-2 p-2 bg-red-50 rounded-md border border-red-200 w-full min-w-80"
            style={{ maxWidth }} // 保留 maxWidth 的控制
        >
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-red-100 rounded border border-red-300">
                <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-grow flex flex-col min-w-0">
                <span className="text-xs text-gray-700 break-words text-left">
                    {file.name}
                </span>
                <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="flex justify-center items-center p-0 mt-1 h-auto text-xs text-blue-600 hover:text-blue-800"
                >
                    <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download className="w-3 h-3 flex-shrink-0" />
                        预览 / 下载
                    </a>
                </Button>
            </div>
        </div>
    )
}
// 文档预览组件
const DocumentPreview: React.FC<{ file: FileStore }> = ({ file }) => {
    const getDocumentTypeLabel = (mimeType?: string): string => {
        if (!mimeType) return '文档'
        if (mimeType.includes('word')) return 'Word'
        if (mimeType.includes('spreadsheet')) return '表格'
        if (mimeType.includes('presentation')) return '演示'
        return '文档'
    }

    // 简化标签以适应水平布局
    const simplifiedLabel = getDocumentTypeLabel(file.mimeType);

    return (
        // 主容器：水平排列，有内边距和边框
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 w-full">

            {/* 图标容器：固定大小 */}
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-50 rounded border border-blue-200">
                <FileText className="w-6 h-6 text-blue-600" />
            </div>

            {/* 信息和按钮容器：占据剩余空间，内部纵向排列 */}
            <div className="flex-grow flex flex-col min-w-0">

                {/* 文件类型和名称 */}
                <div className="flex-grow flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap truncate">
                        {simplifiedLabel}
                    </span>
                    <span className="text-xs text-gray-500 break-words text-left">
                         {file.name}
                    </span>
                </div>

                {/* 下载按钮：居中显示 */}
                <Button
                    asChild
                    variant="link"
                    size="sm"
                    // 核心：使用 flex 布局使其内容居中
                    className="flex justify-center items-center p-0 mt-1 h-auto text-xs text-blue-600 hover:text-blue-800"
                >
                    <a href={file.url} download={file.name} rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download className="w-3 h-3 flex-shrink-0" />
                        下载
                    </a>
                </Button>
            </div>
        </div>
    )
}
// 其他文件预览组件
const OtherFilePreview: React.FC<{ file: FileStore }> = ({ file }) => {
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '文件'
    return (
        // 主容器：水平排列，紧凑，有内边距和边框
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 w-full">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gray-100 rounded border border-gray-300">
                <File className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-grow flex flex-col min-w-0">
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap truncate">
                        {fileExtension} 文件
                    </span>
                    <span className="text-xs text-gray-500 break-words text-left">
                        {file.name}
                    </span>
                </div>
                <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="flex justify-center items-center p-0 mt-1 h-auto text-xs text-blue-600 hover:text-blue-800"
                >
                    <a href={file.url} download={file.name} rel="noopener noreferrer" className="flex items-center gap-1">
                        <Download className="w-3 h-3 flex-shrink-0" />
                        下载
                    </a>
                </Button>
            </div>
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
    const ossFile = { ...file, url: ossEndpoint ? `${ossEndpoint}/${file.url}` : file.url }
        //图片不用 <ImagePreview file={ossFile} maxWidth={maxWidth} maxHeight={maxHeight}/>
    return (
        <div className="flex justify-center items-center">
            {fileType === 'image' && (
                <ImageComponentNatural src={ossFile.url} alt={ossFile.name}/>
            )}
            {fileType === 'video' && (
                <VideoPreview file={ossFile} maxWidth={maxWidth} />
            )}
            {fileType === 'audio' && (
                <AudioPreview file={ossFile} />
            )}
            {fileType === 'pdf' && (
                <PDFPreview file={ossFile} maxWidth={'200px'} />
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
