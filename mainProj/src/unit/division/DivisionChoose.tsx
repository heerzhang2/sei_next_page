/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    IconButton,
    IconX,
    useToast,
    InputPure,
    SuffixInput,
    Dialog,
    Text,
    Button,
    useTheme,
    InputLine,
    Input,
    IconCloud,
    List,
    ListItem,
    Avatar,
    MenuList,
    MenuItem,
    IconPackage,
    IconRefButton,
    IconMoreVertical,
    DialogContent, DialogHeading, DialogDescription, DialogClose
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import {Dispatch, SetStateAction, useContext} from "react";
import RoutingContext from "../../routing/RoutingContext";
import {ContainLine, TransparentInput} from "../../comp/base";
import {usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import {DivisionChooseQuery$data} from "./__generated__/DivisionChooseQuery.graphql";
import {Link as RouterLink} from "../../routing/Link";
///import { DivisionChooseQuery } from "./__generated__/DivisionChooseQuery.graphql";
import { graphql } from "relay-runtime";
const DivisionChooseQuery = require('./__generated__/DivisionChooseQuery.graphql');


interface DivisionChooseProps {
    id?: string | undefined;
    //当前id所指向的挂接对象模型的给用户看的关键名:标题= 单位名字;
    name?: string | undefined;
    onCancel?: () => void;
    //触发了点击，保存状态，返回后才能恢复啊。
    onDialog?: () => void;
    //表示给用户看的关键字，用户以此识别编辑器是哪一个。
    emodel?: string | undefined;
    //当前编辑的哪一个字段： 选择关联对象后要挂接字段。
    field?: string | undefined;
    //路径path+部分queryString参数; 用户选择完毕所需要的关联对象之后，点击返回URL;支持当前SPA的path路径,自带?号的;
    erurl?: string | undefined;
    autoFocus?: boolean;
    unitId: string;
    //直接设置返回的状态变量。
    setEditorVar: Dispatch<SetStateAction<any>>;
}
//页面和数据分离后又要被迫整合在一块了？
//非高层次通用的组件。语义整合：　数据获取和规格化显示部分组合在一个文件内。前端graphql底层缓存：不见得每次都会发送请求给后端的。
//graphQL想把多个Query同时都坐在一个Hook函数里面一次性向后端读取，有许多障碍：页面分割，公用组件嵌套，父辈组件知晓子孙辈组件数据请求和参数还得传递数据，不过前端有缓存。

/**在单位底下挑选 部门 分支机构
 * @param id 目前选择好的单位id
 * @param onCancel 取消该参数的单位选择
 * @param onDialog [伪对话框模式]保存当前用户编辑器的所有输入框编制新数值。
 * other 传递CSS参数的。
 * 原先是传递emodel emid field这3个参数，目前改成传递 emodel + erurl + field 这3个参数;
 */
export const DivisionChoose= ({ id, name,unitId, onCancel, onDialog, emodel, field, erurl,autoFocus,setEditorVar, ...other }:DivisionChooseProps) =>
{
    const toast = useToast();
    //const data={unit:{company:{name:''},person:{name:''}}};
    //console.log("UnitOrChoose跑来~id+name=",id,name);
    const { history } = useContext(RoutingContext);
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [queryReference, loadQuery] = useQueryLoader(DivisionChooseQuery);
    const handleSelect = React.useCallback((id: string | undefined,name: string | undefined) => {
        setEditorVar({id,name});
        setOpen(false);
    }, [setEditorVar]);

  return (
   <React.Fragment>
    <SuffixInput  readOnly autoFocus={autoFocus}
          component={InputPure}
           value={name || '' }
           onClick={async () => {
                loadQuery({
                   id: unitId, // repNo,
                   iwhere: {no: unitId}
                });
              setOpen(true);
              //await onDialog!();   //编辑器来源，context已确定的；离开之前 需要临时保留数据。
            } }
          {...other}
    >
       <IconButton
          variant="ghost"
          icon={<IconX />}
          label="删除"
          css={{
            display: name ?  undefined : 'none'
          }}
          onClick={async (e) => {
            await onCancel!();
            e.preventDefault();
            e.stopPropagation();
          } }
        />
    </SuffixInput>
       <Dialog open={open} onOpenChange={setOpen}>
           <DialogContent >
               <DialogHeading>
                   选择分支机构或部门
               </DialogHeading>
               <DialogDescription>
                   <div css={{ padding: theme.spaces.lg }}>
                       <React.Suspense fallback="等下马上来...">
                           { queryReference && <DivisionChooseInner queryReference={queryReference} onSelect={handleSelect} /> }
                       </React.Suspense>
                   </div>
               </DialogDescription>
               <DialogClose>关闭</DialogClose>
           </DialogContent>
    </Dialog>

   </React.Fragment>
  );
}


interface DivisionChooseInnerProps {
    queryReference: any;
    onSelect: (id: string, name: string) => void;
}
//从服务端取得的每个实体模型id都不允许相等的！Relay报错; $globalId = base64("$ObjectName:$ObjectPK").
function DivisionChooseInner({ queryReference,onSelect }:DivisionChooseInnerProps)
{
    const data =usePreloadedQuery<typeof DivisionChooseQuery>(
        graphql`
            query DivisionChooseQuery($id: ID!,$company:Boolean) {
                getUnit(esid: $id, company:$company) {
                    id,company{id,name,no,address}
                    dvs{id name linkMen phone address}
                }
            }
      `,
        queryReference,
    );
    //有必要？做个 ES搜索引擎 索引，就是给no报告号的搜索加速？？
    const { getUnit: unitObj }=data as DivisionChooseQuery$data;
    const { dvs:list }=unitObj as any;
    //const isps = list && list.edges ? list.edges.map(edge => edge?.node) : [];
    const rep =list && list[0] && list[0].name;
    //  const { getReport: items }= (false)?  data! : {getReport:null};
    const theme = useTheme();
    //useState(默认值) ； 后面参数值仅仅在组件的装载时期有起作用，若再次路由RouterLink进入的，它不会依照该新默认值去修改show。useRef跳出Cpature Value带来的限制
    //采用RouterLink页内路由进入useState还保留旧的值，要修改就将会导致render两次；旧的值新的值各一次渲染。若采用URL刷新模式只有一次。
    //const [show, setShow] = React.useState(false);
    const [repId, setRepId] = React.useState('');
    const [repNo, setRepNo] = React.useState('');
    let filtercomp={ id:repId };

    //复检数据拷贝初检后再度修订的。最初的初检数据原封不动。复检rexm，正检data，结论及审核改定deduction｛也可部分照搬复检rexm正检data或映射转译｝。
    //原始记录录入模式复检正检，［正式报告来源项］只读的预览结论模式{动态生成结论}，(完毕提交)；
    //１原始记录　组件：不可改的不保存的［推断］结论项。　　　内容细化描述；复检正检数据切换的；结论项提示性质；　－－给检验操作人员录入。
    //２审核组件：回退或者往前固化结论项后保存给正式报告页面。　项目文本简化，数据需要保存给后端；－－正式报告手机可预览版，无下拉分区，不能编辑，－－核准管理人员审批。
    //３正式报告那个目录的打印页面。只读的，结论项也是读后端的；正式报告文书版本或可转保存其他如pdf类型文档，无下拉分区，全展示；－－大众用户查看。
    //审核但是不能修改检验数据模式，回退编制复检？或后台修正；校对转正式报告数据倒腾和推断合并结论项目，另外保存成了deduction，对表正式报告，报告排版美化。
    const [inp, setInp] = React.useState(null);
    //外部dat不能加到依赖，变成死循环! const  dat =items&&items.data&&JSON.parse(items.data);  这dat每次render都变了？
    //从后端返回的数据可能items已经被修改了
    React.useEffect(() => {
        const  dat =rep&&rep.data&&JSON.parse(rep.data);
        dat && setInp(dat);
    }, [rep]);
    console.log("祖父OriginalRecord辈：捕获 ==inp=[",  inp,  "] rep=", rep );

    return (
        <div css={{
            margin: 'auto',
            background: "white"
        }}
        >
            {rep?
                <List>
                    { list?.map((hit:any,i:number) => (
                        <ListItem key={hit?.id}
                                  onPress={ ()=> onSelect(hit?.id, hit?.name) }
                                  primary={
                                      {...hit}.name || '竟然没有名字'
                                  }
                                  secondary={
                                      {...hit}.address || ''
                                  }
                        />
                    ))}

                </List>
                :
                <Text variant="h5" css={{ textAlign: 'center' }}>
                    没找到此号码
                </Text>
            }
        </div>
    );
}

//上面若直接用 { data.unit && <IconButton 》} 点击删除报错Can't perform a React state update on an unmounted component. 按钮被卸载。
