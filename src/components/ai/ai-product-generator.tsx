'use client'

import { useState, useEffect } from 'react'
import { Wand2, Send, Copy, RefreshCw, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { aiProductGenerator, type ProductGenerationRequest, type GeneratedProductData } from '@/lib/ai-product-generator'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIProductGeneratorProps {
  productName: string
  productImage?: string
  variants?: Array<{
    name: string
    sku: string
    price: number
  }>
  onDataGenerated: (data: GeneratedProductData) => void
  onClose: () => void
}

export default function AIProductGenerator({ 
  productName, 
  productImage, 
  variants,
  onDataGenerated, 
  onClose 
}: AIProductGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [chatMode, setChatMode] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedProductData | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [productContext, setProductContext] = useState({
    productType: '',
    brandContext: '',
    targetAudience: '',
    additionalDetails: ''
  })

  const generateInitialContent = async () => {
    setGenerating(true)
    try {
      const request: ProductGenerationRequest = {
        productName,
        variants,
        ...productContext
      }

      const data = await aiProductGenerator.generateProductData(request)
      setGeneratedData(data)
      
      setChatMessages([{
        role: 'assistant',
        content: `I've generated complete product details for "${productName}". Review the content below and let me know if you'd like any changes!`,
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate product content. Please check your OpenAI API configuration.')
    } finally {
      setGenerating(false)
    }
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || !generatedData) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setGenerating(true)

    try {
      const updatedData = await aiProductGenerator.refineProductData(generatedData, chatInput)
      setGeneratedData(updatedData)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `I've updated the product details based on your feedback. The changes have been applied to the content below.`,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat refinement failed:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that request. Please try rephrasing or check your API configuration.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleUseGenerated = () => {
    if (generatedData) {
      onDataGenerated(generatedData)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold">AI Product Generator</h2>
              <p className="text-sm text-gray-600">Generate Shopify product details for: {productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Context & Controls */}
          <div className="w-1/3 border-r p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Product Image */}
              {productImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Context Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <input
                  type="text"
                  value={productContext.productType}
                  onChange={(e) => setProductContext(prev => ({ ...prev, productType: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Canvas print, t-shirt, mug..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Context</label>
                <textarea
                  value={productContext.brandContext}
                  onChange={(e) => setProductContext(prev => ({ ...prev, brandContext: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-20"
                  placeholder="What's the story behind this product?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={productContext.targetAudience}
                  onChange={(e) => setProductContext(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Fitness enthusiasts, entrepreneurs..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                <textarea
                  value={productContext.additionalDetails}
                  onChange={(e) => setProductContext(prev => ({ ...prev, additionalDetails: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-20"
                  placeholder="Special features, size info, materials..."
                />
              </div>

              {!generatedData && (
                <button
                  onClick={generateInitialContent}
                  disabled={generating}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {generating ? 'Generating...' : 'Generate Product Details'}
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Generated Content & Chat */}
          <div className="flex-1 flex flex-col">
            {generatedData ? (
              <>
                {/* Generated Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <div className="relative">
                            <p className="text-sm bg-white p-2 rounded border">{generatedData.title}</p>
                            <button onClick={() => copyToClipboard(generatedData.title)} className="absolute top-1 right-1 text-gray-400 hover:text-gray-600">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.category}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description (HTML)</label>
                        <div className="relative">
                          <div className="text-sm bg-white p-3 rounded border h-24 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: generatedData.description }} />
                          </div>
                          <button onClick={() => copyToClipboard(generatedData.description)} className="absolute top-1 right-1 text-gray-400 hover:text-gray-600">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                          <p className="text-sm bg-white p-2 rounded border">${generatedData.price}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Cost per Item</label>
                          <p className="text-sm bg-white p-2 rounded border">${generatedData.costPerItem || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Charges Tax</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.chargesTax ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Inventory & Shipping */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Inventory & Shipping</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.sku}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.weight} {generatedData.weightUnit}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Track Quantity</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.trackQuantity ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Organization</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Type & Vendor</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.type} • {generatedData.vendor}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                          <p className="text-sm bg-white p-2 rounded border capitalize">{generatedData.status}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Collections</label>
                          <div className="flex flex-wrap gap-1">
                            {generatedData.collections.map((collection, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {collection}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                          <div className="flex flex-wrap gap-1">
                            {generatedData.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">SEO & Publishing</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">SEO Title (70 chars)</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.seoTitle}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">SEO Description (160 chars)</label>
                          <p className="text-sm bg-white p-2 rounded border">{generatedData.seoDescription}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">URL Handle</label>
                            <p className="text-sm bg-white p-2 rounded border">{generatedData.urlHandle}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Sales Channels</label>
                            <p className="text-sm bg-white p-2 rounded border">{generatedData.salesChannels.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="border-t p-4">
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Refine with AI Chat</span>
                    </div>
                    
                    {chatMessages.length > 1 && (
                      <div className="max-h-24 overflow-y-auto space-y-2 mb-3">
                        {chatMessages.slice(1).map((message, index) => (
                          <div key={index} className={`text-xs p-2 rounded ${
                            message.role === 'user' 
                              ? 'bg-blue-100 text-blue-800 ml-8' 
                              : 'bg-gray-100 text-gray-800 mr-8'
                          }`}>
                            <span className="font-medium">{message.role === 'user' ? 'You' : 'AI'}:</span> {message.content}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatMessage()}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Ask me to adjust the title, description, tags, etc..."
                        disabled={generating}
                      />
                      <button
                        onClick={handleChatMessage}
                        disabled={generating || !chatInput.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={generateInitialContent}
                      disabled={generating}
                      className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate All
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUseGenerated}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Use This Content
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Wand2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Ready to generate product details</p>
                  <p className="text-sm text-gray-400">Fill in the context form and click generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}