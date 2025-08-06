'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const checkAuthAndRedirect = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    // Redirect to dashboard or login based on auth status - updated
    checkAuthAndRedirect()
  }, [checkAuthAndRedirect])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}