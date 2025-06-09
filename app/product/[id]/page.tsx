"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/store"
import { ProductDetail } from "@/features/product/components/product-detail"
import { CartModal } from "@/features/cart/components/cart-modal"
import { Loader2 } from "lucide-react"
import type { Product } from "@/types"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const products = useStore((state) => state.products)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const getProductById = useStore((state) => state.getProductById)
  const isCartOpen = useStore((state) => state.isCartOpen)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    const checkIfFromTelegram = () => {
      const referrer = document.referrer
      const userAgent = navigator.userAgent
      const isFromTelegram = referrer.includes('t.me') || userAgent.includes('Telegram')
      const hasNavigationHistory = window.history.length > 1
      
      if (isFromTelegram && !hasNavigationHistory) {
        setShouldRedirect(true)
        router.replace('/')
        setTimeout(() => {
          router.push(`/product/${params.id}`)
        }, 100)
        return true
      }
      return false
    }

    if (checkIfFromTelegram()) {
      return
    }

    const loadProduct = async () => {
      try {
        const cachedProduct = localStorage.getItem(`product-${params.id}`)
        if (cachedProduct) {
          const parsedProduct = JSON.parse(cachedProduct)
          setProduct(parsedProduct)
          setLoading(false)

          getProductById(Number(params.id)).then((freshProduct) => {
            if (freshProduct) {
              setProduct(freshProduct)
            }
          })
          return
        }
      } catch (e) {
      }

      const foundProduct = products.find((p) => p.id === Number(params.id))
      if (foundProduct) {
        setProduct(foundProduct)
        setLoading(false)
        return
      }

      try {
        if (products.length === 0) {
          await fetchProducts()
          const freshProduct = products.find((p) => p.id === Number(params.id))
          if (freshProduct) {
            setProduct(freshProduct)
          }
        } else {
          const freshProduct = await getProductById(Number(params.id))
          if (freshProduct) {
            setProduct(freshProduct)
          }
        }
      } catch (error) {
        console.error("Failed to load product:", error)
      }

      setLoading(false)
    }

    loadProduct()
  }, [params.id, products, fetchProducts, getProductById, router])

  if (shouldRedirect) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <p className="text-zinc-400">This product doesn't exist</p>
      </div>
    )
  }

  return (
    <>
      <ProductDetail product={product} />
      {isCartOpen && <CartModal />}
    </>
  )
}
