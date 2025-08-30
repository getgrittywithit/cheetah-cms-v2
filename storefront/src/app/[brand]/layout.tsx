import { notFound } from 'next/navigation'
import { CartProvider } from '@/contexts/cart-context'
import Header from '@/components/layout/header'
import CartDrawer from '@/components/cart/cart-drawer'

// Brand configurations - this should eventually come from your CMS API
interface BrandConfig {
  name: string
  slug: string
  theme: {
    primary: string
    secondary: string
  }
  description: string
}

const brandConfigs: Record<string, BrandConfig> = {
  'daily-dish-dash': {
    name: 'Daily Dish Dash',
    slug: 'daily-dish-dash',
    theme: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
    },
    description: 'Quick, delicious recipes and food inspiration for busy people'
  },
  'grit-collective': {
    name: 'Grit Collective Co.',
    slug: 'grit-collective',
    theme: {
      primary: '#2D4A3A',
      secondary: '#8B7355',
    },
    description: 'Handcrafted products that inspire positive emotions and meaningful connections'
  }
}

interface BrandLayoutProps {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}

export default async function BrandLayout({ children, params }: BrandLayoutProps) {
  const { brand } = await params
  
  // Validate brand
  const brandConfig = brandConfigs[brand]
  if (!brandConfig) {
    notFound()
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header brand={brandConfig} />
        <main className="flex-1">
          {children}
        </main>
        <CartDrawer />
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: brandConfig.theme.primary }}>
                  {brandConfig.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {brandConfig.description}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-4">Shop</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href={`/${brand}/products`} className="hover:text-white">All Products</a></li>
                  <li><a href={`/${brand}/categories`} className="hover:text-white">Categories</a></li>
                  <li><a href={`/${brand}/new`} className="hover:text-white">New Arrivals</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href={`/${brand}/contact`} className="hover:text-white">Contact Us</a></li>
                  <li><a href={`/${brand}/shipping`} className="hover:text-white">Shipping Info</a></li>
                  <li><a href={`/${brand}/returns`} className="hover:text-white">Returns</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white">Instagram</a></li>
                  <li><a href="#" className="hover:text-white">Facebook</a></li>
                  <li><a href="#" className="hover:text-white">Pinterest</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 {brandConfig.name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}

// Generate static paths for known brands
export function generateStaticParams() {
  return [
    { brand: 'daily-dish-dash' },
    { brand: 'grit-collective' }
  ]
}

// Set metadata based on brand
export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const brandConfig = brandConfigs[brand]
  
  return {
    title: `${brandConfig?.name || 'Brand'} Store`,
    description: brandConfig?.description || 'E-commerce store'
  }
}