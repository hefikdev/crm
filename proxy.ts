import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPaths = ["/login", "/register"];
const protectedPaths = ["/a"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  const sessionCookie = request.cookies.get("crm.session_token")?.value;

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/a", request.url));
  }

  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};