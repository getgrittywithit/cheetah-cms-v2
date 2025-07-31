import { NextRequest, NextResponse } from 'next/server'
import { listFilesFromR2, getPublicUrl } from '@/lib/r2-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''

    const files = await listFilesFromR2(folder)

    // Add URLs to files
    const filesWithUrls = files.map(file => ({
      ...file,
      url: getPublicUrl(file.key),
      folder: file.key.split('/')[0],
      filename: file.key.split('/').pop(),
    }))

    // Group by folder
    const grouped = filesWithUrls.reduce((acc, file) => {
      const folder = file.folder
      if (!acc[folder]) {
        acc[folder] = []
      }
      acc[folder].push(file)
      return acc
    }, {} as Record<string, typeof filesWithUrls>)

    return NextResponse.json({
      success: true,
      files: filesWithUrls,
      grouped,
      total: files.length,
    })
  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}