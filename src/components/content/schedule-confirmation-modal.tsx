import { useState } from 'react'
import { Calendar, Clock, Send, X, AlertTriangle, Instagram, Facebook, Twitter } from 'lucide-react'

interface ScheduleConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (scheduleData: { scheduledFor: string | null, isImmediate: boolean, selectedPlatform?: string }) => void
  platform: string
  content: string
  initialDate?: string
  initialTime?: string
  availablePlatforms?: string[] // For universal posts
}

export default function ScheduleConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  platform, 
  content, 
  initialDate = '',
  initialTime = '', 
  availablePlatforms = []
}: ScheduleConfirmationModalProps) {
  const [scheduleDate, setScheduleDate] = useState(initialDate)
  const [scheduleTime, setScheduleTime] = useState(initialTime)
  const [isImmediate, setIsImmediate] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(platform === 'universal' ? availablePlatforms[0] : platform)
  
  const isUniversalPost = platform === 'universal'
  const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter
  }
  
  const platformColors = {
    instagram: 'bg-pink-100 text-pink-600 border-pink-200',
    facebook: 'bg-blue-100 text-blue-600 border-blue-200', 
    twitter: 'bg-sky-100 text-sky-600 border-sky-200'
  }

  if (!isOpen) return null

  const getCombinedDateTime = () => {
    if (!scheduleDate) return null
    const time = scheduleTime || '09:00'
    const dateTime = `${scheduleDate}T${time}`
    return new Date(dateTime).toISOString()
  }

  const getFormattedDateTime = () => {
    if (!scheduleDate) return 'No date selected'
    const time = scheduleTime || '09:00'
    const dateTime = new Date(`${scheduleDate}T${time}`)
    return dateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isValidScheduleTime = () => {
    if (!scheduleDate) return false
    const now = new Date()
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime || '09:00'}`)
    return scheduledDateTime > now
  }

  const handleConfirm = () => {
    if (isImmediate) {
      onConfirm({ scheduledFor: null, isImmediate: true, selectedPlatform: selectedPlatform })
    } else {
      const scheduledFor = getCombinedDateTime()
      onConfirm({ scheduledFor, isImmediate: false, selectedPlatform: selectedPlatform })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Schedule Post</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Platform Selection for Universal Posts */}
          {isUniversalPost && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Platform to Post To:
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map(platformId => {
                  const Icon = platformIcons[platformId as keyof typeof platformIcons]
                  const colorClass = platformColors[platformId as keyof typeof platformColors]
                  const isSelected = selectedPlatform === platformId
                  
                  return (
                    <button
                      key={platformId}
                      onClick={() => setSelectedPlatform(platformId)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        isSelected 
                          ? colorClass + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="text-sm font-medium capitalize">{platformId}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {isUniversalPost ? `${selectedPlatform} Post:` : `${platform} Post:`}
              </span>
            </div>
            <p className="text-sm text-gray-900 line-clamp-3">{content}</p>
          </div>

          {/* Scheduling Options */}
          <div className="space-y-4 mb-6">
            {/* Post Now Option */}
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="schedule-type"
                checked={isImmediate}
                onChange={() => setIsImmediate(true)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Post Immediately</div>
                  <div className="text-sm text-gray-600">Publish this post right now</div>
                </div>
              </div>
            </label>

            {/* Schedule Later Option */}
            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="schedule-type"
                checked={!isImmediate}
                onChange={() => setIsImmediate(false)}
                className="w-4 h-4 text-blue-600 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Schedule for Later</div>
                    <div className="text-sm text-gray-600">Choose a specific date and time</div>
                  </div>
                </div>
                
                {!isImmediate && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
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
                )}
              </div>
            </label>
          </div>

          {/* Schedule Preview */}
          {!isImmediate && scheduleDate && (
            <div className={`p-4 rounded-lg mb-6 ${
              isValidScheduleTime() 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {isValidScheduleTime() ? (
                  <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <div className={`font-medium mb-1 ${
                    isValidScheduleTime() ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isValidScheduleTime() ? 'Scheduled for:' : 'Invalid Schedule Time'}
                  </div>
                  <div className={`text-sm ${
                    isValidScheduleTime() ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isValidScheduleTime() 
                      ? getFormattedDateTime()
                      : 'Please select a future date and time'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isImmediate && !isValidScheduleTime()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isImmediate ? 'Post Now' : 'Schedule Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}