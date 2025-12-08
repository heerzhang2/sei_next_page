"use client"
import * as React from "react"
import Uppy from "@uppy/core"
import Tus from "@uppy/tus"
import XHRUpload from "@uppy/xhr-upload"
import Webcam from "@uppy/webcam"
import useOssDeleteFileMutation from "../../hooks/useOssDeleteFileMutation"
import Dashboard from "@uppy/react/dashboard"
import "@uppy/core/css/style.min.css"
import "@uppy/dashboard/css/style.min.css"
import "@uppy/webcam/css/style.min.css"
import "./uppy-fixes.css"
import { getAuthToken } from "@/lib/auth-token"
import { Button } from "@/components/ui"
import { FilePreview } from "@/components/file-preview"
import { useCallback, useRef } from "react"
import { toast } from "sonner"
import type { UppyStateSnapshot } from "@/lib/file-operations-queue"
import zh_CN from "@uppy/locales/lib/zh_CN.js"
import {verifyPermission} from "@/report/hook/useOfflineUppyUpload"
import { createFile } from 'mp4box'

// 辅助函数：将 ArrayBuffer 转换回 File 对象
const arrayBufferToFile = (
    arrayBuffer: ArrayBuffer,
    fileName: string,
    fileType: string,
    lastModified?: number,
): File => {
    const blob = new Blob([arrayBuffer], { type: fileType })
    return new File([blob], fileName, {
        type: fileType,
        lastModified: lastModified || Date.now(),
    })
}
// 从文件句柄恢复 File 对象
const restoreFileFromHandle = async (fileHandleData: any): Promise<File | null> => {
    //ds自动生成的.handle 有缺陷啊，需改成.fileHandle
    if (!fileHandleData?.fileHandle) {
        console.warn("[OfflineUppy] No file handle provided")
        return null
    }
    try {
        console.log("[OfflineUppy] Verifying file handle permissions...")
        // 验证权限 ds重复犯同一个错误:自动生成的.handle 需改成.fileHandle
        const hasPermission = await verifyPermission(fileHandleData.fileHandle)
        if (!hasPermission) {
            console.warn("[OfflineUppy] No permission to access saved file handle")
            // 尝试重新请求权限
            try {
                //ds生成的.handle 需改成.fileHandle
                const permission = await fileHandleData.fileHandle.requestPermission({ mode: "read" })
                if (permission !== "granted") {
                    console.warn("[OfflineUppy] User denied permission after re-request")
                    return null
                }
            } catch (permissionError) {
                console.error("[OfflineUppy] Error requesting permission:", permissionError)
                return null
            }
        }
        console.log("[OfflineUppy] Getting file from handle...")
        const file = await fileHandleData.fileHandle.getFile()
        if (!file) {
            console.warn("[OfflineUppy]句柄恢复无效的？")
            return null
        }
        console.log("[OfflineUppy] Successfully restored file from handle:", file.name, file.size, file.type)
        return file
    } catch (error) {
        console.error("[OfflineUppy] Failed to restore file from handle:", error)
        return null
    }
}
// 提取的文件恢复逻辑函数
const restoreFileFromSnapshot = async (
    fileData: any,
    uppyInstance: Uppy,
    eid: string,
    business: string,
    liveDays: number
): Promise<{ restored: boolean; fromHandle: boolean }> => {
    try {
        console.log(`[OfflineUppy] Processing file: ${fileData.name}`, {
            hasHandle: !!fileData.fileHandle,
            isHandleMode: fileData.isHandleMode,
            hasData: !!fileData.data,
            hasFileMeta: !!fileData.meta,
        })

        // 加强重复检查
        const existingFiles = uppyInstance.getFiles()
        const isDuplicate = existingFiles.some(
            (file) =>
                file.name === fileData.name &&
                file.size === fileData.size &&
                // 额外检查：如果文件已经成功上传，则视为重复
                (file.progress?.uploadComplete || file.progress?.percentage === 100),
        )

        if (isDuplicate) {
            console.log(`[OfflineUppy] 跳过重复文件（已成功上传）: ${fileData.name}`)
            toast.warning("跳过重复文件", {
                description: `文件 "${fileData.name}" 已成功上传，跳过恢复`,
            })
            return { restored: false, fromHandle: false }
        }

        let fileToRestore: File | null = null
        let fromHandle = false

        // 优先从文件句柄恢复（文件句柄模式）
        if (fileData.fileHandle && fileData.isHandleMode) {
            console.log(`[OfflineUppy] Attempting to restore from handle: ${fileData.name}`)

            try {
                fileToRestore = await restoreFileFromHandle(fileData)
                console.log(`[OfflineUppy] Handle restoration result for ${fileData.name}:`, {
                    success: !!fileToRestore,
                    fileType: fileToRestore?.type,
                    fileSize: fileToRestore?.size,
                })
            } catch (handleError) {
                console.error(`[OfflineUppy] Handle restoration error for ${fileData.name}:`, handleError)
                return { restored: false, fromHandle: false }
            }

            if (fileToRestore) {
                fromHandle = true
                console.log("[OfflineUppy] Successfully restored file from handle:", fileData.name)

                // 修复：使用文件自身的 meta，不展开 snapshotMeta（避免包含 pendingDeleteOperations）
                const fileMeta = fileData.meta || {}
                const fileToAdd = {
                    id: fileData.id || `file-handle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                    name: fileData.name,
                    type: fileData.type,
                    data: fileToRestore,
                    size: fileData.size,
                    meta: {
                        // 只使用文件自身的 meta，不包含快照的顶层 meta
                        ...fileMeta,
                        fileHandle: fileData.fileHandle, // 保持文件句柄
                        relativePath: fileMeta.relativePath || "",
                        lastModified: fileMeta.lastModified || fileData.lastModified || Date.now(),
                        eid: fileMeta.eid || eid,
                        business: fileMeta.business || business,
                        liveDays: fileMeta.liveDays || liveDays,
                        isHandleMode: true, // 明确标记为句柄模式
                        // 不包含 pendingDeleteOperations
                    },
                }

                try {
                    // 先检查是否已存在相同文件
                    const existingFiles = uppyInstance.getFiles()
                    const isDuplicate = existingFiles.some((file) => file.name === fileData.name && file.size === fileData.size)
                    if (isDuplicate) {
                        console.log(`文件已存在列表中: ${fileData.name}`)
                        return { restored: false, fromHandle: true }
                    }
                    const result = uppyInstance.addFile(fileToAdd)
                    if (result) {
                        console.log(`[OfflineUppy] Successfully added file handle to Uppy: ${fileData.name}`)
                        return { restored: true, fromHandle: true }
                    } else {
                        console.error(`[OfflineUppy] Uppy addFile returned false for: ${fileData.name}`)
                        return { restored: false, fromHandle: false }
                    }
                } catch (addError: any) {
                    // 捕获 Uppy 的重复文件错误
                    if (addError.message && addError.message.includes("不允许添加")) {
                        console.warn(`[OfflineUppy] Duplicate file detected: ${fileData.name}`)
                        toast.warning("重复文件", {
                            description: `文件 "${fileData.name}" 已存在，跳过恢复`,
                        })
                        return { restored: false, fromHandle: true }
                    }
                    console.error(`[OfflineUppy] Failed to add file to Uppy: ${fileData.name}`, addError)
                    return { restored: false, fromHandle: false }
                }
            } else {
                console.warn(`[OfflineUppy] File handle restoration returned null for: ${fileData.name}`)
                return { restored: false, fromHandle: false }
            }
        }
        // 传统模式恢复
        else if (!fileData.isHandleMode && fileData.data) {
            console.log(`[OfflineUppy] Attempting traditional restore: ${fileData.name}`)

            if (fileData.data instanceof File) {
                fileToRestore = fileData.data
            } else if (fileData.data instanceof ArrayBuffer) {
                try {
                    fileToRestore = arrayBufferToFile(fileData.data, fileData.name, fileData.type, fileData.lastModified)
                } catch (error) {
                    console.warn("[OfflineUppy] Failed to convert file to ArrayBuffer, falling back to File:", error)
                    fileToRestore = fileData.data
                }
            }

            if (fileToRestore) {
                // 修复：使用文件自身的 meta
                const fileMeta = fileData.meta || {}
                const fileToAdd = {
                    id: fileData.id,
                    name: fileData.name,
                    type: fileData.type,
                    data: fileToRestore,
                    size: fileData.size,
                    meta: {
                        // 只使用文件自身的 meta
                        ...fileMeta,
                        relativePath: fileMeta.relativePath || "",
                        lastModified: fileMeta.lastModified || fileData.lastModified || Date.now(),
                        eid: fileMeta.eid || eid,
                        business: fileMeta.business || business,
                        liveDays: fileMeta.liveDays || liveDays,
                        isHandleMode: false,
                        // 不包含 pendingDeleteOperations
                    },
                }
                try {
                    const existingFiles = uppyInstance.getFiles()
                    const isDuplicate = existingFiles.some((file) => file.name === fileData.name && file.size === fileData.size)
                    if (isDuplicate) {
                        console.log(`文件已存在列表中: ${fileData.name}`)
                        return { restored: false, fromHandle: false }
                    }
                    const result = uppyInstance.addFile(fileToAdd)
                    if (result) {
                        console.log(`[OfflineUppy] Successfully added traditional file to Uppy: ${fileData.name}`)
                        return { restored: true, fromHandle: false }
                    } else {
                        console.error(`[OfflineUppy] Uppy addFile returned false for traditional file: ${fileData.name}`)
                        return { restored: false, fromHandle: false }
                    }
                } catch (addError: any) {
                    // 捕获 Uppy 的重复文件错误
                    if (addError.message && addError.message.includes("不允许添加")) {
                        console.warn(`[OfflineUppy] Duplicate file detected: ${fileData.name}`)
                        toast.warning("重复文件", {
                            description: `文件 "${fileData.name}" 已存在，跳过恢复`,
                        })
                        return { restored: false, fromHandle: false }
                    }
                    console.error(`[OfflineUppy] Failed to add traditional file to Uppy: ${fileData.name}`, addError)
                    return { restored: false, fromHandle: false }
                }
            }
        } else {
            console.warn(`[OfflineUppy] File cannot be restored - no valid data: ${fileData.name}`, {
                hasHandle: !!fileData.fileHandle,
                isHandleMode: fileData.isHandleMode,
                hasData: !!fileData.data,
                hasMeta: !!fileData.meta,
            })
        }
    } catch (error) {
        console.error("[OfflineUppy] Failed to restore file:", fileData.name, error)
    }

    return { restored: false, fromHandle: false }
}
// 在组件外部定义语言配置常量
export const UPPY_LOCALE_CONFIG = {
    strings: {
        cancel: "还是取消",
        failedToUpload: "上传失败 %{file}",
        exceedsSize: "%{file} 大小超 %{size} 限制",
        youCanOnlyUploadX: {
            0: "只能传 %{smart_count} 个文件",
            1: "只能传 %{smart_count} 个文件",
        },
        noDuplicates: "同一个文件 '%{fileName}',不允许添加",
    },
}
export const DASH_LOCALE_CONFIG = {
    strings: {
        browseFiles: "选文件",
        dropPasteFiles: "文件拖进来或 %{browseFiles}",
        addMore: "增加更多",
        xFilesSelected: {
            0: "已选择 %{smart_count} 个",
            1: "已选择 %{smart_count} 个",
        },
        uploadXFiles: {
            0: "上传 %{smart_count}个 文件",
            1: "上传 %{smart_count}个 文件",
        },
        addingMoreFiles: "加更多",
        retry: "努力再试",
        uploadFailed: "失败,可能后端或存储系统问题",
        uploadingXFiles: {
            0: "在传 %{smart_count} 个文件",
            1: "在传 %{smart_count} 个文件",
        },
        filesUploadedOfTotal: {
            0: "合计%{smart_count}个 完成 %{complete} 个",
            1: "合计%{smart_count}个 完成 %{complete} 个",
        },
        upload: "上传",
        uploading: "努力上传中",
        uploadPaused: "暂停上传",
        paused: "暂停",
        resume: "恢复上传",
        uploadComplete: "恭喜干完了",
        complete: "完事",
        done: "返回",
        back: "返回",
        uploadXNewFiles: {
            0: "添加 %{smart_count} 个文件",
            1: "添加 %{smart_count} 个文件",
        },
    },
}

export type FileStore = {
    name: string
    url: string
    mimeType?: string
}
// MP4Box.js 视频转换器类
class MP4BoxVideoConverter {
    constructor() {
        console.log('[MP4Box] 使用ES模块导入，无需动态加载');
    }

    async convertMovToMp4(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            try {
                const mp4box = createFile();
                const arrayBuffer = this.fileToArrayBuffer(file);
                arrayBuffer.fileStart = 0;

                mp4box.onError = (error: any) => {
                    console.error('[MP4Box] 转换错误:', error);
                    reject(new Error(`MP4Box转换失败: ${error}`));
                };

                mp4box.onReady = (info: any) => {
                    console.log('[MP4Box] 视频信息:', info);
                    
                    // 检查是否需要重新编码
                    const needsReencoding = this.checkIfNeedsReencoding(info);
                    
                    if (!needsReencoding) {
                        // 仅容器转换 - 快速且无损
                        this.performContainerConversion(mp4box, file, arrayBuffer, resolve, reject);
                    } else {
                        // 需要重新编码 - 使用服务器转换
                        reject(new Error('VIDEO_NEEDS_REENCODING'));
                    }
                };

                mp4box.appendBuffer(arrayBuffer);
                mp4box.flush();

            } catch (error) {
                reject(error);
            }
        });
    }

    private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    private checkIfNeedsReencoding(info: any): boolean {
        // 检查视频编码是否为H.264
        const videoTrack = info.tracks.find((track: any) => track.type === 'video');
        if (videoTrack) {
            const codec = videoTrack.codec;
            // 如果不是H.264编码，需要重新编码
            return !codec.includes('avc1') && !codec.includes('h264');
        }
        
        // 检查音频编码是否为AAC
        const audioTrack = info.tracks.find((track: any) => track.type === 'audio');
        if (audioTrack) {
            const codec = audioTrack.codec;
            // 如果不是AAC编码，需要重新编码
            return !codec.includes('mp4a') && !codec.includes('aac');
        }
        
        return false;
    }

    private performContainerConversion(
        mp4box: any, 
        originalFile: File, 
        arrayBuffer: ArrayBuffer,
        resolve: (file: File) => void, 
        reject: (error: Error) => void
    ): void {
        try {
            // 对于已经兼容的MOV文件，直接重命名为MP4
            // 因为大多数现代浏览器都支持MOV容器中的H.264/AAC编码
            setTimeout(() => {
                try {
                    // 验证文件确实可以被读取
                    const dataArray = new Uint8Array(arrayBuffer);
                    console.log(`[MP4Box] 文件大小: ${dataArray.length} bytes`);
                    
                    // 创建新的MP4文件
                    const mp4Blob = new Blob([arrayBuffer], { type: 'video/mp4' });
                    const mp4FileName = originalFile.name.replace(/\.mov$/i, '.mp4');
                    const mp4File = new File([mp4Blob], mp4FileName, {
                        type: 'video/mp4',
                        lastModified: Date.now()
                    });

                    console.log(`[MP4Box] 容器转换完成: ${originalFile.name} -> ${mp4FileName}`);
                    resolve(mp4File);
                } catch (error) {
                    reject(error);
                }
            }, 1000); // 短暂延迟以显示进度

        } catch (error) {
            reject(error);
        }
    }

    // 获取视频信息（用于决策）
    async getVideoInfo(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const mp4box = createFile();
                const arrayBuffer = this.fileToArrayBuffer(file);
                arrayBuffer.fileStart = 0;

                mp4box.onError = reject;
                mp4box.onReady = resolve;
                
                mp4box.appendBuffer(arrayBuffer);
                mp4box.flush();

            } catch (error) {
                reject(error);
            }
        });
    }
}

// 全局转换器实例
const mp4boxConverter = new MP4BoxVideoConverter();
const shouldConvertToMp4 = (file: any): boolean => {
    //[修正视频转换前提] 必须MOV
    if (!file.name.toLowerCase().endsWith('.mov')) {
        return false;
    }
    return true
}
// 截断文件名，保留后缀，总长度不超过15个字符
const truncateFileName = (fileName: string, maxLength: number = 15): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;
    if (fileName.length <= maxLength) {
        return fileName;
    }

    if (hasExtension) {
        const name = fileName.substring(0, lastDotIndex);
        const extension = fileName.substring(lastDotIndex);
        const maxNameLength = maxLength - extension.length;

        if (maxNameLength > 0) {
            return name.substring(0, maxNameLength) + extension;
        }
    }
    return fileName.substring(0, maxLength);
};
// 优化后的视频转换函数
const convertMovToMp4Real = async (file: any): Promise<any> => {
    // 如果不是 MOV 文件，直接返回原文件
    if (!file.name.toLowerCase().endsWith('.mov')) {
        console.log(`[v0] 非 MOV 文件，跳过转换: ${file.name}`);
        toast.info("不是 MOV 文件，直接返回", {
            description: `正在 ${file.name} 转换`,
            duration: 20000
        });
        return file;
    }

    const fileSizeMB = file.size / 1024 / 1024;
    console.log(`[v0] 开始处理 MOV 文件: ${file.name} (${fileSizeMB.toFixed(2)}MB)`);

    try {
        // 检查浏览器支持
        if (!window.WebAssembly) {
            throw new Error('浏览器不支持WebAssembly');
        }
        toast.info("leixing转的", {
            description: `正在将 ${file.type} 转换格式.  ${file.meta.type}`,
            duration: 30000
        });
        if(file.meta.type==="video/quicktime"){
            file.meta.type="video/mp4"
            // const originalName = file.name;
            file.name = truncateFileName(file.name, 15);
        }
        // 显示转换进度
        toast.info("视频--转换", {
            description: `正 ${file.type} 转换格式.  ${file.meta.type}`,
            duration: 30000
        });
        // 对于小文件（<50MB），直接尝试客户端转换
        if (fileSizeMB <= 1) {
            try {
                console.log(`[MP4Box] 尝试客户端转换: ${file.name}`);
                const convertedFile = await mp4boxConverter.convertMovToMp4(file.data);
                toast.success("转换完成", {description: `${file.name} 已成功转换为MP4格式`, duration: 15000});
                return {
                    ...file,
                    name: convertedFile.name,
                    type: 'video/mp4',
                    data: convertedFile,
                    size: convertedFile.size,
                    meta: {
                        ...file.meta,
                        converted: true,
                        conversionMethod: 'mp4box',
                        originalFormat: 'mov',
                        targetFormat: 'mp4'
                    }
                };
            } catch (error: any) {
                console.warn(`[MP4Box] 客户端转换失败: ${file.name}`, error);
                // 如果是编码问题，回退到服务器转换
                if (error.message === 'VIDEO_NEEDS_REENCODING') {
                    toast.info("需要服务器转换", {
                        description: `检测到 ${file.name} 需要重新编码，将在服务端完成转换`,
                        duration: 10000
                    });
                } else {
                    toast.warning("转换失败", {
                        description: `客户端转换失败，将使用后端去转换: ${error.message}`,
                        duration: 33000
                    });
                }
            }
        } else {
            // 大文件直接使用服务器转换
            toast.info("大文件处理", {
                description: `${file.name} 较大，将使用服务端转换以确保稳定性 meta.type= ${file.meta.type}`,
                duration: 25000
            });
        }
        // 回退到服务器转换方案
        const mp4FileName = file.name.replace(/\.mov$/i, '.mp4');
        const mp4File = new File([file.data], mp4FileName, {
            type: 'video/mp4',
            lastModified: Date.now()
        });

        return {
            ...file,
            name: mp4FileName,
            type: 'video/mp4',
            data: mp4File,
            size: mp4File.size,
            meta: {
                ...file.meta,
                needsServerConversion: true,
                originalType: file.type,
                targetFormat: 'mp4',
                conversionMethod: 'server',
                conversionRequired: true
            }
        };

    } catch (error: any) {
        console.error(`[v0] 视频转换处理失败: ${file.name}`, error);
        
        toast.error("转换失败", {
            description: `处理 ${file.name} 时出错: ${error.message}`,
            duration: 45000
        });

        // 转换失败时返回原文件
        return file;
    }
};

// 修正 MIME 类型的函数（全面版本）
const correctMimeType = (file: any): string => {
    const { name, type } = file
    
    // 如果没有 MIME 类型，返回默认值
    if (!type || type.trim() === '') {
        return "application/octet-stream"
    }
    
    // 移除分号后面的参数（如codecs、charset等）
    let cleanType = type
    const semicolonIndex = type.indexOf(';')
    if (semicolonIndex > 0) {
        cleanType = type.substring(0, semicolonIndex).trim()
    }
    
    // 转换为小写进行比较
    const lowerMimeType = cleanType.toLowerCase()
    
    // 常见文档类型映射
    const documentMimeMap: { [key: string]: string } = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        rtf: "application/rtf",
        txt: "text/plain",
        csv: "text/csv",
        html: "text/html",
        htm: "text/html",
        xml: "application/xml",
        json: "application/json"
    }
    
    // 视频类型映射
    const videoMimeMap: { [key: string]: string } = {
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
        webm: "video/webm",
        "3gp": "video/3gpp",
        flv: "video/x-flv",
        wmv: "video/x-ms-wmv",
        m4v: "video/mp4"
    }
    
    // 音频类型映射
    const audioMimeMap: { [key: string]: string } = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        m4a: "audio/mp4",
        flac: "audio/flac"
    }
    
    // 压缩文件类型映射
    const archiveMimeMap: { [key: string]: string } = {
        zip: "application/zip",
        rar: "application/x-rar-compressed",
        "7z": "application/x-7z-compressed",
        gz: "application/gzip",
        tar: "application/x-tar"
    }
    
    // 从文件名获取扩展名
    const extension = name.split('.').pop()?.toLowerCase()
    
    // 合并所有映射表
    const allMimeMaps = { ...documentMimeMap, ...videoMimeMap, ...audioMimeMap, ...archiveMimeMap }
    
    // 如果扩展名匹配，使用正确的 MIME 类型
    if (extension && allMimeMaps[extension]) {
        const correctType = allMimeMaps[extension]
        // 检查当前 MIME 类型是否需要修正
        if (lowerMimeType !== correctType) {
            return correctType
        }
    }
    
    // 对于其他类型，验证是否为标准 MIME 格式
    if (lowerMimeType.match(/^[a-z0-9][a-z0-9!#$&\-^]*\/[a-z0-9][a-z0-9!#$&\-^_.]*$/)) {
        return lowerMimeType
    }
    
    // 如果不是标准 MIME 格式，返回默认类型
    return "application/octet-stream"
}

// 修正视频文件 MIME 类型的函数（保留向后兼容）
const correctVideoMimeType = (file: any): string => {
    const { name, type } = file
    // 常见的视频文件扩展名映射
    const videoMimeMap: { [key: string]: string } = {
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
        webm: "video/webm",
        "3gp": "video/3gpp",
        flv: "video/x-flv",
        wmv: "video/x-ms-wmv",
        m4v: "video/mp4",
    }
    // 从文件名获取扩展名
    const extension = name.split(".").pop()?.toLowerCase()
    // 如果扩展名匹配且当前 MIME 类型不正确，则修正
    if (extension && videoMimeMap[extension]) {
        const correctType = videoMimeMap[extension]
        // 检查当前 MIME 类型是否需要修正
        if (!type.startsWith("video/") || type !== correctType) {
            return correctType
        }
    }
    // 如果没有找到匹配的扩展名，但有 video 前缀，确保是标准格式
    if (type && type.startsWith("video/")) {
        // 将一些非标准 MIME 类型转换为标准类型
        if (type.includes("quicktime")) return "video/quicktime"
        if (type.includes("x-msvideo")) return "video/x-msvideo"
        if (type.includes("x-matroska")) return "video/x-matroska"
    }
    return type || "video/mp4" // 默认返回 mp4
}

export const useScrollHandler = (targetSelector: string) => {
    return useCallback(
        (stateSetter: (arg0: boolean) => void, currentState: any) => (e: { preventDefault: () => void }) => {
            e.preventDefault()
            stateSetter(!currentState)
            // 使用requestAnimationFrame优化滚动时机
            requestAnimationFrame(() => {
                const target = document.querySelector(targetSelector)
                target?.scrollIntoView?.({
                    behavior: "smooth",
                    block: "center",
                })
            })
        },
        [targetSelector],
    )
}
//不需要发给后端的字段 "filename","filetype",
const allowedMetaFields = ["name","type","eid","business","liveDays"];
export type PendingDeleteOperation = {
    deleteUrl: string
    repId: string //存储系统eid
    hash: string
    business: string
    timestamp: number
}
const createMergedLocale = () => ({
    ...zh_CN,
    strings: {
        ...zh_CN.strings,
        ...UPPY_LOCALE_CONFIG.strings,
        ...DASH_LOCALE_CONFIG.strings,
        pluginNameCamera: "摄像头",
    },
})
export const MERGED_LOCALE_CONFIG = createMergedLocale()
// 上传模式类型
type UploadMode = "tus" | "xhr"

/**泛化能力更好的： 不支持切换页面后 回来 续刚才的未完成的上传！tus断点续传也是要求当前网页需要保留在目前状态管理的，不能跳转其他网页去，否则不能正常完成上传。
 * @param id 同一个页面不能多个一样id的uppy实例
 * @param eid 分布式对象存储系统靠这个 eid ID来关联业务系统关系数据库的。
 * @param field  inp?.[field]? 存储上传后的文件对象信息对应inp字段。 _FILE_为前缀的； 数据=可能是{}单个的，也可能多为文件形式[{ }, ]？
 * @param maxFile 设计上的最多文件个数【maxFile决定了file保存是数组还是对象】最多传几个文件； 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @param maxSize 每一个文件大小最大 多少 MB 兆B单位。
 * 删除旧文件：关联的 rep+ repId必须的！
 * @param liveDays 该文件要求存储保留天数。 报告应该保留天数估计> 20年吧。
 * @param onFinish [可选参数] #立刻生效给context 避免 事务性的缺失。 【上传任务完成】保存回调。 可能有多个的已经上传的文件！若删除多文件其中一个文件的onFinish参数file是剩下的文件数组。
 *  参数 onFinish?的回调类型:(file:any,newUpload:boolean)=>void； 回调参数newUpload表示是否有新上传的文件。
 * @param storeObj 对象或数组， 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @param open 加载后就打开上传面板
 * @param stateKey 保存到indexDB的key
 * @param preloadedSnapshot 从父级 hook 预加载的状态快照
 * @param isPreloaded 标记预加载是否完成(离线功能)
 * @return {} 节点DOM
 * TUS目前在切换路由页面再回来组件重新加载场景下，从indexDB恢复旧的上传的情况下：不管那个记住方式都会从零开始重新上传，而不是接着上次暂停位置续传的，可能被中断很长的时间，集群#后端状态也没保存。
 * */
export function useUppyUpload({
                                  id,
                                  eid,
                                  storeObj,
                                  stateKey,
                                  maxFile = 1,
                                  liveDays = 2,
                                  maxSize = 5,
                                  onFinish,
                                  hash,
                                  business = "rep",
                                  open,
                                  isFilePendingDelete,
                                  cancelPendingDelete,
                                  addPendingDelete,
                                  preloadedSnapshot,
                                  isPreloaded=true,
                              }: {
    eid: string
    storeObj: FileStore | FileStore[]
    hash: string
    id?: string
    onFinish: (file: any, newUpload: boolean) => void
    maxFile?: number
    liveDays?: number
    maxSize?: number
    business?: string
    stateKey?: string
    isPreloaded?: boolean
    preloadedSnapshot?: UppyStateSnapshot | null
    isFilePendingDelete?: (fileUrl: string) => boolean
    cancelPendingDelete?: (fileUrl: string) => void
    addPendingDelete?: (operation: PendingDeleteOperation) => void
    open?: boolean
}) {
    const [openUppy, setOpenUppy] = React.useState(open)
    const [uppyInstance, setUppyInstance] = React.useState<Uppy | null>(null)
    const [uploadMode, setUploadMode] = React.useState<UploadMode>("xhr")
    const scrollHandler = useScrollHandler(".uppy-Dashboard-browse")(setOpenUppy, openUppy)
    // 配置 Tus 插件的函数
    const configureTusPlugin = (uppy: Uppy) => {
        uppy.use(Tus, {
            id: "tus-upload",
            endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/uploadTUS/`,
            withCredentials: true,
            chunkSize: 5 * 1024 * 1024,
            retryDelays: [0, 2000, 7000, 15000],
            allowedMetaFields,
            async onBeforeRequest(req) {
                const token = await getAuthToken()
                if (token) {
                    req.setHeader("Authorization", `Bearer ${token}`)
                }
            },
            async onAfterResponse(req, res) {
                const status = res.getStatus()
                if (status === 401) {
                    uppy.info("需刷新token", "error", 9000)
                    toast.error("身份认证失败", {
                        description: "需重新登录，或刷新token",
                        duration: 9000,
                    })
                    window.dispatchEvent(new CustomEvent("token:refresh-needed"))
                    uppy.pauseAll()
                    return
                }
                const url = req.getURL()
                const value = res.getHeader("Tus2minIoUrl")
                // 存储服务相关的错误
                if (status === 503) {
                    const errorMessage = value || "无服务"
                    uppy.info(`Upload failed: ${errorMessage}`, "error", 9000)
                    toast.error("OSS存储服务问题", {
                        description: errorMessage,
                        duration: 8000,
                    })
                    uppy.pauseAll()
                }
                // 存储空间不足等业务错误
                else if (value && value.includes("Insufficient storage space")) {
                    uppy.info("Upload failed: Insufficient storage space", "error", 9000)
                    toast.error("存储", {
                        description: "可写磁盘容量不足",
                    })
                    uppy.pauseAll()
                }
                // 其他服务器错误
                else if (status >= 500) {
                    toast.error("Server Error", {
                        description: value,
                    })
                    uppy.pauseAll()
                } else if (value) {
                    const steob = {} as any
                    steob[url] = value
                    uppy.setState({ ...steob })
                    // 可选：显示成功提示
                    toast.success("成功", {
                        description: "上传完成",
                    })
                }
            },
        })
    }

    // 配置 XHR 插件的函数
    const configureXHRPlugin = (uppy: Uppy) => {
        uppy.use(XHRUpload, {
            id: "xhr-upload",
            endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/api/upload`,
            method: "POST",
            formData: true,
            fieldName: "files[]",
            timeout: 600000,
            limit: 1,
            allowedMetaFields: allowedMetaFields,
            shouldRetry: (xhr: XMLHttpRequest) => {
                return false
            },
            async onBeforeRequest(xhr) {
                const token = await getAuthToken()
                xhr.setRequestHeader("Authorization", `Bearer ${token}`) // @ts-ignore
            },
            async getResponseData(req: XMLHttpRequest) {
                const text = await req.response
                let errStr
                try {
                    const data = JSON.parse(text)
                    if (data?.successful) {
                        const obj = data?.successful[0]
                        errStr = obj?.error
                        if (obj?.url) return obj
                    }
                } catch (e) {}
                uppyInstance?.info("不要重试:" + errStr, "error", 9000)
                if (errStr?.includes("Failed to connect to")) errStr = "OSS存储集群服务不可用"
                toast.error("上传失败", {
                    description: errStr,
                })
                // 关键修复：抛出错误而不是返回空对象
                throw new Error(errStr || "上传失败")
            },
            async onAfterResponse(xhr) {
                if (xhr.status === 401) {
                    uppy.info("需刷新token", "error", 9000)
                    window.dispatchEvent(new CustomEvent("token:refresh-needed"))
                    return
                }
                if (xhr.status === 403) {
                    toast.error("上传失败", {
                        description: "请重新登录",
                        duration: 9000,
                    })
                    window.dispatchEvent(new CustomEvent("token:refresh-needed"))
                    return
                }
                try {
                    const data = JSON.parse(xhr.response)
                    if (data?.successful) {
                        const steob = {} as any
                        //类似TUS的做法，目的是给handleUpSuccess里面的统一处理做法提供支持。
                        steob[data?.successful[0]?.url] = data?.successful[0]?.url
                        uppy.setState({ ...steob })
                    } else {
                        console.warn(`上传应答错误`)
                    }
                } catch (e) {
                    console.error(`上传错误`)
                }
            },
        })
    }

    // 初始化 Uppy 实例 - 简化版本
    const createUppyInstance = () => {
        const uniqueId = id ? id : `Report-${eid}-${hash || "default"}`
        const newUppy = new Uppy({
            id: uniqueId,
            restrictions: {
                maxNumberOfFiles: maxFile,
                // 移除文件类型限制，允许上传任意类型的文件
            },
            locale: MERGED_LOCALE_CONFIG, // 使用合并配置
        })
        // 添加 Webcam 插件
        newUppy.use(Webcam, {
            countdown: false, // 是否倒计时拍照
            modes: ["picture", "video-audio"], // 支持拍照和录像（带声音）
            mirror: true, // 是否镜像（对于前置摄像头比较常见）
            mobileNativeCamera: false, //禁用原生相机App，使用浏览器API录制，更易获得MP4
            // 指定首选的视频 MIME 类型为 MP4 (H.264 + AAC)
            preferredVideoMimeType: 'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
            // preferredVideoMimeType: 'video/mp4',     清晰度
            videoConstraints: {
                width: { min: 320, ideal: 1280, max: 1920 },
                height: { min: 240, ideal: 720, max: 1080 },
                facingMode: "environment", //默认用后置摄像头
            },
        })
        // 根据当前模式配置插件
        if (uploadMode === "tus") {
            configureTusPlugin(newUppy)
        } else {
            configureXHRPlugin(newUppy)
        }
        return newUppy
    }

    // 添加 ref 来跟踪初始化状态，防止竞态条件
    const isInitializingRef = useRef<boolean>(false)
    const initializingStateKeyRef = useRef<string | undefined>("")
    const currentStateKeyRef = useRef<string | undefined>(stateKey)

    React.useEffect(() => {
        currentStateKeyRef.current = stateKey
    }, [stateKey])

    React.useEffect(() => {
        // 等待预加载完成
        if (!isPreloaded) {
            console.log(`[v0] Waiting for preload to complete before initializing Uppy for key: ${stateKey}`)
            return
        }
        if (uppyInstance) {
            uppyInstance.cancelAll()
        }
        const initializeUppy = async () => {
            const capturedStateKey = stateKey
            // 如果已经在初始化不同的 stateKey，等待当前初始化完成
            if (isInitializingRef.current && initializingStateKeyRef.current !== capturedStateKey) {
                console.log(
                    `[v0] Initialization WAITING - currently initializing ${initializingStateKeyRef.current}, waiting for ${capturedStateKey}`,
                )
                // 等待当前初始化完成
                let attempts = 0
                while (isInitializingRef.current && attempts < 50) {
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    attempts++
                }
                if (isInitializingRef.current) {
                    console.log(`[v0] Initialization SKIPPED - timeout waiting for ${initializingStateKeyRef.current}`)
                    return
                }
            }
            // 再次检查 stateKey 是否仍然有效
            if (capturedStateKey !== currentStateKeyRef.current) {
                console.log(
                    `[v0] Initialization CANCELLED - stateKey changed from ${capturedStateKey} to ${currentStateKeyRef.current}`,
                )
                return
            }
            // 设置初始化状态
            isInitializingRef.current = true
            initializingStateKeyRef.current = capturedStateKey
            try {
                console.log(`[v0] Initialization START for key: ${capturedStateKey}`)
                const newUppy = createUppyInstance()
                const savedState = preloadedSnapshot
                // 检查 stateKey 是否仍然有效
                if (capturedStateKey !== currentStateKeyRef.current) {
                    console.log(
                        `[v0] Initialization CANCELLED after preload - stateKey changed from ${capturedStateKey} to ${currentStateKeyRef.current}`,
                    )
                    return
                }
                if (savedState && savedState.files && savedState.files.length > 0) {
                    console.log(
                        `[v0] Applying preloaded state for key: ${capturedStateKey} with ${savedState.files.length} files`,
                    )
                    try {
                        if (savedState.meta) {
                            newUppy.setMeta(savedState.meta)
                        }
                        // 在 restoreState 函数中更新恢复计数逻辑
                        let restoredCount = 0
                        let fromHandleCount = 0
                        for (const fileData of savedState.files) {
                            const result = await restoreFileFromSnapshot(
                                fileData,
                                newUppy,
                                eid,
                                business || "rep",
                                liveDays || 2,
                            )
                            if (result.restored) {
                                restoredCount++
                                if (result.fromHandle) {
                                    fromHandleCount++
                                }
                            }
                        }
                        console.log(
                            `[OfflineUppy] State restoration completed: ${restoredCount} files restored (${fromHandleCount} from handles)`,
                        )
                        if (restoredCount > 0) {
                            toast.success(`恢复完成`, {
                                description: `已恢复 ${restoredCount} 个上传文件`,
                            })
                        } else if (savedState.files.length > 0) {
                            toast.error("恢复失败", {
                                description: `无法恢复 ${savedState.files.length} 个文件，请重新选择文件`,
                            })
                        }
                    } catch (error) {
                        console.warn(`[v0] Failed to apply preloaded state:`, error)
                    }
                } else {
                    console.log(`[v0] No preloaded state for key: ${capturedStateKey}`)
                }
                // 最后检查一次 stateKey 是否仍然有效
                if (capturedStateKey === currentStateKeyRef.current) {
                    setUppyInstance(newUppy)
                    console.log(`[v0] Initialization END for key: ${capturedStateKey}`)
                }
            } catch (error) {
                console.error(`[v0] Failed to initialize Uppy:`, error)
            } finally {
                // 清理初始化状态
                if (initializingStateKeyRef.current === capturedStateKey) {
                    isInitializingRef.current = false
                    initializingStateKeyRef.current = ""
                    console.log(`[v0] Initialization CLEANUP for key: ${capturedStateKey}`)
                }
            }
        }
        initializeUppy()
    }, [id, eid, stateKey, isPreloaded, preloadedSnapshot]) // 添加 isPreloaded 和 preloadedSnapshot 依赖

    // 当关键参数变化时更新 Uppy meta 信息
    React.useEffect(() => {
        if (uppyInstance) {
            uppyInstance.cancelAll()
            uppyInstance.setMeta({ eid: eid, liveDays, business })
        }
    }, [eid, liveDays, business])
    React.useEffect(() => {
        if (uppyInstance) {
            //因为恢复保存的状态，然后更新uppyInstance,不取消已添加的文件和上传
            uppyInstance.setMeta({ eid: eid, liveDays, business })
        }
    }, [uppyInstance])

    // 验证存储对象类型
    if (storeObj) {
        if (Array.isArray(storeObj)) {
            if (maxFile <= 1) throw new Error(`存储非法${maxFile}`)
        } else {
            if (maxFile > 1) throw new Error(`存储非法${maxFile}`)
        }
    }

    const storeObj1 = storeObj as FileStore
    const storeObj2 = storeObj as FileStore[]
    const thisMaxFiles = maxFile > 1 ? maxFile - (storeObj2?.length || 0) : storeObj1?.url ? 0 : 1
    //参数arIndex：回调时刻制定了 从哪一个文件index来触发删除后调用的。
    const whenDeleted = React.useCallback(
        async (result: any, fileUrl: string) => {
            const isError = typeof result === "string" && (result.startsWith("OSS服务不可用") || result.startsWith("未登录"))
            const toastMethod = isError ? toast.error : toast.info
            toastMethod("文件删除", {
                description: "结果: " + (result === "未登录" ? "失败，请重新登录" : result),
                duration: isError ? 9000 : 2000,
            })
            if (isError && addPendingDelete) {
                addPendingDelete({
                    deleteUrl: fileUrl,
                    repId: eid,
                    hash: hash || "default",
                    business,
                    timestamp: Date.now(),
                })
                toast.info("已加入待删除列表", {
                    description: "删除操作将在保存状态后加入离线队列",
                })
            } else if ("成功" === result || "文件不存在" === result) {
                if (1 === maxFile) {
                    onFinish && onFinish(undefined, false)
                } else {
                    // 使用文件URL来查找并删除文件，而不是索引
                    const newStoreObj = [...storeObj2].filter((file) => file.url !== fileUrl)
                    onFinish && onFinish(newStoreObj, false)
                }
            }
        },
        [maxFile, onFinish, storeObj2, eid, hash, business],
    )
    const { call: delOssFileFunc } = useOssDeleteFileMutation()
    // 创建包装函数，在调用时传递回调
    const deleteFileWithCallback = React.useCallback(
        (fileUrl: string, key?: string, value?: string) => {
            delOssFileFunc(fileUrl, key, value, whenDeleted)
        },
        [delOssFileFunc, whenDeleted],
    )
    //【上传应答】结束时刻回调
    const handleUpSuccess = React.useCallback(
        (result: { successful: any[] }) => {
            if (!uppyInstance) {
                console.error("Uppy instance is null in handleUpSuccess")
                return
            }
            const newUppsta = uppyInstance.getState()
            let failUploads = ""
            const more = result.successful
                .map((up) => {
                    const fileUrl = newUppsta[up.uploadURL]
                    if (!fileUrl) {
                        failUploads += up.name + "; "
                        return null
                    }
                    //up.type（前端状态）， up.meta.type（后端用）和 up.data.type 三个的类型可能不一样
                    toast.success(`shange三个的模式`, {
                        description: `t= ${up.type} ，me-t= ${up.meta.type} ,dadat= ${up.data.type}`,
                        duration: 9000,
                    })
                    const mimeType=up.meta.type || up.type
                    //XHR方式下这里up.type不会被改成java后端返回的type字段，不变的！MinIO在上传时设置了正确的 Content-Type 元数据：实际还是uppy添加文件时就敲定的
                    return { name: up.name, url: fileUrl, type: up.type, mimeType: mimeType }
                })
                .filter((item) => item !== null) // 立即过滤
            if (failUploads) {
                uppyInstance.info("上传失败的文件：" + failUploads, "error", 9000)
            }
            const newarr = [...more]
            const cntfile = newarr.length
            if (cntfile > 0) {
                // 为成功上传的文件添加特殊标记
                result.successful.forEach((up) => {
                    const file = uppyInstance.getFile(up.id)
                    if (file) {
                        // 在文件 meta 中添加特殊标记，表示该文件已成功上传
                        uppyInstance.setFileState(up.id, {
                            meta: {
                                ...file.meta,
                                uploadCompletedMark: true, // 特殊标记：上传完成
                                uploadCompletedTime: Date.now(), // 记录完成时间
                            },
                        })
                        console.log(`[v0] Marked file as upload completed: ${file.name}`)
                    }
                })

                setOpenUppy(false)
                const newfile = newarr?.map(({ name, url, mimeType }) => ({ name, url, mimeType }))
                // 上传成功后立即清理相关的 Tus 记录
                setTimeout(() => {
                    cleanupTusLocalStorage()
                }, 2000)
                if (onFinish) {
                    if (1 === maxFile) {
                        onFinish(newfile?.[0] || undefined, true)
                    } else {
                        const merged = [...((storeObj2 as any[]) ?? []), ...(newfile as any[])]
                        onFinish(merged, true)
                    }
                }
            }
        },
        [maxFile, onFinish, uppyInstance, eid, hash, storeObj2],
    )
    // 设置 Uppy 选项和事件监听
    React.useEffect(() => {
        if (!uppyInstance) return
        uppyInstance.setOptions({
            restrictions: {
                maxNumberOfFiles: thisMaxFiles,
                maxFileSize: maxSize * 1024 * 1024,
            },
        })
        // @ts-ignore
        uppyInstance.off("complete", handleUpSuccess)
        // @ts-ignore
        uppyInstance.on("complete", handleUpSuccess)
        return () => {
            // @ts-ignore
            uppyInstance.off("complete", handleUpSuccess)
        }
    }, [thisMaxFiles, maxSize, handleUpSuccess, uppyInstance])
    // 组件卸载时清理 Uppy 实例
    React.useEffect(() => {
        // 组件挂载时清理一次
        cleanupTusLocalStorage()
        return () => {
            if (uppyInstance) {
                try {
                    const tusPlugin = uppyInstance.getPlugin("tus-upload")
                    const xhrPlugin = uppyInstance.getPlugin("xhr-upload")

                    if (tusPlugin) {
                        uppyInstance.removePlugin(tusPlugin)
                    }
                    if (xhrPlugin) {
                        uppyInstance.removePlugin(xhrPlugin)
                    }
                } catch (error) {
                    console.warn(`[v0] Failed to remove plugins:`, error)
                }

                uppyInstance.destroy()
            }
        }
    }, [uppyInstance])
    
    // 上传模式切换处理 - 动态切换插件版本
    const handleModeChange = async (mode: UploadMode) => {
        if (!uppyInstance) return
        console.log(`Switching upload mode from ${uploadMode} to ${mode}`)
        // 保存当前文件状态
        const currentFiles = uppyInstance.getFiles()
        console.log(`Preserving ${currentFiles.length} files during mode switch`)
        // 暂停所有上传
        uppyInstance.pauseAll()
        try {
            // 移除所有上传插件
            const tusPlugin = uppyInstance.getPlugin("tus-upload")
            const xhrPlugin = uppyInstance.getPlugin("xhr-upload")
            if (tusPlugin) {
                uppyInstance.removePlugin(tusPlugin)
            }
            if (xhrPlugin) {
                uppyInstance.removePlugin(xhrPlugin)
            }
            // 添加新的上传插件
            if (mode === "tus") {
                configureTusPlugin(uppyInstance)
            } else {
                configureXHRPlugin(uppyInstance)
            }
            // 关键修复：彻底重置文件状态
            currentFiles.forEach((file) => {
                try {
                    // 先移除文件
                    uppyInstance.removeFile(file.id)
                    // 重新添加文件，使用原始文件数据
                    const fileData = file.data
                    if (fileData) {
                        const newFile = {
                            id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, // 新的ID避免冲突
                            name: file.name,
                            type: file.type,
                            data: fileData,
                            size: file.size,
                            meta: {
                                ...file.meta,
                                forcedMode: mode,
                                // 清除所有上传相关状态
                                uploadURL: undefined,
                                tus: undefined,
                                previousResponse: undefined,
                            },
                        }
                        // 重新添加文件
                        const result = uppyInstance.addFile(newFile)
                        if (!result) {
                            console.error(`Failed to re-add file: ${file.name}`)
                            // 如果添加失败，尝试使用原始ID
                            const fallbackFile = { ...newFile, id: file.id }
                            uppyInstance.addFile(fallbackFile)
                        }
                    }
                } catch (error) {
                    console.error(`Error processing file ${file.name} during mode switch:`, error)
                }
            })
            // 更新模式状态
            setUploadMode(mode)
            console.log(`Successfully switched to ${mode} mode, preserved ${currentFiles.length} files`)
            toast.success(`已切换到${mode === "tus" ? "断点续传" : "常规"}模式`, {
                description: `已保留 ${currentFiles.length} 个文件，可以重新上传`,
                duration: 3000,
            })
        } catch (error) {
            console.error("Failed to switch upload mode:", error)
            toast.error("模式切换失败", {
                description: "请重试",
            })
        }
    }
    // 上传模式选择器组件
    const UploadModeSelector = () => (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">上传模式选择：</label>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => handleModeChange("tus")}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        uploadMode === "tus"
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                    disabled={!uppyInstance}
                >
                    断点续传模式
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange("xhr")}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        uploadMode === "xhr"
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                    disabled={!uppyInstance}
                >
                    常规模式
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                {uploadMode === "tus" && "用 TUS 协议，支持断点续传和巨大超大文件"}
                {uploadMode === "xhr" && "用标准 HTTP 上传，事务性更好，最大支持500兆的"}
            </div>
            {uppyInstance && (
                <div className="mt-1 text-xs text-blue-600">当前已选择 {uppyInstance.getFiles().length} 个文件</div>
            )}
        </div>
    )
    //清理函数
    const cleanupTusLocalStorage = () => {
        try {
            const tusKeys = Object.keys(localStorage).filter((key) => key.startsWith("tus::"))
            // 简化清理逻辑：只基于时间清理
            tusKeys.forEach((key) => {
                const value = localStorage.getItem(key)
                if (value) {
                    try {
                        const tusData = JSON.parse(value)
                        // 只根据创建时间清理，避免CORS问题
                        if (tusData && tusData.creationTime) {
                            const createTime = new Date(tusData.creationTime).getTime()
                            const now = Date.now()
                            //超过最大上传时限的时间（2小时），清理
                            if (now - createTime > 2 * 60 * 60 * 1000) {
                                localStorage.removeItem(key)
                                console.log(`清理过期的 Tus 记录: ${key}`)
                            }
                        } else {
                            // 没有创建时间的记录，直接清理
                            localStorage.removeItem(key)
                            console.log(`清理无效的 Tus 记录: ${key}`)
                        }
                    } catch (e) {
                        // 解析失败的直接清理
                        localStorage.removeItem(key)
                        console.log(`清理格式错误的 Tus 记录: ${key}`)
                    }
                }
            })
        } catch (error) {
            console.warn("清理 Tus localStorage 失败:", error)
        }
    }

    const popoverStyles = `
    [popover] {
      background-color: var(--popover);
      color: var(--popover-foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      padding: 1rem;
      z-index: 50;
      animation: popover-show 0.2s ease-out;
    }

    @keyframes popover-show {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    [popover] input[type="number"] {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background-color: var(--input);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) - 2px);
      color: var(--foreground);
      font-size: 0.875rem;
    }

    [popover] input[type="number"]::placeholder {
      color: var(--muted-foreground);
    }

    [popover] input[type="number"]:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--ring);
    }
  `
    // 在渲染文件时使用这些函数
    const renderFileWithDeleteStatus = (file: FileStore, index: number, isSingle = false) => {
        const isPendingDelete = isFilePendingDelete && isFilePendingDelete(file.url)
        const popoverId = `move-popover-${index}-${hash || "_pf"}`

        // Handle file move functionality
        const handleMoveFile = (targetIndex: string) => {
            const target = Number.parseInt(targetIndex, 10)
            const currentFiles = maxFile === 1 ? [storeObj1] : storeObj2

            if (isNaN(target) || target < 0 || target >= currentFiles.length) {
                toast.error("无效移动位置", {
                    description: `请输入 1 到 ${currentFiles.length} 之间的数字`,
                    duration: 2000,
                })
                return
            }

            if (target === index) {
                toast.info("位置相同", {
                    description: "文件已在该位置",
                    duration: 1500,
                })
                return
            }

            const newFiles = [...currentFiles]
            const [movedFile] = newFiles.splice(index, 1)
            newFiles.splice(target, 0, movedFile)

            onFinish && onFinish(maxFile === 1 ? undefined : newFiles, false)

            toast.success("移动成功", {
                description: `文件已移动到位置 ${target + 1}`,
                duration: 2000,
            })

            // Close popover after successful move
            const popover = document.getElementById(popoverId) as HTMLElement
            if (popover?.hidePopover) {
                popover.hidePopover()
            }
        }

        return (
            <div key={index} className="mb-4 border rounded-lg p-3 bg-gray-50">
                {index > 0 && <hr className="my-3" />}
                <div id={(hash ?? "_pf") + `${index}`} className="flex justify-around items-center">
                    {file.url && <FilePreview file={file} ossEndpoint={process.env.NEXT_PUBLIC_OSS_ENDP || ""} />}
                </div>

                {/* 删除按钮放在图片下面 */}
                <div className="mt-0.5 flex gap-2 justify-center flex-wrap">
                    <Button
                        type="button"
                        variant={maxFile === 1 ? "destructive" : "outline"}
                        size="sm"
                        onClick={(e) => {
                            deleteFileWithCallback(file.url, "eid", eid)
                            e.preventDefault()
                        }}
                        className="relative"
                        disabled={isPendingDelete}
                    >
                        {maxFile === 1 ? "删除" : `删除文件`}
                        {isPendingDelete && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                !
              </span>
                        )}
                    </Button>

                    {maxFile > 1 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                const popover = document.getElementById(popoverId) as HTMLElement
                                if (popover?.togglePopover) {
                                    popover.togglePopover()
                                }
                            }}
                        >
                            移动
                        </Button>
                    )}

                    {/* 取消删除按钮 */}
                    {isPendingDelete && cancelPendingDelete && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                cancelPendingDelete(file.url)
                            }}
                        >
                            取消删除
                        </Button>
                    )}
                </div>

                <style>{popoverStyles}</style>
                <div
                    id={popoverId}
                    popover="auto"
                    className="p-4 border rounded-lg shadow-lg bg-white md:min-w-2xs"
                    style={
                        {
                            "--popover": "#fff",
                            "--popover-foreground": "#000",
                            "--border": "#ccc",
                            "--radius": "4px",
                            "--ring": "#000",
                            margin: "auto",
                            border: "solid",
                        } as React.CSSProperties
                    }
                >
                    <h3 className="font-semibold mb-3 text-sm">移动文件到位置</h3>
                    <p className="text-xs text-gray-600 mb-2">
                        当前在位置 {index + 1}，共 {maxFile === 1 ? 1 : storeObj2?.length || 0} 个文件
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            id={`move-input-${index}`}
                            min="1"
                            max={maxFile === 1 ? 1 : storeObj2?.length || 0}
                            placeholder={`输入 1-${maxFile === 1 ? 1 : storeObj2?.length || 0}`}
                            className="flex-1 px-2 py-1 text-sm border rounded"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const input = (e.target as HTMLInputElement).value
                                    const targetIndex = Number.parseInt(input, 10) - 1
                                    handleMoveFile(targetIndex.toString())
                                    ;(e.target as HTMLInputElement).value = ""
                                    const popoverEl = document.getElementById(popoverId) as HTMLElement & { hidePopover?: () => void }
                                    popoverEl?.hidePopover?.()
                                }
                            }}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => {
                                const input = document.getElementById(`move-input-${index}`) as HTMLInputElement
                                const targetIndex = Number.parseInt(input.value, 10) - 1
                                handleMoveFile(targetIndex.toString())
                                input.value = ""
                                const popoverEl = document.getElementById(popoverId) as HTMLElement & { hidePopover?: () => void }
                                popoverEl?.hidePopover?.()
                            }}
                        >
                            确认
                        </Button>
                    </div>
                </div>

                {isPendingDelete && (
                    <div className="text-orange-600 text-sm mt-2 flex items-center justify-center">
                        <span className="animate-pulse">⚠️ 此文件已在待删除队列中</span>
                    </div>
                )}
            </div>
        )
    }

    // 排除已完成的文件
    const removeCompletedFiles = React.useCallback(() => {
        if (!uppyInstance) {
            toast.error("Uppy 实例未初始化")
            return
        }
        const files = uppyInstance.getFiles()
        if (files.length === 0) {
            toast.info("没有需要处理的文件")
            return
        }
        let removedCount = 0
        let completedCount = 0
        files.forEach((file) => {
            // 检查文件是否已经成功上传（多种方式检查）
            const isCompletedByProgress =
                file.progress?.uploadComplete && file.progress?.percentage === 100 && file.response?.uploadURL
            // 检查特殊标记
            const isCompletedByMark = file.meta?.uploadCompletedMark === true
            // 只要任一条件满足就认为已完成
            const isCompleted = isCompletedByProgress || isCompletedByMark
            if (isCompleted) {
                try {
                    uppyInstance.removeFile(file.id)
                    removedCount++
                    completedCount++
                    const reason = isCompletedByMark ? "特殊标记" : "进度检查"
                    console.log(`[v0] 移除已完成文件: ${file.name} (${reason})`)
                } catch (error) {
                    console.warn(`移除已完成文件失败: ${file.name}`, error)
                }
            }
        })
        if (removedCount > 0) {
            toast.success(`已排除 ${removedCount} 个已完成文件`, {
                description: `清理了 ${completedCount} 个成功上传的文件`,
                duration: 3000,
            })
        } else {
            toast.info("没有发现已完成的上传文件")
        }
    }, [uppyInstance])

    // 添加重复文件检查
    const checkForDuplicateFiles = React.useCallback(
        (newFiles: any[]) => {
            if (!uppyInstance || newFiles.length === 0) return newFiles
            const existingFiles = uppyInstance.getFiles()
            const duplicates = newFiles.filter((newFile) => {
                // 检查是否已在 Uppy 文件列表中
                const inUppy = existingFiles.some(
                    (existingFile) =>
                        existingFile.name === newFile.name &&
                        existingFile.size === newFile.size &&
                        existingFile.progress.uploadComplete === true,
                )
                // 检查是否已在存储的文件中 根据storeFile.name判定太武断了，不做限制了。
                return inUppy
            })
            if (duplicates.length > 0) {
                const duplicateNames = duplicates.map((f) => f.name).join(", ")
                toast.warning(`发现 ${duplicates.length} 个重复文件`, {
                    description: `以下文件已存在: ${duplicateNames}`,
                    duration: 5000,
                })
                // 过滤掉重复文件
                return newFiles.filter(
                    (newFile) => !duplicates.some((dup) => dup.name === newFile.name && dup.size === newFile.size),
                )
            }
            return newFiles
        },
        [uppyInstance, storeObj1, storeObj2, maxFile],
    )
    // 在 Uppy 初始化后添加文件重复检查
    React.useEffect(() => {
        if (!uppyInstance) return
        // 监听文件添加事件，进行重复检查和 MIME 类型修正
        const handleFileAdded = async (file: any) => {
            const files = [file]
            
            // 检查是否需要转换视频格式为通用 MP4，确保跨设备兼容
            let processedFile = file;
            const isVideoFile = file.type && file.type.startsWith('video/');
            const needConvert = isVideoFile && shouldConvertToMp4(file) && (
                file.name.toLowerCase().endsWith('.mov') || // MOV 文件
                file.type !== 'video/mp4' || // 非 MP4 格式
                file.name.toLowerCase().includes('.avi') ||
                file.name.toLowerCase().includes('.mkv') ||
                file.name.toLowerCase().includes('.3gp') ||
                file.name.toLowerCase().includes('.flv')
            );
            if (needConvert) {
                console.log(`[v0] 检测到需要转换的视频文件: ${file.name} (${file.type})，开始处理...`)
                toast.info("视频格式转换", {
                    description: `正在将 ${file.name} 转换为通用 MP4 格式，确保跨设备兼容`,
                    duration: 25000
                });
                try {
                    // 执行实际转换
                    const convertedFile = await convertMovToMp4Real(file);
                    toast.info("视频转换", {
                        description: `转换处理完成，改名=${convertedFile.name !== file.name}`,
                        duration: 23000
                    });
                    if (convertedFile.name !== file.name) {
                        console.log(`[v0] 视频转换成功: ${file.name} 改 ${convertedFile.name}`)
                        toast.success("转换完成", {
                            description: `${file.name} 已改为 ${convertedFile.name}，现在可以在所有设备上正常播放`,duration: 16000
                        });
                        
                        // 更新 Uppy 中的文件信息
                        uppyInstance.setFileState(file.id, {
                            name: convertedFile.name,
                            type: convertedFile.type,
                            data: convertedFile.data,
                            size: convertedFile.size
                        });
                        processedFile = convertedFile;
                    } else {
                        console.warn(`[v0] 视频转换失败或被跳过，使用原文件: ${file.name}`)
                        toast.warning("前端转换失败", {
                            description: `无法转换 ${file.name}，将使用原文件上传。已标记服务端转换`,
                            duration: 16000
                        });
                        
                        // 即使转换失败，也标记为需要在服务端转换
                        uppyInstance.setFileMeta(file.id, { 
                            ...file.meta, 
                            needsServerConversion: true,
                            originalType: file.type,
                            targetFormat: 'mp4'
                        });
                    }
                } catch (error) {
                    console.warn(`[v0] 视频文件处理失败，使用原文件:`, error)
                    toast.error("处理失败", {
                        description: `视频文件处理失败，将使用原文件上传: ${error}`,
                        duration: 5000
                    });
                    
                    // 标记服务端转换
                    uppyInstance.setFileMeta(file.id, { 
                        ...file.meta, 
                        needsServerConversion: true,
                        originalType: file.type,
                        targetFormat: 'mp4'
                    });
                }
            }
            
            // 修正所有文件的 MIME 类型
            const correctedMimeType = correctMimeType(processedFile)
            if (correctedMimeType !== processedFile.type) {
                toast.info("handleFileAdded", {
                    description: `已经修改不同的类型 p=${processedFile.type}   correctedMimeType=${correctedMimeType}`,
                    duration: 25000
                });
                console.log(`[v0] Corrected MIME type for ${processedFile.name}: ${processedFile.type} -> ${correctedMimeType}`)
                //不用uppyInstance.setFileMeta(file.id, { ...processedFile.meta, type: correctedMimeType })
                uppyInstance.setFileState(file.id, {
                    meta: { ...processedFile.meta, type: correctedMimeType },
                    type: correctedMimeType
                })
            }
            const uppyfile=uppyInstance.getFile(file.id);
            toast.info("uppyfile", {
                description: `类型 up=${uppyfile.type}   mtC=${uppyfile.meta.type}`,
                duration: 25000
            });
            const filteredFiles = checkForDuplicateFiles(files)
            if (filteredFiles.length < files.length) {
                // 有重复文件，从 Uppy 中移除
                setTimeout(() => {
                    try {
                        uppyInstance.removeFile(file.id)
                    } catch (error) {
                        console.warn(`移除重复文件失败: ${file.name}`, error)
                    }
                }, 100)
            }
        }
        // const handleRetryAll = (fileIDs: any) => {
        //     console.warn(`再试试:  fileIDs=`, fileIDs)
        // }
        uppyInstance.on("file-added", handleFileAdded)
        // uppyInstance.on("retry-all", handleRetryAll)
        return () => {
            uppyInstance.off("file-added", handleFileAdded)
            // uppyInstance.off("retry-all", handleRetryAll)
        }
    }, [uppyInstance, checkForDuplicateFiles])

    // 添加统一的渲染函数
    const renderFiles = () => {
        const files = maxFile === 1 ? (storeObj1?.url ? [storeObj1] : []) : storeObj2 || []
        const hasFiles = files.length > 0
        const selectedFilesCount = uppyInstance ? uppyInstance.getFiles().length : 0
        const recovering=preloadedSnapshot && preloadedSnapshot.files && preloadedSnapshot.files.some((file: any) => !(file.uploadURL))
        return (
            <>
                {/* 显示已上传的文件 */}
                <div className="text-center">
                    {files.map((file, i) => renderFileWithDeleteStatus(file, i, maxFile === 1))}

                    {!hasFiles && (
                        <div key="placeholder" className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">暂无文件</p>
                        </div>
                    )}
                </div>

                {/* 上传面板 */}
                <div className="text-center mt-4">
                    <div key="dashboard" style={{ display: openUppy ? "block" : "none" }}>
                        <UploadModeSelector />
                        <Dashboard uppy={uppyInstance!} locale={MERGED_LOCALE_CONFIG} plugins={["Webcam"]} />
                    </div>
                    {/* 操作按钮 */}
                    <div className="space-y-2">
                        <div className="flex justify-center items-center gap-0">
                            <Button 
                                size="sm" 
                                disabled={!openUppy && thisMaxFiles <= 0} 
                                onClick={scrollHandler}
                                className={ recovering? "relative bg-orange-700 border-orange-300 hover:bg-orange-500" : ""}
                            >
                                {openUppy ? "关闭上传" : `开启上传`}
                                {selectedFilesCount > 0 && ` | 在选${selectedFilesCount}个`}
                                {recovering && (
                                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                !
              </span>
                                )}
                            </Button>
                            {uppyInstance && uppyInstance.getFiles().length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removeCompletedFiles}
                                    className="ml-2 bg-transparent"
                                >
                                    排除已完成
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const uploadDom = (
        <>
            {renderFiles()}
            <div id={hash ?? "_pf"} className="text-center mt-2"></div>
        </>
    )
    return {
        uploadDom: uppyInstance ? uploadDom : null,
        uppyInstance,
        delOssFileFunc,
    }
}
