import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2-client'

export async function POST(request: NextRequest) {
  try {
    const { folderName } = await request.json()
    
    if (!folderName) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    // Validate folder name (no special characters except hyphens and underscores)
    const cleanFolderName = folderName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    
    // Create a placeholder file to create the folder structure in R2
    // R2 (like S3) doesn't have actual folders, just key prefixes
    const placeholderKey = `${cleanFolderName}/.folder-placeholder`
    const placeholderContent = Buffer.from('This file creates the folder structure')
    
    await uploadToR2(placeholderContent, placeholderKey, 'text/plain')

    return NextResponse.json({
      success: true,
      folder: cleanFolderName,
      message: 'Folder created successfully'
    })
  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}