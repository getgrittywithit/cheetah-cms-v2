'use client'

import { useState } from 'react'
import { 
  Send, 
  Sparkles, 
  Calendar, 
  Instagram, 
  Facebook, 
  Twitter, 
  Clock,
  Copy,
  Edit,
  Check,
  Loader2,
  ImagePlus,
  X
} from 'lucide-react'

interface GeneratedPost {
  platform: string
  content: string
  hashtags: string[]
  suggestions: string[]
  imageUrl?: string
}

interface AIPostCreatorProps {
  brandName: string
  onSchedulePost: (post: any) => void
}

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

export default function AIPostCreator({ brandName, onSchedulePost }: AIPostCreatorProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [selectedImages, setSelectedImages] = useState<{[platform: string]: File | null}>({})
  const [imageUrls, setImageUrls] = useState<{[platform: string]: string}>({})
  const [uploadingImages, setUploadingImages] = useState<{[platform: string]: boolean}>({})

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'twitter', name: 'Twitter', icon: Twitter }
  ]

  const generatePosts = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          brand: brandName,
          platforms: selectedPlatforms
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to generate posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const updatePostContent = (platform: string, newContent: string) => {
    setGeneratedPosts(prev => 
      prev.map(post => 
        post.platform === platform 
          ? { ...post, content: newContent }
          : post
      )
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleImageUpload = async (platform: string, file: File) => {
    setUploadingImages(prev => ({ ...prev, [platform]: true }))
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      // For now, create a local URL - in production you'd upload to your storage
      const imageUrl = URL.createObjectURL(file)
      setImageUrls(prev => ({ ...prev, [platform]: imageUrl }))
      setSelectedImages(prev => ({ ...prev, [platform]: file }))
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setUploadingImages(prev => ({ ...prev, [platform]: false }))
    }
  }

  const removeImage = (platform: string) => {
    if (imageUrls[platform]) {
      URL.revokeObjectURL(imageUrls[platform])
    }
    setImageUrls(prev => ({ ...prev, [platform]: '' }))
    setSelectedImages(prev => ({ ...prev, [platform]: null }))
  }

  const schedulePost = (post: GeneratedPost) => {
    onSchedulePost({
      platform: post.platform,
      content: post.content,
      hashtags: post.hashtags.join(' '),
      scheduledFor: scheduleDate,
      imageUrl: imageUrls[post.platform]
    })
  }

  return (
    <div className="space-y-6">
      {/* AI Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Post Creator</h2>
          <span className="text-sm text-gray-700">for {brandName}</span>
        </div>

        {/* Platform Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {platforms.map(platform => {
              const Icon = platform.icon
              const isSelected = selectedPlatforms.includes(platform.id)
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                    isSelected 
                      ? platformColors[platform.id as keyof typeof platformColors]
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conversation Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            What do you want to post about?
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell me what's on your mind... 

Examples:
• I just made this amazing 15-minute pasta dish with garlic and herbs
• Quick tip: add a pinch of salt to your coffee grounds for smoother brew
• What's your favorite meal prep recipe for busy weekdays?"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <button
              onClick={generatePosts}
              disabled={loading || !prompt.trim() || selectedPlatforms.length === 0}
              className="absolute bottom-3 right-3 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          {selectedPlatforms.length === 0 && (
            <p className="text-sm text-red-600">Please select at least one platform</p>
          )}
        </div>
      </div>

      {/* Generated Posts */}
      {generatedPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Posts Are Ready! 🎉</h3>
            <div className="flex items-center space-x-3 bg-purple-50 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-purple-600" />
              <label className="text-sm font-medium text-purple-900">Schedule for:</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="text-sm border border-purple-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {generatedPosts.map(post => {
            const Icon = platformIcons[post.platform as keyof typeof platformIcons]
            const isEditing = editingPost === post.platform
            
            return (
              <div key={post.platform} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${platformColors[post.platform as keyof typeof platformColors]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-gray-900 capitalize">{post.platform}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(post.content + '\n\n' + post.hashtags.join(' '))}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingPost(isEditing ? null : post.platform)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Edit post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                {isEditing ? (
                  <textarea
                    value={post.content}
                    onChange={(e) => updatePostContent(post.platform, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                    rows={6}
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                {/* Hashtags */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((tag, index) => (
                      <span key={index} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Image</label>
                  {imageUrls[post.platform] ? (
                    <div className="relative">
                      <img 
                        src={imageUrls[post.platform]} 
                        alt="Post image" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(post.platform)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(post.platform, file)
                        }}
                        className="hidden"
                        id={`image-upload-${post.platform}`}
                      />
                      <label htmlFor={`image-upload-${post.platform}`} className="cursor-pointer">
                        {uploadingImages[post.platform] ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                            <span className="text-sm text-gray-700">Uploading...</span>
                          </div>
                        ) : (
                          <div>
                            <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-700">Click to add an image</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {post.suggestions.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions</label>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {post.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    {scheduleDate ? (
                      <button
                        onClick={() => schedulePost(post)}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Post</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => schedulePost(post)}
                          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium"
                        >
                          <Send className="w-4 h-4" />
                          <span>Post Now</span>
                        </button>
                        <span className="text-sm text-gray-500">or set a date above to schedule</span>
                      </>
                    )}
                    
                    {isEditing && (
                      <button
                        onClick={() => setEditingPost(null)}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Posting to: <span className="font-medium text-gray-700 capitalize">{post.platform}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}