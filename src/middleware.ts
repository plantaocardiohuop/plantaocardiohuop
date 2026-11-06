import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()

  const authHeader = req.headers.get('authorization')
  if (!authHeader) return new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })

  const authValue = authHeader.split(' ')[1]
  if (!authValue) return new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })

  let decoded = ''
  try {
    decoded = atob(authValue)
  } catch {
    return new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })
  }
  const [, password] = decoded.split(':')

  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedPassword || password !== expectedPassword) {
    return new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })
  }

  return NextResponse.next()
}
