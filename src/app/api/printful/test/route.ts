import { NextResponse } from 'next/server'
import { printfulAPI } from '@/lib/printful-api'

export async function GET() {
  try {
    console.log('Testing Printful API connection...')
    
    // Test basic store info first
    const storeInfo = await printfulAPI.getStoreInfo()
    console.log('Store info:', storeInfo)
    
    return NextResponse.json({
      success: true,
      store: storeInfo,
      message: 'Printful API connection successful'
    })
  } catch (error) {
    console.error('Printful test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Printful API'
      },
      { status: 500 }
    )
  }
}