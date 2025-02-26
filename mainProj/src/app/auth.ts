import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// import type { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import { authConfig } from '@/app/auth.config';
import {userLoginPassed} from "@/action/performAuth";

class InvalidLoginError extends CredentialsSignin {
	code = 'Invalid identifier or password'
}

/*【文档】https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
【handlers 配套本机服务接口的】 app/api/auth/[...nextauth]/route.ts;
* */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
	Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
	  credentials: {
        email: {},
        password: {},
      },
    //认证中继形式的：
	async authorize({username, email, password }: any,request: Request) {
         //仅仅登录出现会的
        const loginResp = await userLoginPassed(username,password);
        if(!loginResp) {
            throw new InvalidLoginError();
        }
        // 注意：这里返回的 user 对象应该包含至少一个唯一标识符（如 id）
        return {
            id: loginResp.user.id,
            name: username,
            email: email,
            accessToken: loginResp.accessToken,
            refreshToken: loginResp.refreshToken,
        };
      },
    }),
  ],
});
