import { getBrandConfig, getBrandBucket } from '@/lib/brand-config'
import { notFound } from 'next/navigation'
import { 
  FolderOpen,
  Upload,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  Eye,
  Zap,
  Layers,
  Plus,
  AlertCircle
} from 'lucide-react'

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

      {/* Coming Soon Notice */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Brand-Specific File Management</h2>
          <p className="text-gray-600 mb-4">
            This will be the file management interface for {brandConfig.name}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-800 mb-1">Implementation Status</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Files will be stored in dedicated R2 bucket: <code className="bg-blue-100 px-1 rounded">{bucketName}</code></li>
                  <li>• AI-generated images will automatically appear here</li>
                  <li>• Upload, organize, and manage brand-specific media</li>
                  <li>• Currently redirecting to global Files page for functionality</li>
                </ul>
              </div>
            </div>
          </div>
          
          <a 
            href="/dashboard/files"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Current Files Interface
          </a>
        </div>
      </div>
    </div>
  )
}