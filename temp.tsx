import {
    Card, CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, Input, Textarea
} from "./mainProj/src/components/ui";
import {BlobInputList, ClearableSelect, SuffixInput} from "./mainProj/src/components/chub";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./mainProj/src/components/ui/tabs";
import {calcAverageArrObj} from "./mainProj/src/common/tool";
import {clcOptions} from "./mainProj/src/report/common/ActionMapItem";
import {useFormFramework} from "./mainProj/src/report/hook/useFormFramework";
import {config加速度, tail加速度} from "./mainProj/src/report/recreation/waterJj/Acceleration";

const contentRendererFactory = React.useCallback(
    (form: any, arrays?: Record<string, any>) => {
        return (
            <>
                <div className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                    <FormField
                        key={"加采频"}
                        control={form.control}
                        name={"加采频"}
                        render={({ field }) => (
                            <FormItem className="pt-2 w-full break-inside-avoid">
                                <FormLabel>采样频率</FormLabel>
                                <FormControl className="w-full">
                                    <SuffixInput  unit={"Hz"}  {...field}  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <span>按测量工况分4个项目: 加速度A，单位（g）{'>>'}</span>

                <Card className="py-1">
                    <CardHeader>
                        <CardTitle>判定部分</CardTitle>
                    </CardHeader>
                    <CardContent className="px-1">

                    </CardContent>
                </Card>
                {children ?? tail加速度}
            </>
        )
    },
    [children, ],
)

const { render, } = useFormFramework({schema, defaultValues, contentRendererFactory, arrayFields, rep})
