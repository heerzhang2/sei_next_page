import * as React from "react";
import {useCallback} from "react";
import {useItemInputControl,InternalItemProps} from "@/report/common/base";
import {RecordInputConfig} from "./config";
import {itemResultUnqualifiedOmni, useItemsMapOmni} from "./omni";
import {undefined, z} from "zod";
import {Button, Card, CardContent, CardFooter, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {BlobInputList, CollapsibleFormSection, CommonSelect, FormSelectField} from "@/components/chub";
import {clcOptions} from "@/report/common/ActionMapItem";
import {Each_ZdSetting, useTableEdit} from "@/report/hook/use-table-edit";
import type {UseFormReturn} from "react-hook-form";
import { useStorage } from "@/report/StorageContext";
import queryString from "query-string";



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
    defaultProj: any[];      //有注入分项目详细列表；
    inpCB?: InputMoreCallback;
    //没有原始记录目录录入
    nrec?: boolean;
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
 * */
export const ProjectR = ({children, show, alone = true, defaultProj, label, rep}: ProjectRProps) => {
    const {storage} = useStorage()
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        schemaTab.name = z.string()
        schemaTab.ml = z.string().optional()
        schemaTab.do = z.boolean().optional()
        schemaFields["Projects"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields.Projects = defaultProj || []
        return fields
    }, [storage])
    const arrayFields = React.useMemo(() => {
        const itemTemplate = {name: "", } as any
        return [{name: "Projects", itemTemplate,}]
    }, [])
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const {fields, append, remove} = arrays?.["Projects"] || {};
            //底下编辑项目不能直接用storage的存储数据。需要用表单自带的临时状态取值。
            const tabledArr = form.watch("Projects") || [];
            const index = selectedIndex ?? 0 // 表格第几行的
            //空行导致tabledArr可能比fields.length更多，form.watch是内部未校验的，fields.length是合法的稳定版本。append新增一条前直接编辑导致空行。
            if (tabledArr[index] === undefined) return null
            const seqOptions = fields?.map((row: any, index: number) => (
                {
                    value: index.toString(),
                    label: <div className={"w-full flex flex-row justify-between"}><span>({index + 1}) {row.name || '未设置'}</span>
                        <span>{row.do && '有做'}</span>
                    </div>
                }
            ));
            return (
                <>
                    <div>目录表的记录列表:

                    </div>
                    <div className="w-full flex justify-center mb-1 items-center gap-1">
                        <h4>选择编辑行</h4>
                        <CommonSelect id={"selectedIndex"} value={selectedIndex?.toString()} options={seqOptions}
                                      onValueChange={(v) => {
                                          const index = v ? Number(v) : null;
                                          if (index !== null) setSelectedIndex(index);
                                      }}
                                      onClear={() => setSelectedIndex(null)}
                                      className={"w-full @md:w-[20rem]"}
                        />
                    </div>
                    <div className="h-md:@md:max-w-[80rem] m-auto">
                        <Card className="py-1 gap-2">
                            <CardHeader>
                                <CardTitle>{selectedIndex === null ? '新增' : '修改'}一条</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-1">
                                {/* 新增选择器和编辑区 */}
                                <div className="mt-4 space-y-4">
                                    {selectedIndex !== null && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name={`Projects.${selectedIndex}.d`}
                                                render={({field}) => (
                                                    <FormItem className="w-full @md:w-[20rem]">
                                                        <FormLabel className="select-text">确认日期</FormLabel>
                                                        <FormControl>
                                                            <Input type="date"{...field} placeholder="选择日期"
                                                                   value={tabledArr[index] ? tabledArr[index].d : ""}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField key='name' control={form.control}
                                                       name={`Projects.${selectedIndex}.name`}
                                                       render={({field}) => (
                                                           <FormSelectField field={field} label={'ddd]]dd'}
                                                                            options={[]}
                                                                            selectClass="w-full @md:w-[20rem]"
                                                                            value={tabledArr[index] ? tabledArr[index].name : ""}
                                                           />
                                                       )}
                                            />
                                        </>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-4 border-t p-6">
                                <Button className=""
                                        onClick={(e) => {
                                            const template = {name: "", } as any;
                                            append(template);
                                            setSelectedIndex(fields.length)
                                            e.preventDefault();
                                        }}
                                >
                                    新增一条
                                </Button>
                                <Button variant="destructive" disabled={selectedIndex === null}
                                        onClick={() => {
                                            if (selectedIndex !== null && arrays?.['检验条件']) {
                                                remove(selectedIndex);
                                                setSelectedIndex(null);
                                            }
                                        }}
                                >
                                    删除该行
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <span>
                        有些是不在附页中体现的但却在目录中有的其页号需设定。
                    </span>
                    想清空所有项目（分项）和目录的配置（谨慎使用！）：
                    <Button  onClick={() => {
                        // clearProjectCatalog();
                    }}>重新初始化</Button>
                    {children ? children :
                        <>注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。</>
                    }
                </>
            );
        },
        [selectedIndex, storage, defaultProj, children, setSelectedIndex]
    );

    const {render, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep
    })
    const content =contentRendererFactory(form, arrayControls)
    return <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(content)}
    </CollapsibleFormSection>;
}
