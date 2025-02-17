/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    List,
    Button, Stack, StackItem,
    useTheme,
    IconMoreVertical,
    MenuItem,
    useToast,
    useMMenuBarOcup,
    DdMenu, DdMenuItem, ListItem,
} from "customize-easy-ui-component";
import { SearchUnitBox } from "./SearchUnitBox";
import {SearchTitle} from "../comp/base"
import {useContext,  useRef} from "react";
import {usePaginationFragment} from "react-relay/hooks";
import { UnitList$key } from "./__generated__/UnitList.graphql";
import RoutingContext from "../routing/RoutingContext";
// import {Stack, StackItem,} from "../../UiDebugSave/sample/Stack";
import {css} from "@emotion/react";

import queryString from "query-string";
import { graphql } from "relay-runtime";


interface UnitListProps {
    units: UnitList$key;
    company?: boolean      //我的页面是为了企业而展示的。
    dataIsCompany?: boolean   //加载的数据是属于企业的。
}

export const UnitList: React.FunctionComponent<UnitListProps> =
({
     units,company,dataIsCompany
})=> {
    //动态的，没有预加载
    const [dynamicGet, setDynamicGet] = React.useState(false);
    //保存 不可变值;  过滤和搜索的参数
    const queryRef =useRef(null);
    const qs= queryString.parse(window.location.search);
    //const field =qs && !!qs.土建施单;
    //console.log("参数JoinedDevice路由qs field=",field, qs);
    const theme = useTheme();
    //底下返回列表是UnitEs = CompanyEs | PersonEs；不是Unit模型的。
    //refetch导致Suspend出现从而搞得编辑框失去焦点了/中文都无法输入了? 不能一个字母一个字母的触发refetch。
    //refetch要求加载的usePaginationFragment参考parentFragmentRef不能为null的;
    const { data, refetch , loadNext,hasNext,isLoadingNext} = usePaginationFragment(
        graphql`
            fragment UnitList on Query
            @refetchable(queryName: "UnitListRefetchQuery") {
                getUnitEsFilter(where: $uwhere,after:$after,first:$first,orderBy:$orderBy,asc:$asc)
                @connection(key: "Query_getUnitEsFilter") {
                    edges {
                        node {
                            __id,
                            __typename , 
                            ... on CompanyEs{
                                id  name no address linkMen
                            }
                            ... on PersonEs{
                                id  name no address phone
                            }
                        }
                    }
                }
            }
        `,
        units,
    );
    //可能data没有加载数据啊
    const { getUnitEsFilter: list }= (dynamicGet || (company && dataIsCompany) || (!company && !dataIsCompany))?  data! : {getUnitEsFilter:null};
  //[union+node: 特殊啊!]上面声明的 node {   __id, 是必要的，否则编译报错: 无 hit.id。
    const items = list && list.edges ? list.edges.map(edge => edge?.node) : [];
  //搜索user的输入:
    const myobj=sessionStorage['单位选择']&&JSON.parse(sessionStorage['单位选择']);
    //简化点：两个分页面排斥。 企业不能用phone查;
    const [query, setQuery] = React.useState( (dataIsCompany && company ?  myobj :
                    !dataIsCompany && !company ? myobj :
                    {...myobj, name: ""} )  || {name:''});
    const { history } = useContext(RoutingContext);

    //上一代做法：根据过滤器选择组织后端参数。
    const condition = React.useMemo( () => {
        const { name,no,address,phone } = query;
        let condition = {company: company,  name,no,address,phone }
        return condition;
    }, [query, company]);

    React.useEffect(() => {
        if (queryRef.current !== condition)
        {
            queryRef.current = condition as any;
            refetch(
                {
                    uwhere: {...condition}, after: null, first: 2,
                }
            );
            setDynamicGet(true);
            sessionStorage['单位选择'] =JSON.stringify(condition);
        }
    }, [condition, refetch]);


  //const [filter, setFilter] = React.useState({unit: {cod:'%'}, offset:0,limit:3 } as any);
    //界面轮播 setIndex切换显示界面；   //index不是组件外部那一个同名index；
    const [index, setIndex] = React.useState(0);

  //这两个useEffect的前后顺序不能颠倒，顺序非常重要，后面的依赖于前面的useEffect更新结果。
/*  const [refMore, acrossMore] = useInView({threshold: 0});
  useEffect( () => {
          if(acrossMore && hasNext)   loadNext(8)
      },
    [acrossMore,hasNext,loadNext ]);*/

    const {save, field, reurl, p1field}= window.history.state?.state??{};      //通用伪对话框传递格式
    console.log("左半边列表组件传来condition=",condition, "queryRef.current=",queryRef.current);
    const toast = useToast();
    const {barHeight } = useMMenuBarOcup(history.routeData?.isExact);
    //睡觉实际没啥意义了。
    function sleep(time: number | undefined) {
        return new Promise(resolve =>
            setTimeout(resolve,time) )
    }
    async function pressWait() {
        console.log("AddUnit睡觉一会了；sta");
        let out = await sleep(900);
        console.log("AddUnit睡觉一会了；end");
        return out;
    }

    //控件<Stack 是堆叠式的，像导航条；适用同一个模板显示只需上级给下级参数调整的场景。根据上一叠页面选择触发状态relation给下一叠参数来控制下一级显示；更多嵌套很困难。
  return (
    <Stack  navStyle={css({ position: 'sticky',  top: 0,})}
      style={{
          height: '100%',
      }}
      index={index}
      navHeight={50}
      onIndexChange={i => setIndex(i)}
      items={[
        {
          title: (
            <SearchTitle>
              <SearchUnitBox
                css={{ borderBottom: "none" }}
                label="搜单位名,过滤器范围内"
                query={query}
                setQuery={setQuery}
                company={company!}
              />
            </SearchTitle>
          ),
          content: (
              <StackItem  css={{ marginBottom: `${barHeight}` }}
                        style={{ position: undefined, boxShadow:undefined ,height: "100%"}}
              >
                <div  css={{overflowY: "auto", height: "100%" }}>
                  <List>
                    { items?.map((hit,i) => (
                        <ListItem key={hit?.id}
                                   onPress={ (e) => {
                                       console.log("List2Item onPreess触发-",e);
                                       //点击列表要传递伪对话框的state 4个字段； history.push(`/unit/${hit!.id}/?&emodel=${qs.emodel}&emid=${qs.emid}&field=${qs.field}`);
                                       history.push(`/unit/${{...hit}.id}/${hit!.__typename==='CompanyEs'? 'company':'person'}`,
                                           {save,field,reurl,p1field});
                                       // e?.stopPropagation();  //加上拉拽事件受到屏蔽了！！！
                                       //  e?.preventDefault();      //避免重复触发onPress
                                   }}
                                  interactive={true}
                                  primary={`${{...hit}.name || '竟然没有名字'}`}
                                  secondary={`${hit?.address}`}
                                  contentAfter={
                                      <DdMenu label="菜单" tight={true}
                                              icon={
                                                  <MenuItem variant="ghost"  component={"div"}>
                                                      <IconMoreVertical />
                                                  </MenuItem>
                                              }
                                      >
                                          <DdMenuItem label="加个单位"
                                                      onClick={async (e) => {
                                                          history.push("/unit/new");
                                                      }}/>
                                          <DdMenuItem label="其他功能" disabled={false} onClick={ async (e) => {
                                              e?.preventDefault();
                                              await history.push("/unit/new");
                                          } } />
                                          <DdMenuItem label="其它" disabled={false} onPress={ async (e) => {
                                              e?.stopPropagation();
                                              await history.push("/unit/new");
                                          } } />
                                      </DdMenu>
                                  }
                        />
                    ))}

                  </List>
                    <div css={{textAlign: "center", paddingBottom:'3rem' }}>
                      { hasNext  &&  (
                        <div>
                            <Button disabled={isLoadingNext} onPress={ () =>{
                                console.log("拉扯获取更多=" ,items?.length);
                                loadNext(3,{
                                    onComplete: (error) =>  {
                                        if(error){
                                            toast({
                                                title: "返回了",
                                                subtitle: ""+error,
                                                intent: "error"
                                            });
                                        }
                                    }
                                });     //虽然引用表现是异步的，但还是需要某些步骤需要同步执行的，只能说是其内部深度嵌套了个Promise()。
                                setDynamicGet(true);
                            } }>
                                按，拉扯获取更多......
                            </Button>
                        </div>
                      )}
                      {!hasNext  &&　<React.Fragment>
                        <span>嘿，没有更多了</span>
                      </React.Fragment>
                      }
                    </div>
                    {/*<div  ref={refMore}  css={{height: "1px"}}> </div>*/}

                </div>
            </StackItem>
          )
        },
      ]}
    />
  );
};


//报错Cannot read property 'map' of null标记出错代码行，竟可能会差错！实际错误点实在下方，报错指示却在上方的代码行，两处都有.map的代码。
//<Stack 组件，实际上是内部状态控制界面的呈现，实际上DOM数据内容并没有同步地变更，只是页面切换着看；适用数据库组织的；PK的，导航堆叠场景实际是源代码组织的。
//幸运的事！！<StackItem>底下内嵌的组件可以做到每一个都是独立自主的。这里<FollowingRecipes key={}/>对每一个按钮进入和后退的，虽然组件同一个，但内部状态数据可各自独立的。
//overflowY:"scroll"若遇到 css={{height: "100%", 和 minHeight: '300px' 不能同时添加的。overflowY:和"100%"一起使用，且要在内层DIV上用。组件中间层可能屏蔽掉。
//多层DIV的height: "100%", 需要在中间层次添加100%传递父辈限制大小，配合内部层的overflowY: "scroll",才能滚动。
//[query] = React.useState(""); 为何导致 if(!query) 成立， ""即空字符串等于false。
/*
<ResponsivePopover
          content={
              <MenuList>
                  <MenuItem onPress={ async () => {
                      //await setRepId(recipe.id);    handleDelete(recipe.id)
                  }
                  }>功能待续
                  </MenuItem>
                  <MenuItem contentBefore={<IconPackage />}  onPress={(e) => {
                      history.push("/unit/new");
                      //e?.preventDefault();
                      // e?.stopPropagation();
                  } }>
                      加个设备
                  </MenuItem>
              </MenuList>
          }
      >
          <IconRefButton variant="ghost" icon={<IconMoreVertical/>} label="菜单"/>
 </ResponsivePopover>
* */
