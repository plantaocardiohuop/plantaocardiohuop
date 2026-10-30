import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization')

    if (!process.env.ADMIN_PASSWORD) {
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      try {
        const decodedValue = atob(authValue)
        const [user, pwd] = decodedValue.split(':')

        if (user === 'admin' && pwd === process.env.ADMIN_PASSWORD) {
          return NextResponse.next()
        }
      } catch {
        // Invalid base64
      }
    }

    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
