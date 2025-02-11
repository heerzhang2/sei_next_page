'use client';

import { isPathProtected } from '@/site/paths';
// import NextAuth, { User } from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
import useLoginMutation from "./useLoginMutation";

//密码hash 防止在服务后台泄密
var sha256 = require('hash.js/lib/hash/sha/256');


export const KEY_CREDENTIALS_SIGN_IN_ERROR = 'CredentialsSignin';
export const KEY_CREDENTIALS_SIGN_IN_ERROR_URL =
  'https://errors.authjs.dev#credentialssignin';
export const KEY_CREDENTIALS_CALLBACK_ROUTE_ERROR_URL =
  'https://errors.authjs.dev#callbackrouteerror';
export const KEY_CALLBACK_URL = 'callbackUrl';

export const {
  handlers: { GET, POST },
  // signIn,
  signOut,
  auth,
} = {handlers:{}}
//     NextAuth({
//   providers: [
//     Credentials({
//       async authorize({ email, password }) {
//         if (
//           process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === email &&
//           process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD === password
//         ) {
//           const user: User = { email, name: 'Admin User' };
//           return user;
//         } else {
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     authorized({ auth, request }) {
//       const { pathname } = request.nextUrl;
//
//       const isUrlProtected = isPathProtected(pathname);
//       const isUserLoggedIn = !!auth?.user;
//       const isRequestAuthorized = !isUrlProtected || isUserLoggedIn;
//
//       return isRequestAuthorized;
//     },
//   },
//   pages: {
//     signIn: '/sign-in',
//   },
// });

export const runAuthenticatedAdminServerAction = async <T>(
  callback: () => T,
): Promise<T> => {
  const session = await auth();
  if (session?.user) {
    return callback();
  } else {
    throw new Error('Unauthorized server action request');
  }
};

export const generateAuthSecret = () => fetch(
  'https://generate-secret.vercel.app/32',
  { cache: 'no-cache' },
).then(res => res.text());




//迁移过来的：
export async function signIn(tag,form)
{
  const {call:submitfunc, doing:isInFlight}= useLoginMutation();


  // e.preventDefault();
  let encodePass=sha256().update('').digest('hex');
  try {
    setError("");
    setLoading(true);
    await  submitfunc('', encodePass);
    //实际await不会在这里阻塞等待的！
    //setIsMeUser(false);  加上这个导致点登陆不管后端应答与否，都会被立刻跳转URL='/'
  } catch (err: any) {
    setLoading(false);
    // @ts-ignore
    setError(err.message);
  }
}
