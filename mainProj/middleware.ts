import NextAuth from 'next-auth';
import { authConfig } from '@/app/auth.config';
// import { auth } from './auth';
import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default NextAuth(authConfig).auth;


// const PUBLIC_ROUTES = ['/', '/login', '/signup', '/public']
// function middleware_OLD(req: NextRequest, res:NextResponse) {
//   const pathname = req.nextUrl.pathname;
//   const token = req.cookies.get('token')?.value;
//   console.log('Client auth update token:{},token={}', req.cookies,token);
//   //【客户端没有输出】{"JSESSIONID":{"name":"JSESSIONID","value":"zkRuKMYuV"},"token":{"name":"token","value":"eUzUsFjA"}}
//   if (
//       PUBLIC_ROUTES.includes(pathname)
//   ) {
//     return NextResponse.next()
//   }
//   // Redirect unauthenticated users from protected routes
//   if (!token) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }
//   if (/^\/photos\/(.)+$/.test(pathname)) {
//     // Accept /photos/* paths, but serve /p/*
//     const matches = pathname.match(/^\/photos\/(.+)$/);
//     return NextResponse.rewrite(new URL(
//       `${PREFIX_PHOTO}/${matches?.[1]}`,
//       req.url,
//     ));
//   } else if (/^\/t\/(.)+$/.test(pathname)) {
//     // Accept /t/* paths, but serve /tag/*
//     const matches = pathname.match(/^\/t\/(.+)$/);
//     return NextResponse.rewrite(new URL(
//       `${PREFIX_TAG}/${matches?.[1]}`,
//       req.url,
//     ));
//   }
//   return NextResponse.next()
// }


export const config = {
  // Excludes:
  // - /api + /api/auth*
  // - /_next/static*
  // - /_next/image*
  // - /favicon.ico + /favicons/*
  // - /grid
  // - / (root)
  // eslint-disable-next-line max-len
  matcher: ['/((?!api$|api/auth|_next/static|_next/image|favicon.ico$|favicons/|grid$|$).*)'],

  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
