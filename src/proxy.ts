import { NextRequest, NextResponse } from 'next/server';

const APP_HOME_PATH = '/routine/routine-cal';
const AUTH_PATH = '/auth';
const PROTECTED_PATH_PREFIXES = ['/routine', '/report', '/challenge', '/mypage'];

const hasAuthToken = (request: NextRequest) => {
  const accessToken = request.cookies.get('sb_access_token')?.value;
  const refreshToken = request.cookies.get('sb_refresh_token')?.value;

  return Boolean(accessToken || refreshToken);
};

const isProtectedPath = (pathname: string) => PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = hasAuthToken(request);

  if (pathname === AUTH_PATH && authenticated) {
    return NextResponse.redirect(new URL(APP_HOME_PATH, request.url));
  }

  if (isProtectedPath(pathname) && !authenticated) {
    const loginUrl = new URL(AUTH_PATH, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth', '/routine/:path*', '/report/:path*', '/challenge/:path*', '/mypage/:path*'],
};
