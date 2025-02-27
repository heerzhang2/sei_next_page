'use server'

import {gql} from "@urql/core";
import {urqlClient} from "@/auth/urql";
import { auth } from '@/app/auth';
//密码hash 防止在服务后台泄密
import sha256 from 'hash.js/lib/hash/sha/256';
// export var sha256 = require('hash.js/lib/hash/sha/256');


const LOGIN_MUTATION = gql`
    mutation performLoginMutation($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
        { accessToken,refreshToken, user{id username} }
    }
`;

// import { auth } from "../ auth"

/*无需采用"@urql/exchange-auth"包的。utilities.appendHeaders(operation, { Authorization: `Bearer ${token}`, })
运行在服务器端的：登录实际用服务端做代理的。 给服务端用的必须加async；  It is not allowed to define inline "use server" annotated Server Actions in Client Components.
SSR服务端的代码 ansyc的：
* */
export async function performAuth(variables: { username: string; password: string }): Promise<any> {
    const { user } = await auth()
    return new Promise(async (resolve, reject) => {
        const result = await urqlClient(user?.accessToken).mutation(LOGIN_MUTATION, {...variables});
        console.log("LOGIN_MUTATION返回=", result, variables);
        if (!result) {
            reject(result);
        } else {
            resolve(result.data?.authenticate);
        }
    });
}


/* Drizzle ORM 对接》CRDB;
* */
export async function userLoginPassed(variables: { username: string; password: string }) {
    let encodePass = sha256().update(password).digest('hex');
    let result;
    try {
        //await db.select().from(users).where(eq(users.email, email));
        result = await performAuth({username, password: encodePass});
    } catch (error: any) {
        console.log("getUser报错:", error);
    }
    console.log("userLoginPassed后续的result=", result);
    return result;
}


