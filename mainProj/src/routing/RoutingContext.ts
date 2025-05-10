import React from 'react';

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
/*@Deprecated
* */
const RoutingContext = React.createContext<RoutingContextType>(
    {
        history: null,
        get: null
    }
);

/*@deprecated
* */
export default RoutingContext
