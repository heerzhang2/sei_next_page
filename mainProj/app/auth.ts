import NextAuth, { CredentialsSignin, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { compare } from 'bcrypt-ts';
import Google from "next-auth/providers/google"

import { userLoginPassed } from 'app/db';
import { authConfig } from 'app/auth.config';

class InvalidLoginError extends CredentialsSignin {
	code = 'Invalid identifier or password'
}

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
        console.log("仅仅登录出现会的authorize用户user password:{}  username> {}", password,username);
        const passOk = await userLoginPassed(username,password);
        console.log("用户认证中继形式的user:", passOk);
        if(!passOk) {
            throw new InvalidLoginError();
        }
        let user:User= {
            name: username,
            email: email
        }
        return user;
      },
    }),
  ],
});
