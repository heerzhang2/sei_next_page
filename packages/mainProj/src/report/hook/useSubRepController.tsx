import * as React from "react";
import {useStorage} from "../StorageContext";
import {Card, CardContent, CardFooter} from "@/components/ui";
import {ProjectListFormField} from "@/component/project-list-form";
import {useCallback, useState} from "react";
import {useFrameEditorBar} from "@/report/hook/useFormFramework";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {undefined} from "zod";

const suffixToRemove = "_Controller";
export const findNodeIndex = <T extends { node: { id: string } }>(
    arr: T[],
    targetId: string
): number => {
    return arr.findIndex(item => {
        const node = item.node;
        return node && node.id === targetId;
    });
};

/**可重复的分项控制：
 * 特殊路由 的 当前分项报告的各个分项在子报告 控制
 * 新增加分项枪击确认保存后爆出hook错误了：因为右半边页面这回仅仅过render？路由没动啊。
 * */
export function useSubRepController(modelkey: string, rep:any, callback: (store: any,index: number) => React.ReactNode, subrid?:string
) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRedId = searchParams.get("redId") || "0"
    const { storage,setStorage, subrType, parrepfs,setModified } = useStorage()
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
        //不能用return (storage?.[key] === undefined)
        return (! storage?.[key] )
    }, [modelkey,storage])
    //编辑器上下文的： 若属于可独立流转的必然是有subrType subrid，普通的可重复分项目必定归属主报告上下文。
    //当前可流转分项目的存储：主报告，多个可流转分项报告；
    const localIdx =(subrType? parrepfs : storage)?.[`_${modelkey}`] ?? [];
    //同一种子报告的相对排序位置：
    const subrepidx = React.useMemo(() => {
        if(subrid){
            const flsReps =rep?.isp?.reps?.edges?.filter(({node: srep}: any) => {
                return srep?.modeltype===modelkey
            })
            const ifind = findNodeIndex(flsReps, subrid);
            //可流转分项报告：独立子报告单独显示的？定位
            // const storageIds =(subrType? storage : parrepfs)?.[`_${modelkey}`] ?? [];
            console.log("等待匹配的ID列表: 当前可流转分项ifind=", ifind);
            return ifind ?? undefined
        }
        else
            return 0;   //本地的分项不管有没有id都要加前缀1； localIdx?.length>0 ? 0: undefined;
    }, [subrid, modelkey, rep])
    const pathname = usePathname()
    //替换掉URL的action==='_Controller'部分；原本是router.push(`?${params.toString()}`)
    const switchRedId = (newRedId: number) => {
        const newUrlp = pathname.slice(0, -suffixToRemove.length)
        const params = new URLSearchParams(searchParams.toString())
        params.set("redId", String(newRedId))
        //params.set("original", "1")       router.push(`?${params.toString()}`)
        const hash=`_${modelkey}${subrepidx!>=0? '_'+(subrepidx!+1) : ''}-${newRedId}`
        router.push(newUrlp+`?${params.toString()}#${hash}`)
    }
    const onProjectClick= useCallback((index: number) => {
        switchRedId(index)
    }, [modelkey,storage])
    const onSubProjDelete= useCallback((index: number) => {
        const key =`_${modelkey}_${index}`
        setStorage((prevStorage :any) => ({
            ...prevStorage,
            [key]: undefined,
        }))
        setModified(true)
    }, [modelkey,storage])
    const [render] = useFrameEditorBar({root:true, rep, values: { ['_'+modelkey]: formData.projectId }, onReset,subrid})
    const view=(
        <div className="my-auto content-center"  style={{ height: `calc(100vh - 6rem)` }}>
            <Card className="py-1 gap-2 mt-4">
                <CardContent className="p-0 space-y-1">
                    <ProjectListFormField  renderTitle={renderProjectTitle}
                           value={formData.projectId}  onChange={onItemChanged}
                           canDeleteItem={canDeleteItem} onProjectClick={onProjectClick}
                           onDeleteItem={onSubProjDelete}
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
