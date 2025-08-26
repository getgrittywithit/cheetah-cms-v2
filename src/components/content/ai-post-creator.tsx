'use client'

import { useState, useEffect } from 'react'
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
  X,
  BookmarkPlus
} from 'lucide-react'
import ScheduleConfirmationModal from './schedule-confirmation-modal'

interface GeneratedPost {
  platform: string
  content: string
  hashtags: string[]
  suggestions: string[]
  imageUrl?: string
}

interface AIPostCreatorProps {
  brandName: string
  brandSlug: string
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

export default function AIPostCreator({ brandName, brandSlug, onSchedulePost }: AIPostCreatorProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'facebook'])
  const [visiblePosts, setVisiblePosts] = useState<{[platform: string]: boolean}>({})
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [selectedImages, setSelectedImages] = useState<{[platform: string]: File | null}>({})
  const [imageUrls, setImageUrls] = useState<{[platform: string]: string}>({})
  const [uploadingImages, setUploadingImages] = useState<{[platform: string]: boolean}>({})
  const [postingStates, setPostingStates] = useState<{[platform: string]: boolean}>({})
  const [postingSuccess, setPostingSuccess] = useState<{[platform: string]: boolean}>({})
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPostForScheduling, setSelectedPostForScheduling] = useState<GeneratedPost | null>(null)
  const [savedDrafts, setSavedDrafts] = useState<{[platform: string]: string}>({}) // Store manually saved draft IDs
  const [savingDraft, setSavingDraft] = useState(false)
  const [generatingImages, setGeneratingImages] = useState<{[platform: string]: boolean}>({})

  // Helper to get combined datetime
  const getCombinedDateTime = () => {
    if (!scheduleDate) return null
    const time = scheduleTime || '09:00'
    const dateTime = `${scheduleDate}T${time}`
    return new Date(dateTime).toISOString()
  }

  // Set default time to current time + 1 hour when component mounts
  useEffect(() => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const timeString = oneHourLater.toTimeString().slice(0, 5)
    setScheduleTime(timeString)
  }, [])

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'twitter', name: 'Twitter', icon: Twitter }
  ]

  const generatePosts = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      // First, generate captions only (no images)
      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          brand: brandName,
          brandSlug: brandSlug,
          platforms: selectedPlatforms
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedPosts(data.posts)
        
        // Set all generated posts as visible by default
        const newVisibility: {[platform: string]: boolean} = {}
        data.posts.forEach((post: GeneratedPost) => {
          newVisibility[post.platform] = true
        })
        setVisiblePosts(newVisibility)

        // Clear any previous save states since we're not auto-saving
        setSavedDrafts({})
      }
    } catch (error) {
      console.error('Failed to generate posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manually save draft when user clicks "Save as Draft"
  const saveDraft = async () => {
    if (generatedPosts.length === 0) return
    
    setSavingDraft(true)
    try {
      const post = generatedPosts[0] // Universal post or first post
      const isUniversal = post.platform === 'universal'
      const targetPlatforms = isUniversal ? selectedPlatforms : [post.platform]
      
      // For universal posts, create drafts for each selected platform
      for (const platform of targetPlatforms) {
        const draftData = {
          brandId: brandSlug,
          platform: platform,
          content: post.content,
          hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
          media: imageUrls[isUniversal ? 'universal' : platform] ? [imageUrls[isUniversal ? 'universal' : platform]] : [],
          status: 'draft'
        }

        const response = await fetch('/api/marketing/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData)
        })

        const result = await response.json()
        if (result.success) {
          setSavedDrafts(prev => ({ 
            ...prev, 
            [platform]: result.post.id 
          }))
          console.log(`Saved draft for ${platform}:`, result.post.id)
        } else {
          console.error(`Failed to save draft for ${platform}:`, result.error)
        }
      }
    } catch (error) {
      console.error('Failed to save drafts:', error)
    } finally {
      setSavingDraft(false)
    }
  }


  // Generate AI image for a specific platform or universal post
  const generateImageForPlatform = async (platform: string) => {
    if (!prompt.trim()) return

    setGeneratingImages(prev => ({ ...prev, [platform]: true }))
    try {
      // Find the post content for context
      const post = generatedPosts.find(p => p.platform === platform || p.platform === 'universal')
      let imagePrompt = prompt
      
      // For Daily Dish Dash, create detailed food photography prompts
      if (brandSlug === 'daily-dish-dash') {
        imagePrompt = `Professional food photography of delicious ${prompt}, hyper-realistic, magazine quality, appetizing presentation, vibrant colors, perfect studio lighting, shallow depth of field, gourmet food styling, commercial kitchen photography, mouth-watering, restaurant quality plating on elegant dishware`
        
        // Add cooking context from the recipe if available (but keep it concise for DALL-E)
        if (post?.content) {
          // Extract key cooking terms from the recipe
          const contentPreview = post.content.substring(0, 150).toLowerCase()
          const cookingTerms = contentPreview.match(/(grilled|baked|roasted|sautéed|fried|steamed|fresh|seasoned|crispy|tender|juicy)/g)
          if (cookingTerms && cookingTerms.length > 0) {
            imagePrompt += `, ${cookingTerms.slice(0, 3).join(', ')}`
          }
        }
      } else {
        // For other brands, use original prompt with some context
        imagePrompt = prompt + (post?.content ? ` - ${post.content.substring(0, 100)}` : '')
      }
      
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          brand: brandName,
          brandSlug: brandSlug,
          style: brandSlug === 'daily-dish-dash' ? 'vivid' : 'natural',
          size: '1024x1024',
          quality: 'hd'
        })
      })

      const data = await response.json()
      if (data.success) {
        setImageUrls(prev => ({ ...prev, [platform]: data.imageUrl }))
        
        // Image generated successfully - no auto-save needed
      } else {
        console.error('Failed to generate image:', data.error)
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setGeneratingImages(prev => ({ ...prev, [platform]: false }))
    }
  }

  const generateForAdditionalPlatform = async (platformId: string) => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          brand: brandName,
          platforms: [platformId]
        })
      })

      const data = await response.json()
      if (data.success && data.posts.length > 0) {
        const newPost = data.posts[0]
        
        // Add to existing posts
        setGeneratedPosts(prev => [...prev, newPost])
        
        // Set as visible
        setVisiblePosts(prev => ({ ...prev, [platformId]: true }))
        
        // Additional post generated successfully - no auto-save needed
      }
    } catch (error) {
      console.error('Failed to generate additional post:', error)
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
    
    // Content updated - no auto-save needed
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

      // Image uploaded successfully - no auto-save needed
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

  const handleOpenScheduleModal = (post: GeneratedPost) => {
    setSelectedPostForScheduling(post)
    setShowScheduleModal(true)
  }

  const handleScheduleConfirm = async (scheduleData: { scheduledFor: string | null, isImmediate: boolean, selectedPlatform?: string }) => {
    if (!selectedPostForScheduling) return
    
    // For universal posts, use the selected platform; otherwise use the original platform
    const targetPlatform = scheduleData.selectedPlatform || selectedPostForScheduling.platform
    const platform = selectedPostForScheduling.platform // For UI state management
    
    setPostingStates(prev => ({ ...prev, [platform]: true }))
    setPostingSuccess(prev => ({ ...prev, [platform]: false }))
    
    try {
      await onSchedulePost({
        platform: targetPlatform, // Use the actual target platform for publishing
        content: selectedPostForScheduling.content,
        hashtags: selectedPostForScheduling.hashtags.join(' '),
        scheduledFor: scheduleData.scheduledFor,
        imageUrl: imageUrls[platform] || imageUrls['universal'], // Try both platform-specific and universal image
        isImmediate: scheduleData.isImmediate
      })
      
      setPostingSuccess(prev => ({ ...prev, [platform]: true }))
      
      // Clear success state after 3 seconds
      setTimeout(() => {
        setPostingSuccess(prev => ({ ...prev, [platform]: false }))
      }, 3000)
      
    } catch (error) {
      console.error('Failed to schedule post:', error)
    } finally {
      setPostingStates(prev => ({ ...prev, [platform]: false }))
      setSelectedPostForScheduling(null)
    }
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-600"
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
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Universal Post is Ready! 🎉</h3>
              <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <Check className="w-3 h-3" />
                <span>Same content for all platforms</span>
              </div>
              
              {/* Platform Toggle Controls */}
              <div className="flex items-center space-x-2">
                {generatedPosts.map(post => {
                  const platform = platforms.find(p => p.id === post.platform)
                  if (!platform) return null
                  const Icon = platform.icon
                  return (
                    <button
                      key={post.platform}
                      onClick={() => setVisiblePosts(prev => ({ ...prev, [post.platform]: !prev[post.platform] }))}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        visiblePosts[post.platform]
                          ? platformColors[post.platform as keyof typeof platformColors]
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{platform.name}</span>
                    </button>
                  )
                })}
                
                {/* Add Missing Platforms */}
                {platforms.filter(p => !generatedPosts.some(post => post.platform === p.id)).map(platform => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => generateForAdditionalPlatform(platform.id)}
                      disabled={loading}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50"
                    >
                      <Icon className="w-3 h-3" />
                      <span>+ {platform.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-purple-50 px-4 py-3 rounded-lg">
              <Clock className="w-4 h-4 text-purple-600" />
              <label className="text-sm font-medium text-purple-900">Schedule for:</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="text-sm border border-purple-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
                min={new Date().toISOString().slice(0, 10)}
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="text-sm border border-purple-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
                placeholder="09:00"
              />
            </div>
          </div>

          {generatedPosts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {generatedPosts.map(post => {
                // Handle universal post vs individual posts
                const isUniversal = post.platform === 'universal'
                const targetPlatforms = isUniversal ? (post as any).platforms : [post.platform]
                const isEditing = editingPost === (isUniversal ? 'universal' : post.platform)
                
                return (
                  <div key={isUniversal ? 'universal' : post.platform}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {isUniversal ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded bg-purple-100 text-purple-600">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <h4 className="font-medium text-gray-900">Universal Post</h4>
                              <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                <span>For: {targetPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {(() => {
                              const platform = platforms.find(p => p.id === post.platform)
                              const PlatformIcon = platform?.icon || Instagram
                              return (
                                <div className={`p-2 rounded ${platformColors[post.platform as keyof typeof platformColors]}`}>
                                  <PlatformIcon className="w-5 h-5" />
                                </div>
                              )
                            })()}
                            <h4 className="font-medium text-gray-900 capitalize">{post.platform}</h4>
                          </>
                        )}
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
                          onClick={() => setEditingPost(isEditing ? null : (isUniversal ? 'universal' : post.platform))}
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
                        onChange={(e) => updatePostContent(isUniversal ? 'universal' : post.platform, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                        rows={8}
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
                      {imageUrls[isUniversal ? 'universal' : post.platform] ? (
                    <div className="relative">
                        <img 
                          src={imageUrls[isUniversal ? 'universal' : post.platform]} 
                          alt="Post image" 
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        />
                      {post.imageUrl && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Generated</span>
                        </div>
                      )}
                        <button
                          onClick={() => removeImage(isUniversal ? 'universal' : post.platform)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                        {/* AI Image Generation Button */}
                        <button
                          onClick={() => generateImageForPlatform(isUniversal ? 'universal' : post.platform)}
                          disabled={generatingImages[isUniversal ? 'universal' : post.platform] || !prompt.trim()}
                        className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {generatingImages[isUniversal ? 'universal' : post.platform] ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating AI Image...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate AI Image</span>
                          </>
                        )}
                      </button>
                      
                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                      </div>
                      
                      {/* Manual Upload Option */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(isUniversal ? 'universal' : post.platform, file)
                          }}
                          className="hidden"
                          id={`image-upload-${isUniversal ? 'universal' : post.platform}`}
                        />
                        <label htmlFor={`image-upload-${isUniversal ? 'universal' : post.platform}`} className="cursor-pointer">
                          {uploadingImages[isUniversal ? 'universal' : post.platform] ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                              <span className="text-sm text-gray-700">Uploading...</span>
                            </div>
                          ) : (
                            <div>
                              <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-700">Upload your own image</p>
                              <p className="text-xs text-gray-600 mt-1">JPG, PNG, GIF up to 10MB</p>
                            </div>
                          )}
                        </label>
                      </div>
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
                    {postingStates[isUniversal ? 'universal' : post.platform] ? (
                      <button
                        disabled
                        className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium cursor-not-allowed"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </button>
                    ) : postingSuccess[isUniversal ? 'universal' : post.platform] ? (
                      <button
                        disabled
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        <span>Posted Successfully!</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenScheduleModal(post)}
                          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium"
                        >
                          <Send className="w-4 h-4" />
                          <span>Post Now</span>
                        </button>
                        
                        <button
                          onClick={() => handleOpenScheduleModal(post)}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Schedule Post</span>
                        </button>
                        
                        {/* Save as Draft Button */}
                        {Object.keys(savedDrafts).length > 0 ? (
                          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2.5 rounded-lg border border-green-200">
                            <Check className="w-4 h-4" />
                            <span className="font-medium">Saved as Draft</span>
                          </div>
                        ) : (
                          <button
                            onClick={saveDraft}
                            disabled={savingDraft}
                            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {savingDraft ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <BookmarkPlus className="w-4 h-4" />
                            )}
                            <span>{savingDraft ? 'Saving...' : 'Save as Draft'}</span>
                          </button>
                        )}
                      </>
                    )}
                    
                    {isEditing && !postingStates[isUniversal ? 'universal' : post.platform] && (
                      <button
                        onClick={() => setEditingPost(null)}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {scheduleDate && scheduleTime ? (
                      <span>Scheduled for: <span className="font-medium text-gray-700">{new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}</span></span>
                    ) : (
                      <span>Posting to: <span className="font-medium text-gray-700 capitalize">{isUniversal ? targetPlatforms.join(', ') : post.platform}</span></span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )}

      {/* Schedule Confirmation Modal */}
      {showScheduleModal && selectedPostForScheduling && (
        <ScheduleConfirmationModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false)
            setSelectedPostForScheduling(null)
          }}
          onConfirm={handleScheduleConfirm}
          platform={selectedPostForScheduling.platform}
          content={selectedPostForScheduling.content}
          initialDate={scheduleDate}
          initialTime={scheduleTime}
          availablePlatforms={selectedPostForScheduling.platform === 'universal' ? (selectedPostForScheduling as any).platforms || selectedPlatforms : []}
        />
      )}
    </div>
  )
}