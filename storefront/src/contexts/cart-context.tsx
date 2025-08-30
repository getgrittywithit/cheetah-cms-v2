'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Cart } from '@/types/product'

interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  })
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08 // 8% tax rate - should be configurable
    const shipping = subtotal > 75 ? 0 : 10 // Free shipping over $75
    const total = subtotal + tax + shipping

    setCart(prev => ({
      ...prev,
      subtotal,
      tax,
      shipping,
      total
    }))
  }, [cart.items])

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => 
        item.productId === newItem.productId && item.variantId === newItem.variantId
      )

      if (existingItem) {
        // Update quantity if item already exists
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        }
      } else {
        // Add new item
        const cartItem: CartItem = {
          id: `${newItem.productId}-${newItem.variantId || 'default'}-${Date.now()}`,
          ...newItem
        }
        return {
          ...prev,
          items: [...prev.items, cartItem]
        }
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }))
  }

  const clearCart = () => {
    setCart({
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0
    })
  }

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isOpen,
    openCart,
    closeCart
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}