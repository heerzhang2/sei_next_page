/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Text,
    Spinner,
    useTheme,
    List,
    Button,
    ListItem,
    Skeleton,
    Embed,
    Avatar,
    useToast,
    MenuList,
    MenuItem,
    IconRefButton,
    IconMoreVertical,
    IconPackage,
    Popover,
    DdMenu,
    DdMenuItem,
    IconCheck,
    Dialog,
    InputLine,
    Input,
    Select, IconLayers, IconButton, IconCheckSquare, IconZapOff, IconMenu
} from "customize-easy-ui-component";



import { Link as RouterLink } from "../routing/Link";
import {FadeImage} from "../comp/FadeImage";
import {commitLocalUpdate, useFragment} from "react-relay";
import { BoundDevices$key } from "./__generated__/BoundDevices.graphql";
import {DeviceListItem} from "./DeviceListItem";
import {usePaginationFragment, useRelayEnvironment} from "react-relay/hooks";

import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {bool3t, mutiSelectedArr, omitArnull, userIdName} from "../common/tool";
import {OneUserChoose} from "../common/user/OneUserChoose";
/*为何自动会添加的 import {css} from "@emotion/react/dist/emotion-react.cjs";
报错 not found: Error: Package path ./dist/emotion-react.cjs is not exported from package D:\home\common-sei\principal\node_modules\@emotion\react */
import {业务类型s} from "../device/edit/CommnBase";
import {ChooseUnit} from "../unit/ChooseUnit";
import {委托法定s} from "./TaskList";
import {ChooseDevice} from "../device/ChooseDevice";
import {DeviceClassSelect} from "../device/DeviceClassSelect";
import {TaskLikeData, useLiablerDialogMenu} from "./useHelpers";
import {useDeviceFilter} from "./hook/useDeviceFilter";
import food from "../images/food.svg";
import {useCallback, useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
import useCudChargingFeeMutation from "./fee/useCudChargingFeeMutation";
import useCudTaskDetailMutation from "./detail/useCudTaskDetailMutation";

const graphql = require("babel-plugin-relay/macro");

interface BoundDevicesProps {
    id: string;   //任务ID
    task: BoundDevices$key;
}
//显示某一个关注对象用户菜谱列表
//有1个地方会引用到的。  BoundDevices 不一定都是Eqp,水质报告?
/**【特殊性】两个路由都集成本页面： /tasks下潜Stack,以及/task/$taskid/*左边页面。 Relay的数据描述引入也支持共享特性。
 * 【被约束】共享的页面和操作：只能尽量都放入本组件的视图区域之中, 定位漂移出去不好自适应，不知道上一级组件的具体布局尺寸，只能自己消化菜单内嵌本组件范围内部。
 * Task关联设备或者单独报告Detail(无设备):列表;
 * 左边列表<ScrollView包裹内部的
 * 【两个页面都用到】复用问题，graphQL查询因为嵌入合并到到不同的请求包，和上一级graphql描述的参数名字冲突隐藏问题，需要规避同名变量！
 * */
export  function BoundDevices(props: BoundDevicesProps) {
    const theme = useTheme();
    // const toast = useToast();
    //console.log("看FollowingRecipes filter =id=", id );
    let wheres={　id: props.id , };

    const [filter, setFilter] = React.useState({filter:wheres,
        offset:0,
        limit:5,
        orderBy: "date",
        asc: true
    });
    //根据任务ｉｄ找设备，返回items＝下挂设备列表
    /*const {
      loading,
      error,
      items,
      loadMore
    } =useQueryBoundDevices(filter);
            fragment DeviceListInner on Query
          @refetchable(queryName: "DeviceListInnerRefetchQuery") {
              getAllEqpEsFilter(where: $where,after:$after,first:$first,orderBy:$orderBy,asc:$asc)
            @connection(key: "Query_getAllEqpEsFilter") {
                edges {
                    __id
                    node {
                        id cod oid type sort vart ust reg
                         plno address useu{id name}
                    }
                }
            }
          }
    */
    //【复用问题】fragment BoundDevices可能嵌入的上一级graphql描述，也会出现相同名称的参数，比如$after导致用了同一个初始值，detail_list接口字段查询为空了。
    //底下(after:$after遭遇复用问题之参数名字冲突隐藏问题，需要变量改名$afterdl; 尽量一致$first
    const { data, refetch, loadNext,hasNext,isLoadingNext} = usePaginationFragment(
        graphql`
            fragment BoundDevices on Task
            @refetchable(queryName: "BoundDevices_DetlistRefetch")
            {
                detail_list(after:$afterdl,first:$first,orderBy:$orderBydl,where:$wheredl)
                @connection(key: "BoundDevices__detail_list") {
                    edges {
                        node {
                            id,
                            ...DeviceListItem
                            selected
                        }
                    }
                }
            }
        `,
        props.task
    );
    const { detail_list:list, }=data;
    const isps = list?.edges?.map(edge => edge?.node);
    //console.log("看FollowingRecipes filter=", filter );
    //就算id切换了，本组件的数据还是会被appollo自动缓存的，id变化不会一定导致重新查询后端数据库的，看着像页面显示的缓存。
    //根据id和界面操作后的参数，来要修正graphQL的Query()的参数 = 要做重新查询。
    React.useEffect(() => {
        let wheres={ id: props.id  };
        setFilter({filter:wheres,
            offset:0,
            limit:5,
            orderBy: "date",
            asc: true
        });
    }, [props.id]);

    const eqpCount= isps? isps.length : 0;
    const [orderby, setOrderby] = React.useState("plno");
    //【排序点了】这里...eqpf 变量，反而是来自后面的Hook输出。顺序颠倒了。
    const handleSort = (order: string) => {
        setOrderby(order);
        let filobj={wheredl: { ...eqpf },
            orderBydl: order,
        };
        refetch(filobj, {fetchPolicy: 'network-only'});
    }
    //【左边列表的过滤器】
    const handleFilt = (filterBy: any) => {
        let filobj={wheredl: { ...filterBy },
            orderBydl: orderby,
        };
        refetch(filobj, {fetchPolicy: 'network-only'});
    }
    //过滤器页面服用的模式之一：组织可复用页面编辑器，可自行回调函数，
    const {menu: filterBtn,  eqpf}= useDeviceFilter(handleFilt);
    //客户端APP状态管理，列表的多选模态开始。
    const [multimode, setMultimode] = React.useState<boolean>(false);
    const taskCurSel=sessionStorage['当前任务'] && JSON.parse(sessionStorage['当前任务']??{});
    const { history } = useContext(RoutingContext);
    const selectedItems= isps?.filter(device => device?.selected) || [];
    const selCount= selectedItems.length;
    const {call:cudTaskDetailfunc, doing, called, reset, result:cudAck}= useCudTaskDetailMutation();
    const environment = useRelayEnvironment();
    function toggleSelectAll(select:boolean) {
        //不能直接对isp []进行赋值操作来尝试更新页面。只能走Relay更新本地存储模式。
        commitLocalUpdate(environment, store => {
            isps?.forEach(isp=>{
                const relayObj= store.get(isp?.id!);
                relayObj?.setValue(select? true:undefined,"selected");
            });           //.map()不能用
        });
    }

    return (
        <div className="BoundDevices"
             css={{overflowY: "auto", height: "100%",}}
        >
            { !isps && (
                <Text
                    muted
                    css={{
                        display: "block",
                        fontSize: theme.fontSizes[0],
                        margin: theme.spaces.lg
                    }}
                >
                    This user currently 没有东西.
                </Text>
            )}

            <List style={{
                overflowX: 'hidden'
            }}>
                {isps?.map(bus => (
                    <DeviceListItem  key={bus!.id || ' '}
                                     detail={bus as any}   task={props.id}  multimode={multimode}
                    />
                ))}
            </List>
            {/*  loading && <Spinner />
          l
          oadingError || (loadingMoreError && <div>Loading error...</div>)
          */}
            {(!isps || isps.length===0) && (
                <Text variant="h4" css={{ textAlign: "center" }}
                > 没找到检验设备(或过滤掉)或没关联台账
                </Text>
            )}

            <div css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
            }}>
                <IconButton
                    onClick={() => setMultimode(!multimode)}
                    variant="ghost"
                    label="多选或取消"
                    icon={multimode? <IconZapOff /> : <IconCheckSquare /> }
                />
                <DdMenu label="排序" icon={<Button size="sm">排序</Button>} >
                    <DdMenuItem label="单位内部编号"  contentBefore={orderby==='plno' && <IconCheck size={'sm'}/>}
                                onClick={  () => {
                                    handleSort('plno');
                                } } />
                    <DdMenuItem label='投用日期'  contentBefore={orderby==='used' && <IconCheck size={'sm'}/>}
                                onClick={  async (e) => {
                                    handleSort('used');
                                } } />
                    <DdMenuItem label={'联系人手机'}  contentBefore={orderby==='lpho' && <IconCheck size={'sm'}/>}
                                onClick={ (e) => {
                                    handleSort('lpho');
                                } } />
                </DdMenu>
                <DdMenu label="内菜单" tight={true}
                        icon={
                            <MenuItem variant="ghost"  component={"div"}>
                                <IconMenu />
                            </MenuItem>
                        }
                >
                    <DdMenu label="多选">
                        <DdMenuItem label="钩选所有项"
                                    onClick={ (e) => {
                                        toggleSelectAll(true);
                                    } }
                        />
                        <DdMenuItem label="清空所有选择"
                                    onClick={ (e) => {
                                        toggleSelectAll(false);
                                    } }
                        />
                    </DdMenu>
                    <DdMenuItem label={'划'+selCount+'条给当前任务'}  disabled={!taskCurSel || selCount!<=0}
                                onClick={(e) => {
                                    //新参数filobj只顾自个，也不能确保其他页面也能同步更新。还只能做绝上.invalidateRecord();来得稳妥。
                                    //底下3个地方wheredl: { ...eqpf }实际上没有用处， Mutation接口不需要过滤参数。
                                    cudTaskDetailfunc(props.id, "UPD",selectedItems.map(a=>a?.id!) ,taskCurSel,
                                        {wheredl: { ...eqpf }, orderBydl: orderby });
                                }}/>
                    <DdMenuItem label="当前任务是"  disabled={!taskCurSel}
                                onClick={async(e) => {
                                    history.push(`/task/${taskCurSel}`);
                                }}/>
                    <DdMenuItem label={'分设'+selCount+'条给新任务'}  disabled={selCount!<=0}
                                onClick={(e) => {
                                    cudTaskDetailfunc(props.id, "ADD",selectedItems.map(a=>a?.id!) ,undefined,
                                        {wheredl: { ...eqpf }, orderBydl: orderby });
                                }}/>
                    <DdMenuItem label={'删除这'+selCount+'条'}  disabled={selCount!<=0}
                                onClick={(e) => {
                                    cudTaskDetailfunc(props.id, "DEL",selectedItems.map(a=>a?.id!) ,undefined,
                                        {wheredl: { ...eqpf }, orderBydl: orderby });
                                }}/>
                </DdMenu>
                {filterBtn}
            </div>
            <div css={{textAlign: "center", paddingBottom:'1rem' }}>
                { hasNext &&
                    <Button disabled={isLoadingNext}
                            onPress={async (e) => {
                                e?.stopPropagation();
                                await loadNext(50,{
                                    onComplete: (error) =>  {
                                        if(error){
                                            // toast({
                                            //     title: "返回了",
                                            //     subtitle: ""+error,
                                            //     intent: "error"
                                            // });
                                            toast(""+error);
                                        }
                                    }
                                });
                            } }
                    >
                        {eqpCount}个,拉扯获取更多
                    </Button>
                }
                { !hasNext && '没有更多了' }
            </div>



        </div>
    );
};

/**可复用的 ,嵌入过滤对话框：任务过滤设备
* */
// export const TaskDeviceFilter: React.FC<any> = React.forwardRef(
//     (props, ref) => {
//
//
//
//     return <MenuComponent {...props} ref={ref}
//     />;
// } );


/* 淘汰旧版的用 <ScrollView 包裹的做法:实际把滚动条向前挪动px点数当做按钮了！ useInfiniteScroll配合的触发回调onFetch。
旧的：useInfiniteScroll({container: ref as any,  hasMore: hasMore,  onFetch: () => toLoadMore() })#不好用的。
加载指示 {(
      <ListItem
        interactive={false}
        aria-live="polite"
        aria-busy="true"
        primary={<Skeleton animated css={{ width: "150px" }} />}
      />
    )}
 <Popover
        content={
            <MenuList>  contentBefore={orderby==='used' && <IconPackage/>}
            </MenuList>
        }
    >
        <IconRefButton variant="ghost" icon={<IconMoreVertical/>} label="排序"/>
    </Popover>
* */
