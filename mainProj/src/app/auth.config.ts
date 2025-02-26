import { NextAuthConfig } from 'next-auth';
import type { JWT } from "next-auth/jwt"
import "next-auth/jwt"
import {performAuth, doRefreshToken} from "@/action/performAuth";
// import { DrizzleAdapter } from "@auth/drizzle-adapter"

//对应的 await fetch("http://YOUR_API_ENDPOINT/refresh", {}）
export async function refreshToken(refreshToken: string, userId: string) {
  let result;
  try {
    result = await doRefreshToken({refreshToken, userId});
  } catch (error: any) {
    console.log("refreshToken报错:", error);
  }
  console.log("refreshToken:已死等的 result=", result);
  return result;
}

// Helper function to refresh token  由于refreshToken不直接发送给客户端，而是保存在服务器端
async function refreshAccessToken(token: JWT) {
  try {
    const Token_expiresInSec = process.env.NEXT_PUBLIC_TOKEN_EXPIRESEC;
    // console.log("refreshAccessToken: 未知的YOUR_API_EN333DPOINT{}", token);
    // const response = await fetch("http://YOUR_API_ENDPOINT/refresh", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     refreshToken: token.refreshToken,
    //     //必须 user.id::
    //   }),
    // })
    // const refreshedTokens = await response.json()
    let loginresp =null;
    try {
        loginresp =await refreshToken(token.user?.refreshToken, token?.user?.id);
        if (!loginresp) {
          console.log("refreshAccessToken: 前面loginresp的=", loginresp);
          throw loginresp
        }
    } catch (error) {
      console.error("An error occurred:", error);  // 捕获并处理错误
    }

    console.log("refreshAccessToken: 前面的=", token);
    const jwtret={
      ...token,
      accessToken: loginresp.accessToken,
      refreshToken: loginresp.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + Token_expiresInSec,
    };
    console.log("refreshAccessToken: 后面的=", jwtret);
    return jwtret;
  } catch (error) {
      //该死的：ansyc await代码：报错必须捕捉。
    console.log("weihe1报错RefreshAccessTokenError了=", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}


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
       console.log("提供者session的回调:", params);
		// 	session.user.image = token.picture
		// 	session.user.id = token.sub ?? ''
      //       // session.user.accessToken = token
      // if (token && token.accessToken) {
      //   session.user.accessToken = token.accessToken; // 将 accessToken 添加到 session 的 user 对象中
      // }
      // // 返回修改后的 session 对象
      // return session;
      session.user = token.user
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },
    async jwt(params) {
      const {token, trigger, session, account, user} = params as any;
      console.log("提供者jwt的回调:", params);
      // if(trigger === "update")  token.name = session.user.name
      // if(trigger=== 'signIn'){
      //   // session.accessToken=  user?.accessToken;
      //   return { ...token, accessToken: user?.accessToken }
      // }
      // return token;
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at * 1000,
          user,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      return await refreshAccessToken(token)
    },
    // async signIn(user, account, profile) {},
    // async redirect(url, baseUrl) {},
  },
  //secret: process.env.NEXTAUTH_SECRET, // Make sure you have this set in your .env file
  //jwt: {
  //     secret: process.env.NEXTAUTH_JWT_SECRET,
  //     signIn: {
  //       maxAge: 30 * 24 * 60 * 60, // 30 days
  //     },
  //     updateAge: 24 * 60 * 60, // Refresh the JWT every 24 hours
  //   },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
} satisfies NextAuthConfig;


/*
在这个模块声明的内部，你定义了一个名为 Session 的接口。这表明你想要扩展或修改 next-auth 库中现有的 Session 接口。
* */
declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    //预计的过期时间：
    accessTokenExpires?: number
    user?: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    error?: string
  }
}

/*
accessTokenExpires返回给客户端是可行的，并且可以提高应用的性能和用户体验。但是，你应该确保你的应用能够处理时间同步问题，并且意识到返回过期时间可能会带来的潜在风险。
如果你决定不返回accessTokenExpires给客户端，客户端仍然可以通过尝试使用令牌进行请求并处理可能的错误响应（如401 Unauthorized）来间接地管理令牌的生命周期
* */
