import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!process.env.ADMIN_PASSWORD) {
      return new NextResponse('Server Error: ADMIN_PASSWORD missing', { status: 500 })
    }
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return new NextResponse('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })
    }
    const auth = atob(authHeader.split(' ')[1]).split(':')
    if (auth[0] !== 'admin' || auth[1] !== process.env.ADMIN_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })
    }
  }
  return NextResponse.next()
}
