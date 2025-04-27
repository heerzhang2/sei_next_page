import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel, FormMessage
} from "./mainProj/src/components/ui";
import {ClearableSelect} from "./mainProj/src/components/chub";
import {现场条件选} from "./mainProj/src/report/elevator/sundryDj/editor";

const contentRendererFactory = React.useCallback(
    (form: any, arrays?: Record<string, any>) => {
        const { fields, append, remove, } = arrays?.["检验条件"] || {}
        const tableData = form.watch("检验条件") || []
        const rowcount = tableData?.length  //空行导致可能比fields.length更多，form.watch是内部未校验的，fields.length是合法的稳定版本。append新增一条前直接编辑导致空行。
        return <>
            {config.map(([title,{f:field,N:descnode}]: any, i: number) => <React.Fragment key={i}>{descnode}<br/></React.Fragment>)}
            <hr/>
            <div>现场检验条件确认结果的记录:
                <Table css={{borderCollapse: 'collapse'}} tight miniw={800}>
                    <TableBody>
                        <TableRow>
                            <CCell>确认日期</CCell>
                            {config.map(([title,{f:field}]: any, i: number) => <CCell key={i}>{title}</CCell>)}
                        </TableRow>
                        {storage?.检验条件?.map((obj: any, i: number) => {
                            return <TableRow key={i}>
                                <CCell>{obj?.d}</CCell>
                                {config.map(([title,{f:field}]: any, j: number) => <CCell key={j}>{obj?.[field] || ''}</CCell>)}
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </div>
            <>新增检查确认时间=＞</>
            <div>
                <Card className="py-1">
                    <CardHeader>
                        <CardTitle>编辑区</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Card className="p-4 mb-4">
                            <Button className="mt-4"
                                    onClick={(e) => {
                                        const template = {d: ""} as any
                                        config.forEach(([_,{f:field,}]) => {
                                            template[field] = ""
                                        })
                                        append(template)
                                        e.preventDefault()
                                    }}
                            >
                                新增一条
                            </Button>
                            { fields.length>0 &&
                                <CardContent className="p-0 space-y-4">
                                    {`实际存储行数= ${fields.length }  ; 内部状态行数=${rowcount}`}
                                    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                                        <FormField control={form.control}
                                                   name={`检验条件.${fields.length-1}.d`}
                                                   render={({ field }) => (
                                                       <FormItem>
                                                           <FormLabel>检验日期</FormLabel>
                                                           <FormControl>
                                                               <Input type="date" {...field} placeholder={`首先设置当前日期`} />
                                                           </FormControl>
                                                           <FormMessage />
                                                       </FormItem>
                                                   )}
                                        />
                                        {config.map(([title,{f:tag,N:desc}]) => (
                                            <FormField key={tag} control={form.control}
                                                       name={`检验条件.${fields.length-1}.${tag}`}
                                                       render={({ field }) => (
                                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                                               <FormLabel>{desc}</FormLabel>
                                                               <FormControl>
                                                                   <ClearableSelect
                                                                       field={field}
                                                                       options={现场条件选}
                                                                       onClear={() => {form.setValue(`检验条件.${fields.length-1}.${tag}`, "")}}
                                                                   />
                                                               </FormControl>
                                                               <FormMessage />
                                                           </FormItem>
                                                       )}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            }
                        </Card>
                    </CardContent>

                </Card>
            </div>
            {children ? children:
                <>注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。</>
            }
        </>
    },
    [children, storage,config],
)
