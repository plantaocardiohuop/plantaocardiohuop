import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Check if we are trying to access the admin area
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (!basicAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      })
    }

    try {
      const authValue = basicAuth.split(' ')[1]
      if (!authValue) {
        throw new Error('Missing basic auth value')
      }
      const [user, pwd] = atob(authValue).split(':')

      // Read credentials from environment variables to avoid hardcoded secrets
      const expectedUser = process.env.ADMIN_USER
      const expectedPwd = process.env.ADMIN_PASSWORD

      // Fail securely if environment variables are not set
      if (!expectedUser || !expectedPwd) {
        console.error('SECURITY WARNING: Missing ADMIN_USER or ADMIN_PASSWORD environment variables')
        return new NextResponse('Server configuration error', { status: 500 })
      }

      // Verify credentials
      if (user === expectedUser && pwd === expectedPwd) {
        return NextResponse.next()
      }
    } catch (e) {
      // Ignore parsing errors, just fail authentication
    }

    // Authentication failed, don't leak whether user exists or not
    return new NextResponse('Authentication failed', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
