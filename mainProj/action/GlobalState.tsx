/** @jsxImportSource @emotion/react */
'use client';

import React from "react";
import { UserContext } from "./UserContext";
import {
    PanelEnlargeCtx,
} from "customize-easy-ui-component";

interface Props {
    children: React.ReactNode;
}

/**【目的】 跨越路由器或者跨越很多层的子孙嵌套组件也能直接传递控制变量和状态。
 * 注入用户信息:
 * 提供user提前验证，否则后面路由逻辑无法搞定复杂的逻辑分辨的！
 * 必须抽身置顶，为了实现逻辑：浏览器直接输入URI但是已经有了token登录过了，就不要再次跳转login页面；允许没授权访问/free/页面。
 * GlobalState只会执行一趟的。
 * 假如token超时了，auth验证通不过也不知道啊？，接口会报错。
 * #已经淘汰DialogEnterReturn.Provider了！这是Context跨越路由器页面数据传递。Context适合范围小点？
 * */
const GlobalState = (props:Props) => {
    const [user, setUser] = React.useState();
    //这里的逻辑不保证数据获取返回时间上一定比嵌套的路由预加载Relay数据请求AuthComp的时间更早？收到服务端应答有可能比它时间还迟。
    //不是正常的render()模式发送数据请求；fetch a query outside of React, use the fetchQuery!
    //奇怪？AuthComp组件的graphql请求数据包发送的实际时间比fetchQuery还要早？数据预加载loadQuery()提前够快！可能fetchQuery优先级不如loadQuery()？
    //但是AuthComp组件的源代码运行时间实际比这里的fetchQuery.subscribe{next: (data: any)}运行时间是会迟点的。AuthComp代码数据都能分离运行了！
    //useEffect依赖本地let变量找死;
      //setUser()不能乱用的，
      //若报错的，很可能需要 setUser放在 useEffect()里面搞。

    //@Deprecated  底下相关import {DialogEnterReturn} from "../../context/DialogEnterReturn"已经作废DialogEnterReturn！
    // const [enlarge, setEnlarge] = React.useState(2);
    //第1层次的两半页面轮播台控制
    // const [activecas, setActivecas] = React.useState(0);
//            <PanelEnlargeCtx.Provider  value={{ enlarge, setEnlarge, activecas, setActivecas }}>
 //           </PanelEnlargeCtx.Provider>
    return (
    <UserContext  value={ {user, setUser} }>
                {props.children}
    </UserContext>
    );
};


//<Router>套在<GlobalState>底下，所以鼠标点击在网页内切换页面不会再次运行GlobalState，除非是浏览器地址栏录入和手动刷新才会重新获取后端授权信息。
export default GlobalState;
