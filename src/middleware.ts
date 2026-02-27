import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from '@/lib/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

const protectedPaths = ['/dashboard', '/teams', '/action-items', '/settings'];
const authPaths = ['/auth/login', '/auth/register'];

function getPathWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || '/';
    }
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
  // Run intl middleware first
  const intlResponse = intlMiddleware(request);

  // Refresh Supabase session
  const { user, supabaseResponse } = await updateSession(request);

  const pathWithoutLocale = getPathWithoutLocale(request.nextUrl.pathname);

  // Check if path is protected
  const isProtectedPath = protectedPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(path + '/')
  );

  // Check if path is auth path
  const isAuthPath = authPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(path + '/')
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedPath && !user) {
    const locale =
      locales.find((l) => request.nextUrl.pathname.startsWith(`/${l}`)) ??
      defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && user) {
    const locale =
      locales.find((l) => request.nextUrl.pathname.startsWith(`/${l}`)) ??
      defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Merge cookies from supabase session refresh into intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
