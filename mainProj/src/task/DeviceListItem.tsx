/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    Spinner,
    useTheme,
    List,
    Button,
    Skeleton,
    Embed,
    Avatar,
    IconChevronRight,
    MenuList,
    MenuItem,
    IconPackage,
    IconRefButton, IconMoreVertical, ListFlexRow, Itext, PanelEnlargeCtx, DdMenuItem, DdMenu,
} from "customize-easy-ui-component";

//import {  useQueryBoundDevices } from "./db";
//import { useFirebaseImage } from "../../Image";
//import { Link as RouterLink, useRoute } from "wouter";
//import { FadeImage } from "../../FadeImage";
import { Link as RouterLink } from "../routing/Link";
import {FadeImage} from "../comp/FadeImage";
import {useFragment} from "react-relay";
import { DeviceListItem$key } from "./__generated__/DeviceListItem.graphql";
import {eqpTypeAllMap} from "../dict/eqpComm";
import {Fragment, useContext} from "react";
// import {ListFlexRow, } from "../comp/List";
import {businessCatspMap} from "./TaskList";
import RoutingContext from "../routing/RoutingContext";
import {useZeebeRead} from "../inspect/report/localUpdateRelay";
import {useToggleItemSelect} from "./detail/localUpdateRelay";
import { graphql } from "relay-runtime";

//设备种类: EQP_TYPE 包括单独报告的类型
const eqpTypespObj = {'3':'梯', '2':'容器', '1':'锅炉', '4':'起重','5':'厂车','6':'游乐',
        '8':'管道','9':'索道','R':'常压','F':'阀','Z':'水质','7':'元件'
};
export const eqpTypespMap = new Map(Object.entries(eqpTypespObj));
//后端 enum Procedure_Enum
export const reportStatusObj = {'BEGIN':'待初始化', 'MAKE':'编制', 'SIGN':'签字','CHECK':'审核',
    'WAITREDO':'等待复检','APPR':'审批', 'OFFER':'报告发放','END':'终结','CANCEL':'注销'
};
export const reportStatusMap = new Map(Object.entries(reportStatusObj));


interface DeviceListItemProps {
    task: string;   //任务ID
    detail: DeviceListItem$key;
    //上一级列表进入多选选择形态了？影响到了单一项抉择和显示。
    multimode: boolean;
}
//device-isp 该任务下挂设备
/**左边列表的一行：某个任务　下挂　单个设备的　recipe＝device{}
 * selected字段是浏览器web APP客户端自己主动添加方便管理使用的，和后端服务器没关联！借用Relay框架功能。
 * */
export function DeviceListItem(props: DeviceListItemProps) {
    const det = useFragment(
        graphql`
            fragment DeviceListItem on Detail {
                id,ident,type,feeOk,sprice, task{id,status} 
                isp{ id dev{id,oid,cod,sort,vart,address,vlg{id,name},ad{id,town{id,name},county{id,name}}
                        used,titl,plno,lpho
                    }
                    report{id,stm{id,sta}}
                }
                selected
            }
        `,
        props.detail
    );

    const theme = useTheme();
  //缩略图thumb-sm@和完整图片thumb@的url不一样的；后端支持缩略？　没必要做；
  //const { src, error } = useFirebaseImage("thumb-sm@", det?.isp?.dev?.cod!);
  const href = `/task/${props.task}/detail/${det?.id}`;
  //const href = `/device/${id}/device/${device}`;
  //被点击中匹配href，成功=true=isActive[? ,..];　表示正好跟界面显示同样的一个路由。
//  const [isActive,] = useRoute(href);
    const isActive= false;
  //const [, setLocation] = useLocation();
  //   href={`/device/${id}`}
  //        //navigate(href , { replace: true });
    const sts= det?.task?.status;
    const eqp= det?.isp?.dev;
    const { history } = useContext(RoutingContext);
    const {enlarge, setEnlarge,setActivecas,getActivecas} =useContext(PanelEnlargeCtx);
    const {call:toggleDeviceBar}= useToggleItemSelect();
    //直接用<RouterLink href={href}>包裹<ListFlexRow>有问题：无法复制局部文字，点击后面按钮同时触发href切换。
//若是需要切换编辑选中状态：可以动态的把<ListItem前边或者后边区域开启。正中间ListItem__content内容Div区域flex动态收缩。
  return (
      <div css={{
          // backgroundColor: det?.selected? "pink" : undefined,
          transform: det?.selected? `scale(1.2,0.7) skew(18deg,0deg)` : undefined,
      }}>
      <ListFlexRow
            onPress={(e) => {
                if(props.multimode){
                    toggleDeviceBar(det?.id!);
                }else{
                    history.push(href);
                    //history.push(href, {time: Date()} );   //方式一： 强制刷新！能切换右边页面。
                    // if(getActivecas!()==0)  setActivecas( 1);  //方式二：若是当前列表项URL正在显示的没有效果!不能切换右边页面。
                    e?.preventDefault();      //【重复触发调用onPress()】 必须加上，可能两次调用？
                }
            }}
            contentAfter={
                isActive &&  <DdMenu label="放大" tight={true}
                                                icon={
                                                    <IconRefButton variant="ghost"
                                                                   icon={<IconMoreVertical />}  label="Options菜单"
                                                    />
                                                }
                >
                    <DdMenuItem label="加个设备"
                                onClick={(e) => {history.push("/device/new");}} />
                </DdMenu>
            }
      >
          <Text>{ eqp?.plno || '?' }</Text>
          <Itext>{ eqpTypeAllMap.get(det?.isp?.dev?.vart!) || eqpTypeAllMap.get(det?.isp?.dev?.sort!) }</Itext>
          <Itext>{ (det?.ident || det?.isp?.dev?.cod || det?.isp?.dev?.oid) }</Itext>
          <Itext>{`${reportStatusMap.get(det?.isp?.report?.stm?.sta!) || '✩'}`}</Itext>
          <Itext>{ det?.feeOk? '确':'未' }</Itext>
          <Itext>
              { (sts==='INIT' || sts==='DEPART')?   det?.isp?.dev?.ad?.town?.name?? det?.isp?.dev?.ad?.county?.name??'♆' :
                  sts==='OFFICE'?  det?.isp?.dev?.ad?.town?.name+" "+det?.isp?.dev?.vlg?.name :
                      (det?.isp?.dev?.vlg?.name??'' + det?.isp?.dev?.address??'@')
              }
          </Itext>
          <Itext>{ eqp?.titl || '*' }</Itext>
          <Itext>{ eqp?.lpho || '#'}</Itext>
          <Text>{ eqp?.used || '--'}</Text>
      </ListFlexRow>
      </div>
  );
}



//引入useInfiniteScroll使用的四个要素：有滚动条的组件innerRef，hasMore，onFetch()，fetching；
//<ScrollView >要么height:"100%"要么删除height参数让内容去撑开，不能使用height:"70%"之类的数，内部2次DIV嵌套,导致0.7*0.7=实际上内部高度。
//较上层DIV若是style={{ height: "xxx%" }}，注意若父辈元素都没限定最小的高度，那么就会导致由底下的内容撑开了，这等价于没height参数=实际无效！；"100%"若父辈有px数就听父辈的。
// contentBefore={<Avatar size="xs" name={eqpTypespMap.get(det?.type!)}/>}
