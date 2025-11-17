"use client"
import * as React from "react"
import Uppy from "@uppy/core"
import Tus from "@uppy/tus"
import XHRUpload from "@uppy/xhr-upload"
import useOssDeleteFileMutation from "../../hooks/useOssDeleteFileMutation"
import Dashboard from "@uppy/react/dashboard"
import "@uppy/core/css/style.min.css"
import "@uppy/dashboard/css/style.min.css"
import "./uppy-fixes.css"
import { getAuthToken } from "@/lib/auth-token"
import { Button } from "@/components/ui"
import { FilePreview } from "@/components/file-preview"
import { useCallback } from "react"
import { toast } from "sonner"
import { fileOperationsQueue } from "@/lib/file-operations-queue"

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
        browseFiles: "浏览文件夹",
        dropPasteFiles: "文件拖拉进来或 %{browseFiles}",
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

export type PendingDeleteOperation = {
    deleteUrl: string
    repId: string
    hash: string
    business: string
    timestamp: number
}
// 上传模式类型
type UploadMode = "tus" | "xhr"

/**不支持切换页面后回来 যুক্তি续刚才的未完成的上传！tus断点续传也是要求当前网页需要保留在目前状态管理的，不能跳转其他网页去，否则不能正常完成上传。
 * 可以支持一个页面 多个上传的面板同时存在的。
 * @param repId 分布式对象存储系统靠这个 eid ID来关联业务系统关系数据库的。
 * @param field  inp?.[field]? 存储上传后的文件对象信息对应inp字段。 _FILE_为前缀的； 数据=可能是{}单个的，也可能多为文件形式[{ }, ]？
 * @param maxFile 设计上的最多文件个数【maxFile决定了file保存是数组还是对象】最多传几个文件； 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @param maxSize  每一个文件大小最大 多少 MB 兆B单位。
 * 删除旧文件：关联的 rep+ repId必须的！
 * @param liveDays  该文件要求存储保留天数。 报告应该保留天数估计> 20年吧。
 * @param onFinish [可选参数] #立刻生效给context 避免 事务性的缺失。 【上传任务完成】保存回调。 可能有多个的已经上传的文件！若删除多文件其中一个文件的onFinish参数file是剩下的文件数组。
 *  参数 onFinish?的回调类型:(file:any,newUpload:boolean)=>void；
 * @param storeObj 对象或数组， 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @param open 加载后就打开上传面板
 * @param externalPendingDeletes 未完成删除文件的状态注入列表
 * @return {} 节点DOM
 * 【局限性】一个编辑器页面内不能放置多个useUppyUpload来做上传，因为uppy全局变量？，必须独立？ 走类似的useUppyUploadM。
 * TUS目前在切换路由页面再回来组件重新加载场景下，从indexDB恢复旧的上传的情况下：不管那个记住方式都会从零开始重新上传，而不是接着上次暂停位置续传的，可能被中断很长的时间，集群#后端状态也没保存。
 * */
export function useUppyUpload({
                                  repId,
                                  storeObj,
                                  maxFile = 1,
                                  liveDays = 2,
                                  maxSize = 5,
                                  onFinish,
                                  hash,
                                  id,
                                  business = "rep",
                                  open,
                                  externalPendingDeletes = [],
                              }: {
    repId: string
    storeObj: FileStore | FileStore[]
    maxFile?: number
    liveDays?: number
    maxSize?: number
    onFinish?: (file: any, newUpload: boolean) => void
    hash?: string
    id?: string
    business?: string
    open?: boolean
    externalPendingDeletes?: PendingDeleteOperation[]
}) {
    // 添加待删除操作状态
    // 优先级：sessionStorage（本次会话） > externalPendingDeletes（从 indexDB 恢复）
    // 页面刷新时 sessionStorage 自动清空，从而只保留 indexDB 中的持久化状态
    const PENDING_DELETES_STORE = 'pendingDeletesStore'

    // const savePendingDeletes = async (repId: string, deletesMap: Record<string, string>) => {
    //     try {
    //         const db = await new Promise<IDBDatabase>((resolve, reject) => {
    //             const request = indexedDB.open('FileOperationsDB', 1)
    //             request.onsuccess = () => resolve(request.result)
    //             request.onerror = () => reject(request.error)
    //         })

    //         const transaction = db.transaction(['uppyState'], 'readwrite')
    //         const store = transaction.objectStore('uppyState')

    //         // 使用特殊的 key 前缀保存待删除队列
    //         const deleteQueueKey = `__deleteQueue:${repId}`
    //         const request = store.put({
    //             key: deleteQueueKey,
    //             repId,
    //             data: deletesMap,
    //             timestamp: Date.now()
    //         })

    //         return new Promise<void>((resolve, reject) => {
    //             request.onsuccess = () => {
    //                 console.log("[v0] Saved pending deletes to indexDB:", deleteQueueKey)
    //                 resolve()
    //             }
    //             request.onerror = () => reject(request.error)
    //         })
    //     } catch (error) {
    //         console.error("[v0] Failed to save pending deletes:", error)
    //     }
    // }

    // const loadPendingDeletes = async (repId: string): Promise<Record<string, string>> => {
    //     try {
    //         const db = await new Promise<IDBDatabase>((resolve, reject) => {
    //             const request = indexedDB.open('FileOperationsDB', 1)
    //             request.onsuccess = () => resolve(request.result)
    //             request.onerror = () => reject(request.error)
    //         })

    //         const transaction = db.transaction(['uppyState'], 'readonly')
    //         const store = transaction.objectStore('uppyState')

    //         // 使用特殊的 key 前缀读取待删除队列
    //         const deleteQueueKey = `__deleteQueue:${repId}`
    //         const request = store.get(deleteQueueKey)

    //         return new Promise<Record<string, string>>((resolve, reject) => {
    //             request.onsuccess = () => {
    //                 const result = request.result as any
    //                 if (result && result.data) {
    //                     console.log("[v0] Loaded pending deletes from indexDB:", deleteQueueKey)
    //                     resolve(result.data)
    //                 } else {
    //                     resolve({})
    //                 }
    //             }
    //             request.onerror = () => reject(request.error)
    //         })
    //     } catch (error) {
    //         console.error("[v0] Failed to load pending deletes:", error)
    //         return {}
    //     }
    // }

    const [pendingDeleteOperations, setPendingDeleteOperations] =
        React.useState<Record<string, string>>({})

    // React.useEffect(() => {
    //     // 组件卸载时，将待删除操作同步到 indexDB
    //     return () => {
    //         if (Object.keys(pendingDeleteOperations).length > 0) {
    //             savePendingDeletes(repId, pendingDeleteOperations).catch((error) => {
    //                 console.error("[v0] Failed to persist pending deletes on unmount:", error)
    //             })
    //         }
    //     }
    // }, [pendingDeleteOperations, repId])

    const [openUppy, setOpenUppy] = React.useState(open)
    const [uppyInstance, setUppyInstance] = React.useState<Uppy | null>(null)
    const [uploadMode, setUploadMode] = React.useState<UploadMode>("xhr")
    const scrollHandler = useScrollHandler(".uppy-Dashboard-browse")(setOpenUppy, openUppy)
    const dashLocale = DASH_LOCALE_CONFIG

    // 配置 Tus 插件的函数
    const configureTusPlugin = (uppy: Uppy) => {
        uppy.use(Tus, {
            id: "tus-upload",
            endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/uploadTUS/`,
            withCredentials: true,
            chunkSize: 5 * 1024 * 1024,
            retryDelays: [0, 2000, 7000, 15000],
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
            allowedMetaFields: true,
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
        const uniqueId = id ? id : `Report-${repId}-${hash || "default"}`
        console.log(`Creating new Uppy instance: ${uniqueId}`)
        const newUppy = new Uppy({
            id: uniqueId,
            restrictions: { maxNumberOfFiles: maxFile },
        })

        // 根据当前模式配置插件
        if (uploadMode === "tus") {
            configureTusPlugin(newUppy)
        } else {
            configureXHRPlugin(newUppy)
        }

        return newUppy
    }

    // 初始化 Uppy 实例
    React.useEffect(() => {
        if (!uppyInstance) {
            const newUppy = createUppyInstance()
            setUppyInstance(newUppy)
        }
    }, [repId, hash, maxFile]) // 移除 uploadMode 依赖

    // 当关键参数变化时重新初始化 Uppy 状态
    React.useEffect(() => {
        if (uppyInstance) {
            uppyInstance.cancelAll()
            uppyInstance.setMeta({ eid: repId, liveDays, business })
        }
    }, [repId, liveDays, uppyInstance])

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
    const thisMaxFiles = maxFile > 1 ? maxFile - (storeObj2?.length || 0) : 1
    //参数arIndex：回调时刻制定了 从哪一个文件index来触发删除后调用的。
    const whenDeleted = React.useCallback(
        async (result: any, fileUrl: string) => {
            const isError = typeof result === "string" && (result.startsWith("OSS服务不可用") || result.startsWith("未登录"))
            const toastMethod = isError ? toast.error : toast.info
            toastMethod("文件删除", {
                description: "结果: " + (result === "未登录" ? "失败，请重新登录" : result),
                duration: isError ? 9000 : 2000,
            })

            if (isError) {
                setPendingDeleteOperations((prev) => ({ ...prev, [fileUrl]: fileUrl }))

                toast.info("已加入待删除列表", {
                    description: "删除操作将在保存状态后加入离线队列",
                })
            } else if ("成功" === result || "文件不存在" === result) {
                if (1 === maxFile) {
                    onFinish && onFinish(undefined, false)
                } else {
                    // 使用文件URL来查找并删除文件，而不是索引
                    const newStoreObj = [...storeObj2].filter(file => file.url !== fileUrl)
                    onFinish && onFinish(newStoreObj, false)
                }
            }
        },
        [maxFile, onFinish, storeObj2, repId, hash, business],
    )
    const { call: delOssFileFunc } = useOssDeleteFileMutation()
    // 创建包装函数，在调用时传递回调
    const deleteFileWithCallback = React.useCallback((fileUrl: string, key?: string, value?: string) => {
        delOssFileFunc(fileUrl, key, value, whenDeleted)
    }, [delOssFileFunc, whenDeleted])
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
                    return { name: up.name, url: fileUrl, type: up.type, mimeType: up.type }
                })
                .filter((item) => item !== null) // 立即过滤
            if (failUploads) {
                uppyInstance.info("上传失败的文件：" + failUploads, "error", 9000)
            }
            const newarr = [...more]
            const cntfile = newarr.length
            if (cntfile > 0) {
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
        [maxFile, onFinish, uppyInstance, repId, hash, storeObj2],
    )
    // 设置 Uppy 选项和事件监听
    React.useEffect(() => {
        if (!uppyInstance) return
        uppyInstance.setOptions({
            restrictions: {
                maxNumberOfFiles: thisMaxFiles,
                maxFileSize: maxSize * 1024 * 1024,
            },
            locale: UPPY_LOCALE_CONFIG,
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
                uppyInstance.destroy()
            }
        }
    }, [uppyInstance, repId])
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
            const tusPlugin = uppyInstance.getPlugin('tus-upload')
            const xhrPlugin = uppyInstance.getPlugin('xhr-upload')

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
            currentFiles.forEach(file => {
                try {
                    // 先移除文件
                    uppyInstance.removeFile(file.id)

                    // 重新添加文件，使用原始文件数据
                    const fileData = file.data
                    if (fileData) {
                        const newFile = {
                            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 新的ID避免冲突
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
                <div className="mt-1 text-xs text-blue-600">
                    当前已选择 {uppyInstance.getFiles().length} 个文件
                </div>
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
    React.useEffect(() => {
        if (externalPendingDeletes.length > 0) {
            const deletesMap = externalPendingDeletes.reduce((acc, op) => {
                acc[op.deleteUrl] = op.deleteUrl
                return acc
            }, {} as Record<string, string>)
            setPendingDeleteOperations((prev) => ({ ...prev, ...deletesMap }))
        }
    }, [externalPendingDeletes])
    // 检查特定文件是否在待删除队列中
    const isFilePendingDelete = useCallback(
        (fileUrl: string) => {
            return pendingDeleteOperations[fileUrl] !== undefined
        },
        [pendingDeleteOperations],
    )

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
        const isPendingDelete = isFilePendingDelete(file.url)
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
                    {file.url && (
                        <FilePreview
                            file={file}
                            ossEndpoint={process.env.NEXT_PUBLIC_OSS_ENDP || ""}
                        />
                    )}
                </div>

                {/* 删除按钮放在图片下面 */}
                <div className="mt-0.5 flex gap-2 justify-center flex-wrap">
                    <Button
                        type="button"
                        variant={maxFile === 1 ? "destructive" : "outline"}
                        size="sm"
                        onClick={(e) => {
                            deleteFileWithCallback(file.url, "eid", repId)
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
                    {isPendingDelete && (
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

    //取消删除的函数
    const cancelPendingDelete = useCallback((fileUrl: string) => {
        setPendingDeleteOperations((prev) => {
            const { [fileUrl]: _, ...rest } = prev
            return rest
        })
        toast.success("已取消删除操作", {
            description: "文件已从待删除队列中移除",
            duration: 2000,
        })
    }, [])
    //批量取消删除的函数
    const cancelPendingOperations = useCallback(() => {
        if (Object.keys(pendingDeleteOperations).length === 0) {
            toast.info("没有待取消的删除操作")
            return
        }

        setPendingDeleteOperations({})
        toast.success("已取消所有删除操作", {
            description: `已移除 ${Object.keys(pendingDeleteOperations).length} 个待删除文件`,
            duration: 3000,
        })
    }, [pendingDeleteOperations])

    // const getInitialPendingDeletes = React.useCallback(async () => {
    //     const savedDeletes = await loadPendingDeletes(repId)
    //     return { ...externalPendingDeletes, ...savedDeletes }
    // }, [repId, externalPendingDeletes])

    // 排除已完成上传的文件
    const removeCompletedFiles = React.useCallback(() => {
        if (!uppyInstance) {
            toast.error("Uppy 实例未初始化");
            return;
        }

        const files = uppyInstance.getFiles();
        if (files.length === 0) {
            toast.info("没有需要处理的文件");
            return;
        }

        let removedCount = 0;
        let completedCount = 0;

        files.forEach((file) => {
            // 检查文件是否已经成功上传
            const isCompleted = file.progress?.uploadComplete &&
                file.progress?.percentage === 100 &&
                file.response?.uploadURL;

            if (isCompleted) {
                try {
                    uppyInstance.removeFile(file.id);
                    removedCount++;
                    completedCount++;
                } catch (error) {
                    console.warn(`移除已完成文件失败: ${file.name}`, error);
                }
            }
        });

        if (removedCount > 0) {
            toast.success(`已排除 ${removedCount} 个已完成文件`, {
                description: `清理了 ${completedCount} 个成功上传的文件`,
                duration: 3000,
            });
        } else {
            toast.info("没有发现已完成的上传文件");
        }
    }, [uppyInstance]);

    // 添加重复文件检查
    const checkForDuplicateFiles = React.useCallback((newFiles: any[]) => {
        if (!uppyInstance || newFiles.length === 0) return newFiles;

        const existingFiles = uppyInstance.getFiles();
        const storeFiles = maxFile === 1 ?
            (storeObj1?.url ? [storeObj1] : []) :
            storeObj2 || [];

        // 检查重复的文件
        const duplicates = newFiles.filter(newFile => {
            // 检查是否已在 Uppy 文件列表中
            const inUppy = existingFiles.some(existingFile =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size && existingFile.progress.uploadComplete===true
            );

            // 检查是否已在存储的文件中
            const inStore = storeFiles.some(storeFile =>
                storeFile.name === newFile.name
            );

            return inUppy || inStore;
        });

        if (duplicates.length > 0) {
            const duplicateNames = duplicates.map(f => f.name).join(', ');
            toast.warning(`发现 ${duplicates.length} 个重复文件`, {
                description: `以下文件已存在: ${duplicateNames}`,
                duration: 5000,
            });

            // 过滤掉重复文件
            return newFiles.filter(newFile =>
                !duplicates.some(dup =>
                    dup.name === newFile.name && dup.size === newFile.size
                )
            );
        }

        return newFiles;
    }, [uppyInstance, storeObj1, storeObj2, maxFile]);
    // 在 Uppy 初始化后添加文件重复检查
    React.useEffect(() => {
        if (!uppyInstance) return;
        // 监听文件添加事件，进行重复检查
        const handleFileAdded = (file: any) => {
            const files = [file];
            const filteredFiles = checkForDuplicateFiles(files);

            if (filteredFiles.length < files.length) {
                // 有重复文件，从 Uppy 中移除
                setTimeout(() => {
                    try {
                        uppyInstance.removeFile(file.id);
                    } catch (error) {
                        console.warn(`移除重复文件失败: ${file.name}`, error);
                    }
                }, 100);
            }
        };
        const handleRetryAll = (fileIDs: any) => {
            console.warn(`再试试:  fileIDs=`, fileIDs);
        };
        uppyInstance.on('file-added', handleFileAdded);
        uppyInstance.on('retry-all', handleRetryAll);
        return () => {
            uppyInstance.off('file-added', handleFileAdded);
            uppyInstance.off('retry-all', handleRetryAll);
        };
    }, [uppyInstance, checkForDuplicateFiles]);

    // 添加强制重新上传功能
    const retryFailedUploads = React.useCallback(() => {
        if (!uppyInstance) {
            toast.error("Uppy 实例未初始化");
            return;
        }

        const files = uppyInstance.getFiles();
        const failedFiles = files.filter(file =>
            file.error ||
            (file.progress?.uploadComplete === false && file.progress?.percentage < 100)
        );

        if (failedFiles.length === 0) {
            toast.info("没有发现失败的上传任务");
            return;
        }

        // 重置失败的文件状态
        failedFiles.forEach(file => {
            try {
                uppyInstance.resetProgress(file.id);
                uppyInstance.retryUpload(file.id);
            } catch (error) {
                console.warn(`重置文件失败: ${file.name}`, error);
            }
        });

        toast.info(`正在重试 ${failedFiles.length} 个失败的上传`, {
            duration: 3000,
        });
    }, [uppyInstance]);
    // 添加统一的渲染函数
    const renderFiles = () => {
        const files = maxFile === 1 ? (storeObj1?.url ? [storeObj1] : []) : storeObj2 || []
        const hasFiles = files.length > 0
        const selectedFilesCount = uppyInstance ? uppyInstance.getFiles().length : 0

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
                    {openUppy && uppyInstance && (
                        <div key="dashboard">
                            <UploadModeSelector />
                            <Dashboard uppy={uppyInstance} plugins={["Webcam"]} locale={dashLocale} />
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="space-y-2">
                        <div className="flex justify-center items-center gap-2">
                            <Button
                                size="sm"
                                disabled={!openUppy && thisMaxFiles <= 0}
                                onClick={scrollHandler}
                            >
                                {openUppy ? "关闭上传" : `开启上传 (还可上传${thisMaxFiles}个)`}
                                {selectedFilesCount > 0 && ` | 已选 ${selectedFilesCount} 个`}
                            </Button>

                            {/* 新增：排除已完成按钮 */}
                            {uppyInstance && uppyInstance.getFiles().length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removeCompletedFiles}
                                    className="ml-2"
                                >
                                    排除已完成
                                </Button>
                            )}
                            {uppyInstance && uppyInstance.getFiles().some(file => file.error) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={retryFailedUploads}
                                    className="ml-2"
                                >
                                    重试失败上传
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    React.useEffect(() => {
        return () => {
            if (uppyInstance && Object.keys(pendingDeleteOperations).length > 0) {
                const currentMeta = uppyInstance.getState().meta
                uppyInstance.setMeta({
                    ...currentMeta,
                    pendingDeleteOperations: Object.keys(pendingDeleteOperations).map(url => ({
                        deleteUrl: url,
                        repId,
                        hash: hash || "default",
                        business,
                        timestamp: Date.now(),
                    })),
                })

                // 立即保存 uppy 状态到 indexDB
                const stateKey = `${repId}-${hash || "default"}`
                const uppyState = uppyInstance.getState()
                fileOperationsQueue.saveUppyState({
                    key: stateKey,
                    repId,
                    hash: hash || "default",
                    timestamp: Date.now(),
                    files: uppyState.files,
                    meta: uppyInstance.getState().meta,
                    oldfiles: maxFile === 1 ? (storeObj1?.url ? [storeObj1] : []) : storeObj2,
                }).catch((error) => {
                    console.error("[v0] Failed to persist pending deletes on unmount:", error)
                })
            }
        }
    }, [pendingDeleteOperations, repId, hash, uppyInstance, business, storeObj1, storeObj2, maxFile])

    const uploadDom = (
        <>
            {renderFiles()}
            <div id={hash ?? "_pf"} className="text-center mt-2"></div>
        </>
    )
    return {
        uploadDom,
        uppyInstance,
        pendingDeleteOperations,
        delOssFileFunc,
        cancelPendingOperations,
    }
}
