'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { AdminUser } from '@/lib/auth'
import { BrandProvider } from '@/contexts/brand-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Force rebuild

const getPageTitle = (pathname: string) => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/orders': 'Orders',
    '/dashboard/products': 'Products',
    '/dashboard/customers': 'Customers',
    '/dashboard/content': 'Content',
    '/dashboard/platforms': 'Platforms',
    '/dashboard/files': 'Files',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/settings': 'Settings',
  }
  return titles[pathname] || 'Dashboard'
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <BrandProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getPageTitle(pathname)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BrandProvider>
  )
}