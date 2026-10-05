import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      })
    }

    try {
      const authValue = authHeader.split(' ')[1]
      const decodedAuth = Buffer.from(authValue, 'base64').toString('utf-8')
      const [user, pass] = decodedAuth.split(':')

      const expectedUser = process.env.ADMIN_USERNAME
      const expectedPass = process.env.ADMIN_PASSWORD

      if (!expectedUser || !expectedPass) {
        console.error('Missing ADMIN_USERNAME or ADMIN_PASSWORD environment variables')
        return new NextResponse('Server configuration error', { status: 500 })
      }

      // Simple constant-time comparison
      const encoder = new TextEncoder();
      const a = encoder.encode(user + ":" + pass);
      const b = encoder.encode(expectedUser + ":" + expectedPass);

      let mismatch = a.length === b.length ? 0 : 1;
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        mismatch |= a[i] ^ b[i];
      }

      if (mismatch === 0) {
        return NextResponse.next()
      }
    } catch (error) {
      console.error('Auth format error:', error)
      return new NextResponse('Invalid authentication format', { status: 400 })
    }

    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
