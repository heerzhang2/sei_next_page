import * as React from "react";
import {useStorage} from "../StorageContext";
import {Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui";
import {ProjectListFormField} from "@/components/project-list-form-integration";
import {useCallback, useState} from "react";
import {useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";
import {Edit} from "lucide-react";
import {useFrameEditorBar} from "@/report/hook/useFormFramework";

const mockProjects = {
    1: { title: "用户认证系统", description: "实现用户登录注册功能" },
    2: { title: "数据库设计", description: "设计用户和权限表结构" },
    3: { title: "API 接口开发", description: "开发 RESTful API" },
    4: { title: "前端界面", description: "React 组件开发" },
    5: { title: "测试用例", description: "单元测试和集成测试" },
    6: { title: "部署配置", description: "Docker 和 CI/CD 配置" },
    7: { title: "文档编写", description: "API 文档和用户手册" },
    8: { title: "性能优化", description: "数据库和前端性能优化" },
    9: { title: "安全加固", description: "安全漏洞检查和修复" },
    0: { title: "监控告警", description: "系统监控和告警配置" },
}
/**可重复的分项控制：
 * 特殊路由 的 当前分项报告的各个分项在子报告 控制
 * 新增加分项枪击确认保存后爆出hook错误了：因为右半边页面这回仅仅过render？路由没动啊。
 * */
export function useSubRepController(modelkey: string, rep:any, callback: (store: any,index: number) => React.ReactNode, subrid?:string
) {
    const { storage, setStorage, parrepfs } = useStorage()
    const [oldvalue, setOldvalue] = useState({ projectId: storage?.['_'+modelkey] ?? [] });

    const maxIdNumo = Math.max(...(storage?.['_'+modelkey] || [-1]) ) ??0;
    const maxIdNum =maxIdNumo<0 ? 0 : maxIdNumo;
    // const onConfirmation = React.useCallback(async() => {
    //     await  setStorage({ ...storage, ...inp });
    // }, [inp,storage,setStorage]);

    const [formData, setFormData] = useState({ projectId: storage?.['_'+modelkey] ?? [] });
    const renderProjectTitle = (index: number) => {
        const project = mockProjects[index as keyof typeof mockProjects]
        if (!project) return `项目 ${index}`
        return (
            <div>
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-gray-500">{callback(storage,index)}</div>
            </div>
        )
    }
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        // setFormData({ ...formData, projectId: modelredos });
        console.log("提交的项目索引:", formData)
    };
    const onItemChanged = useCallback((ids: any) => {
        setFormData({ ...formData, projectId: ids })
    }, [setFormData])


    const onReset = () => {
        setFormData({ ...formData, ...oldvalue })
    }
    //modType:"THICK_MS"
    const [render] = useFrameEditorBar({root:true, rep, values: { ['_'+modelkey]: formData.projectId }, onReset,subrid})
    const view=(
        <div>
            <Card className="py-1 gap-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        仪器编号的编辑器
                        <Badge variant="secondary">共 {(storage?.['_'+modelkey] ?? []).length} 个</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-1">
                    <ProjectListFormField  name={"testajhde"}
                                           renderTitle={renderProjectTitle}
                                           value={formData.projectId}
                                           onChange={onItemChanged}
                                           availableProjects={Object.keys(mockProjects).map(Number)}
                    />
                </CardContent>
                <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
            </Card>
        </div>
    );

  return { view };
}
