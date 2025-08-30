// Development logger that creates a public log stream for Claude to access
import { NextResponse } from 'next/server'

interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: any
  source: 'cms' | 'storefront'
  environment: string
}

// In-memory log storage for development (resets on server restart)
const devLogs: LogEntry[] = []
const MAX_LOGS = 1000

export class DevLogger {
  private source: 'cms' | 'storefront'

  constructor(source: 'cms' | 'storefront') {
    this.source = source
  }

  private addLog(level: LogEntry['level'], message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source: this.source,
      environment: process.env.NODE_ENV || 'development'
    }

    devLogs.unshift(entry)
    if (devLogs.length > MAX_LOGS) {
      devLogs.pop()
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${this.source.toUpperCase()}]`
      switch (level) {
        case 'debug':
          console.debug(prefix, message, context)
          break
        case 'info':
          console.info(prefix, message, context)
          break
        case 'warn':
          console.warn(prefix, message, context)
          break
        case 'error':
          console.error(prefix, message, context)
          break
      }
    }

    // Send to external logging service if configured
    this.sendToExternalLogger(entry)
  }

  private async sendToExternalLogger(entry: LogEntry) {
    // Send to Better Stack
    if (process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN) {
      try {
        await fetch(process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL || 'https://logs.betterstack.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}`
          },
          body: JSON.stringify(entry)
        })
      } catch (error) {
        console.error('Failed to send log to Better Stack:', error)
      }
    }
  }

  debug(message: string, context?: any) {
    this.addLog('debug', message, context)
  }

  info(message: string, context?: any) {
    this.addLog('info', message, context)
  }

  warn(message: string, context?: any) {
    this.addLog('warn', message, context)
  }

  error(message: string, error?: Error | any, context?: any) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    }
    this.addLog('error', message, errorContext)
  }

  // Track API calls
  api(method: string, endpoint: string, status: number, duration: number, error?: any) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    this.addLog(level, `API: ${method} ${endpoint}`, {
      method,
      endpoint,
      status,
      duration,
      success: status >= 200 && status < 300,
      error
    })
  }

  // Get all logs (for API endpoint)
  static getLogs(filters?: {
    level?: string
    source?: string
    since?: string
    limit?: number
  }) {
    let filtered = [...devLogs]

    if (filters?.level) {
      filtered = filtered.filter(log => log.level === filters.level)
    }

    if (filters?.source) {
      filtered = filtered.filter(log => log.source === filters.source)
    }

    if (filters?.since) {
      const sinceDate = new Date(filters.since)
      filtered = filtered.filter(log => new Date(log.timestamp) > sinceDate)
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  static clearLogs() {
    devLogs.length = 0
  }
}

// Export singleton instances
export const cmsLogger = new DevLogger('cms')
export const storefrontLogger = new DevLogger('storefront')