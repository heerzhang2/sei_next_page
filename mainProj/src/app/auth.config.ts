import { NextAuthConfig } from 'next-auth';
import "next-auth/jwt"
// import { DrizzleAdapter } from "@auth/drizzle-adapter"

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
    jwt(params) {
      const { token, trigger, session, account, user } =params as any;
        // console.log("提供者jwt的回调:",params);
        if(trigger === "update")
          token.name = session.user.name
        if(trigger=== 'signIn'){
          // session.accessToken=  user?.accessToken;
          return { ...token,
            accessToken: user?.accessToken,
            refreshToken: user?.refreshToken,
          }
        }
        return token;
    },
  },
} satisfies NextAuthConfig;

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
