import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createBrandR2Client, getBrandPublicUrl, getBrandR2Config } from '@/lib/brand-r2-config'
import { supabaseAdmin } from '@/lib/supabase'
import { getBrandConfig } from '@/lib/brand-config'

export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string, id: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    const r2Client = createBrandR2Client(params.brand)
    const r2Config = getBrandR2Config(params.brand)
    
    if (!r2Client || !r2Config) {
      return NextResponse.json({ success: false, error: 'R2 storage not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageType = formData.get('type') as string // 'featured' or 'additional'
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'File must be an image' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const key = `products/${params.id}/${fileName}`

    // Upload to R2
    const buffer = await file.arrayBuffer()
    const uploadCommand = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
    })

    await r2Client.send(uploadCommand)
    
    // Get public URL
    const imageUrl = getBrandPublicUrl(params.brand, key)

    // Update product in database
    const { data: currentProduct } = await supabaseAdmin
      .from('products')
      .select('featured_image, images')
      .eq('id', params.id)
      .single()

    if (!currentProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    let updateData: any = {}
    
    if (imageType === 'featured') {
      updateData.featured_image = imageUrl
    } else {
      // Add to images array
      const currentImages = currentProduct.images || []
      updateData.images = [...currentImages, imageUrl]
    }

    await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', params.id)

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      type: imageType 
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { brand: string, id: string } }
) {
  try {
    const brandConfig = getBrandConfig(params.brand)
    if (!brandConfig) {
      return NextResponse.json({ success: false, error: 'Invalid brand' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const imageType = searchParams.get('type') // 'featured' or 'additional'
    const imageIndex = searchParams.get('index') // for additional images
    
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'No image URL provided' }, { status: 400 })
    }

    const r2Client = createBrandR2Client(params.brand)
    const r2Config = getBrandR2Config(params.brand)
    
    if (!r2Client || !r2Config) {
      return NextResponse.json({ success: false, error: 'R2 storage not configured' }, { status: 500 })
    }

    // Extract key from URL
    const urlParts = imageUrl.split('/')
    const keyParts = urlParts.slice(-3) // products/{id}/{filename}
    const key = keyParts.join('/')

    // Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    })

    await r2Client.send(deleteCommand)

    // Update product in database
    const { data: currentProduct } = await supabaseAdmin
      .from('products')
      .select('featured_image, images')
      .eq('id', params.id)
      .single()

    if (!currentProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    let updateData: any = {}
    
    if (imageType === 'featured') {
      updateData.featured_image = ''
    } else if (imageType === 'additional' && imageIndex !== null) {
      // Remove from images array
      const currentImages = currentProduct.images || []
      const index = parseInt(imageIndex)
      updateData.images = currentImages.filter((_, i) => i !== index)
    }

    await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}