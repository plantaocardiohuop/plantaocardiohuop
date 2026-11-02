import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
      })
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
    if (!ADMIN_PASSWORD) {
      return new NextResponse('Server configuration error', { status: 500 })
    }

    const authValue = authHeader.split(' ')[1]
    if (!authValue) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
        })
    }

    const decodedValue = atob(authValue)
    const pwdIndex = decodedValue.indexOf(':')
    const pwd = pwdIndex !== -1 ? decodedValue.substring(pwdIndex + 1) : ''

    if (pwd !== ADMIN_PASSWORD) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
      })
    }
  }
  return NextResponse.next()
}
