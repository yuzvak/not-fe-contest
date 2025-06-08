export interface ApiResponse<T> {
  ok: boolean
  data: T
  error?: string
}

export interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  currency: string
  left: number
  tags: {
    fabric: string
  }
  images: string[]
}

export interface HistoryItem {
  timestamp: number
  id: number
  total: number
  currency: string
}

export interface CartItem {
  id: number
  name: string
  category?: string
  price: number
  currency: string
  quantity: number
  image: string
}
