import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { GL_REF_COOKIE, REF_MAX_AGE_SEC, normalizeCreatorHandle } from "@/lib/shop/cookieNames";
import { isDevImpersonationEnabled, isLoopbackHost } from "@/lib/dev/guard";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api/kyc(.*)"]);

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const parts = header.split(",").map((part) => part.split(";")[0]?.trim() ?? "");

  for (const part of parts) {
    if (part === "ar" || part.startsWith("ar-")) return "ar";
    if (part === "en" || part.startsWith("en-")) return "en";
  }

  return DEFAULT_LOCALE;
}

function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

function stampFirstTouchRef(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(GL_REF_COOKIE)?.value) return;

  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  if (parts[0] !== "creator" || !parts[1]) return;

  const handle = normalizeCreatorHandle(parts[1]);
  if (!handle) return;

  response.cookies.set(GL_REF_COOKIE, handle, {
    path: "/",
    maxAge: REF_MAX_AGE_SEC,
    sameSite: "lax",
    httpOnly: true,
  });
}

function publicPassThrough(request: NextRequest) {
  const locale = detectLocale(request);
  const response = withLocaleCookie(NextResponse.next(), locale);
  stampFirstTouchRef(request, response);
  return response;
}

/**
 * Keep clerkMiddleware in the bundle always. A build-time
 * `clerkConfigured ? clerkMiddleware : public` export gets tree-shaken when
 * CLERK_SECRET_KEY is absent during `next build`, then auth() crashes at
 * runtime (digest 2185492348 on /enter).
 */
const withClerk = clerkMiddleware(async (auth, request) => {
  const locale = detectLocale(request);

  if (
    isProtectedRoute(request) &&
    !(isDevImpersonationEnabled() && isLoopbackHost(request.nextUrl.hostname))
  ) {
    const { userId } = await auth();
    if (!userId) {
      if (request.nextUrl.pathname.startsWith("/api/kyc")) {
        const signIn = new URL("/sign-in", request.url);
        signIn.searchParams.set("redirect_url", `${request.nextUrl.pathname}${request.nextUrl.search}`);
        return withLocaleCookie(NextResponse.redirect(signIn), locale);
      }
      return withLocaleCookie(NextResponse.redirect(new URL("/enter", request.url)), locale);
    }
  }

  return publicPassThrough(request);
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) {
    return publicPassThrough(request);
  }
  return withClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
