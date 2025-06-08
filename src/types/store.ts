import type { Product, HistoryItem, CartItem } from "./api"

export interface ProductState {
  products: Product[]
  isLoading: boolean
  error: string | null
}

export interface CartState {
  items: CartItem[]
  total: number
}

export interface HistoryState {
  history: HistoryItem[]
  isLoading: boolean
  error: string | null
}

export interface UIState {
  theme: "light" | "dark"
  isSearchOpen: boolean
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: "success" | "error" | "info"
  message: string
  duration?: number
}
