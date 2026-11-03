import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization')
    const password = process.env.ADMIN_PASSWORD

    if (!password) {
      return new NextResponse('Configuration Error: Missing ADMIN_PASSWORD', { status: 500 })
    }

    if (authHeader) {
      const authValue = authHeader.split(' ')[1]
      if (authValue) {
        const decoded = atob(authValue)
        const [, suppliedPassword] = decoded.split(':')

        if (suppliedPassword === password) {
          return NextResponse.next()
        }
      }
    }

    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
