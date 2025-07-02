import * as React from "react";
import {useStorage} from "../StorageContext";
import {Card, CardContent, CardFooter} from "@/components/ui";
import {ProjectListFormField} from "@/component/project-list-form";
import {useCallback, useState} from "react";
import {useFrameEditorBar} from "@/report/hook/useFormFramework";
import {useRouter, useSearchParams} from "next/navigation";

/**可重复的分项控制：
 * 特殊路由 的 当前分项报告的各个分项在子报告 控制
 * 新增加分项枪击确认保存后爆出hook错误了：因为右半边页面这回仅仅过render？路由没动啊。
 * */
export function useSubRepController(modelkey: string, rep:any, callback: (store: any,index: number) => React.ReactNode, subrid?:string
) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRedId = searchParams.get("redId") || "0"
    const { storage,  } = useStorage()
    const [oldvalue, ] = useState({ projectId: storage?.['_'+modelkey] ?? [] });
    const [formData, setFormData] = useState({ projectId: storage?.['_'+modelkey] ?? [] });
    const renderProjectTitle = (index: number) => {
        return (
            <div>
                <div className="font-medium">{callback(storage,index)}</div>
                <div className="text-sm text-gray-500">项目 {index}</div>
            </div>
        )
    }
    const onItemChanged = useCallback((ids: any) => {
        setFormData({ ...formData, projectId: ids })
    }, [setFormData])
    const onReset = () => {
        setFormData({ ...formData, ...oldvalue })
    }
    const canDeleteItem = useCallback((pid: number) => {
        const key =`_${modelkey}_${pid}`
        return storage?.[key]===undefined
    }, [modelkey,storage])
    const switchRedId = (newRedId: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("redId", String(newRedId))
        params.set("original", "1") // 保持其他参数
        router.push(`?${params.toString()}`)
    }
    //http://192.168.171.3:3765/rep/yAEq8hveSa-ZXgUyKHEEHVJlcG9ydA/INDPL_DJ/1/_Controller?modelkey=THICK_MS
    //http://192.168.171.3:3765/rep/yAEq8hveSa-ZXgUyKHEEHVJlcG9ydA/INDPL_DJ/1/ThkmsInstrument?original=1&redId=0#ThkmsInstrument
    const onProjectClick= useCallback((index: number) => {
        switchRedId(index)
    }, [modelkey,storage])

    const [render] = useFrameEditorBar({root:true, rep, values: { ['_'+modelkey]: formData.projectId }, onReset,subrid})
    const view=(
        <div className="my-auto content-center"  style={{ height: `calc(100vh - 6rem)` }}>
            <Card className="py-1 gap-2 mt-4">
                <CardContent className="p-0 space-y-1">
                    <ProjectListFormField  renderTitle={renderProjectTitle}
                           value={formData.projectId}  onChange={onItemChanged}
                           canDeleteItem={canDeleteItem} onProjectClick={onProjectClick}
                    />
                </CardContent>
                <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2 mb-8">
                    {render()}
                    <span>注意：分项的项目数据内容还未清空的就无法删除</span>
                </CardFooter>
            </Card>
        </div>
    );
  return { view };
}
