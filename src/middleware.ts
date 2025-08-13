import { AUTH_COOKIE_NAME } from '@/lib/constants'
import { verifyToken } from '@/lib/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  const isAuthenticated = authCookie && (await verifyToken(authCookie.value))
  const isLandingPage = request.nextUrl.pathname === '/'

  if (isLandingPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - .ico, .png, .jpg, .jpeg, .svg files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:ico|png|jpg|jpeg|svg)|public).*)',
  ],
}
