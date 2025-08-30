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
  Globe,
  Building2,
  Calendar,
  ShoppingCart,
  Users
} from 'lucide-react'
import { clsx } from 'clsx'
import BrandSwitcher from './brand-switcher'
import { getAllBrands } from '@/lib/brand-config'

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
  const validBrands = getAllBrands().map(brand => brand.slug)
  
  if (validBrands.includes(segment)) {
    return segment
  }
  
  return 'daily-dish-dash' // Default fallback
}

// Generate brand-specific navigation links
function getBrandNavigation(brand: string) {
  const brandPath = `/dashboard/${brand}`
  
  return [
    { name: 'Dashboard', href: brandPath, icon: LayoutDashboard },
    { name: 'Content Creator', href: `${brandPath}/content`, icon: Megaphone },
    { name: 'Calendar', href: `${brandPath}/calendar`, icon: Calendar },
    { name: 'Products', href: `${brandPath}/products`, icon: Package },
    { name: 'Orders', href: `${brandPath}/orders`, icon: ShoppingCart },
    { name: 'Customers', href: `${brandPath}/customers`, icon: Users },
    { name: 'Platforms', href: `${brandPath}/platforms`, icon: Globe },
    { name: 'Integrations', href: `${brandPath}/integrations`, icon: Lightning },
    { name: 'Files', href: `${brandPath}/files`, icon: FolderOpen },
    { name: 'Analytics', href: `${brandPath}/analytics`, icon: BarChart3 },
    { name: 'Settings', href: `${brandPath}/settings`, icon: Settings },
  ]
}

// Generate global/system navigation links
function getGlobalNavigation() {
  return [
    { name: 'Brand Management', href: '/dashboard/brands', icon: Building2 },
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
  const brandNavigation = getBrandNavigation(currentBrand)
  const globalNavigation = getGlobalNavigation()

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

      {/* Brand Switcher */}
      {currentBrand && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Current Brand</div>
          <BrandSwitcher currentBrand={currentBrand} />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6">
        {/* Brand-specific section */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 px-4">
            Brand Content
          </div>
          <div className="space-y-2">
            {brandNavigation.map((item) => {
              const isActive = pathname === item.href || 
                              (item.name === 'Content Creator' && pathname.startsWith(`/dashboard/${currentBrand}/content`)) ||
                              (item.name === 'Calendar' && pathname.startsWith(`/dashboard/${currentBrand}/calendar`)) ||
                              (item.name === 'Products' && pathname.startsWith(`/dashboard/${currentBrand}/products`)) ||
                              (item.name === 'Orders' && pathname.startsWith(`/dashboard/${currentBrand}/orders`)) ||
                              (item.name === 'Customers' && pathname.startsWith(`/dashboard/${currentBrand}/customers`)) ||
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
          </div>
        </div>

        {/* Global/System section */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 px-4">
            System
          </div>
          <div className="space-y-2">
            {globalNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-green-600 text-white' // Different color for global tabs
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
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