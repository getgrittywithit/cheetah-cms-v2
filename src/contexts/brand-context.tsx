'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Brand, BrandContext } from '@/lib/brand-types'

const BrandContextProvider = createContext<BrandContext | undefined>(undefined)

interface BrandProviderProps {
  children: ReactNode
}

export function BrandProvider({ children }: BrandProviderProps) {
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch brands from API to get server-side env vars
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands')
        const data = await response.json()
        
        if (data.success && data.brands) {
          setAllBrands(data.brands)
          
          // Set default brand or restore from localStorage
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
      } catch (error) {
        console.error('Failed to fetch brands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

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