// Public API endpoint for Claude to access development logs
import { NextRequest, NextResponse } from 'next/server'
import { DevLogger } from '@/lib/dev-logger'

export async function GET(request: NextRequest) {
  // Only enable in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_LOGS !== 'true') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  
  const filters = {
    level: searchParams.get('level') || undefined,
    source: searchParams.get('source') || undefined,
    since: searchParams.get('since') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
  }

  const logs = DevLogger.getLogs(filters)
  
  const response = NextResponse.json({
    success: true,
    logs,
    total: logs.length,
    filters,
    timestamp: new Date().toISOString()
  })

  // Add CORS headers for Claude to access
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

export async function DELETE() {
  // Clear all logs
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_LOGS !== 'true') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  DevLogger.clearLogs()
  
  const response = NextResponse.json({
    success: true,
    message: 'Logs cleared'
  })

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  
  return response
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}