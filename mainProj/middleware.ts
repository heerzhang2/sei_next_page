// import { auth } from './auth';
import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PATH_ADMIN,
  PATH_ADMIN_PHOTOS,
  PATH_OG,
  PATH_OG_SAMPLE,
  PREFIX_PHOTO,
  PREFIX_TAG,
} from './site/paths';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/public'
]

export default function middleware(req: NextRequest, res:NextResponse) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('token')?.value;
  console.log('Client auth update token:{},token={}', req.cookies,token);
  //【客户端没有输出】{"JSESSIONID":{"name":"JSESSIONID","value":"zkRuKMYuV"},"token":{"name":"token","value":"eUzUsFjA"}}
  if (
      PUBLIC_ROUTES.includes(pathname)
  ) {
    return NextResponse.next()
  }
  // Redirect unauthenticated users from protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (/^\/photos\/(.)+$/.test(pathname)) {
    // Accept /photos/* paths, but serve /p/*
    const matches = pathname.match(/^\/photos\/(.+)$/);
    return NextResponse.rewrite(new URL(
      `${PREFIX_PHOTO}/${matches?.[1]}`,
      req.url,
    ));
  } else if (/^\/t\/(.)+$/.test(pathname)) {
    // Accept /t/* paths, but serve /tag/*
    const matches = pathname.match(/^\/t\/(.+)$/);
    return NextResponse.rewrite(new URL(
      `${PREFIX_TAG}/${matches?.[1]}`,
      req.url,
    ));
  }

  return NextResponse.next()

  // return auth(
  //   req as unknown as NextApiRequest,
  //   res as unknown as NextApiResponse,
  // );
}


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
};
