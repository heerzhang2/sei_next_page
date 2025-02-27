import { NextAuthConfig } from 'next-auth';
import "next-auth/jwt"
import {urqlClient} from "@/auth/urql";
import {gql} from "@urql/core";
// import { DrizzleAdapter } from "@auth/drizzle-adapter"

const Token_expiresInSec =Number(process.env.NEXT_PUBLIC_TOKEN_EXPIRESEC);
/*先执行authorize登录，随后来到jwt（）再到session（）回调；
accessToken过期的，无法从客户端发起更新，而SSR服务端却不晓得此事！
* */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
	// adapter: DrizzleAdapter(db),
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith('/login');
      const isRegisterPage = nextUrl.pathname.startsWith('/register');

			if (!isLoggedIn && !(isLoginPage || isRegisterPage)) {
				return false;
			}
      return true;
    },
	async session(params) {
      const { session, token }=params as any;
       // console.log("提供者session的回调:", params);
			session.user.image = token.picture
			session.user.id = token.sub ?? ''
            // session.user.accessToken = token
      if (token && token.accessToken) {
        session.user.accessToken = token.accessToken; // 将 accessToken 添加到 session 的 user 对象中
      }
      // 返回修改后的 session 对象
      return session;
    },
    async jwt(params) {
      const { token, trigger, session, account, user } =params as any;
        // console.log("提供者jwt的回调:",params);
        if(trigger === "update")
          token.name = session.user.name
        if(trigger=== 'signIn'){
          let expNumber=Number(Date.now()) + Token_expiresInSec;
          // session.accessToken=  user?.accessToken;
          return { ...token,
            accessToken: user?.accessToken,
            refreshToken: user?.refreshToken,
            accessTokenExpires: expNumber,
          }
        }
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }
      return await refreshAccessToken(token);
    },
  },
} satisfies NextAuthConfig;

const refreshToken_MUTATION = gql`
  mutation refreshToken($refreshToken: String!,$userId: ID) {
    refreshToken(refreshToken: $refreshToken,userId: $userId)
    { accessToken, user{id username} }
  }
`;
// Helper function to refresh token  由于refreshToken不直接发送给客户端，而是保存在服务器端
async function refreshAccessToken(token: JWT) {
  try {
    let loginresp =null;
    try {
        //loginresp = await doRefreshToken({refreshToken:token.refreshToken, userId:token?.id});
        loginresp = await urqlClient(null).mutation(refreshToken_MUTATION, {
              refreshToken: token.refreshToken,
              userId: token?.sub    //==session.user?.id
            });
        // loginresp =await refreshToken(token.user?.refreshToken, token?.user?.id);
      if (!loginresp) {
        console.log("refreshAccessToken: 前面loginresp的=", loginresp);  //没连上？重新登录
        throw loginresp
      }
    } catch (error) {
      console.error("doRefreshToken error:", error);
    }
    console.log("refreshAccessToken: 前面的=", token);
    let expNumber=Number(Date.now()) + Token_expiresInSec;
    const jwtret={
      ...token,
      accessToken: loginresp?.data?.refreshToken?.accessToken,
      refreshToken: loginresp?.data?.refreshToken?.refreshToken ?? token.refreshToken,
      accessTokenExpires: expNumber,
    };
    console.log("refreshAccessToken: 后面的=", jwtret);
    return jwtret;
  } catch (error) {
    console.log("报错RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}


/*
在这个模块声明的内部，你定义了一个名为 Session 的接口。这表明你想要扩展或修改 next-auth 库中现有的 Session 接口。
* */
declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
