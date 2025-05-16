'use client';
// import { Global } from "@emotion/react";
/*必须登录用户，否则不能用
【客户端浏览器】情形下的： 因为报错createContext only works in Client Components. Add the "use client"
* */
const PrintUsed = () => {
    if(typeof window === "undefined")  return null;     //加上这个，就避免水和报错！
    return <>
{/*        <Global
            styles={{
                html: {
                    "#root #floormenu": {
                        opacity: '0.3' //: 'unset',
                    }
                }
            }}
        />*/}
    </>;
};

export default PrintUsed;