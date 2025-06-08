import { API_ENDPOINTS } from "@/lib/constants"
import type { Product, ApiResponse } from "@/types"

export class ProductsAPI {
  static async getProducts(): Promise<Product[]> {
    try {
      console.log("🚀 Fetching products from:", API_ENDPOINTS.PRODUCTS)

      const response = await fetch(API_ENDPOINTS.PRODUCTS)

      console.log("📡 Response received:")
      console.log("- Status:", response.status)
      console.log("- Status Text:", response.statusText)
      console.log("- OK:", response.ok)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      console.log("📄 Raw response (first 200 chars):", text.substring(0, 200))

      let data: ApiResponse<Product[]>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError)
        throw new Error("Invalid JSON response from API")
      }

      console.log("✅ Parsed data:", data)

      if (!data.ok) {
        throw new Error(data.error || "API returned error")
      }

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format from API")
      }

      console.log("🎉 Successfully fetched", data.data.length, "products")
      return data.data
    } catch (error) {
      console.error("💥 API Error:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.log("🔄 Network error detected, trying alternative approach...")
        return this.getProductsAlternative()
      }

      console.log("📦 Using fallback data")
      return this.getFallbackProducts()
    }
  }

  static async getProductsAlternative(): Promise<Product[]> {
    try {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("GET", API_ENDPOINTS.PRODUCTS, true)
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText)
                console.log("✅ XHR Success:", data)
                resolve(data.data || [])
              } catch (e) {
                console.error("❌ XHR Parse Error:", e)
                reject(e)
              }
            } else {
              console.error("❌ XHR Error:", xhr.status, xhr.statusText)
              reject(new Error(`XHR Error: ${xhr.status}`))
            }
          }
        }
        xhr.send()
      })
    } catch (error) {
      console.error("💥 XHR Alternative failed:", error)
      return this.getFallbackProducts()
    }
  }

  static getFallbackProducts(): Product[] {
    console.log("📦 Loading fallback products...")
    return [
      {
        id: 1,
        name: "boxlogo",
        category: "hoodie",
        description: "Volumetric silk screen printing PUFF. Wash it before first use",
        price: 46000,
        currency: "NOT",
        left: 42,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 2,
        name: "not for climbing",
        category: "hoodie",
        description: "Silk screen printing, DTF printing. Wash it before first use!",
        price: 50000,
        currency: "NOT",
        left: 14,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 3,
        name: "physics",
        category: "hoodie",
        description: "Silk screen printing. Wash it before first use!",
        price: 44000,
        currency: "NOT",
        left: 5,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 4,
        name: "4 hounds",
        category: "longsleeve",
        description: "Silk screen printing. Wash it before first use!",
        price: 30000,
        currency: "NOT",
        left: 11,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 5,
        name: "not blank",
        category: "longsleeve",
        description: "Silk screen printing. Wash it before first use!",
        price: 29000,
        currency: "NOT",
        left: 16,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 6,
        name: "not or never",
        category: "longsleeve",
        description: "Silk screen printing. Wash it before first use!",
        price: 29000,
        currency: "NOT",
        left: 33,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 7,
        name: "nobody knows",
        category: "t-shirt",
        description: "Silk screen printing. Wash it before first use!",
        price: 23000,
        currency: "NOT",
        left: 35,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
      {
        id: 8,
        name: "out of nothing",
        category: "t-shirt",
        description: "Silk screen printing. Wash it before first use!",
        price: 26000,
        currency: "NOT",
        left: 0,
        tags: {
          fabric: "100% cotton",
        },
        images: [
          "https://not-contest-cdn.openbuilders.xyz/items/1.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/2.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/3.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/4.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/5.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/6.png",
          "https://not-contest-cdn.openbuilders.xyz/items/7.jpg",
          "https://not-contest-cdn.openbuilders.xyz/items/8.jpg",
        ],
      },
    ]
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getProducts()

    if (!query.trim()) {
      return products
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.id.toString().includes(query),
    )
  }

  static async getProductById(id: number): Promise<Product | null> {
    const products = await this.getProducts()
    return products.find((product) => product.id === id) || null
  }
}
