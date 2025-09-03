'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react'
import { getBrandConfig } from '@/lib/brand-config'

interface ProductVariant {
  id?: string
  name: string
  sku: string
  price: number
  size?: string
  color?: string
  stock?: number
}

export default function EditProductPage({ params }: { params: { brand: string, id: string } }) {
  const router = useRouter()
  const brandConfig = getBrandConfig(params.brand)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Product fields
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    status: 'draft' as 'draft' | 'active',
    featured_image: '',
    images: [] as string[],
    product_type: 'handmade' as 'handmade' | 'printful' | 'digital',
    primary_category_id: '',
    tags: [] as string[],
    seo_title: '',
    seo_description: '',
    slug: '',
    variants: [] as ProductVariant[]
  })

  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([]);
  
  // Product type options with user-friendly names
  const productTypes = [
    { value: 'handmade', label: 'Handcrafted' },
    { value: 'printful', label: 'Made to Order' },
    { value: 'digital', label: 'Digital Download' }
  ]

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/brands/${params.brand}/categories`)
      const data = await response.json()
      if (data.success && data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/brands/${params.brand}/products/${params.id}`)
      const data = await response.json()
      
      if (data.success && data.product) {
        setProduct({
          name: data.product.name || '',
          description: data.product.description || '',
          price: data.product.price || 0,
          status: data.product.status || 'draft',
          featured_image: data.product.featured_image || '',
          images: data.product.images || [],
          product_type: data.product.product_type || 'handmade',
          primary_category_id: data.product.primary_category_id || '',
          tags: data.product.tags || [],
          seo_title: data.product.seo_title || data.product.name || '',
          seo_description: data.product.seo_description || '',
          slug: data.product.slug || '',
          variants: data.product.variants || []
        })
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/brands/${params.brand}/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
      
      if (response.ok) {
        router.push(`/dashboard/${params.brand}/products`)
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setSaving(false)
    }
  }

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [...product.variants, {
        name: '',
        sku: '',
        price: product.price,
        size: '',
        stock: 0
      }]
    })
  }

  const removeVariant = (index: number) => {
    setProduct({
      ...product,
      variants: product.variants.filter((_, i) => i !== index)
    })
  }

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const newVariants = [...product.variants]
    newVariants[index] = { ...newVariants[index], ...updates }
    setProduct({ ...product, variants: newVariants })
  }

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'featured')

      const response = await fetch(`/api/brands/${params.brand}/products/${params.id}/images`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setProduct({ ...product, featured_image: data.imageUrl })
      }
    } catch (error) {
      console.error('Failed to upload featured image:', error)
    }
  }

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'additional')

      const response = await fetch(`/api/brands/${params.brand}/products/${params.id}/images`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setProduct({ 
          ...product, 
          images: [...product.images, data.imageUrl] 
        })
      }
    } catch (error) {
      console.error('Failed to upload additional image:', error)
    }
  }

  const removeAdditionalImage = async (index: number) => {
    const imageUrl = product.images[index]
    
    try {
      const response = await fetch(
        `/api/brands/${params.brand}/products/${params.id}/images?url=${encodeURIComponent(imageUrl)}&type=additional&index=${index}`, 
        { method: 'DELETE' }
      )

      if (response.ok) {
        setProduct({
          ...product,
          images: product.images.filter((_, i) => i !== index)
        })
      }
    } catch (error) {
      console.error('Failed to remove image:', error)
    }
  }

  if (!brandConfig) return <div>Brand not found</div>
  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Title</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Describe your product..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
                <select
                  value={product.status}
                  onChange={(e) => setProduct({ ...product, status: e.target.value as 'draft' | 'active' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Base Price</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Featured Image</label>
              <div className="flex items-center space-x-4">
                {product.featured_image ? (
                  <div className="relative">
                    <img src={product.featured_image} alt="" className="w-24 h-24 object-cover rounded" />
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/brands/${params.brand}/products/${params.id}/images?url=${encodeURIComponent(product.featured_image)}&type=featured`, 
                            { method: 'DELETE' }
                          )
                          if (response.ok) {
                            setProduct({ ...product, featured_image: '' })
                          }
                        } catch (error) {
                          console.error('Failed to remove featured image:', error)
                          // Fallback: remove from UI anyway
                          setProduct({ ...product, featured_image: '' })
                        }
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    className="hidden"
                    id="featured-image-upload"
                  />
                  <label
                    htmlFor="featured-image-upload"
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer inline-block"
                  >
                    {product.featured_image ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Additional Images</label>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt="" className="w-full aspect-square object-cover rounded" />
                    <button
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {product.images.length < 8 && (
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdditionalImageUpload}
                      className="hidden"
                      id={`additional-image-upload-${product.images.length}`}
                    />
                    <label
                      htmlFor={`additional-image-upload-${product.images.length}`}
                      className="flex flex-col items-center text-gray-500 cursor-pointer"
                    >
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-xs">Add</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <button
              onClick={addVariant}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variant
            </button>
          </div>

          {product.variants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No variants. Add one to offer different sizes or colors.</p>
          ) : (
            <div className="space-y-3">
              {product.variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                      <input
                        type="text"
                        value={variant.size || ''}
                        onChange={(e) => updateVariant(index, { size: e.target.value })}
                        placeholder="e.g., 12×18"
                        className="w-full px-2 py-1 text-sm border rounded text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, { sku: e.target.value })}
                        className="w-full px-2 py-1 text-sm border rounded text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, { price: parseFloat(e.target.value) || 0 })}
                        step="0.01"
                        min="0"
                        className="w-full px-2 py-1 text-sm border rounded text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <button
                      onClick={() => removeVariant(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organization */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Product Type</label>
              <select
                value={product.product_type}
                onChange={(e) => setProduct({ ...product, product_type: e.target.value as 'handmade' | 'printful' | 'digital' })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              >
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {product.product_type === 'handmade' && 'Handcrafted items made by you'}
                {product.product_type === 'printful' && 'Print-on-demand products fulfilled by Printful'}
                {product.product_type === 'digital' && 'Downloadable digital files'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
              <select
                value={product.primary_category_id}
                onChange={(e) => setProduct({ ...product, primary_category_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={product.tags.join(', ')}
                onChange={(e) => setProduct({ ...product, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                placeholder="summer, gift idea, bestseller"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Engine Listing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Page Title</label>
              <input
                type="text"
                value={product.seo_title}
                onChange={(e) => setProduct({ ...product, seo_title: e.target.value })}
                placeholder={product.name}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{product.seo_title.length} of 70 characters used</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Meta Description</label>
              <textarea
                value={product.seo_description}
                onChange={(e) => setProduct({ ...product, seo_description: e.target.value })}
                rows={3}
                placeholder="Brief description for search engines..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{product.seo_description.length} of 160 characters used</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">URL Handle</label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-1">/{params.brand}/products/</span>
                <input
                  type="text"
                  value={product.slug}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}