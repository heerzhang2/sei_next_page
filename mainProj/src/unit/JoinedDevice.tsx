/** @jsxImportSource @emotion/react */
import * as React from "react";

import {
  Text,
  useTheme,
  LayerLoading,
  Container,
  Button, IconArrowRight, Touchable, IconCloud
} from "customize-easy-ui-component";

//import { useSession } from "../auth";
//import {Helmet} from "react-helmet";
//import { Link as RouterLink, useLocation } from "wouter";
//import { Link as RouterLink } from "wouter";
//import { useCancellationTask } from "./device/db";
import { DevfilterContext } from "../context/DevfilterContext";

//import queryString from "querystring";
import { Link as RouterLink } from "../routing/Link";
import {useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
import queryString from "query-string";

interface JoinedDeviceProps {
  id?: string;
  readOnly?: boolean;
  unit?:any;
}

export const JoinedDevice: React.FunctionComponent<JoinedDeviceProps> = ({
  readOnly,
  id,
  unit=null,
}) => {
  //const qs= queryString.parse(window.location.search);
  //const field =qs && !!qs.土建施单;
  //console.log("参数JoinedDevice路由qs field=",field, qs);
  const theme = useTheme();
 // const toast = useToast();
  //const eqpId=id;
  const [loading, ] = React.useState(false);
 // const [editing, setEditing] = React.useState(!readOnly);
 // const [image, ] = React.useState(defaultImage);
 // const [title, setTitle] = React.useState(defaultTitle);
 // const [taskId, setTaskId] = React.useState(null);
  //直接取得EQP关联的task字段的对象。
  const {task} =unit;
 // const [ingredients, setIngredients] = React.useState<any>( dt||{} );
    const { history } = useContext(RoutingContext);
  //const [lazyurl, setLayurl] = React.useState(null);
    //【4种参数传递】淘汰Contex跨路由页面传参。SessionStorage? history.state{}? 定做路由器｛user注入路由器prepare(parms,user)｝
  const {filter, setFilter} =React.useContext(DevfilterContext);
  /*const {result, submit:updateFunc, } = useCancellationTask({
    taskid: taskId, reason:'测试期直接删'
  });*/
  //过滤对象or参数取值K/V；有些保留key不能随意使用。 ,"useUid": undefined
  const  devFilterArgs={"ownerId": id };
  const  devFilterArgsUseU={"useUid": id };

  console.log("页面刷新钩子AttachedTask entry=",　",设备id="+id+";device=",task,";eqp=",unit ,"filter=",filter);
/*
  async function handleDelete(id: string) {
    try {
      await updateFunc();
    } catch (err: any) {
      toast({
        title: "后端报错",
        subtitle: err.message,
        intent: "error"
      });
      return;
    }
    setLocation("/device/"+eqpId,  { replace: true } );
  }
  */

  //旧模式：跳转前分解步骤：点击doConfirm确认，异步完成了，然后才能做路由切换。
/*  const [doConfirm, setDoConfirm] = React.useState(false);
  React.useEffect(() => {
      console.log("页面刷新钩efec=doConfirm=",doConfirm ,"filter=",filter);
    if(doConfirm){
      filter && ( history.push('/device') );
    }
  }, [doConfirm,filter,history]);*/


    //如果是第二次弹跳伪对话框情况：.state?.state的第一层保存对象!=null，必须在这里当成单独的属性再次保存：按规范命名nestedstate:{},和普通字段平等的#save:{nestedstate:{}}。
    //在第二层做两次跳的伪对话框看见的?.state数据规范：{save:{ nestedstate:{ save:{...}, field, reurl } ,普通字段...}, field, reurl}这样的，所以两层伪对话框很麻烦了。
    //【进一步】要在第一层起跳进入的伪对话框路由页面内部做更复杂的处理：因为除了被跳入的情况，还存在再次跳转第二层伪对话框的第三个路由页面的可能；如果发现了nestedstate就得认定为嵌套做两次伪对话框。
    //实际应当是在第二次起跳封装nestedstate给第二个伪对话框页面，在第二个伪对话框路由页面看见了nestedstate，点击返回第一层伪对话框路由页面之后nestedstate没修改，
    //这样第一层对话框页面遇见nestedstate晓得还深陷于伪对话框逻辑形态而并非普通的直接点击页面形态的，也就是还需要显示退回上一层次的编辑器路由页面。reurl和nestedstate都要提示关闭对话框=退回源编辑路由页面。
    //【约束】 这里定义的 {save,field,reurl} {save:{ nestedstate:{} } 都属于伪对话框强制命名规范, 和其它字段名字不要冲突。
    //实际上是另外一个路由页面中用一个history.push(`/unit/${id? id:''}`,{save, field, reurl, p1field})来传递数据的形式。
    const {save, field, reurl, p1field}= window.history.state?.state??{};      //通用伪对话框传递格式
    console.log("返回刚才编辑器页面 frm-save=", save,"reurl=",reurl);
    //正常这个位置id不是Unit模型，但是unit.id肯定是了;
    //一般编辑器页面点击转去伪对话框路由页面，实际都是针对某一个特定属性字段filed={}的选定设置。 上面reurl参数就是保存了返回的URL;
    //.svp{} .pa{} 这样子是嵌套的对象里面的待设置的属性字段如何是好啊：修改嵌套第二层的字段?
    if(save && field) {          //修改成当前选择的单位。 field是原始编辑页面的保存属性字段名。
        const objUnit={id: unit.id, crDate: unit?.crDate, name: unit.name};
        if(p1field)  save[p1field][field] = objUnit;      //最多2层的编辑的目标对象属性字段。
        else   save[field] = objUnit;
    }

  return (
    <div
      css={{
        [theme.mediaQueries.md]: {
          height: "auto",
          display: "block"
        }
      }}
    >
      <hr/>
      <Text
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
        {unit?.id}名下关联设备
      </Text>

      <div
        css={{  //控制小屏时的导航条底下的整个页面滚动。
          flex: 1,
          [theme.mediaQueries.md]: {
            flex: "none"
          }
        }}
      >
        <div>

          <Container>
            <div
              css={{
                paddingTop: theme.spaces.lg,
                paddingBottom: theme.spaces.lg
              }}
            >
                <div >

                          <div
                            css={{
                              backgroundColor: false
                                ? theme.colors.palette.blue.lightest
                                : "transparent",
                             // display: "flex",  //这个位置display: "flex"在手机上如果本div底下内容Button是inline-flex遇宽度超出却可以缩放显示。手机没有滚动条!
                              marginBottom: theme.spaces.xs,
                              justifyContent: "space-between",
                              [theme.mediaQueries.md]: {
                                 // display: "flex",
                                //  width: "600px"
                              }
                            }}
                          >
                            <Text
                              css={{
                                paddingRight: theme.spaces.xs,
                                backgroundColor: false
                                  ? theme.colors.palette.blue.lightest
                                  : "white"
                              }}
                            >
                            设备、单位 {id}
                            </Text>

                            <Text
                              css={{
                                paddingLeft: theme.spaces.xs,
                                backgroundColor: false
                                  ? theme.colors.palette.blue.lightest
                                  : "white"
                              }}
                            >
                              状态：{unit.status||''}
                            </Text>

                            <Button
                              size="lg"
                              intent="primary"
                              iconAfter={<IconArrowRight />}
                              onPress={ async () => {
                                //history.push(`/device?useu=4c37dbaa-12d1-41b2-8e83-9143a64677e1`)
                                //这里派发出去editorSnapshot: outCome {...storage, ...outCome}都是按钮捕获的值，还要经过一轮render才会有最新值。 `${id}`
                                sessionStorage['设备过滤'] =JSON.stringify({'useu':unit});
                                history.push(`/device`)
                              } }
                            >
                              该单位使用的设备
                            </Button>
                          </div>
                    { reurl &&
                        <Button
                            size="lg"
                            intent="primary"
                            variant="ghost"
                            iconAfter={<IconCloud />}
                            onPress={ async () => {
                                console.log("Unit伪对话save=", save,"field=",field);
                                await history.push(reurl, {save,field});
                                //Warning: You should avoid providing a 2nd state argument to push when the 1st argument is a location-like object that already has state; it is ignored
                                //await history.go(-2); 用go(n) goBack()无法实现state传递回去。只能依赖前面源编辑器URL的还原做法。
                            } }
                        >选定这个，返回刚才编辑器页面
                        </Button>
                    }
                </div>
            </div>
          </Container>
        </div>
      </div>
      <LayerLoading loading={loading} />
    </div>
  );
};

