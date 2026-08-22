import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  const publicPaths = ['/sign-in', '/sign-up', '/verify-email']
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
