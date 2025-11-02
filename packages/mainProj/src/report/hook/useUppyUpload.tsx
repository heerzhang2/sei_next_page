"use client"
import * as React from "react"
import Uppy, {type UppyFile} from "@uppy/core"
import Tus from "@uppy/tus"
import XHRUpload from "@uppy/xhr-upload"
// import Webcam from "@uppy/webcam";
import useOssDeleteFileMutation from "../../hooks/useOssDeleteFileMutation"
// import Dashboard from '@uppy/react/lib/Dashboard';
import Dashboard from '@uppy/react/dashboard';
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
// import "@uppy/core/dist/style.min.css"
// import "@uppy/dashboard/dist/style.min.css"
// import "@uppy/webcam/dist/style.min.css"
// Add custom styles to fix Tailwind conflicts
import "./uppy-fixes.css"

import { getAuthToken } from "@/lib/auth-token"
import { Button } from "@/components/ui"
import { ImageComponentNatural } from "@/components/natural"
import { useCallback } from "react"

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
type UploadMode = 'tus' | 'xhr'

/**可以支持一个页面 多个上传的面板同时存在的。
 * @param repId 分布式对象存储系统靠这个 rep ID来关联业务系统关系数据库的。
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
 * */
export function useUppyUpload({
                                  repId,
                                  storeObj,
                                  maxFile = 1,
                                  liveDays = 2,
                                  maxSize = 3,
                                  onFinish,
                                  hash,
                                  id,
                              }: {
    repId: string
    storeObj: FileStore | FileStore[]
    maxFile?: number
    liveDays?: number
    maxSize?: number
    onFinish?: (file: any, del: boolean) => void
    hash?: string
    id?: string
}) {
    const [openUppy, setOpenUppy] = React.useState(false)
    const [uppyInstance, setUppyInstance] = React.useState<Uppy | null>(null)
    const [uploadMode, setUploadMode] = React.useState<UploadMode>('xhr')

    // 根据文件大小和模式决定使用哪种上传方式
    const shouldUseTus = React.useCallback((file: any): boolean => {
        if (uploadMode === 'tus') return true
        if (uploadMode === 'xhr') return false

        // auto 模式：大文件使用 tus
        return file.size > 20 * 1024 * 1024 // 20MB 以上使用 tus
    }, [uploadMode])

    // 创建 Uppy 实例的函数
    const createUppyInstance = () => {
        const uniqueId = id ? id : `Report-${repId}-${hash || "default"}`
        // console.log(`Creating new Uppy instance: ${uniqueId}`)
        const newUppy = new Uppy({
            id: uniqueId,
            restrictions: { maxNumberOfFiles: maxFile },
        })
        if (uploadMode === 'tus'){
            // 配置 Tus 插件
            newUppy.use(Tus, {
                id: 'tus-upload',
                endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/uploadTUS/`,
                withCredentials: true,
                chunkSize: 5 * 1024 * 1024, // 5MB 分片
                retryDelays: [0, 1000, 3000, 5000],
                async onBeforeRequest(req) {
                    const token = await getAuthToken()
                    if (token) {
                        req.setHeader("Authorization", `Bearer ${token}`)
                    }
                },
                async onAfterResponse(req, res) {
                    if (res.getStatus() === 401) {
                        newUppy.info("刷新token")
                    }
                    const url = req.getURL()
                    const value = res.getHeader("Tus2minIoUrl")
                    var occur = value?.indexOf("DO NOT TRY:")
                    if (occur === 0) {
                        newUppy.info("不要重试，报错" + value, "error", 999000)
                        newUppy.pauseAll()
                    } else {
                        const steob = {} as any
                        steob[url] = value
                        newUppy.setState({ ...steob })
                        // console.log(`Setting state for ${url}: ${value}`)
                    }
                },
            })
        }
        else{
            // 修复 XHR 插件的 onBeforeRequest
            newUppy.use(XHRUpload, {
                id: 'xhr-upload',
                endpoint: `${process.env.NEXT_PUBLIC_BACK_END}/api/upload`,
                method: 'POST',
                formData: true,
                fieldName: 'files[]',
                timeout: 300000,
                limit: 3,
                async onBeforeRequest(xhr) {
                    const token =await getAuthToken()
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                },
                async getResponseData(response: XMLHttpRequest) {
                    const text = await response.text()
                    try {
                        const data = JSON.parse(text)
                        return data
                    } catch (e) {
                        return { url: text }
                    }
                },
                async onAfterResponse(xhr) {
                    if (xhr.status === 401) {
                    }
                    const url = xhr.body?.url || xhr.body?.fileUrl
                    if (url) {
                        const steob = {} as any
                        steob[file.uploadURL] = url
                        newUppy.setState({ ...steob })
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
            uppyInstance.setMeta({ rep: repId, liveDays })
            uppyInstance.setState({ oldfiles: maxFile > 1 ? storeObj : undefined })
        }
    }, [repId, liveDays, uppyInstance, maxFile, storeObj])

    // 组件卸载时清理 Uppy 实例
    React.useEffect(() => {
        return () => {
            if (uppyInstance) {
                uppyInstance.destroy()
            }
        }
    }, [uppyInstance, repId])

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

    //【上传应答】结束时刻回调
    const handleUpSuccess = React.useCallback(
        (result: { successful: any[] }) => {
            if (!uppyInstance) {
                console.error("Uppy instance is null in handleUpSuccess")
                return
            }
            const newUppsta = uppyInstance.getState()
            const more = result.successful.map((up) => {
                const fileUrl = newUppsta[up.uploadURL]
                return { name: up.name, url: fileUrl, type: up.type }
            })
            const newarr = [...more]
            const cntfile = newarr.length
            if (cntfile > 0) {
                setOpenUppy(false)
                const newfile = newarr?.map(({ name, url }) => ({ name, url }))

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
                maxFileSize: maxSize * 1024 * 1024
            },
            locale: {
                strings: {
                    cancel: "还是取消",
                },
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

    // 上传模式切换处理
    const handleModeChange = (mode: UploadMode) => {
        setUploadMode(mode)
        // 重新验证所有文件的上传方式
        if (uppyInstance) {
            uppyInstance.getFiles().forEach(file => {
                uppyInstance.setFileMeta(file.id, { forcedMode: mode })
            })
        }
    }

    // 上传模式选择器组件
    const UploadModeSelector = () => (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                上传模式选择：
            </label>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => handleModeChange('tus')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        uploadMode === 'tus'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                 断点续传模式
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange('xhr')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        uploadMode === 'xhr'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                 常规模式
                </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
                {uploadMode === 'tus' && '用 TUS 协议，支持断点续传和超大文件上传'}
                {uploadMode === 'xhr' && '用标准 HTTP 上传，事务性更好'}
            </div>
        </div>
    )

    //参数arIndex：回调时刻制定了 从哪一个文件index来触发删除后调用的。
    const whenDeleted = React.useCallback(
        (result: any, arIndex: number) => {
            if ("成功" === result || "不存在" === result) {
                if (1 === maxFile) {
                    onFinish && onFinish(undefined, true)
                } else {
                    const newStoreObj = [...storeObj2]
                    newStoreObj.splice(arIndex, 1)
                    onFinish && onFinish(newStoreObj, true)
                }
            }
        },
        [maxFile, onFinish, storeObj2, repId, hash],
    )

    const { call: delOssFileFunc } = useOssDeleteFileMutation(whenDeleted)
    const scrollHandler = useScrollHandler(".uppy-Dashboard-browse")(setOpenUppy, openUppy)

    // 如果 Uppy 实例还没有创建，显示加载状态
    if (!uppyInstance) {
        return [<div key="loading">正在初始化上传组件...</div>]
    }

    //单一文件情况的：
    if (1 === maxFile) {
        const onlyOne = (
            <>
                {openUppy ? (
                    <div key="dashboard">
                        <UploadModeSelector />
                        <Dashboard uppy={uppyInstance} plugins={["Webcam"]} />
                    </div>
                ) : storeObj1?.url ? (
                    <div key="image">
                        <ImageComponentNatural
                            src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${storeObj1.url}` || "/placeholder.svg"}
                            alt={storeObj1?.url || "图片"}
                        />
                    </div>
                ) : (
                    <div key="placeholder" className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">暂无图片</p>
                    </div>
                )}
                <div id={hash ?? "_pf"} className="text-center mt-2">
                    {storeObj1?.url ? (
                        <div className="space-x-2">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                    delOssFileFunc(storeObj1?.url, 0, "rep", repId)
                                    e.preventDefault()
                                }}
                            >
                                删除旧的
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Button size="sm" onClick={scrollHandler}>
                                {openUppy ? "关闭上传" : "开启上传"}
                            </Button>
                        </div>
                    )}
                </div>
            </>
        )

        return [onlyOne]
    } else if (maxFile > 1) {
        //允许有多个文件情况：类似 _FILE_部位 ； 多个文件存储的  _FILE_S部位 单一文件
        const manyMore = (
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={(e) => {
                                        delOssFileFunc(url, i, "rep", repId)
                                        e.preventDefault()
                                    }}
                                >
                                    删除第{i + 1}个文件
                                </Button>
                            </div>
                        )
                    })}
                </div>
                <div className="text-center mt-4">
                    {openUppy && (
                        <div key="dashboard-multi">
                            <UploadModeSelector />
                            <Dashboard uppy={uppyInstance} plugins={["Webcam"]} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Button size="sm" disabled={!openUppy && thisMaxFiles <= 0} onClick={scrollHandler}>
                            {openUppy ? "关闭上传" : `开启上传 (还可上传${thisMaxFiles}个)`}
                        </Button>
                    </div>
                </div>
            </>
        )

        return [manyMore]
    } else return []
}