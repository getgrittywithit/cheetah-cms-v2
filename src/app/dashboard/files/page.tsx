'use client'

import { useState, useEffect, useRef } from 'react'
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
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface FileItem {
  key: string
  size: number
  type: string
  lastModified: Date
  url: string
  folder: string
  filename: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files/list')
      const data = await response.json()
      if (data.success) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadMessage(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'raw')

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Upload failed')
        }
      }

      setUploadMessage({ type: 'success', text: `Successfully uploaded ${files.length} file(s)` })
      await loadFiles()
      
      // Clear input
      event.target.value = ''
    } catch (error) {
      setUploadMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadMessage(null), 5000)
    }
  }

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      const data = await response.json()
      if (data.success) {
        await loadFiles()
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-600" />
    return <FileText className="w-5 h-5 text-blue-600" />
  }

  // Filter files
  let filteredFiles = files
  if (selectedFolder !== 'all') {
    filteredFiles = filteredFiles.filter(file => file.folder === selectedFolder)
  }
  if (selectedType !== 'all') {
    if (selectedType === 'image') {
      filteredFiles = filteredFiles.filter(file => file.type.startsWith('image/'))
    } else if (selectedType === 'video') {
      filteredFiles = filteredFiles.filter(file => file.type.startsWith('video/'))
    }
  }

  // Calculate stats
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const imageCount = files.filter(file => file.type.startsWith('image/')).length
  const videoCount = files.filter(file => file.type.startsWith('video/')).length

  // Folder counts
  const folderCounts = files.reduce((acc, file) => {
    acc[file.folder] = (acc[file.folder] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-700">Manage media library and VPS processing tools</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            VPS Tools
          </button>
        </div>
      </div>

      {/* Upload Message */}
      {uploadMessage && (
        <div className={`p-4 rounded-lg flex items-center ${
          uploadMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {uploadMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {uploadMessage.text}
        </div>
      )}

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Total Files</p>
              <p className="text-2xl font-semibold text-gray-900">{files.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Images</p>
              <p className="text-2xl font-semibold text-gray-900">{imageCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Videos</p>
              <p className="text-2xl font-semibold text-gray-900">{videoCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Layers className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Storage Used</p>
              <p className="text-2xl font-semibold text-gray-900">{formatFileSize(totalSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Organization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Folder Structure */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
            Folders
          </h2>
          <div className="space-y-2">
            <div 
              onClick={() => setSelectedFolder('all')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedFolder === 'all' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                <span className="text-sm">All Files</span>
              </div>
              <span className="text-xs text-gray-700">{files.length}</span>
            </div>
            
            <div 
              onClick={() => setSelectedFolder('raw')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedFolder === 'raw' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm">Raw Uploads</span>
              </div>
              <span className="text-xs text-gray-700">{folderCounts.raw || 0}</span>
            </div>
            
            <div 
              onClick={() => setSelectedFolder('processed')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedFolder === 'processed' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Processed</span>
              </div>
              <span className="text-xs text-gray-700">{folderCounts.processed || 0}</span>
            </div>
            
            <div 
              onClick={() => setSelectedFolder('social')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedFolder === 'social' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-sm">Social Media</span>
              </div>
              <span className="text-xs text-gray-700">{folderCounts.social || 0}</span>
            </div>
            
            <div 
              onClick={() => setSelectedFolder('products')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedFolder === 'products' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 text-orange-500 mr-2" />
                <span className="text-sm">Products</span>
              </div>
              <span className="text-xs text-gray-700">{folderCounts.products || 0}</span>
            </div>
          </div>
        </div>

        {/* File Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedType('all')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                      selectedType === 'all' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    All Types
                  </button>
                  <button 
                    onClick={() => setSelectedType('image')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                      selectedType === 'image' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Image className="w-4 h-4 mr-1" />
                    Images
                  </button>
                  <button 
                    onClick={() => setSelectedType('video')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                      selectedType === 'video' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Videos
                  </button>
                </div>
              </div>
            </div>

            {/* Files Display */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-700">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {files.length === 0 ? 'No files yet' : 'No files in this folder'}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {files.length === 0 ? 'Upload your first files to get started' : 'Try selecting a different folder or filter'}
                  </p>
                  {files.length === 0 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.key}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      {/* File Preview */}
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-700">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedFile.filename}</h2>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Preview */}
              <div className="mb-6">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.filename}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : selectedFile.type.startsWith('video/') ? (
                  <video
                    src={selectedFile.url}
                    controls
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="p-12 bg-gray-100 rounded-lg text-center">
                    {getFileIcon(selectedFile.type)}
                    <p className="mt-4 text-gray-700">Preview not available</p>
                  </div>
                )}
              </div>
              
              {/* File Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-700">File Type</p>
                  <p className="font-medium">{selectedFile.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">File Size</p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Folder</p>
                  <p className="font-medium capitalize">{selectedFile.folder}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Uploaded</p>
                  <p className="font-medium">
                    {new Date(selectedFile.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between">
                <div className="space-x-2">
                  <a
                    href={selectedFile.url}
                    download={selectedFile.filename}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                  <button
                    onClick={() => window.open(selectedFile.url, '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Size
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(selectedFile.key)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VPS Tools Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-600" />
          VPS Processing Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center mb-2">
              <Image className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium">Image Optimizer</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">Compress and optimize images for web</p>
            <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
              Process Images
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center mb-2">
              <Layers className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium">Background Remover</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">Remove backgrounds automatically</p>
            <button className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
              Remove Backgrounds
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center mb-2">
              <Video className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-medium">Video Converter</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">Convert videos for social media</p>
            <button className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
              Convert Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}