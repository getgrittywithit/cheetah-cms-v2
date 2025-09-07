'use client'

import { useState } from 'react'
import { Upload, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react'

interface MockupGeneratorProps {
  productSyncId: string
  productName: string
  brandSlug: string
  onComplete: () => void
}

export default function MockupGenerator({ 
  productSyncId, 
  productName, 
  brandSlug,
  onComplete 
}: MockupGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [designPreview, setDesignPreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesignFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setDesignPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateMockups = async () => {
    if (!designFile) return

    setIsGenerating(true)
    setStatus('Uploading design...')

    try {
      // First, upload the design to R2 or your storage
      const formData = new FormData()
      formData.append('file', designFile)
      
      const uploadResponse = await fetch(`/api/brands/${brandSlug}/upload`, {
        method: 'POST',
        body: formData
      })
      
      const { url: designUrl } = await uploadResponse.json()
      
      // Then generate mockups
      setStatus('Generating mockups for all variants...')
      
      const mockupResponse = await fetch(`/api/brands/${brandSlug}/products/generate-mockups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designUrl,
          productSyncId
        })
      })

      const result = await mockupResponse.json()
      
      if (result.success) {
        setStatus(`✅ Generated mockups for ${result.productsUpdated} products!`)
        setTimeout(() => {
          setIsOpen(false)
          onComplete()
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to generate mockups')
      }
      
    } catch (error) {
      console.error('Error generating mockups:', error)
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Failed to generate mockups'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        <ImageIcon className="w-4 h-4" />
        <span>Generate Mockups</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">
              Generate Mockups for {productName}
            </h3>
            
            <div className="space-y-4">
              {/* Design Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Your Design
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {designPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={designPreview} 
                        alt="Design preview" 
                        className="max-h-48 mx-auto"
                      />
                      <button
                        onClick={() => {
                          setDesignFile(null)
                          setDesignPreview(null)
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload design
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: PNG or JPG, at least 1800x2400px
                </p>
              </div>

              {/* Status */}
              {status && (
                <div className="p-3 bg-gray-100 rounded-lg text-sm">
                  {status}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={generateMockups}
                  disabled={!designFile || isGenerating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Generate Mockups
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">What this does:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Uploads your design to Printful</li>
                <li>Generates product mockups for ALL variants</li>
                <li>Updates all variant images automatically</li>
                <li>Perfect for bulk updating product photos</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}