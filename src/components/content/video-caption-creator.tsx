'use client'

import { useState } from 'react'
import { 
  Upload, 
  Video, 
  Instagram, 
  Facebook, 
  Youtube,
  Copy,
  Check,
  Loader2,
  FileVideo,
  Sparkles,
  Info,
  CheckSquare,
  Square
} from 'lucide-react'

interface VideoPlatform {
  id: string
  name: string
  icon: React.ElementType
  color: string
  maxLength: number
  tips: string[]
  isManual: boolean
}

interface GeneratedCaption {
  platform: string
  caption: string
  hashtags: string[]
  posted: boolean
}

interface VideoCaptionCreatorProps {
  brandName: string
  brandGuidelines: any
}

const videoPlatforms: VideoPlatform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video,
    color: 'bg-black text-white',
    maxLength: 2200,
    tips: ['Hook viewers in first 3 seconds', 'Use trending sounds', 'Keep it authentic'],
    isManual: true
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600 text-white',
    maxLength: 5000,
    tips: ['Include timestamps for chapters', 'Add relevant keywords', 'Strong CTA'],
    isManual: true
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 text-white',
    maxLength: 63206,
    tips: ['Tell a story', 'Ask questions', 'Native uploads perform better'],
    isManual: false
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    maxLength: 2200,
    tips: ['Use 3-5 hashtags', 'Add music from Instagram library', 'Vertical format only'],
    isManual: true
  }
]

export default function VideoCaptionCreator({ brandName, brandGuidelines }: VideoCaptionCreatorProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoDescription, setVideoDescription] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram'])
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaption[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    }
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const generateCaptions = async () => {
    if (!videoDescription.trim() || selectedPlatforms.length === 0) return

    setLoading(true)
    try {
      // Generate captions for selected platforms
      const captions: GeneratedCaption[] = selectedPlatforms.map(platformId => {
        const platform = videoPlatforms.find(p => p.id === platformId)!
        return {
          platform: platformId,
          caption: `Sample caption for ${platform.name}: ${videoDescription}`,
          hashtags: ['#GritCollective', '#Motivation', '#HomeDecor'],
          posted: false
        }
      })
      
      setGeneratedCaptions(captions)
    } catch (error) {
      console.error('Failed to generate captions:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCaption = (caption: string, hashtags: string[], platformId: string) => {
    const fullText = `${caption}\n\n${hashtags.join(' ')}`
    navigator.clipboard.writeText(fullText)
    setCopiedPlatform(platformId)
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Video Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Video className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Video Caption Creator</h2>
          <span className="text-sm text-gray-700">for {brandName}</span>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Video (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer">
              {videoFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileVideo className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{videoFile.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Drop video here or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI up to 100MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Video Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your video content
          </label>
          <textarea
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            placeholder="Tell us about your video... What's the main message? What products are featured? What mood should it convey?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Platform Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platforms
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {videoPlatforms.map(platform => {
              const Icon = platform.icon
              const isSelected = selectedPlatforms.includes(platform.id)
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`inline-flex p-2 rounded-lg ${platform.color} mb-2`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{platform.name}</p>
                    <p className="text-xs text-gray-600">{platform.maxLength} chars</p>
                    {platform.isManual && (
                      <p className="text-xs text-orange-600 mt-1">Manual posting</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckSquare className="absolute top-2 right-2 w-4 h-4 text-purple-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateCaptions}
          disabled={loading || !videoDescription.trim() || selectedPlatforms.length === 0}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>{loading ? 'Generating Captions...' : 'Generate Video Captions'}</span>
        </button>
      </div>

      {/* Generated Captions */}
      {generatedCaptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Video Captions</h3>
          {generatedCaptions.map(caption => {
            const platform = videoPlatforms.find(p => p.id === caption.platform)!
            const Icon = platform.icon
            const isCopied = copiedPlatform === caption.platform
            
            return (
              <div key={caption.platform} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${platform.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-600">Max {platform.maxLength} characters</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyCaption(caption.caption, caption.hashtags, caption.platform)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">{caption.caption}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                    <div className="flex flex-wrap gap-1">
                      {caption.hashtags.map((tag, index) => (
                        <span key={index} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {platform.tips.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform Tips</label>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <ul className="text-sm text-yellow-800 space-y-1">
                            {platform.tips.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}