"use client"
import React from "react"
import {useCallback} from "react";
import {useItemInputControl,InternalItemProps} from "@/report/common/base";
import {RecordInputConfig} from "./config";
import {itemResultUnqualifiedOmni, useItemsMapOmni} from "./omni";
import {undefined, z} from "zod";
import {Button, Card, CardContent, CardFooter, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage,
    Input,Badge,Label,Checkbox} from "@/components/ui";
import {useEditorBar, useFormFramework} from "@/report/hook/useFormFramework";
import {BlobInputList, CollapsibleFormSection, CommonSelect, FormSelectField} from "@/components/chub";
import {clcOptions} from "@/report/common/ActionMapItem";
import {Each_ZdSetting, useTableEdit} from "@/report/hook/use-table-edit";
import type {UseFormReturn} from "react-hook-form";
import { useStorage } from "@/report/StorageContext";
import queryString from "query-string";
import { Edit, Trash2, Plus, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"


//原始记录用的 项目列表： 可兼容报告俩种的目录
export const ProjectR4=
    React.forwardRef((
        { children, show ,alone=true,label,defaultProj,inpCB,nrec}:ProjectRProps, ref
    ) => {
        const toast = useToast();
        const getInpFilter = React.useCallback((par: any) => {
            //仅仅页面上用的路由hash字段 "ha": 不需要存储数据库给报告的。
            const VsProjects_configPure=config.map(
                one=>{ const { ha, ...other}=one;
                    return {...other} }
            );
            //初始化的 Projects=空 -> 缺省值:要求挑选的大项目; 怎能增加，不允许删除和修改默认项目名字。
            const {Projects =VsProjects_configPure } =par||{};
            return {Projects};
        }, []);
        const {inp, setInp} = useItemInputControl({ ref });
        const qs= queryString.parse(window.location.search);
        const [viewHas, setViewHas] = React.useState<boolean>(false);
        const [seq, setSeq] = React.useState<number | null>(Number(qs?.from));   //表對象的當前一條。
        const [obj, setObj] = React.useState<any>();        //Projects数组的各个对象
        React.useEffect(() => {
            let size = inp?.Projects?.length;
            let ifrom = Number(qs?.from);
            if (ifrom >= 0 && ifrom < size) {
                setSeq(ifrom);    //导致初始化显示最后一个seq
                setObj(inp?.Projects?.[ifrom]);
            } else {
                setSeq(null);
                setObj(null);
            }
        }, [qs?.from ]);
        //这上面副作用：,inp?.Projects不能随意增加 依赖项哦，也不能用[qs])替代，qs会导致点击修改菜单后也会重复刷新的。【不要加】inp?.Projects依赖项，导致尾部插入的会跳到qs?.from那一条显示，不合理。
        function onModifySeq(idx:number,it:any){
            setObj(it);
            setSeq(idx);
        };
        function onDeleteSeq(idx:number,it:any){
            let fixSize =config.length;
            if(idx<fixSize)  return;        //【不是用户添加的】不允许删除
            inp?.Projects?.splice(idx,1);
            setInp({...inp,Projects: [...inp?.Projects] });
            setSeq(null);
        };
        function onInsertSeq(idx:number,it:any){
            let fixSize =config.length;
            if(idx<fixSize)  return;    //不允许从默认项目列表中间插入自定义的东西
            inp?.Projects?.splice(idx,0, obj);
            setInp({...inp,Projects:[...inp?.Projects] });
            setSeq(idx);
        };
        function onAddSeq(idx:number){
            let size =inp?.Projects?.push(obj);
            setInp( (inp?.Projects&&{...inp,Projects:[...inp?.Projects] } )  || {...inp,Projects:[obj] } );
            //应该跳到最后一条：不能停留倒数第二条 当前from 当前按钮那条；
            setSeq((inp?.Projects&&(size-1))  || 0 );
        };
        const clearProjectCatalog = React.useCallback(() => {
            setInp({...inp, Projects:undefined });
            toast({title: "目录表被清空", subtitle: "需要重新设置!", intent: "warning"});
        }, [inp,setInp,toast]);
        //本对象组件：是共享的，状态交互注意。 参数：fixed 表示用户自己添加的吗
        const editor=(fixed: boolean, tail: boolean) => <Layer elevation={"sm"} css={{ padding: '0.25rem' }}>
            <div>
                <LineColumn column={6}>
                    <InputLine label={`有做该项目吗:`}>
                        <CheckSwitch  checked= {obj?.do || false}
                                      onChange={e =>setObj({...obj, do: (obj?.do? undefined:true)} ) } />
                    </InputLine>
                    {!fixed &&
                        <InputLine label={`检验项目:`}>
                            <Input   value={obj?.name ||''}
                                     onChange={e =>setObj({...obj, name: e.currentTarget.value} ) } />
                        </InputLine>
                    }
                    { !obj?.na && inpCB && inpCB(obj,setObj)}
                    <InputLine label={`页号`}>
                        <Input   value={obj?.page ||''}
                                 onChange={e =>setObj({...obj, page: e.currentTarget.value} ) } />
                    </InputLine>
                    <InputLine label={`附页、附图`}>
                        <Input   value={obj?.apx ||''}
                                 onChange={e =>setObj({...obj, apx: e.currentTarget.value} ) } />
                    </InputLine>
                    {!nrec && <>
                        <InputLine label={`记录-页号`}>
                            <Input   value={obj?.op ||''}
                                     onChange={e =>setObj({...obj, op: e.currentTarget.value} ) } />
                        </InputLine>
                        <InputLine label={`记录-附图附页`}>
                            <Input   value={obj?.oa ||''}
                                     onChange={e =>setObj({...obj, oa: e.currentTarget.value} ) } />
                        </InputLine>
                    </>}
                    {!fixed && <InputLine label={`不在目录中显示该项目:`}>
                        <CheckSwitch  checked= {obj?.na || false}
                                      onChange={e =>setObj({...obj, na: (obj?.na? undefined:true)} ) } />
                    </InputLine>
                    }
                </LineColumn>
                <Button onPress={() => {
                    if(seq !== null) {
                        inp?.Projects?.splice(seq, 1, obj);
                        setInp({ ...inp, Projects: [...inp?.Projects] });
                    }
                    else setInp({ ...inp, Projects: [...inp?.Projects ,obj] });
                } }
                >{tail? `新增一条` : `改一条就确认`}</Button>
            </div>
        </Layer>;
        //项目明细编辑器的显示：依赖Projects数组索引i来判定的。页面上名义的顺序序号不等于这个的，要转换？链接生成时刻就要敲定了。新增加的又删除导致序号跳变?【默认】项目不允许删除而且在前面。
        const myTable=<div>
            {inp?.Projects?.map((a:any,i:number)=>{
                if((viewHas && a?.do) || !viewHas)
                    return <React.Fragment  key={i}>
                        <div css={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'
                        }}>{`${i+1}`}
                            <Popover>
                                <PopoverRefer>
                                   <Button  size="md" iconAfter={<IconChevronDown />} variant="ghost" css={{whiteSpace:'unset'}}>
                                            {`${a?.name||'？'} [${a?.do? '有做':'没做'}] `}
                                   </Button>
                                </PopoverRefer>
                                <PopoverContent>
                                    <PopoverDescription>
                                        <MenuList>
                                            <MenuItem onPress={()=>onModifySeq(i,a)}>修改</MenuItem>
                                            <MenuItem onPress={()=>onDeleteSeq(i,a)}>刪除这条</MenuItem>
                                            <MenuItem onPress={()=>onInsertSeq(i,a)}>插入一条</MenuItem>
                                            <MenuItem onPress={()=>onAddSeq(i)}>末尾新增一条</MenuItem>
                                        </MenuList>
                                    </PopoverDescription>
                                    <PopoverClose>
                                        <IconX/>
                                    </PopoverClose>
                                </PopoverContent>
                            </Popover>
                            {!a?.do && <IconButton  icon={<IconTruck />} variant="ghost" size="md" label='有做'
                                          onPress={() => { tableSetInp('Projects',i, inp,setInp,'do',true)}}/>
                            }
                        </div>
                        {i===seq && editor(i<config.length, false) }
                    </React.Fragment>;
                else return null;
            }) }
        </div>;
        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                { children }
                <Text  variant="h5">
                    {label}-包括的项目：
                </Text>
                <Button intent='primary' onPress={() => setViewHas(!viewHas)}
                >{viewHas? `显示全部项目`: `仅显示有做的项目`}</Button>
                默认项目表的部分不能删除，不能改名字;
                <hr/>
                {myTable}
                { seq===null && editor(false, true) }
                <Text  variant="h5">
                    有些是不在附页中体现的但却在目录中有的其页号需设定。
                </Text>
                想清空所有项目（分项）和目录的配置（谨慎使用！）：
                <Button intent='danger' onPress={() => {
                    clearProjectCatalog();
                }}>重新初始化</Button>
            </InspectRecordLayout>
        );
} );

export declare type InputMoreCallback = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode;

interface ProjectRProps  extends InternalItemProps{
    defaultProj: ProjectItem[];      //有注入分项目详细列表；
    inpCB?: InputMoreCallback;
    //没有原始记录目录录入
    nrec?: boolean;
    onSave?: (projects: ProjectItem[]) => void
}
// 模拟数据类型
interface ProjectItem {
    name: string
    ha?: string
    na?: boolean
    ml?: string
    do?: boolean
    om?: boolean
    dd?: boolean
    zs?: boolean
}

/**检验条件：表格一样。
 * 表单useForm毛病【特别注意】form.setValue(`.${fields.length-1}.`,)name={`.${fields.length-1}.`}的索引序号需有效序号,新增按钮{ fields.length>0 &&隐藏编辑器，否则自动乱加空行导致后续报错。append前直接编辑导致空行。
 * */
/**@property name : 附录显示名称, 和页面逻辑开关代码上需保持一致的。
 * @property ha : Hash路由标签
 * @property na : 表示不在【结论报告附页】当中出现的吗，但都出现在目录中的。不在附录表也没有安排目录表这页的也行。 na:正好相反，怪啊；
 * @property ml : 该分项在报告【目录】中的文本显示题目。
 * @property ol :原始记录的标题。
 * @property om :仅出现在原始记录的目录。 om=ture: 只是在记录目录存在的，但是在正式报告目录却不显示的。 na=表示在两个目录页都不存在。{规定：记录目录集合包含报告的列表}
 * @property do : 默认有做的分项报告
 *其它字段： page ，apx: 正式报告的标注。  op，oa: 打印原始记录的标注。
 * @property zs: 证书，在前面 不在目录？ na:可替代。且顺序是在代码布局体现的。
 * @property dd: 不在目录的，可附页中必须显示的【目的】支持结论报告附页的用户添加。 na:可替代。
 * 报告中实际打印顺序看代码：
 * 原平台testlogcfg.ses的 "contlist" :[ {"contname":}, ]列出全部分项。  而"mainpage":[ ]扣除"addpage":[]后的是固定的必须展示。 nosavepage无关的；
 const VsProjects默认2=[];
 正式报告的目录"repcontlist"	"allreportpage"， 记录打印的目录是=旧的 contlist， allpage。
 不用useFormFramework contentRendererFactory的模式的编辑器。
 * */
export const ProjectR = ({children, show, alone = true, defaultProj, label, rep}: ProjectRProps) => {
    const {storage} = useStorage()
    const [projects, setProjects] = React.useState<ProjectItem[]>(storage?.Projects ?? defaultProj)
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [editForm, setEditForm] = React.useState<ProjectItem>({
        name: "",
        ha: "",
        ml: "",
        na: false,
        do: false,
        om: false,
        dd: false,
        zs: false,
    })

    // 开始编辑
    const startEdit = (index: number) => {
        setEditingIndex(index)
        setEditForm({ ...projects[index] })
        setIsAddingNew(false)
    }

    // 开始新增
    const startAdd = () => {
        setIsAddingNew(true)
        setEditingIndex(null)
        setEditForm({
            name: "",
            ha: "",
            ml: "",
            na: false,
            do: false,
            om: false,
            dd: false,
            zs: false,
        })
    }

    // 保存编辑
    const saveEdit = () => {
        if (editingIndex !== null) {
            const newProjects = [...projects]
            newProjects[editingIndex] = { ...editForm }
            setProjects(newProjects)
            setEditingIndex(null)
        }
    }

    // 保存新增
    const saveAdd = () => {
        setProjects([...projects, { ...editForm }])
        setIsAddingNew(false)
    }

    // 取消编辑
    const cancelEdit = () => {
        setEditingIndex(null)
        setIsAddingNew(false)
    }

    // 删除项目
    const deleteProject = (index: number) => {
        const newProjects = projects.filter((_, i) => i !== index)
        setProjects(newProjects)
    }

    // 更新表单字段
    const updateFormField = (field: keyof ProjectItem, value: any) => {
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }

    // 渲染编辑表单
    const renderEditForm = (item: ProjectItem, isNew = false) => (
        <Card className="mt-2 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{isNew ? "新增目录项" : "编辑目录项"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">显示名称 *</Label>
                        <Input
                            id="name"
                            value={item.name}
                            onChange={(e) => updateFormField("name", e.target.value)}
                            placeholder="输入显示名称"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ha">Hash路由标签</Label>
                        <Input
                            id="ha"
                            value={item.ha || ""}
                            onChange={(e) => updateFormField("ha", e.target.value)}
                            placeholder="输入路由标签"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ml">目录显示题目</Label>
                    <Input
                        id="ml"
                        value={item.ml || ""}
                        onChange={(e) => updateFormField("ml", e.target.value)}
                        placeholder="输入在报告目录中的显示题目"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="do"
                            checked={item.do || false}
                            onCheckedChange={(checked) => updateFormField("do", checked)}
                        />
                        <Label htmlFor="do" className="text-sm">
                            默认有做
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="na"
                            checked={item.na || false}
                            onCheckedChange={(checked) => updateFormField("na", checked)}
                        />
                        <Label htmlFor="na" className="text-sm">
                            不在附页
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="om"
                            checked={item.om || false}
                            onCheckedChange={(checked) => updateFormField("om", checked)}
                        />
                        <Label htmlFor="om" className="text-sm">
                            仅记录目录
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="zs"
                            checked={item.zs || false}
                            onCheckedChange={(checked) => updateFormField("zs", checked)}
                        />
                        <Label htmlFor="zs" className="text-sm">
                            证书类型
                        </Label>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        取消
                    </Button>
                    <Button onClick={isNew ? saveAdd : saveEdit}>
                        <Save className="w-4 h-4 mr-2" />
                        保存
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
    const { render } = useEditorBar({rep, values: {Projects: projects}})
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
         <div className="h-md:@md:max-w-[80rem] m-auto">
             <Card className="py-1 gap-2">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        目录列表编辑器
                        <Badge variant="secondary">{projects.length} 项</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-1">
                    <div className="space-y-2">
                        {projects.map((project, index) => (
                            <div key={index}>
                                {/* 项目展示行 */}
                                <div
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                        editingIndex === index ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                                    )}
                                >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                        <div className="font-medium text-sm">
                                            <span className="text-gray-500 mr-2">#{index + 1}</span>
                                            {project.name}
                                        </div>
                                        <div className="text-sm text-gray-600 truncate">
                                            {project.ml && <span className="bg-gray-100 px-2 py-1 rounded text-xs">{project.ml}</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {project.do && (
                                                <Badge variant="default" className="text-xs">
                                                    有做
                                                </Badge>
                                            )}
                                            {project.na && (
                                                <Badge variant="secondary" className="text-xs">
                                                    不在附页
                                                </Badge>
                                            )}
                                            {project.om && (
                                                <Badge variant="outline" className="text-xs">
                                                    仅记录
                                                </Badge>
                                            )}
                                            {project.zs && (
                                                <Badge variant="destructive" className="text-xs">
                                                    证书
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{project.ha && `路由: ${project.ha}`}</div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEdit(index)}
                                            disabled={editingIndex !== null || isAddingNew}
                                        >
                                            <Edit className="w-4 h-4" />
                                            修改
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteProject(index)}
                                            disabled={editingIndex !== null || isAddingNew}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            删除
                                        </Button>
                                    </div>
                                </div>

                                {/* 编辑表单 */}
                                {editingIndex === index && renderEditForm(editForm)}
                            </div>
                        ))}

                        {/* 新增按钮和表单 */}
                        <div className="pt-4 border-t">
                            {!isAddingNew ? (
                                <Button onClick={startAdd} disabled={editingIndex !== null} className="w-full" variant="dashed">
                                    <Plus className="w-4 h-4 mr-2" />
                                    新增目录项
                                </Button>
                            ) : (
                                renderEditForm(editForm, true)
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>
                            <strong>字段说明：</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>
                                <strong>显示名称：</strong>附录显示名称，需与页面逻辑开关代码保持一致
                            </li>
                            <li>
                                <strong>Hash路由标签：</strong>页面路由标识
                            </li>
                            <li>
                                <strong>目录显示题目：</strong>该分项在报告目录中的文本显示题目
                            </li>
                            <li>
                                <strong>默认有做：</strong>默认包含的分项报告
                            </li>
                            <li>
                                <strong>不在附页：</strong>不在结论报告附页中出现，但出现在目录中
                            </li>
                            <li>
                                <strong>仅记录目录：</strong>仅出现在原始记录目录中
                            </li>
                            <li>
                                <strong>证书类型：</strong>证书类型项目
                            </li>
                        </ul>
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end space-x-4 border-t p-6">
                     <div>
                        <span>
                            有些是不在附页中体现的但却在目录中有的其页号需设定。
                        </span>
                             想清空所有项目（分项）和目录的配置（谨慎使用！）：
                             <Button  onClick={() => {
                                 // clearProjectCatalog();
                             }}>重新初始化</Button>
                     </div>
                     <div className="flex gap-4 justify-end">
                         {/*<Button type="button" variant="outline" onClick={() => form.reset()}>*/}
                         {/*    重置*/}
                         {/*</Button>*/}
                         {/*<Button type="button" variant="outline" onClick={handleConfirm}>*/}
                         {/*    确认*/}
                         {/*</Button>*/}
                         {/*<Button type="submit" disabled={form.formState.isSubmitting}>*/}
                         {/*    {form.formState.isSubmitting ? "保存到后端..." : "保存"}*/}
                         {/*</Button>*/}
                     </div>
                     {render(null)}
                 </CardFooter>
            </Card>
             {children}
        </div>
    </CollapsibleFormSection>
    )
}
