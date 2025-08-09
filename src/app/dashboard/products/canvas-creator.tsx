'use client'

import { useState } from 'react'
import { Upload, Wand2, ShoppingCart, RotateCcw } from 'lucide-react'

interface CanvasSize {
  name: string
  width: number
  height: number
  price: number
  shipping: number
  popular?: boolean
  weight?: string
}

interface CanvasRatio {
  id: string
  name: string
  ratio: string
  description: string
  sizes: CanvasSize[]
}

const CANVAS_RATIOS: CanvasRatio[] = [
  {
    id: 'square',
    name: 'Square',
    ratio: '1:1',
    description: 'Perfect for Instagram and social media',
    sizes: [
      { name: '8×8"', width: 8, height: 8, price: 14.95, shipping: 6.49, popular: true },
      { name: '10×10"', width: 10, height: 10, price: 16.50, shipping: 6.49, popular: true },
      { name: '12×12"', width: 12, height: 12, price: 21.50, shipping: 9.99, popular: true },
      { name: '16×16"', width: 16, height: 16, price: 27.50, shipping: 9.99 },
      { name: '18×18"', width: 18, height: 18, price: 29.25, shipping: 9.99 },
      { name: '20×20"', width: 20, height: 20, price: 34.00, shipping: 9.99 },
      { name: '24×24"', width: 24, height: 24, price: 42.00, shipping: 24.99 },
      { name: '30×30"', width: 30, height: 30, price: 60.00, shipping: 24.99 },
    ]
  },
  {
    id: 'portrait-4-5',
    name: '4:5 Portrait',
    ratio: '4:5',
    description: 'Classic portrait orientation',
    sizes: [
      { name: '8×10"', width: 8, height: 10, price: 15.50, shipping: 6.49, popular: true },
      { name: '11×14"', width: 11, height: 14, price: 17.00, shipping: 9.99, popular: true },
      { name: '16×20"', width: 16, height: 20, price: 28.00, shipping: 9.99, popular: true },
      { name: '24×30"', width: 24, height: 30, price: 49.50, shipping: 24.99 },
    ]
  },
  {
    id: 'portrait-3-4',
    name: '3:4 Portrait', 
    ratio: '3:4',
    description: 'Traditional frame proportions',
    sizes: [
      { name: '9×12"', width: 9, height: 12, price: 16.00, shipping: 6.49, popular: true },
      { name: '12×16"', width: 12, height: 16, price: 22.95, shipping: 9.99, popular: true },
      { name: '18×24"', width: 18, height: 24, price: 33.00, shipping: 9.99, popular: true },
      { name: '24×32"', width: 24, height: 32, price: 50.00, shipping: 24.99 },
      { name: '30×40"', width: 30, height: 40, price: 63.00, shipping: 24.99 },
    ]
  },
  {
    id: 'portrait-2-3',
    name: '2:3 Portrait',
    ratio: '2:3', 
    description: 'Modern wall art proportions',
    sizes: [
      { name: '8×12"', width: 8, height: 12, price: 15.95, shipping: 6.49, popular: true },
      { name: '12×18"', width: 12, height: 18, price: 24.50, shipping: 9.99, popular: true },
      { name: '16×24"', width: 16, height: 24, price: 30.50, shipping: 9.99, popular: true },
      { name: '20×30"', width: 20, height: 30, price: 36.00, shipping: 9.99 },
      { name: '24×36"', width: 24, height: 36, price: 51.00, shipping: 24.99 },
      { name: '32×48"', width: 32, height: 48, price: 89.00, shipping: 24.99 },
    ]
  },
  {
    id: 'panoramic-1-2',
    name: 'Panoramic 1:2',
    ratio: '1:2',
    description: 'Wide landscape format',
    sizes: [
      { name: '10×20"', width: 10, height: 20, price: 25.50, shipping: 9.99, popular: true },
      { name: '12×24"', width: 12, height: 24, price: 28.00, shipping: 9.99, popular: true },
      { name: '16×32"', width: 16, height: 32, price: 52.50, shipping: 24.99 },
      { name: '20×40"', width: 20, height: 40, price: 58.00, shipping: 24.99 },
      { name: '24×48"', width: 24, height: 48, price: 68.00, shipping: 24.99 },
    ]
  },
  {
    id: 'ultra-panoramic',
    name: 'Ultra Panoramic 1:3',
    ratio: '1:3',
    description: 'Ultra-wide cinematic format',
    sizes: [
      { name: '12×36"', width: 12, height: 36, price: 46.50, shipping: 24.99, popular: true },
      { name: '16×48"', width: 16, height: 48, price: 59.00, shipping: 24.99 },
      { name: '20×60"', width: 20, height: 60, price: 98.00, shipping: 86.99 },
    ]
  }
]

export default function CanvasCreator() {
  const [selectedRatio, setSelectedRatio] = useState<string>('portrait-2-3')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['12×18"'])
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [concept, setConcept] = useState('')
  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const currentRatio = CANVAS_RATIOS.find(r => r.id === selectedRatio)!
  const isRectangular = selectedRatio !== 'square'

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // TODO: Auto-detect aspect ratio and suggest best ratio
      // TODO: Auto-enhance with Topaz AI
    }
  }

  const handleGenerateContent = async () => {
    if (!selectedImage || !concept) return
    
    setIsGenerating(true)
    try {
      // TODO: Call AI API with canvas-specific prompts
      setTimeout(() => {
        setGeneratedContent({
          title: `${concept} - Canvas Wall Art`,
          description: `Transform your space with this inspiring ${concept.toLowerCase()} canvas print. Premium quality canvas with vibrant colors and sharp details. Ready to hang with gallery-style presentation.`,
          tags: ['canvas art', 'wall decor', 'motivational', concept.toLowerCase(), 'home decor', 'grit collective']
        })
        setIsGenerating(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to generate content:', error)
      setIsGenerating(false)
    }
  }

  const calculateDimensions = (size: CanvasSize) => {
    if (orientation === 'landscape' && isRectangular) {
      return { width: size.height, height: size.width }
    }
    return { width: size.width, height: size.height }
  }

  const handlePublishToShopify = async () => {
    setIsUploading(true)
    try {
      const selectedSizeObjects = selectedSizes.map(sizeName => 
        currentRatio.sizes.find(s => s.name === sizeName)!
      )

      const productData = {
        title: generatedContent.title,
        body_html: generatedContent.description,
        images: [selectedImage],
        variants: selectedSizeObjects.map(size => {
          const dims = calculateDimensions(size)
          return {
            title: `${generatedContent.title} - ${dims.width}×${dims.height}"`,
            price: size.price,
            sku: `canvas-${concept.replace(/\s+/g, '-').toLowerCase()}-${dims.width}x${dims.height}`,
            inventory_quantity: 100,
            weight: 1.5,
            weight_unit: 'lb'
          }
        }),
        tags: generatedContent.tags.join(', '),
        product_type: 'Canvas Print',
        vendor: 'Grit Collective'
      }
      
      console.log('Would publish to Shopify:', productData)
      setIsUploading(false)
      alert('Canvas product would be published to Shopify!')
    } catch (error) {
      console.error('Failed to publish:', error)
      setIsUploading(false)
    }
  }

  const totalPrice = selectedSizes.reduce((sum, sizeName) => {
    const size = currentRatio.sizes.find(s => s.name === sizeName)
    return sum + (size?.price || 0)
  }, 0)

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Canvas Creator</h2>
        <p className="text-gray-600">Professional canvas prints with premium quality and fast shipping</p>
      </div>

      {/* Step 1: Image Upload */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">1. Upload Your Design</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
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
              Drop your design here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 300 DPI recommended for best quality
            </p>
          </label>
        </div>
        
        {selectedImage && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">✅ Image uploaded: {selectedImage.name}</p>
            <p className="text-sm text-green-600">Ready for AI enhancement and ratio detection</p>
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
          placeholder="e.g., Mountain Sunrise Motivation, Workout Inspiration, Focus Quote..."
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Step 3: Ratio Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">3. Choose Canvas Ratio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CANVAS_RATIOS.map((ratio) => (
            <div
              key={ratio.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedRatio === ratio.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedRatio(ratio.id)
                setSelectedSizes([ratio.sizes.find(s => s.popular)?.name || ratio.sizes[0].name])
              }}
            >
              <h4 className="font-medium">{ratio.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{ratio.ratio}</p>
              <p className="text-xs text-gray-500">{ratio.description}</p>
            </div>
          ))}
        </div>

        {/* Orientation Toggle */}
        {isRectangular && (
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                orientation === 'portrait' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
              }`}
            >
              📱 Portrait
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                orientation === 'landscape' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
              }`}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              🖼️ Landscape
            </button>
          </div>
        )}
      </div>

      {/* Step 4: Size Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">4. Available Sizes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentRatio.sizes.map((size) => {
            const dims = calculateDimensions(size)
            const displayName = `${dims.width}×${dims.height}"`
            return (
              <div
                key={size.name}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedSizes.includes(size.name)
                    ? 'border-purple-500 bg-purple-50'
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
                  <h4 className="font-medium">{displayName}</h4>
                  <p className="text-lg font-semibold text-green-600">${size.price}</p>
                  <p className="text-xs text-gray-500">+ ${size.shipping} shipping</p>
                  {size.popular && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Popular
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {selectedSizes.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Selected: {selectedSizes.length} size{selectedSizes.length > 1 ? 's' : ''} • 
              Total: <span className="font-semibold text-green-600">${totalPrice.toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Step 5: Generate Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">5. AI-Generated Content</h3>
        
        {!generatedContent.title ? (
          <button
            onClick={handleGenerateContent}
            disabled={!selectedImage || !concept || isGenerating}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Canvas Content'}
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

      {/* Step 6: Publish */}
      {generatedContent.title && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">6. Publish to Shopify & Printful</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Publishing Summary:</h4>
            <ul className="text-sm space-y-1">
              <li>• Product: {generatedContent.title}</li>
              <li>• Ratio: {currentRatio.name} ({currentRatio.ratio})</li>
              <li>• Sizes: {selectedSizes.join(', ')}</li>
              <li>• Orientation: {orientation}</li>
              <li>• Total Value: ${totalPrice.toFixed(2)}</li>
            </ul>
          </div>
          
          <button
            onClick={handlePublishToShopify}
            disabled={isUploading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isUploading ? 'Publishing...' : 'Publish Canvas to Shopify'}
          </button>
        </div>
      )}
    </div>
  )
}