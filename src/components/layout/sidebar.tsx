'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BarChart3,
  Settings,
  LogOut,
  Megaphone,
  FolderOpen,
  Zap as Lightning,
  Package,
  Globe
} from 'lucide-react'
import { clsx } from 'clsx'

// Extract brand from pathname if we're in a brand route
function getBrandFromPath(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/([^\/]+)/)
  if (!match) return 'daily-dish-dash'
  
  const segment = match[1]
  
  // These are global pages, not brands
  const globalPages = ['products'] // Only Products stays global for now
  
  if (globalPages.includes(segment)) {
    return 'daily-dish-dash' // Default to Daily Dish Dash for global pages
  }
  
  // Valid brand slugs (from brand-config.ts)
  const validBrands = ['daily-dish-dash', 'grit-collective']
  
  if (validBrands.includes(segment)) {
    return segment
  }
  
  return 'daily-dish-dash' // Default fallback
}

// Generate navigation links based on current brand
function getNavigation(brand: string) {
  const brandPath = `/dashboard/${brand}`
  
  return [
    { name: 'Dashboard', href: brandPath, icon: LayoutDashboard },
    { name: 'Content', href: `${brandPath}/content`, icon: Megaphone },
    { name: 'Platforms', href: `${brandPath}/platforms`, icon: Globe },
    { name: 'Files', href: `${brandPath}/files`, icon: FolderOpen },
    { name: 'Analytics', href: `${brandPath}/analytics`, icon: BarChart3 },
    { name: 'Settings', href: `${brandPath}/settings`, icon: Settings },
    { name: 'Products', href: '/dashboard/products', icon: Package }, // Keep global for now
  ]
}

interface SidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const currentBrand = getBrandFromPath(pathname)
  const navigation = getNavigation(currentBrand)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <Lightning className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-white">Cheetah CMS v2</span>
        </div>
      </div>

      {/* Brand Indicator */}
      {currentBrand && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Current Brand</div>
          <div className="text-sm text-white font-medium capitalize">
            {currentBrand.replace('-', ' ')}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
                          (item.name === 'Content' && pathname.startsWith(`/dashboard/${currentBrand}/content`)) ||
                          (item.name === 'Platforms' && pathname.startsWith(`/dashboard/${currentBrand}/platforms`)) ||
                          (item.name === 'Files' && pathname.startsWith(`/dashboard/${currentBrand}/files`)) ||
                          (item.name === 'Analytics' && pathname.startsWith(`/dashboard/${currentBrand}/analytics`)) ||
                          (item.name === 'Settings' && pathname.startsWith(`/dashboard/${currentBrand}/settings`))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {user.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign out
        </button>
      </div>
    </div>
  )
}