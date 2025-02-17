/** @jsxImportSource @emotion/react */
import {jsx, css} from "@emotion/react";
import * as React from "react";
import {
    useTheme, Tabs, Tab, TabPanel, DarkMode,  Pager,
    PanelEnlargeCtx, useMMenuBarOcup,
    TwoHalfFrame,
} from "customize-easy-ui-component";

//import { UnitList } from "./UnitList";
import {useContext} from "react";
import UserContext from "../routing/UserContext";
import RoutingContext from "../routing/RoutingContext";
import {UnitList, } from "./UnitList";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import { UnitMainQuery } from "./__generated__/UnitMainQuery.graphql";
import {Vector2} from "@use-gesture/core/dist/declarations/src/types/utils";
// import {TwoHalfFrame} from "../comp/TwoHalfFrame";
// import {Pager} from "../../UiDebugSave/sample/Pager";

import queryString from "query-string";
const graphql = require("babel-plugin-relay/macro");

interface UnitMainProps {
    //[特别小心！！] 路由器参数位置不是在第一层；实际放在这个prepared嵌套底下！！
    prepared: {
        query: PreloadedQuery<UnitMainQuery>;
        //预加载的数据是企业还是个人的； UnitList有两个组件一起展示的，但是数据只做了一个预先加载。UnitList只能选做一份。
        company?: boolean;
    }
    children: React.ReactNode;
    routeData: any;
}

//类似于这种模式的 <Upper> { (props:向下传递参数) => ( (...) return <Component />) } <Upper/> 这里改成了多定义一层组件做嵌套的新模式。
//组件UnitMainInner中间需用useContext(PanelEnlargeCtx);所以只能拆解后嵌套组装；把<PanelEnlargeCtx.Provider上移注入,这样才正常！
export const UnitMain = (props: UnitMainProps) => {
    return (
        <TwoHalfFrame  rightPanel={props.children}
               leftStyle={{
                           overflowY: 'hidden',
                           marginBottom: 'unset',
                       }}
        >
           <UnitMainInner
               {...props}
           />
        </TwoHalfFrame>
    );
};

const UnitMainInner: React.FunctionComponent<UnitMainProps> = props => {
  const theme = useTheme();
    const {user, setUser} =useContext(UserContext);
    const qs= queryString.parse(window.location.search);
    //是从编辑器进来的挑选单位模式： 返回按钮和选择好单位后需要能返回到来源地编辑器页面。
    const editorSM =qs && !!qs.erurl;
    const { isExact }=props.routeData;
    //这个必须用这里的，如果下面这句：报错 Unexpected use of 'history'  no-restricted-globals 不同的变量！
    const {history } = useContext(RoutingContext);
    const data = usePreloadedQuery<UnitMainQuery>(
        graphql`
            query UnitMainQuery(
                $after:String,$first:Int=10,$orderBy:String,$asc:Boolean=true,
                $uwhere:UnitCommonInput
            ) {
                ...UnitList
            }
        `,
        props.prepared.query,
    );
  //const { countTask:sumofTask,  }=data;
  //const [, params] = useRoute("/unit/:recipe*");
  let showingRecipe =!!props.children;
  let initTab= props.prepared.company? 0: 1;
    //儿子的第二层次的Pager控制
    const [activeTab, setActiveTab] = React.useState(initTab);
  //const { item:sumofTask,  } = useCountOfTask({dep:"", status:""} );
    console.log("UnitMain跑来  showingRecipe",showingRecipe);
    //实际就是TwoHalfFrame组件向下传递参数给子组件。
    const { setActivecas, getActivecas } =useContext(PanelEnlargeCtx);
    const onChildCannotDrag = React.useCallback(([x, y]:Vector2) => {
        if (x < 0 || x > 0) {
            setActivecas(getActivecas!()===1? 0 : 1);
            return true;
        }
        return false;
    }, [setActivecas, getActivecas]);
    //返回true=脱离控制，交给父辈的Pager控制
    // function onChildTerminationRequest({ delta }: StateType) {
    //     const [x] = delta;
    //     //表示是往左拉动的
    //     if (x < 0 && activeTab>=1) {
    //         return true;
    //     }
    //     if (x > 0 && activeTab<=0) {
    //         return true;
    //     }
    //     return false;
    // }
    const [openTablist, setOpenTablist] = React.useState(false);
    const { barHeight }= useMMenuBarOcup(false);

  return (
      <>
          <div  className="DragLinkBar"
            css={[
              {
                width: "100%",
                top: 0,
                background: theme.colors.palette.gray.base,
                zIndex: theme.zIndices.sticky,
                position: "sticky",
              }
            ]}
          >

            <div css={{ flex: "0 0 auto", zIndex: 2 }}>
                <DarkMode>
                  <Tabs
                      css={{
                          position: "sticky",
                          top: 0,
                          background: theme.colors.palette.gray.base
                      }}
                      onChange={i => setActiveTab(i)}
                      value={activeTab}
                      variant="evenly-spaced"
                  >
                      <Tab id="company">
                          找企业
                      </Tab>
                      <Tab id="person">
                          找个人
                      </Tab>
                  </Tabs>
                </DarkMode>

            </div>
          </div>
            {/*嵌套地Pager形式,框架在手机上有第一层Pager,两层衔接转切换的处理较为麻烦点
            enableScrollLock={true}  enableMouse minVelocity={0.2}
            */}
          <Pager    lazyLoad={false}
                  value={activeTab}   onRequestChange={i => setActiveTab(i)}
                  onNestDragEnd={onChildCannotDrag}
                  css={{
                      height: '100%',
                  }}
                paneStyle={{
                    // marginBottom: `${barHeight}`,
                }}
          >
              <TabPanel id="company"
                    css={{
                        height: '100%',
                    }}
              >
                  <React.Suspense fallback={'请稍等-企业'}>
                      <UnitList  company units={data} dataIsCompany={props.prepared.company}/>
                  </React.Suspense>
              </TabPanel>
              <TabPanel id="person"
                    css={{
                        height: '100%',
                    }}
              >
                  <React.Suspense fallback={'请稍等-个人'}>
                      <UnitList  units={data} dataIsCompany={props.prepared.company}/>
                  </React.Suspense>
              </TabPanel>
          </Pager>
      </>
  );
};


export default UnitMain;
