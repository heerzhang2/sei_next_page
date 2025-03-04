/**无类型定义any;
 * A custom context instance for our router type
 * 自定义 的路由器插件
 */
import React from 'react';

//不兼容！history包的 Version 5 is used in React Router version 6.
//不能用？ import History from "history";
//import {Pathname, Search} from "history";

/**history.location.state实际上是浏览器层面管理多个页面的进退导航的有关管理内容，所以对于SPA根本就不是一个层面的东西。
 * SPA路由器基于history.location.state搞成的；??
 * history.location:就是浏览器的浏览记录的列表{附带保存的信息}-当前一条。
 * 【关键错误】不允许使用window.history.pushState(stateObj,),本身SPA路由器就是在它上面再做一层包装的；
 引用类型 history = {
        length: globalHistory.length,
        [action]: 'POP',
        location: initialLocation,
        createHref: createHref,   //用createHref可代替import { createPath } from 'history'
        push: push,
        replace: replace,
        go: go,
        goBack: goBack,
        goForward: goForward,
        block: block,
        listen: listen
      };
 * */
interface RoutingContextType {
    //用户登录后的 客户端本地保存的身份等 相关数据
    ////底下history.是History包给的。在/node_modules/@types/history/index.d.ts这里的History
    history: any,    //是History类型；
    //参数在 window.history.state.state?.myQuery ; react-router包里面location竟然就是=window.history.state;
    //history.location.state不会依附于URL(SPA?),全部路由都共用同一个state啊，大杂烩了。
    get: any,       //获得当前路由
    preloadCode?: any,
    //【加载的数据】服务端给出的信息，前端不要更改。preload(href); 后添个参数user; preload(href, user)传递用户给非render环境的加载数据函数。
    preload?: any,
    subscribe?: any
}

//这是实例！   不要重复定义实例，确保访问的是同样一个的东东。
//在render中就无法修改RoutingContext!了。路由配置表中无法使用hook函数。
const RoutingContext = React.createContext<RoutingContextType>(
    {
        history: null,
        get: null
    }
);

export default RoutingContext

/*如何用history路由，举例说明： http://host:3765/device/567/unit/123A?sdf=34&HJH=fhfvcbvxcb#qqqwwweee
history.location:基本字段是
    pathname: "/device/567/unit/123A"
    search: "?sdf=34&HJH=fhfvcbvxcb"
    hash: "#qqqwwweee"
    state: undefined
    这里hash字段代表很长的页面的定位滚动位置直接显示位置。hash模式实现前端路由？，可实际hash已淘汰不用了！两种hash啊.总之,hash字段设备台账页面用了。
    pathname和search字段都要提取基础的参数，从pathname分解出来的参数最为关键，核心定位关联id字段；
    search字段给出的参数属于辅助页面定做性质的，要显示那些区域，普通过滤参数等。[问题]search变化不能让组件重新render,只好配套state必须同时变更才行的！
    state字段假如也提供的｛｝是用户选择和输入过滤的短暂挑选的参数。注意state字段是单页面应用SPA所有的URL一起共享的对象，多个地方交叉设置需要紧紧配置属于自己页面的参数部分，管理有问题。
    可利用sessionStorage替代state字段功能，优缺点互补，state仅保留时间字段用来触发刷新。
    state字段或sessionStorage所涉及参数字段：有个风险点，当前与参数过滤相关的页面上必须明确显示出来提醒用户目前的过滤选择项目以及数值，否则如何反馈被过滤数据列表不一致事实？
 路由器正宗都用 pathname: '/somewhere',路由器params:分解的字段是路径PATH的分解 path-to-regexp都是要在?问号之前的URL字符串那一部分才是路由。
 路由器一般不管你这个属性 search: '?some=search-string',路由器params:分解的字段不是指这里search的可选参数。
 这个一般是大页面的滚动条跳跳的样子， hash: '#howdy',
 状态字段？公共的，不能轻易使用，双层套套 ———.state.state: { [userDefined]: true };
* */

