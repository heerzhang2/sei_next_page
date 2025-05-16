'use client';
import * as React from "react";
import { Dispatch, SetStateAction } from "react";

//带了操作开关的Context：灵活了！，注意！可是不能不要随意地修改。否则不知道被谁改了，依赖打乱了。
interface UserContextType {
  //用户登录后的 客户端本地保存的身份等 相关数据
  user: any,
    //服务端给出的信息，前端不要更改，除非注销和登录或验证。
  setUser: Dispatch<SetStateAction<any>>
}

//这是实例！   不要重复定义实例，确保访问的是同样一个的东东。
export const UserContext = React.createContext<UserContextType>(
    {
      user:  undefined,
      setUser:  value => null,
    }
);

export default UserContext


/* 【关键思考】 跨路由器页面间做参数传递的几个模式对比:
(1) sessionStorage 最好。问题是需要规范可能同名字混乱# APP全局共享json对象定义避免打架，选择项当前选择揭示和取消。缺点是访问本地存储性能局限,冲突名字。
(2) createContext() Context.Provider 一般，变更数据影响波及面是整个的APP。影响render性能疑问大。
(3) queryString.parse(window.location.search) , URL?&=&B=b, 无法连续传递多个链接，列表点击无法继承，浏览器地址栏可看到参数。
(4) history.push(`/device/${hit?.node?.id}`, {save,field,reurl,p1field})方式,实际window.history.state?.state 也无法连续传递多个链接。设备列表点击无法继承过滤器。
(5) SecondRouter.ts特别用的prepare: (params:any, user:any) => {}; 专门对user敏感数据不保存,须经过后端实时验证。
(6) Realy store的利用，一个页面保存给store顺带发送给后端模型对象保存，另外一个路由导航的页面就能直接获取到最新的Realy对象数据，可同步显示。
*/
