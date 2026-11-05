import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return new NextResponse('Authentication not configured.', { status: 500 });
  }

  const basicAuth = req.headers.get('authorization')
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const decoded = atob(authValue)
    const [, password] = decoded.split(':')

    if (password === adminPassword) {
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
