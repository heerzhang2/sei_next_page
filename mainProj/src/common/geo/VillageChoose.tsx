/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    IconButton,
    useToast,
    InputPure,
    SuffixInput,
    Dialog,
    Text,
    List,
    ListItem,
    IconSearch, useTheme, InputBase,
    DialogContent, DialogHeading, DialogDescription, DialogClose
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import {Dispatch, SetStateAction, useContext} from "react";
import RoutingContext from "../../routing/RoutingContext";
import {ContainLine, TransparentInput} from "../../comp/base";
import {usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import {VillageChooseQuery$data} from "./__generated__/VillageChooseQuery.graphql";
import {Link as RouterLink} from "../../routing/Link";
///import { VillageChooseQuery } from "./__generated__/VillageChooseQuery.graphql";
const graphql = require("babel-plugin-relay/macro");
const VillageChooseQuery = require('./__generated__/VillageChooseQuery.graphql');


interface VillageChooseProps {
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
    //楼盘小区：假如不选择到乡镇街道一级的可能吗？不符合预期的旧数据维护！
    //两种父辈关联对象类型：可能是Town || Adminunit;都支持的。
    parentId: string;
    //直接设置返回的状态变量。
    setEditorVar: Dispatch<SetStateAction<any>>;
}
//页面和数据分离后又要被迫整合在一块了？
//非高层次通用的组件。语义整合：　数据获取和规格化显示部分组合在一个文件内。前端graphql底层缓存：不见得每次都会发送请求给后端的。
//graphQL想把多个Query同时都坐在一个Hook函数里面一次性向后端读取，有许多障碍：页面分割，公用组件嵌套，父辈组件知晓子孙辈组件数据请求和参数还得传递数据，不过前端有缓存。

/**必须先选有 街道乡镇 后，才能挑选楼盘的。
 * 福州大约45个街道。大约3000个小区。
 * 行政最小单位一个乡镇的底下大约会有100个楼盘？;
 * 支持输入部分 楼盘名称 来搜索 。先选'街道乡镇'输入'%partial%'找:不是ES搜索，也不是数据库SQL而是JPA关联内存.stream().contain();
 */
export const VillageChoose= ({ id, name,parentId, onCancel, onDialog, emodel, field, erurl,autoFocus,setEditorVar, ...other }:VillageChooseProps) =>
{
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [queryReference, loadQuery] = useQueryLoader(VillageChooseQuery);
    //可输入部分名称来搜索
    const [spart, setSpart] = React.useState(name);
    const handleSelect = React.useCallback((id : string | undefined,name: string | undefined)  => {
        setEditorVar({id,name});
        setSpart(name);
        setOpen(false);
    }, [setEditorVar]);
    //两层上下级的状态变量是孤立的：
    React.useEffect(() => {
        if(!spart)  setEditorVar(undefined);
    }, [spart,setEditorVar]);
    //onChange={e => setSpart( e.currentTarget.value||undefined ) }   onSave={txt=> setSpart(txt||undefined)}
    //只要有加上onChange(),那么InputPure和InputBase实际效果一样的。 把onChange=改成onSave=()才会不同。
    //用component={InputBase}+onSave=()问题是：外部修改了状态变量无法简单的让input同步显示。 InputBase无法由外部推动input内容的改动，只能自己改。
  return (
   <React.Fragment>
    <SuffixInput  type={"search"}  autoFocus={autoFocus}
            component={InputPure}
            value={spart || '' }  placeholder="可输入部分名称来搜"
            onChange={e => setSpart( e.currentTarget.value||undefined ) }
            {...other}
    >
       <IconButton
          variant="ghost"
          icon={<IconSearch />}
          label="搜索吧"
          css={{
           // display: name ?  undefined : 'none'
          }}
          onClick={async (e) => {
                loadQuery({
                  id: parentId,
                  partial: spart
                });
                setOpen(true);
                e.stopPropagation();
          } }
        />
    </SuffixInput>
       <Dialog open={open} onOpenChange={setOpen}>
           <DialogContent >
               <DialogHeading>
                   选择楼盘小区
               </DialogHeading>
               <DialogDescription>

        <div css={{ padding: theme.spaces.lg }}>
            <React.Suspense fallback="等下马上来...">
                { queryReference && <VillageChooseInner queryReference={queryReference} onSelect={handleSelect} /> }
            </React.Suspense>
        </div>

               </DialogDescription>
               <DialogClose>关闭</DialogClose>
           </DialogContent>
    </Dialog>

   </React.Fragment>
  );
}


interface VillageChooseInnerProps {
    queryReference: any;
    onSelect: (id: string, name: string) => void;
}
/**因为需要预加载数据的：所以构造成2层次的组件：上层的组件点击触发查询，而下层内部组件直接提取出数据。
 *不能放在同一个组件内： queryReference还未按钮点击(触发！)，还是null,下面组件的状态管理依赖于Hook,不能分叉hook,必须嵌套一层的组件render;
 *比如用 useLazyLoadQuery<typeof ProvinceChooseQuery> 只需要一层组件，但是有传统的缺点{不鼓励用那种模式},已经知道参数了就应该提前加载数据发起后端请求。
 *可关联传递调用实体模型自带的接口方法：Town(id).Adminunit.vlgs($partial)
 * */
function VillageChooseInner({ queryReference,onSelect }:VillageChooseInnerProps)
{
    const data =usePreloadedQuery<typeof VillageChooseQuery>(
        graphql`
            query VillageChooseQuery($id: ID!,$partial:String) {
                node(id: $id) {
                    id,
                    ... on Adminunit {
                        id name vlgs(partial: $partial){id name}
                    },
                    ... on Town {
                        id name adm{ id name vlgs(partial: $partial){id name} }
                    },
                    __typename
                }
            }
      `,
        queryReference,
    );
    //有必要？做个 ES搜索引擎 索引，就是给no报告号的搜索加速？？
    const { node: obj }=data as VillageChooseQuery$data;
    const allobj= obj?.__typename==='Town'? obj.adm : obj;
    if(!allobj)  return(
        <Text variant="h5" css={{ textAlign: 'center' }}>
        没找到Adminunit，请联系后台维护
        </Text>
    );
    const { vlgs:list }=allobj as any;
    //const isps = list && list.edges ? list.edges.map(edge => edge?.node) : [];
    //const rep =list && list[0] && list[0].name;
    //  const { getReport: items }= (false)?  data! : {getReport:null};
 //   const theme = useTheme();
    //useState(默认值) ； 后面参数值仅仅在组件的装载时期有起作用，若再次路由RouterLink进入的，它不会依照该新默认值去修改show。useRef跳出Cpature Value带来的限制
    //采用RouterLink页内路由进入useState还保留旧的值，要修改就将会导致render两次；旧的值新的值各一次渲染。若采用URL刷新模式只有一次。
    //const [show, setShow] = React.useState(false);
 //   const [repId, setRepId] = React.useState('');
  //  const [repNo, setRepNo] = React.useState('');
   // let filtercomp={ id:repId };

    //复检数据拷贝初检后再度修订的。最初的初检数据原封不动。复检rexm，正检data，结论及审核改定deduction｛也可部分照搬复检rexm正检data或映射转译｝。
    //原始记录录入模式复检正检，［正式报告来源项］只读的预览结论模式{动态生成结论}，(完毕提交)；
    //１原始记录　组件：不可改的不保存的［推断］结论项。　　　内容细化描述；复检正检数据切换的；结论项提示性质；　－－给检验操作人员录入。
    //２审核组件：回退或者往前固化结论项后保存给正式报告页面。　项目文本简化，数据需要保存给后端；－－正式报告手机可预览版，无下拉分区，不能编辑，－－核准管理人员审批。
    //３正式报告那个目录的打印页面。只读的，结论项也是读后端的；正式报告文书版本或可转保存其他如pdf类型文档，无下拉分区，全展示；－－大众用户查看。
    //审核但是不能修改检验数据模式，回退编制复检？或后台修正；校对转正式报告数据倒腾和推断合并结论项目，另外保存成了deduction，对表正式报告，报告排版美化。
   // const [inp, setInp] = React.useState(null);
    //外部dat不能加到依赖，变成死循环! const  dat =items&&items.data&&JSON.parse(items.data);  这dat每次render都变了？
    //从后端返回的数据可能items已经被修改了
/*    React.useEffect(() => {
        const  dat =rep&&rep.data&&JSON.parse(rep.data);
        dat && setInp(dat);
    }, [rep]);*/
    //console.log("祖父OriginalRecord辈：捕获 ==inp=[",  inp,  "] rep=", rep );

    return (
        <div css={{
            margin: 'auto',
            background: "white"
        }}
        >
            { list.length!==0?
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
                    没找到
                </Text>
            }
        </div>
    );
}

