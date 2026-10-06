import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER
  const expectedPwd = process.env.ADMIN_PASSWORD

  if (!expectedUser || !expectedPwd) {
      return new NextResponse('Server not configured for authentication', { status: 500 })
  }

  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === expectedUser && pwd === expectedPwd) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: '/admin/:path*',
}
