import { getBrandConfig } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import { 
  Facebook,
  Instagram,
  Twitter,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

interface BrandPlatformsPageProps {
  params: { brand: string }
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter
}

const platformColors = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500', 
  twitter: 'bg-sky-500'
}

export default function BrandPlatformsPage({ params }: BrandPlatformsPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  // Get configured platforms for this brand
  const platforms = Object.entries(brandConfig.socialTokens)
    .map(([platform, token]) => ({
      id: platform,
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      isConnected: !!token,
      token: token ? `${token.substring(0, 10)}...` : null,
      icon: platformIcons[platform as keyof typeof platformIcons] || Settings
    }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: brandConfig.theme.primary }}
          >
            {brandConfig.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Platforms</h1>
            <p className="text-gray-600">Manage social media connections for {brandConfig.name}</p>
          </div>
        </div>
      </div>

      {/* Platform Connections */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Connected Platforms</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon
            
            return (
              <div key={platform.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg text-white ${platformColors[platform.id as keyof typeof platformColors] || 'bg-gray-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                  </div>
                  
                  <div className="flex items-center">
                    {platform.isConnected ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Status:</span>
                    <span className={`font-medium ${platform.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {platform.isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  
                  {platform.isConnected && platform.token && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Token:</span>
                      <span className="text-gray-500 font-mono text-xs">{platform.token}</span>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-gray-100">
                    <button 
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        platform.isConnected 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {platform.isConnected ? 'Reconfigure' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Auto-Publishing</h3>
              <p className="text-sm text-gray-600">Automatically publish scheduled posts to connected platforms</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Cross-Posting</h3>
              <p className="text-sm text-gray-600">Post to multiple platforms simultaneously</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Analytics Tracking</h3>
              <p className="text-sm text-gray-600">Track engagement and performance metrics</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}