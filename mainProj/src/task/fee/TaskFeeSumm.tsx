/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme,
    LayerLoading,
    Text,
    Button,
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
    Dialog,
    InputLine,
    Select,
    InputDatalist,
    ComboBoxDatalist,
    Spinner,
    CommitInput,
    ButtonRefComp,
    InputGroup,
    TextArea,
    IconPrinter,
    LineColumn,
    Container,
    CheckSwitch,
    VerticalMenu,
    DdMenuItem, SuffixInput, Input,
    TwoHalfRightPanel, IconArchive
} from "customize-easy-ui-component";
//import {  useLookReportOfIsp } from "./db";

//import { Link as RouterLink, useLocation } from "wouter";
//import { TransparentInput } from "../../comp/base";
import { Link as RouterLink } from "../../routing/Link";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import {TaskFeeSummQuery} from "./__generated__/TaskFeeSummQuery.graphql";
//import {noop} from "use-media/lib/utilities";

import {DivisionChooseQuery$data} from "../../unit/division/__generated__/DivisionChooseQuery.graphql";
import {getFeeTitleBe} from "../../dict/feeTitleBe";
import {asFeeTitleFeOb as FeeC, ContainerDesignClsTil, getFeeTitleFe} from "../../dict/feeTitleFe";
import {css} from "@emotion/react";

import {Dispatch, MutableRefObject, SetStateAction, useContext, useEffect} from "react";


import {InternalEditorResult} from "../../common/base";
import {ContainLine, TransparentInput} from "../../comp/base";
import useConfirmTaskFeeMutation from "./useConfirmTaskFeeMutation";
import RoutingContext from "../../routing/RoutingContext";
import useSummaryTaskFeeMutation from "../useSummaryTaskFeeMutation";
//import useReckonIspFeeMutation from "./useReckonIspFeeMutation";
//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。
import { graphql } from "relay-runtime";


interface TaskFeeSummProps {
    id?: string;
    prepared: {
        //【特别注意】query路由器若不是提供这个类型的查询DetailConfigQuery，本组件也不会抛出异常！在usePreloadedQuery<DetailConfigQuery>()不报错！
        query: PreloadedQuery<TaskFeeSummQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}
/**业务信息配置*/
export default function TaskFeeSumm(props: TaskFeeSummProps) {
    const theme = useTheme();
    const data = usePreloadedQuery<TaskFeeSummQuery>(
        graphql`
            query TaskFeeSummQuery($taskId: ID!) {
                node(id: $taskId)
                {
                    ... on Task {
                        id  feeOk dreason disfee charge
                    }
                }
            }
        `,
        props.prepared.query,
    );
    const { node:item, }=data;    //有多个分项报告[SimpleReport]
  //  const {call:updateDetailFunc,doing,called, result}= useUpdateDetailMutation();
    const {call:confirmTaskFeeFunc,doing:confing,called:confed, result:confrs}= useConfirmTaskFeeMutation();

    const commitBlurRef =React.useRef(null);
    //先试一试：直接在父辈同一个组件内直接做 编辑器方式的保存。 PreloadedQuery+Mutation()都在同一组件干。
    const [charge, setCharge] = React.useState<number|undefined>(Number(item!.charge) ||  Number(item!.disfee) || undefined);

    const [memo, setMemo] = React.useState<string|null>();
    //会根据参数判定输出类型啊！报错了,useRef<T>(initialValue: T|null): RefObject<T>; useRef<T>(initialValue: T): MutableRefObject<T>;
    const editorRef=React.useRef({} as InternalEditorResult);
    const { history } = useContext(RoutingContext);
    //把左边任务设备列表主菜单的功能直接腾挪到了右边工作页面内容区域中： @ 复制和复用代码。
    const {call:summaryTaskFeeFunc,doing:summing,called:summed, result:summrs}= useSummaryTaskFeeMutation();

    useEffect(() => {
        if(summrs){
            //上面charge= React.useState( || ) 被初始化,页面没有强制unmount的，就不会再变化。【问题出现！】汇算结果无法更新render页面{&& <charge===0?>}
            if(!charge)  setCharge(Number(item!.charge) ||  Number(item!.disfee) || undefined);
            history.push('/task/' + item?.id! +'/sumfee', {time: Date()} );          //强制刷新！，时间肯定变化
        }
    }, [summrs]);

    console.log("收费主页来taskSja:", props.routeData.params.taskId!,";isp=", props.routeData.params, "editorRef=",editorRef.current);

    if(!item) return(
        <Text  variant="h4"　css={{ textAlign: 'center' }}>
            没找到检验detId {props.routeData.params.ispId}。
        </Text>);
  // @ts-ignore
    return (
      <TwoHalfRightPanel
          title={ `关联的收费信息` }
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
                  <DdMenuItem label="功能待续"
                              onClick={(e) => {
                              }}/>
              </VerticalMenu>
          }
      >
            <Container>
                <div
                     css={{
                      paddingBottom: theme.spaces.lg
                     }}
                >
                    <Text variant="h5">任务级别汇总收费</Text>
                    <ContainLine display='应收费任务金额'>
                        <TransparentInput readOnly={true} value={item?.disfee || '请先去汇总'}/>
                    </ContainLine>
                    { item?.dreason &&
                        <Text>自动折扣说明：{item?.dreason || ''}</Text>
                    }
                    { (charge || 0===charge) ?
                        <InputLine label={`实际收费金额:`} >
                            <SuffixInput component={Input}
                                         css={{
                                             "div:has(&).SuffixInput_Top": {
                                                 display: 'flex',
                                                 alignItems: 'center',
                                             },
                                             "div:has(&).Input_Top":{
                                                 width: "70%",
                                             },
                                             width: '100%',
                                         }}
                                         onChange={e=>{
                                             //不能用setCharge( Number(e.currentTarget.value) || undefined)导致0无法输入，0变身undefined取值的。
                                             setCharge( Number(e.currentTarget.value) || 0 );
                                         } }
                                         type="number"  value={ charge || 0}>
                                元
                                <IconButton  variant="ghost"  icon={<IconArchive />}  label="默认"
                                             onClick={async (e) => {
                                                await setCharge(Number(item?.disfee!));
                                             } }
                                />
                            </SuffixInput>
                        </InputLine>
                        :
                        <>
                            <Text variant="h5" css={{color: 'red' }} >请先汇总任务金额(多设备)</Text>
                            <Button intent="primary" disabled={summing}
                                    onPress={async () => {
                                        await summaryTaskFeeFunc(item?.id!);
                                        //强制去刷新 当前URL
                                        //这里却没有效果history.push('/task/' + item?.id! +'/sumfee');
                                    }}
                            >
                              任务金额汇总
                            </Button>
                        </>
                    }
                    <InputLine label={`给审批人的理由:`}>
                        <CommitInput  value={ memo || ''}  onSave={txt => setMemo( txt || undefined) }
                               placeholder="如果实际收费金额比应收费任务金额少的，必须给出说明"
                        />
                    </InputLine>
                </div>
            </Container>
          {
              (charge || 0===charge)  &&
              <ButtonRefComp
                  intent="primary"
                  disabled={(item!.feeOk &&  charge===Number(item!.charge) ) as any }
                  ref={commitBlurRef}
                  css={{marginLeft: theme.spaces.sm}}
                  onPointerOver={(e: any) => {
                      // @ts-ignore
                      commitBlurRef!.current!.focus();
                  }}
                  onPress={async () => {
                      //获取最新的儿孙组件编辑器数据
                      //const sendInp = editorRef.current!.doConfirm();
                      const sendInp={ amount: charge?.toString() , memo };
                      await confirmTaskFeeFunc(props.routeData.params.taskId,sendInp as any);
                  }}
              >
                  确认采用这个实际收费
              </ButtonRefComp>
          }
          { confrs.warn && (
                  <Text  variant="h5"　css={{ textAlign: 'center' }}>
                      后端应答：{confrs.warn}，请处理后再来。
                  </Text>
          ) }
        <RouterLink href={"/tasks"}>
            查全部任务
        </RouterLink>

      </TwoHalfRightPanel>
  );
};


//【重要】正常<SuffixInput component={InputBase}默认，Input 比起InputBase，外面多包裹一个div。这样css修改幅度较大，需要使用div:has(&)选择器选定上一级或祖辈div的样式修正！
//"div:has(&).Input_Top": {} 实际代表任意祖先div再去选择className=".Input_Top"的那些？ 万一嵌套重名的呢？【注意】className最好不一样 才能区分啊。
//CSS相邻兄弟选择器只支持后面的元素，而不支持前面的兄弟元素？”是一样的。CSS不支持父选择器 ？  https://blog.csdn.net/qq_40738077/article/details/127302494
//选择器当中"&" { } 会直接转换为类选择器指向实际是组件{...other}所附属设置的哪一个tag：可能嵌套追溯到最终叶子tag。 div:has(.css-utnaou-TaskFeeSumm).css-oqlhsk-SuffixInput
//CSS5: 复合选择器"div:has(&)#cssid2": {,}         https://blog.csdn.net/baidu_38766791/article/details/125815212
//子元素选择器  >不能跨代选取  h1.warning + p { ...} 会选择所有有用warning类的h1元素后面紧跟的p兄弟元素。 "& .Tabs__container":
//下一级标签的修改样式办法： & 表示在嵌套层次中回溯一层 /空格' '后代选择器/.class名字选择器 <div class="nn11 Tabs__container">点号后面就是类。
//允许组件css={ "& > div": {}, ".Suffix__Edit":{} }能自定义样式的;

