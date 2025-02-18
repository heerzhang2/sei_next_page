/** @jsxImportSource @emotion/react */
"use client"
import RoutingContext from './RoutingContext';
import React from 'react';
import UserContext from "./UserContext";
import { useRouter } from 'next/navigation';

const { useCallback, useContext } = React;


/** SPA程序不要用 customize-easy-ui-component 简易的Link也就是<a></a>组件。要用这里的Link，避免强制刷新整个APP缓存。
 * An alternative to react-router's Link component that works with
 * our custom RoutingContext.
 *注意 RoutingContext非常重要的； 直接用一般做法引进的router库函数，无法获取context!!
 *把标签的参数 to 改成 href
 *经过一次的Link转移之后的：就算用了{history}=useContext(RoutingContext)的history.push("/device", stateObj)也会丢失的;除非没经过Link或路由,还是算当前挂载?。
 用了<RouterLink href="/device" state={ { }} }>需要两次经过路由prepare();但是幸亏页面只有一次的，数据加载也是触发一次。
 <RouterLink href="/device?gdg=1&vv=3" state={ {}}同一个页面device内点可能不会触发。改成href="/device“连点击两次能触发。
 路由点击如何才能立刻更新数据？：
 <RouterLink href="/device" state={ {myQuery:{,}} }>且 href必须不是当前页面的路径。
 onPress={e => {history.push("/device", {myQuery:{} });当前页面的路径必须不是/device?&页面,有实际变动的才触发。
 结论是location.state不适合用作传递参数用途的。.state只适合于不同两个页面之间切换时刻的交换参数场景。单页面本页面路径内路由不适合用。
 结论是改了参数.state无法保障触发更新啊。
 Chrome浏览器history API的 .state：至少可以存储10MB（甚至更大）。
 */
interface LinkProps {
    href: string;
    children: React.ReactNode;
    state?: any;
}

//使用了自定义路由器的Link链接，点击这个组件的才会经过自定义路由器跳转。旧的可携带user保存当前的用户数据 state;
/*@deprecated
* */
export const Link: React.FunctionComponent<LinkProps> =({href,state,children,...other}: LinkProps)=>
{
  const router = useContext(RoutingContext);
    const {user, } = useContext(UserContext);
  // When the user clicks, change route
    //底下router.history.是History包给的。在/node_modules/@types/history/index.d.ts这里的
    //history.location.state不会依附于URL(SPA?),全部路由都共用同一个state啊，大杂烩了。
   //这个state最大2MiB限制。如果您需要更多的空间，建议您使用sessionStorage标签页关闭，localStorage永久。
  //sessionStorage的session仅限当前标签页或者当前标签页打开的新标签页，通过其它方式新开的窗口或标签不认为是同一个session;克隆窗口数据不会同步改。localStorage都同一份。

  const changeRoute = useCallback(
      (event :any )=> {
      event.preventDefault();
            /* const location = {
                pathname: '/somewhere',
                //search?: Search string;
                state: { fromDashboard: true }
                <Link to={location}/>
            }*/

      if(state)
          router.history.push(href, state);
      else {
          //【问题出处】不应该把旧的.state传递下去的！ 体现在设备列表点击切换不同的设备，上一个设备的编辑器伪对话框保存数据会带给下一个设备的编辑器！
          //解决法子：把外面<RouterLink href=的，改成了<ListItem:onPress={ history.push(`/device/.id`)}就可清理干净遗留?.state伪对话框保存数据。
          //router.history.push(props.href, router.history.location.state);
          router.history.push(href);
      }
        //router.history.push(props.href);     location.state旧值？怎么是全局共享量而且还刷新都还有在？
        //单页面应用啊：当做同一个path" *.html"只用同一个的。
        //不允许使用window.history.pushState(stateObj,),本身SPA路由器就是在它上面再做一层包装的；
        // console.log(`onClick再执行一次changeRoute`, window.history.state.state);
    },
    [href, router, state],
  );

  // Callback to preload just the code for the route:
  // we pass this to onMouseEnter, which is a weaker signal
  // that the user *may* navigate to the route.
  //鼠标飘过去的 才会去读取代码的，真正去前端服务器获取，和下载源程序代码
  const preloadRouteCode = useCallback(() => {
    // router.preloadCode(href, user);
  }, [href, router, user]);

  // Callback to preload the code and data for the route:
  // we pass this to onMouseDown, since this is a stronger
  // signal that the user will likely complete the navigation
  //加载数据，服务端请求发起了。
/* 【重复preload()】onMouseDown就别搞加载了，直接等待onClick被触发吧：实际也是onClick才算最终确认链接必然要进去的；时间稍微滞后一点点。避免2次执行prepare:{}
    const preloadRoute = useCallback(() => {
    // .preload(pathname :);
    router.preload(props.href, user);
      console.log(`onMouseDown:执行preload了`, window.history.state?.state);
  }, [props.href, router]);*/

     //原先"wouter"搞出来Link:不需要加这一层<a>的；
    //onMouseDown执行一次， 随后onClick再执行一次。 2次执行路由器的prepare: (params:any) => {}
    //重复更不好还是取消了： onMouseDown={preloadRoute}
  return (
    <a
      href={href}
      onClick={changeRoute}
      onMouseEnter={preloadRouteCode}
      css={{
        textDecoration: "none"
      }}
      {...other}
    >
      {children}
    </a>
  );
}


/**儿子里面若是<></>包裹的需要改造替代，支持一层层次的替换。
 * 替换旧的 validChildrenMap ； 【来由】代码里面经常出现逻辑render { boolean && <> nodes </> }这样子的会导致以前普通办法失效。
 * 可支持把被<></>包裹下的组件直接合并给上一级的级别来作为并列的儿子，只支持第一层的非嵌套的<></>标签。
 * 避免相同的key就报错，但是有副作用后果：把全部儿子的key 统一再做个修改。 "_N**"作为排他性的key;
 * */
export function validChildrenFragmentSpread(children: any,assert:boolean=true) {
    let idseq=1;
    let outs: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>[]=[];
    let sons=React.Children.toArray(children);
    sons.forEach((son: any, index:number, array: any) =>{
        if(React.isValidElement(son)){
            const descriptor=Object.getOwnPropertyDescriptor(son, 'type');
            if(( descriptor?.value === Symbol.for('react.fragment') )  &&  son.props  &&  son.props.hasOwnProperty("children")){
                const subChildren=Object.getOwnPropertyDescriptor(son.props, 'children');
                let nestSubNodes=React.Children.toArray(subChildren?.value);
                nestSubNodes.forEach((subnode: any, index:number, array: any) => {
                    //if( !(subnode.hasOwnProperty("key")) ||  subnode.key===`.0` ...?等 ? )
                    //Cannot assign to read only property 'key' of object '#<Object>' Object.assign(subnode,{ key: '_'+idseq });
                    //避免相同的key 就报错的情况。?和上一级的兄弟节点相同的id。
                    let modifyNode={...subnode};
                    Object.assign(modifyNode,{ key: '_N'+idseq });
                    outs.push( modifyNode );
                    idseq++;
                });
            }
            else{
                outs.push(son);       //前提假设： son该不会出现"_N**"作为key;
            }
        }else if(assert){
            throw new Error("literal text must be wrapped in <></> tag or Components");     //不合法的文字？
        }
    } );
    return outs;
}


/**有些场合不能加一层<a></a>的；只能使用透明模式DirectLink:
 * 检验报告的正常展示需要。 为了应付这种情况：
 * <tr> cannot appear as a child of <a>. <a> cannot appear as a child of <tbody>. <a> cannot appear as a child of <thead>.
 * [考虑] ?再套一个<div > <a>来避免?。或者其他的<div OnClick()>
 * 直接触发 子组件的onClick()
 */
interface DirectLinkProps extends React.HTMLAttributes<HTMLElement>{
    href: string;
    children: React.ReactNode;
    state?: any;
}
/**对比上面Link 缺少user的注入;
 * 直接用next.js Link 导致报错In HTML, <tr> cannot be a child of <a>.
 * In HTML, <a> cannot be a child of <tbody>. This will cause a hydration error.
 * */
export const DirectLink: React.FunctionComponent<DirectLinkProps> =(props: DirectLinkProps)=>
{
    const router = useRouter();
    const valChilds=validChildrenFragmentSpread(props.children);
    const changeRoute = useCallback(
        (event :any )=> {
            event.preventDefault();
            event.stopPropagation();        //不想向祖辈组件传递点击事件。
            router.push(props.href)
        },
        [props.href, router],
    );

    const preloadRouteCode = useCallback(() => {
        router.prefetch(props.href)
    }, [props.href, router]);
    return (
        <React.Fragment>
        {
            valChilds.map((one,row) =>
                React.cloneElement(one as React.ReactElement<any>, {
                    onClick: changeRoute,
                    onMouseEnter: preloadRouteCode,
                })
            )
        }
        </React.Fragment>
    );
}

//export { Link , DirectLink as Likes }
/* 【用法】 使用了const { history } = useContext(RoutingContext); 后从.history.push(`/`,  {servu: });发起:
 跳转路由页面之后，新页面中用window.history.state?.state?.servu来接收的。 注意第二个.state?才是.push()的第二个参数对应物;

*/

