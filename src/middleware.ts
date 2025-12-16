import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let locales = ["en", "nl", "it"];

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
    // Simple logic: default to 'en'
    return "en";
}

export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl;

    // Exclude API routes, next default files, and public assets
    if (
        pathname.startsWith("/api") ||
        pathname.includes(".") || // files like robot.txt, favicon.ico
        pathname.startsWith("/_next")
    ) {
        return;
    }

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect if there is no locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|api|favicon.ico).*)',
    ],
};
