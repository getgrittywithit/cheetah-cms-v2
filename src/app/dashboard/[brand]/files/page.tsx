import { getBrandConfig, getBrandBucket } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import BrandFilesManager from '@/components/brand-files-manager'

interface BrandFilesPageProps {
  params: { brand: string }
}

export default function BrandFilesPage({ params }: BrandFilesPageProps) {
  const { brand } = params
  const brandConfig = getBrandConfig(brand)
  
  if (!brandConfig) {
    notFound()
  }

  const bucketName = getBrandBucket(brand)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              {brandConfig.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Files</h1>
              <p className="text-gray-600">Manage media library for {brandConfig.name}</p>
              <p className="text-sm text-gray-500">Bucket: {bucketName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </button>
          </div>
        </div>
      </div>

      {/* Brand Files Manager */}
      <BrandFilesManager brandConfig={brandConfig} />
    </div>
  )
}