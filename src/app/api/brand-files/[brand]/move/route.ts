import { NextRequest, NextResponse } from 'next/server'
import { getBrandR2Config } from '@/lib/brand-r2-config'

interface MoveFileRequest {
  sourceKey: string
  targetFolder: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const { sourceKey, targetFolder }: MoveFileRequest = await request.json()
    
    console.log('🔵 Moving file:', { sourceKey, targetFolder, brand: params.brand })
    
    if (!sourceKey) {
      return NextResponse.json(
        { success: false, error: 'Source key is required' },
        { status: 400 }
      )
    }

    // Get R2 client for this brand
    const r2Client = getBrandR2Config(params.brand)
    
    if (!r2Client) {
      console.error('🔴 R2 client not configured for brand:', params.brand)
      return NextResponse.json(
        { success: false, error: 'R2 not configured for this brand' },
        { status: 500 }
      )
    }

    // Extract the filename from the source key
    const filename = sourceKey.split('/').pop()
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Invalid source key' },
        { status: 400 }
      )
    }

    // Create the target key
    const targetKey = targetFolder ? `${targetFolder}/${filename}` : filename

    console.log('🔵 Copy operation:', { from: sourceKey, to: targetKey })

    // Copy the object to the new location
    const copyResponse = await r2Client.copyObject({
      Bucket: r2Client.config.params?.Bucket,
      CopySource: `${r2Client.config.params?.Bucket}/${sourceKey}`,
      Key: targetKey,
    }).promise()

    console.log('🔵 Copy successful, now deleting original')

    // Delete the original object
    await r2Client.deleteObject({
      Bucket: r2Client.config.params?.Bucket,
      Key: sourceKey,
    }).promise()

    console.log('🟢 File moved successfully:', { from: sourceKey, to: targetKey })

    return NextResponse.json({
      success: true,
      message: 'File moved successfully',
      newKey: targetKey
    })

  } catch (error) {
    console.error('🔴 Error moving file:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to move file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}