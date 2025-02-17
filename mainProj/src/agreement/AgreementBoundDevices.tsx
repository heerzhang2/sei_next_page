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
import { AgreementBoundDevices$key } from "./__generated__/AgreementBoundDevices.graphql";
import {AgreementListItem} from "./AgreementListItem";
import {usePaginationFragment, useRelayEnvironment} from "react-relay/hooks";

import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {bool3t, mutiSelectedArr, omitArnull, userIdName} from "../common/tool";
import {OneUserChoose} from "../common/user/OneUserChoose";
/*为何自动会添加的 import {css} from "@emotion/react/dist/emotion-react.cjs";
报错 not found: Error: Package path ./dist/emotion-react.cjs is not exported from package D:\home\common-sei\principal\node_modules\@emotion\react */
import {业务类型s} from "../device/edit/CommnBase";
import {ChooseUnit} from "../unit/ChooseUnit";
// import {委托法定s} from "./AgreementList";
import {ChooseDevice} from "../device/ChooseDevice";
import {DeviceClassSelect} from "../device/DeviceClassSelect";
// import {TaskLikeData, useLiablerDialogMenu} from "./useHelpers";
import {useDeviceFilter} from "./hook/useDeviceFilter";
import food from "../images/food.svg";
import {useCallback, useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
// import useCudChargingFeeMutation from "./fee/useCudChargingFeeMutation";
import cudAgreementTaskEqpMutation from "./hook/cudAgreementTaskEqpMutation"
import useSessionStorageState from "use-session-storage-state";

import { graphql } from "relay-runtime";


interface BoundDevicesProps {
    id: string;   //任务ID
    task: AgreementBoundDevices$key;
}
//显示某一个关注对象用户菜谱列表
//有1个地方会引用到的。  BoundDevices 不一定都是Eqp,水质报告?
/**左半边列表<ScrollView包裹内部的
 * 协议附属的设备，可以选择的设备队列；
 * */
export  function AgreementBoundDevices(props: BoundDevicesProps) {
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
    const data = useFragment(
        graphql`
            fragment AgreementBoundDevices on Agreement
            {
                devs {
                    id,
                    ...AgreementListItem
                    selected
                }
            }
        `,
        props.task
    );
    const { devs:list, }=data;
    const isps = list;
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
    //排序也不可行：注入的$ref:: graphql''定义体根本没有$orderBydl参数啊, refetch也不会重新排序,devs[]不会变。
    // const handleSort = (order: string) => {
    //     setOrderby(order);
    //     let filobj={wheredl: { ...eqpf },
    //         orderBydl: order,
    //     };
    //     // refetch(filobj, {fetchPolicy: 'network-only'});
    // }
    //【左边列表的过滤器】
    const handleFilt = (filterBy: any) => {
        let filobj={wheredl: { ...filterBy },
            orderBydl: orderby,
        };
        // refetch(filobj, {fetchPolicy: 'network-only'});
    }
    //过滤器页面服用的模式之一：组织可复用页面编辑器，可自行回调函数，【没提供】Query接口过滤参数,无法过滤！
    // const {menu: filterBtn,  eqpf}= useDeviceFilter(handleFilt);
    //客户端APP状态管理，列表的多选模态开始。
    const [multimode, setMultimode] = React.useState<boolean>(false);
    // const taskCurSel=sessionStorage['当前任务'];    //有明显延迟，另外一个页面设置后，本页面等几秒才能正常显示!
    //有毛病:没有初始值导致清空旧的['当前任务']设置;
    // const [taskCurSel, setTaskCurSel,errstg] = useStorageState(
    //     sessionStorage,
    //     '当前任务'
    // );
    const [taskCurSel, setTaskCurSel, ] = useSessionStorageState('当前任务', {
        defaultValue: ''
    });
    const { history } = useContext(RoutingContext);
    //这里不像有@connection(key: "BoundDevices__detail_list") { 这里不支持分页显示，排序？过滤器$wheredl{}？还会有用吗? #关键也没注入refetch;#过滤无效是全量列表非分页。
    // @ts-ignore
    const selectedItems= isps?.filter((device: { selected: any; }) => device?.selected) || [];
    const selCount= selectedItems.length;
    const {call:cudAgreementTaskEqpfunc, doing, called, reset, result:cudAck}= cudAgreementTaskEqpMutation();
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
    function getCurTaskSel() {
        try {
            const taskCurSel=sessionStorage['当前任务'] && JSON.parse(sessionStorage['当前任务']);
            return taskCurSel;
        } catch (err: any) {
            //console.log("捕获err打了吗", taskCurSel);
        }
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
                {isps?.map((bus: any) => (
                    <AgreementListItem key={bus!.id || ' '}
                                       detail={bus as any} task={props.id} multimode={multimode}
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
                <DdMenu label="内菜单" tight={true}
                        icon={
                            <MenuItem variant="ghost"  component={"div"}>
                                <IconMenu />
                            </MenuItem>
                        }
                        onClick={async() => {
                            const seltask= getCurTaskSel();
                            setTaskCurSel(seltask);   //不能这样setTaskCurSel( JSON.stringify(.id ));这个useStorageState主动做了转换！！
                            //主动提取更新！仅依靠useStorageState不能做到立刻更新的！  console.log("内菜单点击提前获取Storage早更新?WQ=" ,seltask);
                        }}
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
                                    cudAgreementTaskEqpfunc(props.id, "ADD",selectedItems.map(a=>a?.id!) ,taskCurSel as string,
                                        );
                                }}/>
                    <DdMenuItem label="当前任务是"  disabled={!taskCurSel}
                                onClick={async(e) => {
                                    //这里若用async｛｝ await getCurTaskSel 会报错
                                    // const seltask= getCurTaskSel();
                                    //并非最新的！
                                    history.push(`/task/${taskCurSel}`);
                                }}/>
                </DdMenu>
            </div>
            <div css={{textAlign: "center", paddingBottom:'1rem' }}>
               协议关联{eqpCount}个设备
            </div>

        </div>
    );
};

/**可复用的 ,嵌入过滤对话框：协议过滤设备
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
