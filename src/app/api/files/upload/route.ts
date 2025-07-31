import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, generateFileKey, getPublicUrl } from '@/lib/r2-client'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for large file uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'raw'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique file key
    const key = generateFileKey(folder, file.name)

    // Upload to R2
    const uploadedFile = await uploadToR2(buffer, key, file.type)

    // Return file info with URL
    return NextResponse.json({
      success: true,
      file: {
        ...uploadedFile,
        url: getPublicUrl(key),
        originalName: file.name,
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}