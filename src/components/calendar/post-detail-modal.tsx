'use client'

import { useState } from 'react'
import { 
  X, 
  Clock, 
  Edit, 
  Trash2, 
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  FileImage,
  Calendar,
  Hash,
  Eye
} from 'lucide-react'

interface ScheduledPost {
  id: string
  title: string
  content: string
  platform: string
  scheduledDate: Date
  status: 'scheduled' | 'published' | 'failed'
  media: string[]
  hashtags: string[]
  createdAt: Date
}

interface PostDetailModalProps {
  post: ScheduledPost
  onClose: () => void
  onEdit: (post: ScheduledPost) => void
  onDelete: (postId: string) => void
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: FileImage,
  pinterest: FileImage,
  linkedin: FileImage
}

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F', 
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  tiktok: '#000000',
  pinterest: '#E60023',
  linkedin: '#0077B5'
}

export default function PostDetailModal({ post, onClose, onEdit, onDelete }: PostDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const Icon = platformIcons[post.platform as keyof typeof platformIcons] || FileImage
  const platformColor = platformColors[post.platform as keyof typeof platformColors]

  const handleDelete = () => {
    onDelete(post.id)
    setShowDeleteConfirm(false)
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: platformColor }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {post.platform} Post
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                    {post.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created {post.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(post)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit post"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete post"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scheduled Date */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Scheduled for</div>
              <div className="text-sm text-gray-600">{formatDateTime(post.scheduledDate)}</div>
            </div>
          </div>

          {/* Post Content */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Post Content</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          </div>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          {post.media.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FileImage className="w-5 h-5 mr-2" />
                Media ({post.media.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.media.map((mediaUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={mediaUrl}
                      alt={`Media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04IDlMMTIgMTNMMTYgOSIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => window.open(mediaUrl, '_blank')}
                        className="p-2 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Platform Preview</h3>
            <div 
              className="border-2 rounded-lg p-4"
              style={{ borderColor: platformColor }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: platformColor }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 capitalize">{post.platform}</div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(post.scheduledDate)}
                  </div>
                </div>
              </div>
              
              {post.media.length > 0 && (
                <div className="mb-3">
                  <img
                    src={post.media[0]}
                    alt="Post preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <p className="text-gray-900 text-sm mb-2 whitespace-pre-wrap">
                {post.content}
              </p>
              
              {post.hashtags.length > 0 && (
                <p className="text-blue-600 text-sm">
                  {post.hashtags.join(' ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Scheduled Post?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. The scheduled post will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}