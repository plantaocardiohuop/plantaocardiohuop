import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const pwd = process.env.ADMIN_PASSWORD
  if (!pwd) return new NextResponse('Error', { status: 500 })

  try {
    const auth = req.headers.get('authorization')
    if (!auth) throw new Error()
    const [, password] = atob(auth.split(' ')[1]).split(':')
    if (password !== pwd) throw new Error()
  } catch {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
    })
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
