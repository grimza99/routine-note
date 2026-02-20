import { NextRequest, NextResponse } from 'next/server';
import { TOKEN } from './shared/constants';

const APP_HOME_PATH = '/workout/workout-cal';
const AUTH_PATH = '/auth';
const PROTECTED_PATH_PREFIXES = ['/routine', '/report', '/challenge', '/mypage', '/workout'];

const hasAuthToken = (request: NextRequest) => {
  const accessToken = request.cookies.get(TOKEN.ACCESS)?.value;
  const refreshToken = request.cookies.get(TOKEN.REFRESH)?.value;

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
  matcher: ['/auth', '/routine/:path*', '/report/:path*', '/challenge/:path*', '/mypage/:path*', '/workout/:path*'],
};
