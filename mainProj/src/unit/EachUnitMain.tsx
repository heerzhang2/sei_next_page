/** @jsxImportSource @emotion/react */
import * as React from "react";
import {jsx, css} from "@emotion/react";
import {
    Text,TwoHalfRightPanel,
    Button,
    IconButton,
    useTheme,
    useToast,
    Container,
    IconArrowLeft, IconArrowRight,  DdMenuItem, VerticalMenu
} from "customize-easy-ui-component";

import { Link as RouterLink } from "../routing/Link";
//import { ContainLine, TransparentInput } from "../comp/base";
import {UnitOutline} from "./comm/UnitOutline";
//import { useInvalidateEQP } from "./db";
import {JoinedDevice} from "./JoinedDevice";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import { EachUnitMainQuery } from "./__generated__/EachUnitMainQuery.graphql";
import {useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
// import {TwoHalfRightPanel} from "../../UiDebugSave/sample/TwoHalfRightPanel";
import { graphql } from "relay-runtime";


interface EachUnitMainProps {
    //id?: string;   　//来自上级<Route path={"/device/:id/"} component={} />给的:id。
    //company?:boolean;
    prepared: {
        query: PreloadedQuery<EachUnitMainQuery>;
    }
    children: React.ReactNode;
    routeData: any;    //隐藏的参数：路由器主动给的。
}
//右半边页面 二级路由的
/**左半边的大列表和右半边主页面两个页面实际可能没有半点关联的: 非点击选中的直接输入ID情形就可能不会从大列表找到并跟随的。
 * */
export const EachUnitMain = (props: EachUnitMainProps) => {
  //const qs= queryString.parse(window.location.search);
  //const field =qs && !!qs.土建施单;
  const theme = useTheme();
  const toast = useToast();

        //原型是[Path, (to: Path, options?: { replace?: boolean }) => void]
  //const [, setLocation] = useLocation();
 //const [match, params] = useRoute("/unit/:id/:rest*");
  let id =props.routeData.params.unitId;     //路由器URL分解得到参数
  console.log("EachUnitMain查询id=", id,"company=", props.routeData.params.company, props);
    const data = usePreloadedQuery<EachUnitMainQuery>(
        graphql`
            query EachUnitMainQuery($id: ID!,$company:Boolean) {
                getUnit(esid: $id, company:$company) {
                    id, company {id,name,no,address}, person {id,name,no,address}
                    name,address,linkMen,phone, crDate
                }
            }
        `,
        props.prepared.query,
    );
    const { getUnit: unit }=data;
    //const { loading ,items: dtvalue, error ,refetch} = useDeviceDetail( { id , company } );
    const { history } = useContext(RoutingContext);
    console.log("EachUnitMain参数@unit.company=",unit?.company, "unit=",unit);
    console.log("右半边子组件传递参数来servu=",window.history.state?.state);
    const {save, field, reurl, p1field}= window.history.state?.state??{};      //通用伪对话框传递格式
    console.log("EachUnitMain组件传来reurl=",reurl, "save=",save);

  return (
      <TwoHalfRightPanel
          title={  <Text
              css={{
                  flex: 1,
                  textAlign: "center",
                  [theme.mediaQueries.md]: {
                      textAlign: "left"
                  }
              }}
              wrap={false}
              variant="h5"
              gutter={false}
          >
              {
                  unit?
                      unit.company? '企业的':
                          '个人的'
                      :
                      "没找到此"
              }ID号:
              {id}
          </Text>
          }
          back={
              <IconButton  icon={<IconArrowLeft />}
                           variant="ghost"
                           label="后退"
                           size="md"
                           css={{
                               marginRight: theme.spaces.sm,
                               [theme.mediaQueries.md]: {
                                   display: "none"
                               }
                           }}
                           onPress={e => {
                               //点击列表要传递伪对话框的state 4个字段； history.push(`/unit/${hit!.id}/?&emodel=${qs.emodel}&emid=${qs.emid}&field=${qs.field}`);
                               history.push(`/unit`,   {save,field,reurl,p1field});
                           } }
              />
          }
          menu={
              <VerticalMenu>
                  <DdMenuItem label="为该服务单位生成新任务"
                              onClick={(e) => {
                                  const {id,name}=unit!;         //多个search?&=参数tasks/new?servu=${unit?.id}
                                  //不是伪对话框的形式：但是也用了?.state?.save传递一个单独的字段--目标服务单位。 两个机制都共用一个状态啊？会冲突。跳转并提供预设参数的模式.PK.弹转伪对话框待返回;
                                  //假如和伪对话框兼容？{save: {servu: {id,name}} } 都能支持：我这是跳转并提供预设参数的模式，类似URL直接提供附加参数?&servu={id}&=;
                                  history.push(`/tasks/new`, {save: {servu: {id,name}} } );
                              }}/>
                  <DdMenuItem label="其他功能" onClick={ async () => {
                      }
                  }/>
              </VerticalMenu>
          }
      >

          <Container>
              <div
                  css={{
                      display: 'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      minHeight: '85vh',
                      [theme.mediaQueries.md]: {
                          paddingTop: theme.spaces.lg,
                          paddingBottom: theme.spaces.lg,
                          minHeight:'unset',
                      }
                  }}
              >
                  <div
                      css={{
                          width:'100%',
                      }}
                  >
                      {
                          unit? (
                                  <React.Fragment>
                                      <UnitOutline  id={id} dt={unit}/>
                                      <JoinedDevice
                                          readOnly={true}
                                          id={id}
                                          unit={unit}
                                      />
                                  </React.Fragment>
                              )
                              :
                              <h3>没找到单位?</h3>
                      }

                      <div css={{ marginTop: theme.spaces.sm }}>
                          <RouterLink href={`/device/`}>
                              <Button
                                  size="lg" noBind
                                  intent="primary"
                                  iconAfter={<IconArrowRight />}
                              >
                                  找其名下设备
                              </Button>
                          </RouterLink>
                      </div>
                  </div>
              </div>
          </Container>

      </TwoHalfRightPanel>
  );
};

export default EachUnitMain;
