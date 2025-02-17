/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    Spinner,
    useTheme,
    List,
    Button,
    ListItem,
    Skeleton,   Embed, Avatar, IconX, IconButton
} from "customize-easy-ui-component";

//import {  useQueryBoundDevices } from "./db";
//import { useFirebaseImage } from "../../Image";
//import { Link as RouterLink, useRoute } from "wouter";
//import { FadeImage } from "../../FadeImage";
import { Link as RouterLink } from "../../routing/Link";
import {useFragment} from "react-relay";
import { FeesListItem$key } from "./__generated__/FeesListItem.graphql";
import {getFeeTitleBe} from "../../dict/feeTitleBe";
import {getFeeTitleFe} from "../../dict/feeTitleFe";
import {css} from "@emotion/react";
//import {useFirebaseImage} from "../comp/Image";
import { graphql } from "relay-runtime";


interface FeesListItemProps {
    detId: string;   //Detail ID
    fee: FeesListItem$key;
    seq: number
    //删除这个收费项目
    onCancel?: () => void;
    //切换数据并显示 管道单元的明细列表。
    onViewPipeList?: ([]) => void;
}
//device-isp 该任务下挂设备
//某个任务　下挂　单个设备的　recipe＝device{}
export function FeesListItem(props: FeesListItemProps) {
  const theme = useTheme();
    const fee = useFragment(
        graphql`
            fragment FeesListItem on Charging {
                id code manual amount fm mnum pipus{ id code rno leng }
                detail{id task{id}} memo
            }
        `,
        props.fee
    );
  //缩略图thumb-sm@和完整图片thumb@的url不一样的；后端支持缩略？　没必要做；
  //const { src, error } = useFirebaseImage("thumb-sm@", isp?.dev?.cod!);    语法支持`/task/${props.detId}/isp/${fee?.pipus![0]!.id}`;  空值合并运算符(??)


  //const href = `/device/${id}/device/${device}`;
  //被点击中匹配href，成功=true=isActive[? ,..];　表示正好跟界面显示同样的一个路由。
//  const [isActive,] = useRoute(href);
    const isActive=false;    //当前被选中的列表项？
    const title= fee.manual? getFeeTitleFe(fee.code!) : getFeeTitleBe(fee.code!);
    let mnystr = Number(fee.amount);
    let money2 = mnystr.toFixed(2);     //小数点保留2位
    let mnumstr = Number(fee.mnum);
    let mnum2 =fee.mnum? mnumstr.toFixed(2) : ' ';
    let modtitl= fee.fm===1? '基础费' : fee.fm===2? '附加费' : fee.fm===8? '基础加收' : fee.fm===9? '其他收费' : fee.fm===6? '自定义款' : fee.fm===5? '下限条款' :'?';

  //const [, setLocation] = useLocation();
//
  //   href={`/device/${id}`}
  //        //navigate(href , { replace: true });

  return (
      /*<ListItem 外面再套<RouterLink 若列表项还有可点击按钮的：在触摸屏可以正常，可电脑上不正常会优先触发<RouterLink*/
      <ListItem  interactive={false}
        aria-current={isActive}
        css={{
          paddingTop: 0,
          paddingBottom: 0,
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          "& em": {
            fontStyle: "normal",
            color: theme.colors.text.selected
          },
          backgroundColor: isActive ? theme.colors.background.tint1 : undefined,
          "& > *": {
            flex: 1,
            overflow: "hidden"
          }
        }}
        contentBefore={
            `${props.seq}`
        }
        contentAfter={
            fee.fm===9 ? `乘数${money2}` : `${money2}`
        }
        primary={
            `${title ||'空的?'}`
        }
        secondStyle={css({display: "flex", justifyContent: 'space-around',flexWrap: 'wrap'})}
        secondary={ <React.Fragment>
            <Text>{modtitl}</Text>
            <Text>{fee.fm===9 ? `X乘数` : `${mnum2}`}</Text>
        </React.Fragment>
        }
      >
       { fee.memo && <Text css={{
                      paddingLeft: theme.spaces.xs,
                      backgroundColor: false
                          ? theme.colors.palette.blue.lightest
                          : "white"
                  }}
              >
               {`${fee.memo}`}
              </Text>
       }
       {/*再次分开做 两行*/}
       {
           (fee.manual || (fee?.pipus && fee?.pipus!.length>0)) && <div css={{
                           display: "flex",
                           justifyContent: 'space-between'
                       }}>
               { fee.manual && <IconButton  variant="ghost" label="删除"  icon={<IconX />}
                       onClick={async (e) => {
                           await props.onCancel!();
                           e.preventDefault();
                           //e.stopPropagation();
                       } }
                   />
               }
               { (fee?.pipus && fee?.pipus!.length>0) && <Button size={"sm"} variant={"ghost"} intent="primary"
                   onPress={(e) => {
                       //避免点击点穿,手机易点到隐藏的或者即将显示的对话框上面去。必须截断事件链条
                       e?.preventDefault();     //阻止浏览器默认事件
                      //e?.stopPropagation();   阻止冒泡事件(父子元素之间)
                       console.log("到onViewPipeList输出Listit=", fee?.pipus!);   //这个时间就有后端给出最新被修改的数据！
                       props.onViewPipeList!(fee?.pipus!);
                   }}
               >
                单元列表
               </Button>
               }
           </div>
       }
      </ListItem>
  );
}



/**上面的loadMore的updateQuery的函数原型定义这样的：...node_modules/apollo-client/core/ObservableQuery.d.ts:25；
 * =更新整个Query查询结果。
  export interface FetchMoreOptions<TData = any, TVariables = OperationVariables> {
    updateQuery: (previousQueryResult: TData, options: {
        fetchMoreResult?: TData;    //这个是=后端服务器新增加数据。
        variables?: TVariables;
    }) => TData;
}
 **/


//引入useInfiniteScroll使用的四个要素：有滚动条的组件innerRef，hasMore，onFetch()，fetching；
//<ScrollView >要么height:"100%"要么删除height参数让内容去撑开，不能使用height:"70%"之类的数，内部2次DIV嵌套,导致0.7*0.7=实际上内部高度。
//较上层DIV若是style={{ height: "xxx%" }}，注意若父辈元素都没限定最小的高度，那么就会导致由底下的内容撑开了，这等价于没height参数=实际无效！；"100%"若父辈有px数就听父辈的。

