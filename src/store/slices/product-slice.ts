import type { StateCreator } from "zustand"
import type { ProductState } from "@/types"
import { ProductsAPI } from "@/services/api/products"

export interface ProductSlice extends ProductState {
  fetchProducts: () => Promise<void>
  searchProducts: (query: string) => Promise<void>
  getProductById: (id: number) => Promise<any>
  refreshProducts: () => Promise<void>
}

export const createProductSlice: StateCreator<ProductSlice> = (set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    if (get().products.length > 0) return

    if (get().isLoading) return

    set({ isLoading: true, error: null })

    try {
      console.log("Starting to fetch products...")
      const products = await ProductsAPI.getProducts()
      console.log("Products fetched successfully:", products.length, "items")
      set({ products, isLoading: false })
    } catch (error) {
      console.error("Error in fetchProducts:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to fetch products",
        isLoading: false,
      })
    }
  },

  searchProducts: async (query: string) => {
    if (get().products.length > 0) {
      const products = get().products
      if (!query.trim()) {
        return products
      }

      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.id.toString().includes(query),
      )

      return filtered
    }

    set({ isLoading: true, error: null })

    try {
      const products = await ProductsAPI.searchProducts(query)
      set({ products, isLoading: false })
      return products
    } catch (error) {
      console.error("Error in searchProducts:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to search products",
        isLoading: false,
      })
      return []
    }
  },

  getProductById: async (id: number) => {
    const { products } = get()
    const existingProduct = products.find((p) => p.id === id)
    if (existingProduct) {
      return existingProduct
    }

    try {
      const product = await ProductsAPI.getProductById(id)
      if (product) {
        if (!products.find((p) => p.id === id)) {
          set({ products: [...products, product] })
        }
        return product
      }
      return null
    } catch (error) {
      console.error("Error in getProductById:", error)
      return null
    }
  },

  refreshProducts: async () => {
    set({ isLoading: true, error: null })

    try {
      const products = await ProductsAPI.getProducts()
      set({ products, isLoading: false })
    } catch (error) {
      console.error("Error in refreshProducts:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to refresh products",
        isLoading: false,
      })
    }
  },
})
