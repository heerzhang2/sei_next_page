/** @jsxImportSource @emotion/react */
'use client';

import { Global } from "@emotion/react";
/*必须登录用户，否则不能用
【客户端浏览器】情形下的：
* */
const PrintUsed = () => {
    return <>
        <Global
            styles={{
                html: {
                    "@page": {
                        // size: 'A4 portrait',
                        size: 'A4 landscape',
                    },
                    "#root #floormenu": {
                        // display: 'none',
                        opacity: '0.3' //: 'unset',
                    }
                }
            }}
        />
    </>;
};

export default PrintUsed;