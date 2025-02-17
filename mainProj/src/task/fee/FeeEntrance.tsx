/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme,
    LayerLoading,
    Text,
    Button,
    Spinner,
    IconTruck,
    IconArrowRight,
    Navbar,
    Toolbar,
    IconButton,
    IconArrowLeft,
    MenuList,
    MenuItem,
    IconMoreVertical,
    IconRefButton,
    List,
    ListItem,
    Skeleton,
    InputPure,
    IconX,
    InputLine,
    Select,
    InputDatalist,
    ComboBoxDatalist,
    CommitInput,
    ButtonRefComp,
    SuffixInput,
    InputGroup,
    TextArea,
    IconPrinter,
    VerticalMenu,
    TwoHalfRightPanel,
    DdMenuItem,
    Dialog, DialogContent, DialogHeading, DialogDescription, DialogClose
} from "customize-easy-ui-component";
// import {Dialog,DialogTrigger,DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";

//import { Link as RouterLink, useLocation } from "wouter";
//import { TransparentInput } from "../../comp/base";
import { Link as RouterLink } from "../../routing/Link";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import {FeeEntranceQuery} from "./__generated__/FeeEntranceQuery.graphql";
import {noop} from "use-media/lib/utilities";
import {FeesListItem} from "./FeesListItem";
import {DivisionChooseQuery$data} from "../../unit/division/__generated__/DivisionChooseQuery.graphql";
import {getFeeTitleBe} from "../../dict/feeTitleBe";
import {asFeeTitleFeOb as FeeC, ContainerDesignClsTil, getFeeTitleFe} from "../../dict/feeTitleFe";
import {css} from "@emotion/react";
import useCudChargingFeeMutation from "./useCudChargingFeeMutation";
import {Dispatch, SetStateAction, useContext, useRef} from "react";
import {FeeItemInput, Ifop_Enu} from "./__generated__/useCudChargingFeeMutation.graphql";
import {
    Disposable,
} from 'relay-runtime';
import useReckonIspFeeMutation from "../device/useReckonIspFeeMutation";
import useConfirmIspFeeMutation from "./useConfirmIspFeeMutation";
import {ContainLine, TransparentInput} from "../../comp/base";
import RoutingContext from "../../routing/RoutingContext";


//import useReckonIspFeeMutation from "./useReckonIspFeeMutation";
//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。
const graphql = require("babel-plugin-relay/macro");


interface FeeEntranceProps {
    id?: string;   　//来自上级<Route path={"/device/:id/"} component={} />给的:id。
    prepared: {
        query: PreloadedQuery<FeeEntranceQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}

//四个收费对话框状态开关变量的汇集。
const ENUM_附加  = 1, ENUM_金相  = 2, ENUM_无损  = 3,  ENUM_加减  = 4;

//[我的任务列表]底下某设备去点击，首先要到这："/device/:id/device/:taskId"路由来的；　然後setLocation再次路由。
//模型关系修改导致路由表也改成 /device/:id/isp/:id/唯一一个eqp(或者未挂接设备)
//React.FunctionComponent<IspEntranceProps> = ({
 //            params: { id:devId, ispId},      //来自上级<Route path={"/device/:id/addTask"} />路由器给的:id。
  //       }) =>
//1个Task:n个Isp；每1个Isp:n个Report;
export default function FeeEntrance(props: FeeEntranceProps) {
    //第一次啊运行吗？
    const mountedRef = useRef(false);
    if(!mountedRef.current) {
        mountedRef.current = true;
        console.log("加载初始化FeeEntrance期间0: mount=",mountedRef.current);
    }
    else
        console.log("加载初始化FeeEntrance期间1: mount=", mountedRef.current);
    const theme = useTheme();
    const [open, setOpen] = React.useState(0);

  let filtercomp={ id:props.routeData.params.ispId};
 // const {loading, error, item } =useLookReportOfIsp(filtercomp);
    const data = usePreloadedQuery<FeeEntranceQuery>(
        graphql`
            query FeeEntranceQuery($detId: ID!) {
                node(id: $detId)
                {
                    id, __typename
                    ... on Detail {
                        id ident type feeOk sprice, fees{
                            id
                            ...FeesListItem
                        },
                        isp{id dev{id,cod} },
                        task{id,servu{id,name}}
                    }
                    ... on Isp {
                        id,bus{
                            id ident type feeOk sprice, fees{
                                id
                                ...FeesListItem
                            },
                            isp{id dev{id,cod} },
                            task{id,servu{id,name}}
                        }
                    }
                }
            }
        `,
        props.prepared.query,
    );

    if(data?.node?.__typename !== "Detail" && data?.node?.__typename !== "Isp")
        throw new Error("模型不对");
    const item= data?.node?.__typename === "Detail"? data?.node : data?.node?.bus;
    //const {node: isp}=data;    //有多个分项报告[SimpleReport]
    //const {bus: item}=isp!;
   // const  item=null;
   // const {call:reckonIspFeeFunc,}={call:void noop()};// useReckonIspFeeMutation();
    const {call:reckonIspFeeFunc,doing:recking,called:recked, result:reckrs}= useReckonIspFeeMutation();
    const {call:confirmIspFeeFunc,doing:confing,called:confed, result:confrs}= useConfirmIspFeeMutation();

  //加载数据后立刻跳转，重定向操作。 要么直接去ISP页面；  要么先去派工吧。
  //用useEffect跳转setLocation，操之过急！，useLookIspOfDevTask后面数据还会更新的，可是这里却早早就跳转页面了，所以逻辑错误！
  //useLookIspOfDevTask实际查询后端比cache慢了1节拍要多一次render，若是cache也算数的立刻setLocation跳转，导致后端查询结果被遗弃，都无法更新cache了。
    const {call:cudChFeefunc, doing, called, reset, result:cudAck}= useCudChargingFeeMutation();     //删除专用，增加在子组件内部独立的；
    console.log("收费主页来taskS4:", props.routeData.params.taskId!,";isp=", props.routeData.params, "cudAck=",cudAck);
    const [pipusView, setPipusView] = React.useState(false);
    const [pipusList, setPipusList] = React.useState<[]>();

    if(!item) return(
        <Text  variant="h4"　css={{ textAlign: 'center' }}>
            没找到检验dID {props.routeData.params.detId}。
        </Text>);
  return (
          <TwoHalfRightPanel
              title={`单设备的收费明细项`}
              back={
                  <RouterLink href={`/task/${props.routeData.params.taskId!}`}>
                      <IconButton  noBind  icon={<IconArrowLeft />}
                                   variant="ghost"
                                   label="后退"
                                   size="md"
                                   css={{
                                       marginRight: theme.spaces.sm,
                                       [theme.mediaQueries.md]: {
                                           display: "none"
                                       }
                                   }}
                      />
                  </RouterLink>
              }
              menu={
                  <VerticalMenu>
                      <DdMenuItem label="收费依据重新计算"
                                  onClick={(e) => {
                                      reckonIspFeeFunc(props.routeData.params.detId);
                                  }}/>
                      <DdMenuItem label="添附加收费"
                                  onClick={async () => { await setOpen(ENUM_附加);
                                  }}/>
                      <DdMenuItem label="加金相试验费"
                                  onClick={async () => { await setOpen(ENUM_金相);
                                  }}/>
                      <DdMenuItem label="加无损检测费"
                                  onClick={async () => { await setOpen(ENUM_无损);
                                  }}/>
                      <DdMenuItem label="加收减收费"
                                  onClick={async () => { await setOpen(ENUM_加减);
                                  }}/>
                  </VerticalMenu>
              }
          >
              <ContainLine display={'设备,定位'}>
                  <TransparentInput readOnly value={item.ident || item.isp?.dev?.cod!}/>
              </ContainLine>
              <ContainLine display={'服务单位'}>
                  <TransparentInput readOnly value={item.task?.servu?.name!}/>
              </ContainLine>

              { reckrs.parms?.length>0 && (
                  <React.Fragment>
                      <Text  variant="h4"　css={{ textAlign: 'center' }}>
                          后端计算发现了有些参数不适合的，请修改后再来。
                      </Text>
                      <ParamsErrorLinks detId={item.id} eqpId={item.isp!.dev?.id} taskId={item.task?.id!} errors={reckrs.parms}/>
                  </React.Fragment>
              )
              }
              <List css={{ maxWidth: 750,
                  margin: 'auto',
              }}>
                  {item.fees && item.fees.map((fee,i) => (
                      <FeesListItem
                          key={fee?.id || ' '}
                          fee={fee as any}
                          detId={item.id}
                          seq={i+1}
                          onCancel={()=>{cudChFeefunc(item.id, "DEL",{id: fee?.id }) } }
                          onViewPipeList={(list)=>{
                              console.log("到onViewPipeList输出=", list);
                              setPipusList(list as any);
                              setPipusView(true); }}
                      />
                  ))}
              </List>

              <ContainLine display='最终应收费金额'>
                  <TransparentInput readOnly value={item?.sprice || ''}/>
              </ContainLine>
              <RouterLink href={"/inspect/"+item?.isp?.id!}>
                  <Button
                      size="lg" noBind
                      intent="primary"
                      iconBefore={<IconTruck />}
                      iconAfter={<IconArrowRight />}
                  >
                      查看Isp检验详情
                  </Button>
              </RouterLink>
              <Button  size="lg" intent="primary" disabled={item?.feeOk!}
                       iconBefore={<IconTruck />}
                       iconAfter={<IconArrowRight />}
                       onPress={() => {
                           confirmIspFeeFunc(props.routeData.params.detId);
                       }}
              >
                  收费确认
              </Button>
              <RouterLink href={"/tasks"}>
                  查全部任务
              </RouterLink>

              {/*不用Dialog下面再嵌套Tabs多页按钮的模式，直接在菜单入口就区分了直接进入嵌套页面，避免啰嗦*/}
              <LikeTabsDialogs busTaskId={item!.id} open={open} setOpen={setOpen}/>
              <Dialog open={pipusView} onOpenChange={setPipusView}>
                  <DialogContent >
                      <DialogHeading>
                        匹配该收费项管道单元
                      </DialogHeading>
                      <DialogDescription>
                  <div css={{ padding: theme.spaces.lg }}>
                      <FeeItemPipeUnit busTaskId={item!.id} list={pipusList as any} eqpId={item!.isp?.dev?.id!}/>
                  </div>
                      </DialogDescription>
                      <DialogClose>关闭</DialogClose>
                  </DialogContent>
              </Dialog>
          </TwoHalfRightPanel>
  );
};

const 附加收费objs=[FeeC("2370"),FeeC("2380"),FeeC("M210"),FeeC("M220"),
    FeeC("M230"),FeeC("M240"),FeeC("1430"),
    FeeC("M110"),FeeC("M120"),FeeC("M130"),FeeC("M140"),FeeC("M150"),FeeC("M160"),
    FeeC("M310"),FeeC("M320"),
    FeeC("S210"),FeeC("S220"),FeeC("H100"),FeeC("H200")
];
interface FeeItemChooseInnerProps {
    //queryReference?: any;
    busTaskId: string;
    //onSelect: (id: string, name: string) => void;
    //(busTaskId: string, opt: Ifop_Enu, inp:FeeItemInput)=> () => void;
    cudChFeefunc: (busTaskId: string, opt: Ifop_Enu, inp:FeeItemInput)=> Disposable;
    reset: ()=> void;
}
/**第一块：附加收费：;    $globalId = base64("$ObjectName:$ObjectPK").*/
function FeeItemChooseAttach({ busTaskId,cudChFeefunc,reset }:FeeItemChooseInnerProps)
{
    const theme = useTheme();
    const [fcode, setFcode] = React.useState<string>();     //收费项目编码
    const [subcode, setSubcode] = React.useState<string>();     //收费子项伪代码
    return (
        <React.Fragment>
            <InputLine label={`附加费主项目:`}>
                {/*下面这个css=?$实际上Select内部传给了参数other，而不是传给style参数接受的！pre-wrap太长了换行*/}
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem',whiteSpace:'pre-wrap'}}
                        value={fcode || ''} divStyle={css`max-width:300px;`}
                        onChange={e => {
                            reset();
                            setFcode!( e.currentTarget.value||undefined);
                            setSubcode(undefined);
                        } }
                >
                    <option> </option>
                    { 附加收费objs?.map((hit:any,i:number) => (
                            <option key={i} value={hit.cod}>{hit.til}</option>
                        ))
                    }
                </Select>
            </InputLine>
            {
                (fcode==='M210' || fcode==='M220' || fcode==='M230' || fcode==='M240') &&
                <InputLine label={`${getFeeTitleFe(fcode)}:`}>
                    <Select value={ subcode || ''}
                        onChange={e =>{   reset();
                            setSubcode( e.currentTarget.value||undefined );
                        } }
                    >
                        <option> </option>
                        { (fcode==='M210' || fcode==='M220' || fcode==='M230' || fcode==='M240') && Object.entries(ContainerDesignClsTil).map(([vkey,vvalue],i) => (
                            <option key={i} value={vkey}>{vvalue}</option>
                        ))
                        }
                    </Select>
                </InputLine>
            }
            <Button  intent="primary"  disabled={!fcode}  css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {  //按钮里面看不到最新的input取值的。 {code:subcode??fcode,}前面为空的才去采用后面的替换值。
                    cudChFeefunc(busTaskId, "ADD",{code: subcode? fcode?.slice(0,-1)+subcode : fcode,
                        fm:2 });
                }}
            >
             加收附加收费项
            </Button>
        </React.Fragment>
    );
}
const 金相收费objs=[FeeC("L110"),FeeC("L120"),
    FeeC("L131"),FeeC("L132"),FeeC("L133"),FeeC("L134"),FeeC("L135"),
    FeeC("L210"),FeeC("L220"),
    FeeC("L300"),FeeC("L400"),FeeC("L500"),FeeC("L600")
];
/**第二块：金相试验费；   使用Tabs反而交互不方便。直接上层菜单项就分叉页面*/
function FeeItemChooseMetal({ busTaskId,cudChFeefunc,reset }:FeeItemChooseInnerProps)
{
    const theme = useTheme();
    const [fcode, setFcode] = React.useState<string>();     //收费项目编码
    const [mnum, setMnum] = React.useState<number>(1);     //收费项 的乘数数量
    //点击按钮前触发子孙组件的各个一次性触发模式的输入框onBlur()都触发干净了。
    const commitBlurRef =React.useRef(null);
    return (
        <React.Fragment>
            <InputLine label={`金相项目:`}>
                {/*下面这个css=?$实际上Select内部传给了参数other，而不是传给style参数接受的！pre-wrap太长了换行*/}
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem',whiteSpace:'pre-wrap'}}
                        value={fcode || ''} divStyle={css`max-width:300px;`}
                        onChange={e => {
                            reset();
                            setFcode!( e.currentTarget.value||undefined);
                        } }
                >
                    <option> </option>
                    { 金相收费objs?.map((hit:any,i:number) => (
                        <option key={i} value={hit.cod}>{hit.til}</option>
                    ))
                    }
                </Select>
            </InputLine>
            <InputLine label={`计价数量:`} error={mnum<=0} >
                <SuffixInput  onSave={txt=> setMnum(Number(txt)||1) }
                              type="number"  value={ mnum || ''}  min={0}>
                    {`${ (fcode==='L210'||fcode==='L220')? '元素': (fcode==='L400'||fcode==='L500')? '点' : '件' }`}
                </SuffixInput>
            </InputLine>
            <ButtonRefComp  intent="primary"  disabled={!fcode} css={{ marginLeft: theme.spaces.sm }}
                ref={commitBlurRef}  onPointerOver={(e :any) => { // @ts-ignore
                                 commitBlurRef!.current!.focus(); }}
                onPress={() => {    //按钮里面看不到最新的input取值的。 {code:subcode??fcode,}前面为空的才去采用后面的替换值。
                    cudChFeefunc(busTaskId, "ADD",{code: fcode,
                        fm:2,mnum:mnum.toString()});
                }}
            > 加收费项
            </ButtonRefComp>
        </React.Fragment>
    );
}
const 无损收费objs=[FeeC("W110"),FeeC("W120"),
    FeeC("W210"),FeeC("W211"),FeeC("W212"),FeeC("W220"),FeeC("W230"),
    FeeC("W310"),FeeC("W311"),FeeC("W320"),FeeC("W321"),FeeC("W330"),FeeC("W331"),
    FeeC("W410"),FeeC("W420"),
    FeeC("W431"),FeeC("W432"),FeeC("W433"),FeeC("W434"),FeeC("W435"),
    FeeC("W500"),FeeC("W611"),FeeC("W612"),FeeC("W621"),FeeC("W622"),
    FeeC("W700"),FeeC("W800"),FeeC("W910"),FeeC("W920"),FeeC("WA00")
];
/**第三块：无损检测费*/
function FeeItemChooseUndam({ busTaskId,cudChFeefunc,reset }:FeeItemChooseInnerProps)
{
    const theme = useTheme();
    const [fcode, setFcode] = React.useState<string>();     //收费项目编码
    const [mnum, setMnum] = React.useState<number>(1);     //收费项 的乘数数量
    const commitBlurRef =React.useRef(null);
    return (
        <React.Fragment>
            <InputLine label={`无损检测:`}>
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem',whiteSpace:'pre-wrap'}}
                        value={fcode || ''} divStyle={css`max-width:300px;`}
                        onChange={e => {
                            reset();
                            setFcode!( e.currentTarget.value||undefined);
                        } }
                >
                    <option> </option>
                    { 无损收费objs?.map((hit:any,i:number) => (
                        <option key={i} value={hit.cod}>{hit.til}</option>
                    ))
                    }
                </Select>
            </InputLine>
            <InputLine label={`计价数量:`} error={mnum<=0} >
                <SuffixInput  onSave={txt=> setMnum(Number(txt)||1) }
                              type="number"  value={ mnum || ''}  min={0}>
                    {`${ (fcode==='W500')? '条': (fcode==='W110'||fcode==='W120')? '片' :
                        (fcode==='W220'||fcode==='W230'||fcode==='W320'||fcode==='W321'||fcode==='W420')? '平方米' :
                        (fcode==='W611'||fcode==='W612'||fcode==='W621'||fcode==='W622'||fcode==='W700'||fcode==='W800')? '点' :
                        (fcode==='W330'||fcode==='W331'|| fcode?.slice(0,-1)==='W43')? '个' : '米' }`
                    }
                </SuffixInput>
            </InputLine>
            <ButtonRefComp  intent="primary"  disabled={!fcode} css={{ marginLeft: theme.spaces.sm }}
                            ref={commitBlurRef}  onPointerOver={(e :any) => { // @ts-ignore
                                 commitBlurRef!.current!.focus(); }}
                            onPress={() => {
                                cudChFeefunc(busTaskId, "ADD",{code: fcode,
                                    fm:2,mnum:mnum.toString()});
                            }}
            > 加收费项
            </ButtonRefComp>
        </React.Fragment>
    );
}
const 加减收费objs=[FeeC("B82"),FeeC("B84"),
    FeeC("B86"),FeeC("B85"),FeeC("B88"),FeeC("B87"),FeeC("B90"),
    FeeC("A108"),FeeC("A104"),FeeC("B107"),
];
/**第四块：加收减收费*/
function FeeItemChooseAddSub({ busTaskId,cudChFeefunc,reset }:FeeItemChooseInnerProps)
{
    const theme = useTheme();
    const [fcode, setFcode] = React.useState<string>();     //收费项目编码
    const [amount, setAmount] = React.useState<number>(0);     //收费项 的乘数数量
    const [memo, setMemo] = React.useState<string>();     //理由
    const commitBlurRef =React.useRef(null);
    return (
        <React.Fragment>
            <InputLine label={`加收减收:`}>
                <Select inputSize="md" css={{minWidth:'140px',fontSize:'1rem',padding:'0 1rem',whiteSpace:'pre-wrap'}}
                        value={fcode || ''} divStyle={css`max-width:300px;`}
                        onChange={e => {
                            reset();
                            setFcode!( e.currentTarget.value||undefined);
                        } }
                >
                    <option> </option>
                    { 加减收费objs?.map((hit:any,i:number) => (
                        <option key={i} value={hit.cod}>{hit.til}</option>
                    ))
                    }
                </Select>
            </InputLine>
            { (fcode==='A108' || fcode==='A104' || fcode==='B107') &&
                <InputLine label={`金额(减收是负数):`} >
                    <SuffixInput  onSave={txt=> setAmount(Number(txt)||0) }
                                  type="number"  value={ amount } >
                    元</SuffixInput>
                </InputLine>
            }
            { fcode==='B107' &&
                <InputGroup label="自定义收费理由:">
                    <TextArea required rows={5} placeholder="需详细说明，以供相关人员做审批"
                              value={memo} onChange={e => setMemo( e.currentTarget.value||undefined ) }
                    />
                </InputGroup>
            }
            <ButtonRefComp  intent="primary"  disabled={!fcode || (fcode==='B107' && !memo) }
                            css={{ marginLeft: theme.spaces.sm }}
                            ref={commitBlurRef}  onPointerOver={(e :any) => { // @ts-ignore
                                commitBlurRef!.current!.focus(); }}
                            onPress={() => {
                                cudChFeefunc(busTaskId, "ADD",{code: fcode,
                                    fm: (fcode==='B107')? 6: (fcode==='A108'||fcode==='A104')? 8 :9,
                                    amount: amount.toString(), memo });
                            }}
            > 配置上加收减收项
            </ButtonRefComp>
        </React.Fragment>
    );
}

interface FeeItemPipusListProps {
    busTaskId: string;
    list: any[];
    eqpId: string;
}
/**管道单元揭示列表*/
function FeeItemPipeUnit({ busTaskId, list, eqpId }:FeeItemPipusListProps)
{
    const theme = useTheme();
    //href仅对管道才有用：到底哪些单元进一步显示列表？ /pipeline/:pId/:ppuId
    const href = `/pipeline/${eqpId}/`;       //到底有哪一些管道单元属于这个收费项？
    console.log("到FeeItem管道单元输出=", list);
    return (
        <React.Fragment>
            <List css={{
                margin: 'auto',
            }}>
                {list?.map((one,i) => (
                  <RouterLink href={href+`${one?.id}`} key={i}>
                    <ListItem  interactive={true}
                               css={{
                                   paddingTop: 0,
                                   paddingBottom: 0,
                               }}
                               contentBefore={ `${i+1}` }
                               contentAfter={ one.leng }
                               primary={ one.code || '空的?'}
                               secondStyle={css({display: "flex", justifyContent: 'space-around',flexWrap: 'wrap'})}
                               secondary={ one.rno }
                    />
                  </RouterLink>
                ))}
            </List>
        </React.Fragment>
    );
}

interface LikeTabsDialogsProps {
    open: number;
    setOpen: Dispatch<SetStateAction<number>>;
    busTaskId: string;
    //onSelect: (id: string, name: string) => void;
}
/**像多个同类Tab; 归并再套一层: 抽取相同部分功能和界面*/
function LikeTabsDialogs({ busTaskId,open, setOpen}:LikeTabsDialogsProps)
{
    const theme = useTheme();
    const {call, doing, called, reset, result:cudAck}= useCudChargingFeeMutation();
/*    const handleSelect = React.useCallback((id,name) => {
        setOpen(0);
    }, []);*/

    return (
        <Dialog open={!!open} onOpenChange={() => setOpen(0)}>
            <DialogContent >
                <DialogHeading>
                    选择收费项目
                </DialogHeading>
                <DialogDescription>
                    <div css={{ padding: theme.spaces.lg }}>
                        { open===ENUM_附加 && <FeeItemChooseAttach busTaskId={busTaskId} cudChFeefunc={call} reset={reset}/> }
                        { open===ENUM_金相 && <FeeItemChooseMetal busTaskId={busTaskId} cudChFeefunc={call} reset={reset}/> }
                        { open===ENUM_无损 && <FeeItemChooseUndam busTaskId={busTaskId} cudChFeefunc={call} reset={reset}/> }
                        { open===ENUM_加减 && <FeeItemChooseAddSub busTaskId={busTaskId} cudChFeefunc={call} reset={reset}/> }

                        { !doing && called && (
                            <div>
                                <Text>{`${cudAck?.warn??'成功'}; 新收费项id=${cudAck?.fee?.id}`}</Text>

                            </div>
                        )
                        }
                        <Spinner doing={doing}/>
                        <Button component="button" block size="lg"
                                css={{ marginTop: theme.spaces.md }}
                                onPress={() => {  setOpen(0);  }}
                        >关闭
                        </Button>
                    </div>
                </DialogDescription>
                <DialogClose>关闭</DialogClose>
            </DialogContent>
        </Dialog>
    );
}

const ENUM_EQP  = 1, ENUM_BUS  = 2;
/**后端收费计算 报出参数有问题的
 * 跳转去的URL页面组件当中需要添加<HashLinkObserver />来定位anchor，免去手动滚动查找的需要。底下每一个参数都要恰当测试；
 * 底下配置来自后端"money": ['设备销售价',ENUM_EQP]对应有5个地方：电梯、起重(包含升降机)、游乐、锅炉、容器(不含常压容器)的 进口安全性监督。
 * */
const mapErrorParam={
    "ccost": ['施工工程费',ENUM_BUS],
    "money": ['设备销售价',ENUM_EQP],
    "rtlf": ['起重机械载荷',ENUM_EQP],
    "power": ['额定功率/蒸发量',ENUM_EQP],
    "mreprc": ['改造、修理的设备价',ENUM_BUS],
    "pnum": ['停车设备泊位数',ENUM_EQP],
    "pnum2": ['氧舱人数',ENUM_EQP],
    "hlfm": ['起升高度(主钩)',ENUM_EQP],
    "hlf": ['提升高度',ENUM_EQP],
    "mom": ['起重力矩',ENUM_EQP],
    "span": ['起重机跨度',ENUM_EQP],
    "zmoney": ['产品设备价',ENUM_BUS],
    "flo": ['电梯层数',ENUM_EQP],
    "lesc": ['人行道使用区段长度',ENUM_EQP],
    "subv": ['子设备品种',ENUM_EQP],
    "level": ['游乐设施级别',ENUM_EQP],
    "fcode": ['承压进口安全性能检或气瓶制造监检需选择设备品类',ENUM_BUS],
    "vol": ['容积(换热面积)',ENUM_EQP],
    "prs": ['容器设计压力',ENUM_EQP],
    "varea": ['内外部检验面积',ENUM_BUS],
    "totm": ['液面计切断阀及附件检验收费单价不合理:30~60元/只',ENUM_BUS],
    "meter": ['容器检验部位总米数',ENUM_BUS],
    "opprn": ['安全阀工作压力',ENUM_BUS],
    "diame": ['安全阀公称通径',ENUM_BUS]
} as any;

interface ParamsErrorLinksProps {
    detId: string;
    eqpId?: string;
    taskId: string;
    errors: string[];
}
/**根据后端自动收费计算给出的参数缺失或者不合理数值提示来决定跳转链接*/
function ParamsErrorLinks({ detId,eqpId,taskId,errors }:ParamsErrorLinksProps)
{
    const arrset= new Set(errors);      //目的：去除重复的
    const errorlst= [...arrset];
    const theme = useTheme();
    const { history } = useContext(RoutingContext);
    return (
        <React.Fragment>
            <List css={{
                margin: 'auto',
            }}>
                {errorlst?.map((one,i) =>{
                    const tlArr=mapErrorParam[one];         //href ={hrefb+` ${tlArr[1]}`}
                    const hrefb0= tlArr[1]===ENUM_BUS? "/task/"+taskId+"/detail/"+detId+"/config" : "/device/"+eqpId;
                    //自动跳转到某个 anchor # 原生定位毛病更甚，<HashLinkObserver />定位也有缺陷：位置放哪里合适，可放多个的。
                    const hrefb= hrefb0 +"#"+ one;
                    //旧的是套上 <RouterLink href={hrefb} key={i}> <ListItem  ，，</RouterLink>
                    return (
                        <ListItem  interactive={true} key={i}
                                   css={{
                                       paddingTop: 0,
                                       paddingBottom: 0,
                                   }}
                                   contentBefore={ `${i+1}` }
                                   primary={ tlArr[0] }
                                   onPress={() =>{
                                       //目的：URL强制刷新！
                                       history.push(hrefb, {time: Date()});
                                   }}
                        />
                )
                } )}
            </List>
        </React.Fragment>
    );
}