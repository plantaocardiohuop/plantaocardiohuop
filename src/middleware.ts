import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return new NextResponse('Server configuration error', { status: 500 })
  }

  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const decodedAuth = atob(authValue)
    const [, password] = decodedAuth.split(':')

    if (password === adminPassword) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Access"',
    },
  })
}

export const config = {
  matcher: '/admin/:path*',
}
