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
import { ImageComponentNatural } from "@/components/natural"
import { useCallback } from "react"
import { toast } from "sonner"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import { Clock } from "lucide-react"

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
        uploading: "努力上传中",
        uploadPaused: "暂停上传",
        paused: "暂停",
        resume: "恢复上传",
        uploadComplete: "恭喜干完了",
        complete: "完事",
        done: "返回",
    },
}

export type FileStore = {
    name: string
    url: string
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

// 上传模式类型
type UploadMode = "tus" | "xhr"

/**不支持切换页面后回来继续刚才的未完成的上传！tus断点续传也是要求当前网页需要保留在目前状态管理的，不能跳转其他网页去，否则不能正常完成上传。
 * 可以支持一个页面 多个上传的面板同时存在的。
 * @param repId 分布式对象存储系统靠这个 eid ID来关联业务系统关系数据库的。
 * @param field  inp?.[field]? 存储上传后的文件对象信息对应inp字段。 _FILE_为前缀的； 数据=可能是{}单个的，也可能多为文件形式[{ }, ]？
 * @param maxFile 设计上的最多文件个数【maxFile决定了file保存是数组还是对象】最多传几个文件； 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
 * @param maxSize  每一个文件大小最大 多少 MB 兆B单位。
 * 删除旧文件：关联的 rep+ repId必须的！
 * @param liveDays  该文件要求存储保留天数。 报告应该保留天数估计> 20年吧。
 * @param onFinish [可选参数] #立刻生效给context 避免 事务性的缺失。 【上传任务完成】保存回调。 可能有多个的已经上传的文件！若删除多文件其中一个文件的onFinish参数file是剩下的文件数组。
 *  参数 onFinish?的回调类型:(file:any,del:boolean)=>void；
 * @param storeObj 对象或数组， 依照maxFile=1来判定的json inp{}关联存储 _FILE_S 还是 _FILE_ 单个多个的分别。
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
                              }: {
    repId: string
    storeObj: FileStore | FileStore[]
    maxFile?: number
    liveDays?: number
    maxSize?: number
    onFinish?: (file: any, del: boolean) => void
    hash?: string
    id?: string
    business?: string
    open?: boolean
}) {
    const [openUppy, setOpenUppy] = React.useState(open)
    const [uppyInstance, setUppyInstance] = React.useState<Uppy | null>(null)
    const [uploadMode, setUploadMode] = React.useState<UploadMode>("xhr")
    const scrollHandler = useScrollHandler(".uppy-Dashboard-browse")(setOpenUppy, openUppy)
    const dashLocale = DASH_LOCALE_CONFIG
    //Uppy实例初始化：【很大的局限性】无法恢复一次路由跳转出去后重新再进来本页面的，删一次挑选的那些尚未完成上传文件，就算TUS也不能恢复状态的，只能不离开页面TUS才能继续干活的。
    const createUppyInstance = () => {
        const uniqueId = id ? id : `Report-${repId}-${hash || "default"}`
        // console.log(`Creating new Uppy instance: ${uniqueId}`)
        const newUppy = new Uppy({
            id: uniqueId,
            restrictions: { maxNumberOfFiles: maxFile },
        })
        if (uploadMode === "tus") {
            // 配置 Tus 插件
            newUppy.use(Tus, {
                id: "tus-upload",
                endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/uploadTUS/`,
                withCredentials: true,
                chunkSize: 5 * 1024 * 1024,
                retryDelays: [0, 1000, 3000, 5000],
                async onBeforeRequest(req) {
                    const token = await getAuthToken()
                    if (token) {
                        req.setHeader("Authorization", `Bearer ${token}`)
                    }
                },
                async onAfterResponse(req, res) {
                    const status = res.getStatus()
                    if (status === 401) {
                        newUppy.info("需刷新token")
                        window.dispatchEvent(new CustomEvent("token:refresh-needed"));
                    }
                    const url = req.getURL()
                    const value = res.getHeader("Tus2minIoUrl")
                    // 存储服务相关的错误
                    if (status === 503) {
                        const errorMessage = value || "无服务"
                        newUppy.info(`Upload failed: ${errorMessage}`, "error", 999000)
                        toast.error("OSS存储服务问题", {
                            description: errorMessage,
                            duration: 8000,
                        })
                        newUppy.pauseAll()
                    }
                    // 存储空间不足等业务错误
                    else if (value && value.includes("Insufficient storage space")) {
                        newUppy.info("Upload failed: Insufficient storage space", "error", 999000)
                        toast.error("存储", {
                            description: "可写磁盘容量不足",
                        })
                        newUppy.pauseAll()
                    }
                    // 其他服务器错误
                    else if (status >= 500) {
                        toast.error("Server Error", {
                            description: value,
                        })
                        newUppy.pauseAll()
                    } else if (value) {
                        const steob = {} as any
                        steob[url] = value
                        newUppy.setState({ ...steob })
                        // 可选：显示成功提示
                        toast.success("成功", {
                            description: "上传完成",
                        })
                    }
                },
            })
        } else {
            // 修复 XHR 插件的 onBeforeRequest
            newUppy.use(XHRUpload, {
                id: "xhr-upload",
                endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/api/upload`,
                method: "POST",
                formData: true,
                fieldName: "files[]",
                timeout: 600000,
                limit: 1,
                allowedMetaFields: true,
                shouldRetry: (xhr: XMLHttpRequest) => {
                    return false;
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
                            //必须返回{url：}对象：这样才能在handleUpSuccess()里面result.successful才能看得到uploadURL，是uppy库转化生成的。
                            const obj = data?.successful[0]
                            errStr = obj?.error
                            if (obj?.url) return obj
                        }
                    } catch (e) {}
                    newUppy.info("不要重试，估计没可用空间:" + errStr, "error", 999000)
                    if (errStr.includes("Failed to connect to")) errStr = "OSS存储集群服务不可用"
                    toast.error("上传失败", {
                        description: errStr,
                    })
                    // newUppy.cancelAll()
                    return {}
                },
                async onAfterResponse(xhr) {
                    if (xhr.status === 401) {
                        newUppy.info("需刷新token")
                        window.dispatchEvent(new CustomEvent("token:refresh-needed"));
                        // newUppy.pauseAll()
                        return
                    }
                    if (xhr.status === 403) {
                        toast.error("上传失败", {
                            description: "请重新登录，刷新token",
                        })
                    }
                    try {
                        const data = JSON.parse(xhr.response)
                        if (data?.successful) {
                            const steob = {} as any
                            //类似TUS的做法，目的是给handleUpSuccess里面的统一处理做法提供支持。
                            steob[data?.successful[0]?.url] = data?.successful[0]?.url
                            newUppy.setState({ ...steob })
                        } else {
                            console.warn(`上传应答错误`)
                        }
                    } catch (e) {
                        console.error(`上传错误`)
                    }
                },
            })
        }
        return newUppy
    }

    // 初始化 Uppy 实例
    React.useEffect(() => {
        if (!uppyInstance) {
            const newUppy = createUppyInstance()
            setUppyInstance(newUppy)
        } else {
            uppyInstance.destroy()
            const newUppy = createUppyInstance()
            setUppyInstance(newUppy)
        }
    }, [repId, hash, maxFile, uploadMode]) // 添加上传模式到依赖

    // 当关键参数变化时重新初始化 Uppy 状态
    React.useEffect(() => {
        if (uppyInstance) {
            uppyInstance.cancelAll()
            uppyInstance.setState({ oldfiles: undefined })
            uppyInstance.setMeta({ eid: repId, liveDays, business })
        }
    }, [repId, liveDays, uppyInstance])
    //不能合并上面的，会造选择的文件失败就不见了。
    React.useEffect(() => {
        if (uppyInstance) {
            uppyInstance.setState({ oldfiles: maxFile > 1 ? storeObj : undefined })
        }
    }, [uppyInstance, maxFile, storeObj])

    //验证存储对象类型
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
        async (result: any, arIndex: number) => {
            const isError = typeof result === "string" && (result.startsWith("OSS服务不可用") || result.startsWith("未登录"))
            const toastMethod = isError ? toast.error : toast.info
            toastMethod("文件删除", {
                description: "结果: " + (result === "未登录" ? "失败，请重新登录" : result),
                duration: isError ? 9000 : 2000,
            })

            if (isError) {
                const deleteUrl = maxFile === 1 ? storeObj1?.url : storeObj2?.[arIndex]?.url
                if (deleteUrl) {
                    await fileOperationsQueue.addOperation({
                        type: "delete",
                        repId,
                        hash: hash || "default",
                        business,
                        deleteUrl,
                        deleteIndex: arIndex,
                    })
                    toast.info("已加入队列", {
                        description: "删除操作将在网络恢复后自动重试",
                    })
                }
            } else if ("成功" === result || "文件不存在" === result) {
                if (1 === maxFile) {
                    onFinish && onFinish(undefined, true)
                } else {
                    const newStoreObj = [...storeObj2]
                    newStoreObj.splice(arIndex, 1)
                    onFinish && onFinish(newStoreObj, true)
                }
            }
        },
        [maxFile, onFinish, storeObj2, storeObj1, repId, hash, business],
    )
    const { call: delOssFileFunc } = useOssDeleteFileMutation(whenDeleted)
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
                    return { name: up.name, url: fileUrl, type: up.type }
                })
                .filter((item) => item !== null) // 立即过滤
            if (failUploads) {
                uppyInstance.info("上传失败的文件：" + failUploads, "error", 5000)
            }
            const newarr = [...more]
            const cntfile = newarr.length
            if (cntfile > 0) {
                setOpenUppy(false)
                const newfile = newarr?.map(({ name, url }) => ({ name, url }))
                // 上传成功后立即清理相关的 Tus 记录
                setTimeout(() => {
                    cleanupTusLocalStorage()
                }, 2000)
                if (onFinish) {
                    if (1 === maxFile) {
                        onFinish(newfile?.[0] || undefined, false)
                    } else {
                        const { oldfiles } = newUppsta
                        const merged = [...((oldfiles as any[]) ?? []), ...(newfile as any[])]
                        onFinish(merged, false)
                    }
                }
            }
        },
        [maxFile, onFinish, uppyInstance, repId, hash],
    )
    // 设置 Uppy 选项和事件监听
    React.useEffect(() => {
        if (!uppyInstance) return
        uppyInstance.setOptions({
            restrictions: {
                maxNumberOfFiles: thisMaxFiles,
                maxFileSize: maxSize * 1024 * 1024,
            },
            locale: UPPY_LOCALE_CONFIG, // 使用常量
        })
        // uppyInstance.getPlugin()
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

    // 上传模式切换处理
    const handleModeChange = (mode: UploadMode) => {
        setUploadMode(mode)
        if (uppyInstance) {
            // 重新设置语言配置
            uppyInstance.setOptions({
                locale: UPPY_LOCALE_CONFIG,
            })
            // 重新验证所有文件的上传方式
            uppyInstance.getFiles().forEach((file) => {
                uppyInstance.setFileMeta(file.id, { forcedMode: mode })
            })
        }
        // 强制重新渲染 Dashboard
        setOpenUppy(false)
        setTimeout(() => {
            setOpenUppy(true)
        }, 50) // 更短的延迟
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
                >
                    常规模式
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                {uploadMode === "tus" && "用 TUS 协议，支持断点续传和巨大超大文件"}
                {uploadMode === "xhr" && "用标准 HTTP 上传，事务性更好，最大支持500兆的"}
            </div>
        </div>
    )

    const saveCurrentState = React.useCallback(async () => {
        if (!uppyInstance) return

        const files = uppyInstance.getFiles()
        if (files.length === 0) {
            toast.info("无需保存", {
                description: "当前没有待上传的文件",
            })
            return
        }

        const filesWithData = await Promise.all(
            files.map(async (file) => {
                let data: ArrayBuffer | undefined
                if (file.data instanceof Blob) {
                    data = await file.data.arrayBuffer()
                }
                return {
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data,
                    progress: file.progress?.percentage,
                    uploadURL: file.uploadURL,
                }
            }),
        )

        const stateKey = `${repId}${hash ? `:${hash}` : ""}`
        await fileOperationsQueue.saveUppyState({
            key: stateKey,
            repId,
            hash: hash || "default",
            timestamp: Date.now(),
            files: filesWithData,
            meta: uppyInstance.getState().meta,
            oldfiles: uppyInstance.getState().oldfiles,
        })

        toast.success("已保存", {
            description: `已保存 ${files.length} 个文件的状态，可稍后恢复`,
        })
    }, [uppyInstance, repId, hash])

    const SaveStateButton = () => (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={saveCurrentState}
            disabled={!uppyInstance}
            className="ml-2 bg-transparent"
        >
            <Clock className="w-4 h-4 mr-2" />
            记住未完成的文件操作
        </Button>
    )

    const renderSingleFile = () => {
        if (openUppy && uppyInstance) {
            return (
                <div key="dashboard">
                    <UploadModeSelector />
                    <Dashboard uppy={uppyInstance} plugins={["Webcam"]} locale={dashLocale} />
                </div>
            )
        } else if (storeObj1?.url) {
            return (
                <div key="image">
                    <ImageComponentNatural
                        src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${storeObj1.url}` || "/placeholder.svg"}
                        alt={storeObj1?.url || "图片"}
                    />
                </div>
            )
        } else {
            return (
                <div key="placeholder" className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">暂无图片</p>
                </div>
            )
        }
    }

    const renderMultipleFiles = () => {
        return (
            <>
                <div className="text-center">
                    {storeObj2?.map(({ name, url }: any, i: number) => {
                        return (
                            <div key={i}>
                                {i > 0 && <hr />}
                                <div id={(hash ?? "_pf") + `${i}`} className="flex justify-around items-center">
                                    {url && (
                                        <ImageComponentNatural
                                            src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${url}` || "/placeholder.svg"}
                                            alt={url}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="text-center mt-4">
                    {openUppy && uppyInstance && (
                        <div key="dashboard-multi">
                            <UploadModeSelector />
                            <Dashboard uppy={uppyInstance} plugins={["Webcam"]} locale={dashLocale} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <div className="flex justify-center items-center gap-2">
                            <Button size="sm" disabled={!openUppy && thisMaxFiles <= 0} onClick={scrollHandler}>
                                {openUppy ? "关闭上传" : `开启上传 (还可上传${thisMaxFiles}个)`}
                            </Button>
                            {openUppy && <SaveStateButton />}
                        </div>
                    </div>
                </div>
            </>
        )
    }
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

    if (1 === maxFile) {
        const onlyOne = (
            <>
                {renderSingleFile()}
                <div id={hash ?? "_pf"} className="text-center mt-2">
                    {storeObj1?.url ? (
                        <div className="space-x-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={(e) => {
                                    delOssFileFunc(storeObj1?.url, 0, "eid", repId)
                                    e.preventDefault()
                                }}
                            >
                                删除旧的
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-2">
                            <Button size="sm" onClick={scrollHandler}>
                                {openUppy ? "关闭上传" : "开启上传"}
                            </Button>
                            {openUppy && <SaveStateButton />}
                        </div>
                    )}
                </div>
            </>
        )

        return [onlyOne, uppyInstance] as const
    } else if (maxFile > 1) {
        const manyMore = (
            <>
                {renderMultipleFiles()}
                <div id={hash ?? "_pf"} className="text-center mt-2">
                    {storeObj2?.map(({ url }: any, i: number) => (
                        <Button
                            key={i}
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                delOssFileFunc(url, i, "eid", repId)
                                e.preventDefault()
                            }}
                        >
                            删除第{i + 1}个文件
                        </Button>
                    ))}
                </div>
            </>
        )

        return [manyMore, uppyInstance] as const
    } else return [null, null] as const
}
