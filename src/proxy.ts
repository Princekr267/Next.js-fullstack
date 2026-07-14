import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {

  const session = getSessionCookie(request)

  const isProtected = request.nextUrl.pathname.startsWith("/dashboard");

  const isAuthPage = ["/sign-in", "/sign-up", "/verify", "/"].includes(request.nextUrl.pathname)

  // Not logged in → redirect to sign-in
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  // Already logged in → redirect away from auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/dashboard/:path*',
    '/verify/:path*',
    '/'
  ],
}