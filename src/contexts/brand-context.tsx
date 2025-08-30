'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Brand, BrandContext } from '@/lib/brand-types'
import { getBrandConfig, isValidBrandSlug } from '@/lib/brand-config'

const BrandContextProvider = createContext<BrandContext | undefined>(undefined)

interface BrandProviderProps {
  children: ReactNode
  initialBrand?: any
}

export function BrandProvider({ children, initialBrand }: BrandProviderProps) {
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Extract brand from URL path
  const getBrandFromUrl = () => {
    const match = pathname.match(/\/dashboard\/([^\/]+)/)
    return match ? match[1] : null
  }

  // Fetch brands from API and sync with URL
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands')
        const data = await response.json()
        
        if (data.success && data.brands) {
          setAllBrands(data.brands)
          
          // Check URL first for brand selection
          const urlBrand = getBrandFromUrl()
          if (urlBrand && isValidBrandSlug(urlBrand)) {
            // Find brand from API data that matches URL brand
            const brand = data.brands.find((b: Brand) => b.slug === urlBrand)
            if (brand) {
              setCurrentBrand(brand)
            } else {
              // URL brand is valid but not in API, create minimal brand from config
              const brandConfig = getBrandConfig(urlBrand)
              if (brandConfig) {
                const minimalBrand: Brand = {
                  id: brandConfig.slug,
                  slug: brandConfig.slug,
                  name: brandConfig.name,
                  industry: brandConfig.industry,
                  description: brandConfig.description,
                  targetAudience: brandConfig.targetAudience,
                  socialAccounts: [],
                  guidelines: {
                    voice: {
                      tone: brandConfig.aiSettings.voice,
                      personality: brandConfig.aiSettings.personality,
                      doNots: []
                    },
                    visual: {
                      primaryColors: [brandConfig.theme.primary],
                      secondaryColors: [brandConfig.theme.secondary],
                      fontStyle: 'Default'
                    },
                    content: {
                      hashtags: [],
                      keywords: [],
                      contentPillars: [],
                      postingSchedule: []
                    },
                    aiPrompt: brandConfig.aiSettings.systemPrompt
                  },
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
                setCurrentBrand(minimalBrand)
              }
            }
          } else {
            // No URL brand, use saved preference or default
            const savedBrandId = localStorage.getItem('selectedBrandId')
            if (savedBrandId) {
              const brand = data.brands.find((b: Brand) => b.id === savedBrandId)
              if (brand) {
                setCurrentBrand(brand)
              } else {
                setCurrentBrand(data.brands[0])
              }
            } else {
              setCurrentBrand(data.brands[0])
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [pathname])

  const switchBrand = (brandId: string) => {
    const brand = allBrands.find(b => b.id === brandId)
    if (brand) {
      setCurrentBrand(brand)
      // Store preference in localStorage
      localStorage.setItem('selectedBrandId', brandId)
    }
  }

  const updateBrand = (updates: Partial<Brand>) => {
    if (!currentBrand) return
    
    const updatedBrand = { ...currentBrand, ...updates, updatedAt: new Date() }
    setCurrentBrand(updatedBrand)
    
    setAllBrands(brands => 
      brands.map(brand => 
        brand.id === currentBrand.id ? updatedBrand : brand
      )
    )
  }

  const contextValue: BrandContext = {
    currentBrand,
    allBrands,
    switchBrand,
    updateBrand
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading brands...</div>
  }

  return (
    <BrandContextProvider.Provider value={contextValue}>
      {children}
    </BrandContextProvider.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContextProvider)
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider')
  }
  return context
}