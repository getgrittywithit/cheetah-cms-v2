'use client'

import { useState } from 'react'
import { Upload, Wand2, ShoppingCart } from 'lucide-react'

interface WallArtSize {
  name: string
  dimensions: string
  aspectRatio: string
  price: number
  popular?: boolean
}

// You'll provide the actual sizes and pricing
const WALL_ART_SIZES: WallArtSize[] = [
  { name: 'Small', dimensions: '12" × 18"', aspectRatio: '2:3', price: 25, popular: true },
  { name: 'Medium', dimensions: '16" × 24"', aspectRatio: '2:3', price: 35, popular: true },
  { name: 'Large', dimensions: '24" × 36"', aspectRatio: '2:3', price: 55 },
  { name: 'Extra Large', dimensions: '30" × 45"', aspectRatio: '2:3', price: 75 },
]

export default function WallArtCreator() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [concept, setConcept] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['Medium'])
  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // TODO: Validate 2:3 aspect ratio
      // TODO: Auto-enhance with Topaz AI
    }
  }

  const handleGenerateContent = async () => {
    if (!selectedImage || !concept) return
    
    setIsGenerating(true)
    try {
      // TODO: Call AI API to generate optimized content
      // For now, mock the response
      setTimeout(() => {
        setGeneratedContent({
          title: `${concept} - Motivational Wall Art Print`,
          description: `Transform your space with this inspiring ${concept.toLowerCase()} wall art. High-quality print perfect for home, office, or gym motivation. Available in multiple sizes to fit any space.`,
          tags: ['wall art', 'motivational', 'inspirational', 'home decor', concept.toLowerCase()]
        })
        setIsGenerating(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to generate content:', error)
      setIsGenerating(false)
    }
  }

  const handlePublishToShopify = async () => {
    setIsUploading(true)
    try {
      // TODO: Upload to Shopify with variants for each size
      const productData = {
        title: generatedContent.title,
        body_html: generatedContent.description,
        images: [selectedImage],
        variants: selectedSizes.map(sizeName => {
          const size = WALL_ART_SIZES.find(s => s.name === sizeName)
          return {
            title: `${generatedContent.title} - ${size?.dimensions}`,
            price: size?.price,
            sku: `${concept.replace(/\s+/g, '-').toLowerCase()}-${size?.name.toLowerCase()}`,
            inventory_quantity: 100,
            weight: 0.5,
            weight_unit: 'lb'
          }
        }),
        tags: generatedContent.tags.join(', '),
        product_type: 'Wall Art',
        vendor: 'Grit Collective'
      }
      
      console.log('Would publish to Shopify:', productData)
      // TODO: Actual Shopify API call
      setIsUploading(false)
      alert('Product would be published to Shopify!')
    } catch (error) {
      console.error('Failed to publish:', error)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">2:3 Wall Art Creator</h2>
        <p className="text-gray-600">Optimized workflow for creating motivational wall art prints</p>
      </div>

      {/* Step 1: Image Upload */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">1. Upload Your Design</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              Drop your 2:3 ratio image here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 2400×3600px for best quality
            </p>
          </label>
        </div>
        
        {selectedImage && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">✅ Image uploaded: {selectedImage.name}</p>
            <p className="text-sm text-green-600">Ready for AI enhancement</p>
          </div>
        )}
      </div>

      {/* Step 2: Concept */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">2. Product Concept</h3>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., Motivational Mountain Landscape, Inspirational Quote Design..."
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Step 3: Size Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">3. Available Sizes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WALL_ART_SIZES.map((size) => (
            <div
              key={size.name}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedSizes.includes(size.name)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedSizes(prev => 
                  prev.includes(size.name)
                    ? prev.filter(s => s !== size.name)
                    : [...prev, size.name]
                )
              }}
            >
              <div className="text-center">
                <h4 className="font-medium">{size.name}</h4>
                <p className="text-sm text-gray-600">{size.dimensions}</p>
                <p className="text-lg font-semibold text-green-600">${size.price}</p>
                {size.popular && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Popular
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4: Generate Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">4. AI-Generated Content</h3>
        
        {!generatedContent.title ? (
          <button
            onClick={handleGenerateContent}
            disabled={!selectedImage || !concept || isGenerating}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Product Content'}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product Title</label>
              <input
                value={generatedContent.title}
                onChange={(e) => setGeneratedContent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={generatedContent.description}
                onChange={(e) => setGeneratedContent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg h-24"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <input
                value={generatedContent.tags.join(', ')}
                onChange={(e) => setGeneratedContent(prev => ({ ...prev, tags: e.target.value.split(', ') }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 5: Publish */}
      {generatedContent.title && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">5. Publish to Shopify</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Publishing Summary:</h4>
            <ul className="text-sm space-y-1">
              <li>• Product: {generatedContent.title}</li>
              <li>• Sizes: {selectedSizes.join(', ')}</li>
              <li>• Price range: ${Math.min(...selectedSizes.map(s => WALL_ART_SIZES.find(size => size.name === s)?.price || 0))} - ${Math.max(...selectedSizes.map(s => WALL_ART_SIZES.find(size => size.name === s)?.price || 0))}</li>
            </ul>
          </div>
          
          <button
            onClick={handlePublishToShopify}
            disabled={isUploading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isUploading ? 'Publishing...' : 'Publish to Shopify'}
          </button>
        </div>
      )}
    </div>
  )
}