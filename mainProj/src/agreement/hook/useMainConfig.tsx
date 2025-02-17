/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    Button, ButtonRefComp, CommitInput, DdMenuItem,
    Dialog, DialogClose, DialogContent, DialogDescription, DialogHeading, IconArrowLeft, IconButton,
    Input,
    InputLine,
    Select, Text, TwoHalfRightPanel,
    useTheme, VerticalMenu
} from "customize-easy-ui-component";
import {DeviceClassSelect} from "../../device/DeviceClassSelect";
import {reportStatusObj} from "../AgreementListItem";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import {useContext} from "react";
import useBuildAgreementMutation from "./useBuildAgreementMutation";
import RoutingContext from "../../routing/RoutingContext";
import {useMainConfigQuery} from "./__generated__/useMainConfigQuery.graphql";
import {InternalEditorResult} from "../../common/base";
import {Link as RouterLink} from "../../routing/Link";

import { graphql } from "relay-runtime";


export interface AgreementConfigProps {
    id?: string;
    prepared: {
        //【特别注意】query路由器若不是提供这个类型的查询DetailConfigQuery，本组件也不会抛出异常！在usePreloadedQuery<DetailConfigQuery>()不报错！
        query: PreloadedQuery<useMainConfigQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}
/**【代码复用】 见识下Hook形式的灵活性。类似页面的可以抽取公用部分代码，中间插入各自特殊的页面组件。frame底下sibling也是相同的。
 * 本HOOK返回值：
 * frame：父辈上级一层的页面，抽取相同的父辈一级组件内容。
 * sibling：和本体主体差别内容div位于同一层级的div页面区域（这里是下方的工具栏附加显示）；抽取相同的跟随的底下工具栏一级组件内容，同样的Mutation操作接口。
 * agreement: 依靠Relay读取关联实体, 同样的都会用到同一个Model类型的实体数据Query: node();
 * editorRef：其它的上下级组件之间传递参数。 同样都会传递这个参数的。
 * */
export function useMainConfig(props: AgreementConfigProps)
{
    const theme = useTheme();
    const data = usePreloadedQuery<useMainConfigQuery>(
        graphql`
            query useMainConfigQuery($ptId: ID!) {
                node(id: $ptId)
                {
                    id, __typename
                    ... on Agreement {
                        id,status,ptno,ispu{id name}, servu{id name}, crman{id username},promoter{id username},
                        auditor{id username,person{id,name}}, dispatcher{id username,person{id,name}},
                        entrust bsType,ad{id }, transferor,
                        complDate, charge, mdtime, aux, pttype,
                        ad{id,prefix,name,country{id},province{id},city{id},county{id},town{id}},
                        devs{id cod oid plno,useu{id name},address,vlg{id,name}
                            ad{id,prefix,name}, lpho,fno,titl,plat,ust,vart,cert,
                            used,nxtd1,nxtd2,ispu{id,name},ispud{id,name}
                        }
                    }
                }
            }
        `,
        props.prepared.query,
    );
    const { node:item, }=data;    //有多个分项报告[SimpleReport]
    const {call:updateDetailFunc,doing,called, result}= useBuildAgreementMutation();
    //  const {call:cudChFeefunc, doing, called, reset, result:cudAck}= useCudChargingFeeMutation();     //删除专用，增加在子组件内部独立的；
    const commitBlurRef =React.useRef(null);
    //先试一试：直接在父辈同一个组件内直接做 编辑器方式的保存。 PreloadedQuery+Mutation()都在同一组件干。
    // const [ccost, setCcost] = React.useState<number|undefined>(item?.ccost!);
    // const [fcode, setFcode] = React.useState(item!.fcode);
    // const [zmoney, setZmoney] = React.useState(item?.zmoney);
    // const [totm, setTotm] = React.useState<number|undefined>(item!.totm!);
    //会根据参数判定输出类型啊！报错了,useRef<T>(initialValue: T|null): RefObject<T>; useRef<T>(initialValue: T): MutableRefObject<T>;
    const editorRef=React.useRef({} as InternalEditorResult);
    const {save, field, reurl, p1field, multi}= window.history.state?.state??{};       //通用伪对话框传递格式field=上次跳转目标选择字段。
    const {history } = useContext(RoutingContext);
    const myUrl= history.createHref(history.location);
    const hrefnow =history.location.pathname;

    console.log("收费主页来taskSjw:", props.routeData.params.taskId!,";routeData=", props.routeData, "editorRef=",editorRef.current);
    if(!item)  throw new Error(`没找到协议申请单 ID${props.id}`);

    //共同父辈页面部分：
    const frame=(
        <TwoHalfRightPanel
            title={`协议申请单`}
            back={
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
            }
            menu={
                <VerticalMenu>
                    <DdMenuItem label="看协议书"
                                onClick={(e) => {
                                    history.push(`/agreementView/${props.routeData.params.ptId}/${item?.pttype}`);
                                }}/>
                    <DdMenuItem label="已关联任务"
                                onClick={(e) => {
                                    history.push(`/agreement/${props.routeData.params.ptId}/${item?.pttype}/tasks`);
                                }}/>
                </VerticalMenu>
            }
            children={null}
        />
    );

    //共同兄弟div层次页面部分：
    const sibling=(
      <>
          <ButtonRefComp
              intent="primary"
              disabled={doing}
              ref={commitBlurRef}
              css={{marginLeft: theme.spaces.sm}}
              onPointerOver={(e: any) => {
                  // @ts-ignore
                  commitBlurRef!.current!.focus();
              }}
              onPress={async () => {
                  //获取最新的儿孙组件编辑器数据， 若doConfirm是异步就必须加上await
                  const sendInp = editorRef.current!.doConfirm()  as any;
                  //注意 ad: Relay.Query读取过来是对象，更新Mutation后端INPUT需要映射修改为 GlobalID;
                  sendInp.ad =sendInp.ad?.id;
                  //参数个数少了会飘红，可是照样能执行。
                  updateDetailFunc(props.routeData.params.ptId, 'UPD', sendInp);
                  history.push(myUrl);
              }}
          >
          保存申请单的修改
          </ButtonRefComp>
          {
              item?.status==='INIT' &&
              <ButtonRefComp
                  intent="primary"
                  disabled={doing}
                  ref={commitBlurRef}
                  css={{marginLeft: theme.spaces.sm}}
                  onPointerOver={(e: any) => {
                      // @ts-ignore
                      commitBlurRef!.current!.focus();
                  }}
                  onPress={async () => {
                      const sendInp = editorRef.current!.doConfirm()  as any;
                      sendInp.ad =sendInp.ad?.id;
                      sendInp.status ='SUBMIT';
                      //【zeebe终端被挂住】导致这里连续多次点击的，可能导致产生多个的流程实例：多余流程实例，且实例没法保存给实体prId字段，游离于管理控制之外。
                      updateDetailFunc(props.routeData.params.ptId, 'UPD', sendInp);
                      history.push(myUrl);
                  }}
              >
                  提交申请
              </ButtonRefComp>
          }
          {
              item?.status!=='INIT' &&
              <Button intent="primary" css={{marginLeft: theme.spaces.sm}}
                      onPress={async () => {
                      history.push(hrefnow+'/flowSelect');
                  }}>流转
              </Button>
          }
      </>
    );

  //页面复用的Hook: 肢解复杂结构页面和拼装, 读取Relay数据和useRef也能都放在一起复用和拼凑。
  return {
      frame,
      sibling,
      agreement: item,
      editorRef
  };
}

