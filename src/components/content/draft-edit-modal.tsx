import { useState } from 'react'
import { Calendar, Clock, Send, X, Trash2, Edit as EditIcon } from 'lucide-react'
import { SocialPost } from '@/lib/marketing-types'

interface DraftEditModalProps {
  isOpen: boolean
  onClose: () => void
  post: SocialPost
  onUpdate: (postId: string, updates: Partial<SocialPost>) => Promise<void>
  onDelete: (postId: string) => Promise<void>
  onPublish: (post: SocialPost, scheduledFor: string | null) => Promise<void>
}

const platformColors = {
  instagram: 'bg-pink-100 text-pink-600 border-pink-200',
  facebook: 'bg-blue-100 text-blue-600 border-blue-200',
  twitter: 'bg-sky-100 text-sky-600 border-sky-200'
}

export default function DraftEditModal({ 
  isOpen, 
  onClose, 
  post,
  onUpdate,
  onDelete,
  onPublish
}: DraftEditModalProps) {
  const [content, setContent] = useState(post.content)
  const [hashtags, setHashtags] = useState(post.hashtags.join(' '))
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await onUpdate(post.id, {
        content,
        hashtags: hashtags.split(' ').filter(Boolean)
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this draft?')) return
    
    setIsDeleting(true)
    try {
      await onDelete(post.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduleDate) {
      alert('Please select a date and time')
      return
    }

    const scheduledFor = scheduleDate && scheduleTime 
      ? `${scheduleDate}T${scheduleTime}` 
      : scheduleDate ? `${scheduleDate}T09:00` : null

    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor)
      if (scheduledDate <= new Date()) {
        alert('Please select a future date and time')
        return
      }
    }

    setIsScheduling(true)
    try {
      await onPublish(
        { ...post, content, hashtags: hashtags.split(' ').filter(Boolean) },
        scheduledFor
      )
      onClose()
    } catch (error) {
      console.error('Failed to schedule post:', error)
      alert('Failed to schedule post')
    } finally {
      setIsScheduling(false)
    }
  }

  const handlePublishNow = async () => {
    if (!confirm('Publish this post immediately?')) return
    
    setIsScheduling(true)
    try {
      await onPublish(
        { ...post, content, hashtags: hashtags.split(' ').filter(Boolean) },
        null
      )
      onClose()
    } catch (error) {
      console.error('Failed to publish post:', error)
      alert('Failed to publish post')
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Draft' : 'Draft Post'}
              </h2>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${platformColors[post.platform as keyof typeof platformColors]}`}>
                  {post.platform}
                </span>
                <span className="text-sm text-gray-600">
                  Created {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <EditIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                rows={6}
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
              </div>
            )}
          </div>

          {/* Hashtags */}
          {isEditing && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="#recipe #quickmeals #foodie"
              />
            </div>
          )}

          {/* Media preview if exists */}
          {post.media && post.media.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media
              </label>
              <div className="grid grid-cols-2 gap-2">
                {post.media.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mb-6 pb-6 border-b">
              <button
                onClick={() => {
                  setContent(post.content)
                  setHashtags(post.hashtags.join(' '))
                  setIsEditing(false)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Scheduling Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Schedule or Publish</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {scheduleDate && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Will be scheduled for: {new Date(`${scheduleDate}T${scheduleTime || '09:00'}`).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center disabled:opacity-50"
                disabled={isDeleting || isScheduling}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Draft'}
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={handlePublishNow}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:bg-gray-400"
                  disabled={isScheduling || isEditing}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Now
                </button>
                
                <button
                  onClick={handleSchedule}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:bg-gray-400"
                  disabled={!scheduleDate || isScheduling || isEditing}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {isScheduling ? 'Processing...' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}