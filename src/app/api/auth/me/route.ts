import { NextRequest, NextResponse } from 'next/server'
import { AdminUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: session.user as AdminUser
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }
}