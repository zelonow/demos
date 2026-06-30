import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const locales = ["en", "fr", "zh"];
export const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname is an API route, static asset, or Next.js internal
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // e.g. /favicon.ico, /images/hero.png
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to the default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/` and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
