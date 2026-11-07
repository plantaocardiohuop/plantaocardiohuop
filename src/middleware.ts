import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const auth = req.headers.get('authorization')
    const adminPwd = process.env.ADMIN_PASSWORD
    if (!adminPwd) return new NextResponse('Server configuration error', { status: 500 })

    if (auth) {
      const [scheme, encoded] = auth.split(' ')
      if (scheme.toLowerCase() === 'basic' && encoded) {
        const [, password] = atob(encoded).split(':')
        if (password === adminPwd) return NextResponse.next()
      }
    }
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
    })
  }
}
