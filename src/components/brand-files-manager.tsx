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
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Calendar,
  Filter
} from 'lucide-react'
import { BrandConfig } from '@/lib/brand-config'

interface FileItem {
  key: string
  size: number
  type: string
  lastModified: Date
  url: string
  folder: string
  filename: string
}

interface BrandFilesManagerProps {
  brandConfig: BrandConfig
}

export default function BrandFilesManager({ brandConfig }: BrandFilesManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [folders, setFolders] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [bucketName, setBucketName] = useState('')
  const [r2Status, setR2Status] = useState<'loading' | 'success' | 'error' | 'missing-config'>('loading')
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creating, setCreating] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadFolder, setUploadFolder] = useState('uploads')
  const [draggedFile, setDraggedFile] = useState<FileItem | null>(null)
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null)
  const [movingFile, setMovingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    setR2Status('loading')
    
    try {
      const response = await fetch(`/api/brand-files/${brandConfig.slug}/list`)
      const data = await response.json()
      
      if (data.success) {
        setFiles(data.files || [])
        setFolders(data.folders || [])
        setBucketName(data.bucket || brandConfig.bucket)
        setR2Status('success')
      } else {
        setR2Status('error')
        if (data.message?.includes('environment variables')) {
          setR2Status('missing-config')
        }
        console.error('Failed to load files:', data.error)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      setR2Status('error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, folder: string = uploadFolder) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      const response = await fetch(`/api/brand-files/${brandConfig.slug}/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setUploadMessage({ type: 'success', text: `File "${file.name}" uploaded successfully!` })
        await loadFiles()
      } else {
        setUploadMessage({ type: 'error', text: data.error || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadMessage(null), 5000)
    }
  }

  const handleDeleteFile = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/brand-files/${brandConfig.slug}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })

      const data = await response.json()
      
      if (data.success) {
        setUploadMessage({ type: 'success', text: 'File deleted successfully!' })
        await loadFiles()
        setSelectedFile(null)
      } else {
        setUploadMessage({ type: 'error', text: data.error || 'Delete failed' })
      }
    } catch (error) {
      console.error('Delete failed:', error)
      setUploadMessage({ type: 'error', text: 'Delete failed. Please try again.' })
    } finally {
      setTimeout(() => setUploadMessage(null), 5000)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach(file => handleFileUpload(file, uploadFolder))
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => handleFileUpload(file, uploadFolder))
  }

  // Handle file move between folders
  const handleFileMove = async (sourceFile: FileItem, targetFolder: string) => {
    if (sourceFile.folder === targetFolder) return // No move needed
    
    setMovingFile(true)
    try {
      const response = await fetch(`/api/brand-files/${brandConfig.slug}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceKey: sourceFile.key,
          targetFolder: targetFolder
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setUploadMessage({ type: 'success', text: `File moved to ${targetFolder} successfully!` })
        await loadFiles()
      } else {
        setUploadMessage({ type: 'error', text: data.error || 'Failed to move file' })
      }
    } catch (error) {
      console.error('Move failed:', error)
      setUploadMessage({ type: 'error', text: 'Failed to move file. Please try again.' })
    } finally {
      setMovingFile(false)
      setTimeout(() => setUploadMessage(null), 5000)
    }
  }

  // Handle drag start for files
  const handleFileDragStart = (e: React.DragEvent, file: FileItem) => {
    setDraggedFile(file)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag end for files
  const handleFileDragEnd = () => {
    setDraggedFile(null)
    setDropTargetFolder(null)
  }

  // Handle folder drop target events
  const handleFolderDragOver = (e: React.DragEvent, folder: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetFolder(folder)
  }

  const handleFolderDragLeave = () => {
    setDropTargetFolder(null)
  }

  const handleFolderDrop = (e: React.DragEvent, folder: string) => {
    e.preventDefault()
    if (draggedFile && draggedFile.folder !== folder) {
      handleFileMove(draggedFile, folder)
    }
    setDraggedFile(null)
    setDropTargetFolder(null)
  }

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    
    setCreating(true)
    try {
      const response = await fetch(`/api/brand-files/${brandConfig.slug}/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setUploadMessage({ type: 'success', text: `Folder "${data.folder.originalName}" created successfully!` })
        await loadFiles()
        setNewFolderName('')
        setShowCreateFolder(false)
      } else {
        setUploadMessage({ type: 'error', text: data.error || 'Failed to create folder' })
      }
    } catch (error) {
      console.error('Create folder failed:', error)
      setUploadMessage({ type: 'error', text: 'Failed to create folder. Please try again.' })
    } finally {
      setCreating(false)
      setTimeout(() => setUploadMessage(null), 5000)
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder
    const matchesType = selectedType === 'all' || file.type.startsWith(selectedType)
    return matchesSearch && matchesFolder && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.startsWith('video/')) return Video
    return FileText
  }

  // Missing R2 configuration UI
  if (r2Status === 'missing-config') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                R2 Storage Not Configured for {brandConfig.name}
              </h3>
              <p className="text-yellow-700 mb-4">
                To enable file storage for this brand, add these environment variables to Vercel:
              </p>
              <div className="bg-yellow-100 rounded-lg p-4 font-mono text-sm">
                <div className="text-yellow-800">
                  DAILY_DISH_R2_ACCOUNT_ID=your_account_id<br/>
                  DAILY_DISH_R2_ACCESS_KEY_ID=your_access_key<br/>
                  DAILY_DISH_R2_SECRET_ACCESS_KEY=your_secret_key<br/>
                  DAILY_DISH_R2_BUCKET=dailydishdash<br/>
                  DAILY_DISH_R2_PUBLIC_URL=https://pub-dailydishdash.r2.dev (optional)
                </div>
              </div>
              <p className="text-yellow-700 mt-4 text-sm">
                These should be the API credentials you have for the "{bucketName || 'dailydishdash'}" bucket.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Message */}
      {uploadMessage && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          uploadMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {uploadMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {uploadMessage.text}
          </div>
          <button onClick={() => setUploadMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div 
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          dragActive ? 'text-blue-500' : 'text-gray-400'
        }`} />
        <h3 className={`text-lg font-medium mb-2 ${
          dragActive ? 'text-blue-700' : 'text-gray-900'
        }`}>
          {dragActive ? 'Drop files here' : 'Drop files to upload'}
        </h3>
        <p className={`text-sm mb-4 ${
          dragActive ? 'text-blue-600' : 'text-gray-600'
        }`}>
          or click the button below to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 inline-flex items-center"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept="image/*,video/*,.pdf,.txt,.json"
        />
      </div>

      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="application">Documents</option>
            </select>

            {/* Upload to Folder */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Upload to:</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="uploads">uploads</option>
                {folders.filter(f => f !== 'uploads').map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Create Folder Button */}
            <button
              onClick={() => setShowCreateFolder(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            
            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Files</div>
          <div className="text-2xl font-bold text-gray-900">{files.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Size</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Folders</div>
          <div className="text-2xl font-bold text-gray-900">{folders.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Bucket</div>
          <div className="text-lg font-bold text-gray-900">{bucketName}</div>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex gap-6">
        {/* Folder Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Folders</h3>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {/* All Files */}
            <button
              onClick={() => setSelectedFolder('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium">All Files</span>
              <span className="ml-auto text-xs text-gray-500">{files.length}</span>
            </button>
            
            {/* Individual Folders */}
            {folders.map(folder => {
              const folderFiles = files.filter(f => f.folder === folder)
              const isDropTarget = dropTargetFolder === folder
              const isDraggedOver = draggedFile && dropTargetFolder === folder
              
              return (
                <div
                  key={folder}
                  onDragOver={(e) => handleFolderDragOver(e, folder)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folder)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFolder === folder
                      ? 'bg-blue-100 text-blue-700'
                      : isDraggedOver
                      ? 'bg-green-100 border-2 border-green-300 border-dashed'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFolder(folder)}
                >
                  <FolderOpen className={`w-4 h-4 ${
                    isDraggedOver ? 'text-green-600' : ''
                  }`} />
                  <span className="text-sm font-medium flex-1">{folder}</span>
                  <span className="text-xs text-gray-500">{folderFiles.length}</span>
                </div>
              )
            })}
          </div>
          
          {/* Drop Zone Helper */}
          {draggedFile && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">Moving file:</p>
              <p className="text-xs text-blue-600 truncate">{draggedFile.filename}</p>
              <p className="text-xs text-blue-500 mt-1">Drop on a folder to move</p>
            </div>
          )}
        </div>

        {/* Files Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading files...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-600 mb-4">
                  {files.length === 0 
                    ? "Start by uploading your first file"
                    : "No files match your current filters"
                  }
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {movingFile && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                    <span className="text-sm text-blue-700">Moving file...</span>
                  </div>
                </div>
              )}
              
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" 
                : "space-y-2"
              }>
                {filteredFiles.map((file) => {
                  const IconComponent = getFileIcon(file.type)
                  const isDragging = draggedFile?.key === file.key
                  
                  return viewMode === 'grid' ? (
                    <div
                      key={file.key}
                      draggable
                      onDragStart={(e) => handleFileDragStart(e, file)}
                      onDragEnd={handleFileDragEnd}
                      className={`group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors ${
                        isDragging ? 'opacity-50 scale-95' : ''
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex flex-col items-center">
                        {file.type.startsWith('image/') ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden mb-2">
                            <img 
                              src={file.url} 
                              alt={file.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                            <IconComponent className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        
                        <p className="text-sm font-medium text-gray-900 truncate w-full text-center">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {/* Action buttons on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(file.url, '_blank')
                              }}
                              className="p-1 bg-white rounded shadow hover:bg-gray-50"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteFile(file.key)
                              }}
                              className="p-1 bg-white rounded shadow hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={file.key}
                      draggable
                      onDragStart={(e) => handleFileDragStart(e, file)}
                      onDragEnd={handleFileDragEnd}
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                        isDragging ? 'opacity-50' : ''
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            {file.folder} • {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(file.url, '_blank')
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFile(file.key)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedFile.filename}</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                {selectedFile.type.startsWith('image/') ? (
                  <img 
                    src={selectedFile.url}
                    alt={selectedFile.filename}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg p-12 text-center">
                    {(() => {
                      const Icon = getFileIcon(selectedFile.type)
                      return <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    })()}
                    <p className="text-gray-600">Preview not available for this file type</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                </div>
                <div>
                  <strong>Type:</strong> {selectedFile.type}
                </div>
                <div>
                  <strong>Folder:</strong> {selectedFile.folder}
                </div>
                <div>
                  <strong>Modified:</strong> {new Date(selectedFile.lastModified).toLocaleString()}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => window.open(selectedFile.url, '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Size
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.url)
                    setUploadMessage({ type: 'success', text: 'URL copied to clipboard!' })
                    setTimeout(() => setUploadMessage(null), 3000)
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDeleteFile(selectedFile.key)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Folder</h3>
              <button
                onClick={() => {
                  setShowCreateFolder(false)
                  setNewFolderName('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !creating) {
                    handleCreateFolder()
                  }
                }}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Folder names will be automatically cleaned (spaces become dashes, special characters removed)
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false)
                  setNewFolderName('')
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creating}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create Folder'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}