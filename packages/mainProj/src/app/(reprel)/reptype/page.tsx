import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { 
    getAllTemplatesInfo, 
    groupTemplatesByType, 
    getEquipmentTypeLabel, 
    getDefaultTab,
    TemplateInfo 
} from "./templateUtils";
import HeaderWrapper from "@/component/header-wrapper";

// 编译时生成静态页面
export const dynamic = 'force-static';

export default function ReportTypesPage() {
    // 在编译时获取模板信息
    const templates = getAllTemplatesInfo();
    const groupedTemplates = groupTemplatesByType(templates);
    const defaultTab = getDefaultTab(groupedTemplates);

    // 定义标签顺序
    const tabOrder = [
        { key: 'boiler', label: '1锅炉' },
        { key: 'vessel', label: '2压力容器' },
        { key: 'elevator', label: '3电梯' },
        { key: 'crane', label: '4起重' },
        { key: 'vehicle', label: '5场(厂)车' },
        { key: 'amusement', label: '6游乐设施' },
        { key: 'ropeway', label: '9客运索道' },
        { key: 'piping', label: '8压力管道' },
        { key: 'atmospheric', label: 'R常压容器' },
        { key: 'valve', label: 'F安全阀' },
        { key: 'water', label: 'Z水质' },
        { key: 'component', label: '7管道元件' },
        { key: 'other', label: '其它' },
    ];

    // 过滤出有模板的标签
    const availableTabs = tabOrder.filter(tab => groupedTemplates[tab.key]?.length > 0);

    return (
        <div className="container mx-auto py-8 px-4">
            <HeaderWrapper />
            <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-transparent" asChild>
                <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-6">检验报告模板类型</h1>

            <p className="mb-6 text-muted-foreground">
                已支持的检验报告模板类型，共 {templates.length} 个模板
            </p>

            {availableTabs.length > 0 ? (
                <Tabs defaultValue={defaultTab}>
                    <TabsList className="mb-4 flex-wrap h-auto">
                        {availableTabs.map(tab => (
                            <TabsTrigger key={tab.key} value={tab.key}>
                                {tab.label}
                                <span className="ml-1 text-xs text-muted-foreground">
                                    ({groupedTemplates[tab.key].length})
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {availableTabs.map(tab => (
                        <TabsContent key={tab.key} value={tab.key}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{tab.label} 模板列表</CardTitle>
                                    <CardDescription>
                                        共 {groupedTemplates[tab.key].length} 个报告模板
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal pl-5 space-y-3">
                                        {groupedTemplates[tab.key].map((template: TemplateInfo) => (
                                            <li key={template.code}>
                                                <Link 
                                                    href={`/rep/*/${template.code}/1`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                                                >
                                                    <span className="font-medium">{template.name}</span>
                                                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                                                        {template.code}
                                                    </span>
                                                    {template.config?.vers && (
                                                        <span className="text-xs text-green-600">
                                                            v{Object.keys(template.config.vers).join(', v')}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">
                            暂无已实现的报告模板，请在 <code>src/app/rep/[repId]/</code> 目录下创建模板文件夹
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">使用说明</h2>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-blue-700">
                    <li>点击模板名称可预览报告模板</li>
                    <li>版本号显示该模板支持的所有版本</li>
                    <li>旧版本标记为失效的模板将不再推荐使用</li>
                </ul>
            </div>
        </div>
    );
}
