import { NextAuthConfig } from 'next-auth';
import "next-auth/jwt"
import {urqlClient} from "@/auth/urql";
import {gql} from "@urql/core";
import {JWT} from "@auth/core/jwt";
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
  providers: [], // Add providers with an empty array for now
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith('/login');
      const isRegisterPage = nextUrl.pathname.startsWith('/register');
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (!isLoggedIn && !(isLoginPage || isRegisterPage)) {
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        // 将 accessToken 和 refreshToken 保存到 JWT token 中
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    session({ session, token }) {
      // 将 accessToken 传递到 session 中
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      return session;
    },
  },
} satisfies NextAuthConfig;

const refreshToken_MUTATION = gql`
  mutation refreshToken($refreshToken: String!,$userId: ID) {
    refreshToken(refreshToken: $refreshToken,userId: $userId)
    { accessToken, user{id username} }
  }
`;

//从 Java 后端验证用户；等同verifyUserWithJavaBackend
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
    // console.log("refreshAccessToken: 前面的=", token);
    let expNumber=Number(Date.now()) + Token_expiresInSec;
    const jwtret={
      ...token,
      accessToken: loginresp?.data?.refreshToken?.accessToken,
      refreshToken: loginresp?.data?.refreshToken?.refreshToken ?? token.refreshToken,
      accessTokenExpires: expNumber,
    };
    // console.log("refreshAccessToken: 后面的=", jwtret);
    return jwtret;
  } catch (error) {
    console.log("报错RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

//用户全部的信息
export const getUserinfoQuery = gql`
  query getUserQuery($id: ID!) {
    getUser(id: $id) {
      id,username, person{id,name}
      dep{id name} office{id name} 
      unit{id name dvs{id name} }
      ispUnits{id,unit{id,name}}
      authorities{id,name}
    }
  }
`;

/**应该是在nextjs-RSC-node服务器环境中的，才能执行的，获取用户信息：【不能】切记不要在浏览器执行本函数。
 * @param accessToken  调用函数人的身份
 * @param userId 不一定就是调用者自己的id
 * */
export async function getUserInfo(userId: string,accessToken?:string) {
  const result = await urqlClient(accessToken || null).query(getUserinfoQuery, {
    id: userId
  }).toPromise();
  if (result.error) {
    throw result.error;
  }
  return result.data.getUser;
}


/*
在这个模块声明的内部，你定义了一个名为 Session 的接口。这表明你想要扩展或修改 next-auth 库中现有的 Session 接口。
* */
declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
  }
}
