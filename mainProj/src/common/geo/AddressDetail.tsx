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
    IconSearch, useTheme, useCollapse, Layer, Button, IconChevronUp, IconChevronDown,
    Collapse, IconX, usePressable, OnPressFunction,safeBind
} from "customize-easy-ui-component";

import {Dispatch, SetStateAction, useContext} from "react";
import RoutingContext from "../../routing/RoutingContext";
import {ContainLine, TransparentInput} from "../../comp/base";
import {usePreloadedQuery, useQueryLoader} from "react-relay/hooks";
import { AddressDetailQuery$data } from "./__generated__/AddressDetailQuery.graphql";
//import AddressDetailQueryResponse from "./__generated__/AddressDetailQuery.graphql"
import {Link as RouterLink} from "../../routing/Link";
///import { VillageChooseQuery } from "./__generated__/VillageChooseQuery.graphql";

import cx from "classnames";
// import { safeBind } from "customize-easy-ui-component/esm/Hooks/compose-bind";
//import {OnPressFunction} from "customize-easy-ui-component/esm/Hooks/touchable-hook";


const graphql = require("babel-plugin-relay/macro");
const AddressDetailQuery = require('./__generated__/AddressDetailQuery.graphql');


interface AddressDetailProps {
    id: string | undefined;
    children: React.ReactNode;
    onPress?: OnPressFunction;  //绑定选择触发
}

/**ES太简单了，要详细信息
 * 点击：触发揭示更多，同时加载数据。
 */
export const AddressDetail= ({ id, children,onPress, ...other }:AddressDetailProps) =>
{
    const theme = useTheme();
    const [queryReference, loadQuery] = useQueryLoader(AddressDetailQuery);
    const eos = useCollapse(false, true);
    const {setShow, show} =eos;

    const { bind, hover, active } = usePressable({
        onPress,
        //pressExpandPx,
        //disabled,
        behavior: "button", noHover:true
    });

  return (
          <Layer   elevation={"sm"} css={{padding: '0.25rem'}}>
              <div
                  className={cx("Button", "Touchable", {
                      "Touchable--hover": hover,
                      "Touchable--active": active
                  })}
                  role={"button"}
                  tabIndex={0}
                  css={[
                      //buttonReset,
                      {
                         // width:  undefined,
                          fontWeight: 500,
                          position: "relative",
                          fontFamily: theme.fonts.base,
                          borderRadius: theme.radii.sm,
                    //   fontSize: getFontSize(size, theme),
                          padding: "0 0.6rem",
                          [theme.mediaQueries.sm]: {
                              padding: "0 0.6rem",
                              whiteSpace: 'unset',
                          },
                          [theme.mediaQueries.lg]: {
                              padding: "0 0.6rem",
                          },
                         // height: getHeight(size),
                          display: 'flex',    //"inline-flex"是并列紧接着挨着。 ‘flex’可各靠着左右方向的头尾对齐。
                          alignItems: "center",
                          justifyContent: "center",
                          ":focus": {
                              outline: theme.outline
                          },
                          ":focus:not([data-focus-visible-added])": {
                              outline:  "none"
                          }
                      },
                    //  variants[variant],
                      {
                          background: "transparent",
                          boxShadow: "none"
                      }
                     // intentStyle,
                  ]}
                  {... ( safeBind( bind,  other)  ) }
              >
                  {typeof children === "string" ? (
                      <span
                          css={{
                              flex: 1,
                              marginRight: 0,
                              marginLeft:0
                          }}
                      >
                        {children}
                      </span>
                  ) : (
                      children
                  )}

                  <IconButton
                      variant="ghost"
                      icon={eos.show ? <IconChevronUp/> : <IconChevronDown/>}
                      label="删除"
                      css={{
                          //display: name ?  undefined : 'none',
                          //marginLeft: theme.spaces.sm
                          //position: 'fixed',
                          right: 0
                      }}
                      onClick={async (e) => {
                          loadQuery({id });
                          setShow(!show);
                          e.preventDefault();
                          e.stopPropagation();
                      } }
                  />
              </div>

              <Collapse {...eos.collapseProps} noAnimated>
                  <React.Suspense fallback="等下马上来...">
                      { queryReference && <AddressDetailInner queryReference={queryReference} /> }
                  </React.Suspense>
              </Collapse>
          </Layer>
   );
}


interface AddressDetailInnerProps {
    queryReference: any;
}
/**因为需要预加载数据的：所以构造成2层次的组件：上层的组件点击触发查询，而下层内部组件直接提取出数据。
 *不能放在同一个组件内： queryReference还未按钮点击(触发！)，还是null,下面组件的状态管理依赖于Hook,不能分叉hook,必须嵌套一层的组件render;
 *比如用 useLazyLoadQuery<typeof ProvinceChooseQuery> 只需要一层组件，但是有传统的缺点{不鼓励用那种模式},已经知道参数了就应该提前加载数据发起后端请求。

 ... on Address {
                        id name used lat lon plcls dense seimp vlg{id name type}
                        ad{id prefix name zipcode areacode}
                    },
 * */
function AddressDetailInner({ queryReference }:AddressDetailInnerProps)
{
    const data =usePreloadedQuery<typeof AddressDetailQuery>(
        graphql`
            query AddressDetailQuery($id: ID!) {
                node(id: $id) {
                    id,
                    __typename
                }
            }
      `,
        queryReference,
    );
    const { node: obj }=data as AddressDetailQuery$data;
    if(!obj)  return(
        <Text variant="h5" css={{ textAlign: 'center' }}>
            没找到
        </Text>
    );
    //const allobj= obj?.__typename==='Town'? obj.ads : obj;
    //const { vlgs:list }=allobj as any;  lat lon

    return (
        <div css={{
            margin: 'auto',
            background: "white"
        }}
        >
{/*            <Text variant="h6" css={{ textAlign: 'center' }}>
                { `${obj.ad?.prefix} ${obj.name}` }
            </Text>
            <Text variant="h6" css={{ textAlign: 'center' }}>
                楼盘: {`${obj.vlg?.name??'' }` }
            </Text>
            <Text variant="h6" css={{ textAlign: 'center' }}>
                邮编: {`${obj.ad?.zipcode??'' }` }
            </Text>
            {obj.plcls&&
                <Text variant="h6" css={{ textAlign: 'center' }}>
                  {`${obj.plcls}` }
                </Text>
            }
            {obj.dense&&
                <Text variant="h6" css={{ textAlign: 'center' }}>
                    人口密集区
                </Text>
            }
            {obj.seimp&&
                <Text variant="h6" css={{ textAlign: 'center' }}>
                 设备在重要场所
                </Text>
            }
            <Text variant="h6" css={{ textAlign: 'center' }}>
               纬度={`${obj.lat??''}`} 经度={`${obj.lon??''}`}
            </Text>*/}
        </div>
    );
}

