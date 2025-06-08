import type { StateCreator } from "zustand"
import type { CartState, Product } from "@/types"

export interface CartSlice extends CartState {
  isCartOpen: boolean
  addToCart: (product: Product) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

export const createCartSlice: StateCreator<CartSlice> = (set, get) => ({
  items: [],
  total: 0,
  isCartOpen: false,

  addToCart: (product) => {
    const { items } = get()
    const existingItem = items.find((item) => item.id === product.id)

    let newItems
    if (existingItem) {
      newItems = items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      newItems = [
        ...items,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          currency: product.currency,
          quantity: 1,
          image: product.images[0] || "",
        },
      ]
    }

    const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ items: newItems, total })
  },

  removeFromCart: (id) => {
    const { items } = get()
    const newItems = items.filter((item) => item.id !== id)
    const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ items: newItems, total })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id)
      return
    }

    const { items } = get()
    const newItems = items.map((item) => (item.id === id ? { ...item, quantity } : item))
    const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ items: newItems, total })
  },

  clearCart: () => set({ items: [], total: 0 }),

  openCart: () => set({ isCartOpen: true }),

  closeCart: () => set({ isCartOpen: false }),
})
