"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveTabsList } from "@/components/responsive-tabs-list"

export default function ExampleUsage() {
    // 示例数据
    const config加速度 = [
        ["tab1", "测wewqqwe点1"],
        ["tab2", "测sdfqweds点2"],
        ["tab3", "测sssasdsdf点3"],
        ["tab4", "测xcvasdcxv点4"],
    ]

    // 模拟表单
    const form = {
        watch: () => [],
        control: {},
    }

    // 模拟数据
    const arrays = {
        tab1: { fields: [{ id: 1 }, { id: 2 }] },
        tab2: { fields: [{ id: 1 }] },
        tab3: { fields: [{ id: 1 }] },
        tab4: { fields: [{ id: 1 }] },
        tab5: { fields: [{ id: 1 }] },
        tab6: { fields: [{ id: 1 }] },
        tab7: { fields: [{ id: 1 }] },
        tab8: { fields: [{ id: 1 }] },
    }

    const AxyzCfg = [
        ["ax_max", "Ax.max"],
        ["ax_min", "Ax.min"],
        ["ay_max", "Ay.max"],
        ["ay_min", "Ay.min"],
        ["az_max", "Az.max"],
        ["az_min", "Az.min"],
    ]

    const calcAverageArrObj = () => "0.00"
    const AxyzNm = ["ax_max", "ax_min", "ay_max", "ay_min", "az_max", "az_min"]
    const stnum = 1

    return (
        <div className="w-full p-4">
            <h2 className="text-xl font-bold mb-4">标签布局示例</h2>

            <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">正常宽度</h3>
                <Tabs defaultValue={config加速度[0][0]} className="w-full">
                    <ResponsiveTabsList minTabWidth={120}>
                        {config加速度.map(([name, title]) => (
                            <TabsTrigger key={name} value={name}>
                                {title}
                            </TabsTrigger>
                        ))}
                    </ResponsiveTabsList>

                    {config加速度.map(([name, title]) => (
                        <TabsContent key={name} value={name}>
                            <Card className="bg-transparent border-dashed py-1">
                                <CardHeader>
                                    <CardTitle>{title} 加速度测量</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>标签内容 {name}</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">窄屏幕模拟 (300px)</h3>
                <div className="w-[300px] border border-dashed p-2">
                    <Tabs defaultValue={config加速度[0][0]} className="w-full">
                        <ResponsiveTabsList minTabWidth={100}>
                            {config加速度.map(([name, title]) => (
                                <TabsTrigger key={name} value={name}>
                                    {title}
                                </TabsTrigger>
                            ))}
                        </ResponsiveTabsList>

                        {config加速度.map(([name, title]) => (
                            <TabsContent key={name} value={name}>
                                <Card className="bg-transparent border-dashed py-1">
                                    <CardHeader className="py-2">
                                        <CardTitle className="text-sm">{title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <p className="text-xs">标签内容 {name}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-2">超窄屏幕模拟 (200px)</h3>
                <div className="w-[200px] border border-dashed p-2">
                    <Tabs defaultValue={config加速度[0][0]} className="w-full">
                        <ResponsiveTabsList minTabWidth={80}>
                            {config加速度.map(([name, title]) => (
                                <TabsTrigger key={name} value={name}>
                                    {title}
                                </TabsTrigger>
                            ))}
                        </ResponsiveTabsList>

                        {config加速度.map(([name, title]) => (
                            <TabsContent key={name} value={name}>
                                <Card className="bg-transparent border-dashed py-1">
                                    <CardHeader className="py-1">
                                        <CardTitle className="text-xs">{title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-1">
                                        <p className="text-xs">标签内容 {name}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
