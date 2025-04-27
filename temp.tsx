import {useStorage} from "./mainProj/src/report/StorageContext";
import {useTableEditor} from "./mainProj/src/report/hook/useRepTableEditor";
import {useUppyUpload} from "./mainProj/src/report/hook/useUppyUpload";
import {
    Card, CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, Textarea
} from "./mainProj/src/components/ui";
import {BlobInputList, ClearableSelect, CollapsibleFormSection, SuffixInput} from "./mainProj/src/components/chub";
import {clcOptions} from "./mainProj/src/report/common/ActionMapItem";
import {useFormFramework} from "./mainProj/src/report/hook/useFormFramework";
import {config测点表, itemA应变应力, tail应变} from "./mainProj/src/report/recreation/waterJj/StrainStress";

export const StrainStress = ({ children, show, alone = true, redId, nestMd, label, rep,sensit }: Props) => {
    const {storage,setStorage,modified,setModified} =useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        // 添加普通字段
        itemA应变应力.forEach((name) => {
            //这个字段 _FILE_测点：是专用组件处理设置的，直接修改storage，必须排除在form之外。
            if(name!=="_FILE_测点")
                schemaFields[name] = z.string().optional()
        })
        const schemaTab = {} as any
        config测点表.forEach(([t,field,s,o,park]) => {
            schemaTab[field] = z.string().optional()
        })
        // 添加表格字段
        schemaFields["测点表"]= z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        // 初始化普通字段
        itemA应变应力.forEach((name) => {
            if(name!=="_FILE_测点")
                fields[name] = storage[name] ?? ""
        })
        //【不初始化"测点表"】 没报错？ arrayFields里面有做等效功能。
        return fields
    }, [storage])

    const arrayFields =React.useMemo(() => {
        // 创建每个字段的空模板
        const itemTemplate = {} as any
        config测点表.forEach(([t,field,s,o,park]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"测点表", itemTemplate,} ]
    }, [])

    const headview=<h5>
        测试点:按照一行2字段录入： 应变值（με）, 应力值（MPa）;
    </h5>;

    const [nestRendererFactory]=useTableEditor({headview, config: config测点表, table:'测点表',defFixedLay:true});

    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {

            return (
                <>
                    <Card className="py-1 gap-1">
                        <CardHeader>
                            <CardTitle>测试：</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1">
                            {nestRendererFactory(form, arrays)}
                        </CardContent>
                    </Card>
                    {children ?? tail应变}
                </>
            )
        },
        [children,nestRendererFactory ],
    )
    const { render,form,arrayControls } = useFormFramework({schema, defaultValues, contentRendererFactory,arrayFields, rep})
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render()}
    </CollapsibleFormSection>;
};
