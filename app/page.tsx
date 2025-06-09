"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { ProductGrid } from "@/features/catalog/components/product-grid"
import { CartModal } from "@/features/cart/components/cart-modal"
import { SuccessModal } from "@/components/ui/success-modal"
import { useStore } from "@/store"
import { useTelegram } from "@/providers/telegram-provider"
import { usePurchaseFlow } from "@/hooks/use-purchase-flow"
import { motion, AnimatePresence } from "framer-motion"
import type { Product } from "@/types"

export default function HomePage() {
  const router = useRouter()
  const fetchProducts = useStore((state) => state.fetchProducts)
  const products = useStore((state) => state.products)
  const isLoading = useStore((state) => state.isLoading)
  const error = useStore((state) => state.error)
  const isCartOpen = useStore((state) => state.isCartOpen)
  const addToCart = useStore((state) => state.addToCart)
  const openCart = useStore((state) => state.openCart)
  const { hideBackButton, requestFullscreen, disableVerticalSwipes, hapticFeedback, showBackButton, colorScheme, themeParams } = useTelegram()
  const { handlePurchase, isProcessing, purchaseSuccess, closePurchaseSuccess } = usePurchaseFlow()

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [hasProcessedStartParam, setHasProcessedStartParam] = useState(false)

  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const bgColor = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const buttonColor = themeParams.button_color || (colorScheme === "light" ? "#007aff" : "#ffffff")
  const buttonTextColor = themeParams.button_text_color || (colorScheme === "light" ? "#ffffff" : "#000000")

  useEffect(() => {
    console.log("🏠 HomePage mounted")

    hideBackButton()

    requestFullscreen()

    disableVerticalSwipes();

    console.log("📊 Current state:", {
      productsCount: products.length,
      isLoading,
      error,
    })

    if (typeof window !== "undefined" && window.Telegram?.WebApp && !hasProcessedStartParam) {
      const webApp = window.Telegram.WebApp
      const startParam = webApp.initDataUnsafe?.start_param
      
      if (startParam && startParam.startsWith("product_")) {
        const productId = startParam.replace("product_", "")
        console.log("🔗 Opening product from start param:", productId)
        setHasProcessedStartParam(true)
        router.push(`/product/${productId}`)
      }
    }

  }, [hideBackButton, requestFullscreen, router, hasProcessedStartParam])

  useEffect(() => {
    if (products.length > 0 && !hasInitiallyLoaded) {
      console.log("✅ Products initially loaded, setting hasInitiallyLoaded to true")
      setTimeout(() => {
        setHasInitiallyLoaded(true)
      }, 200)
    }
  }, [products.length, hasInitiallyLoaded])

  useEffect(() => {
    if (isSelectionMode) {
      const handleBackButtonClick = () => {
        handleExitSelection()
        return false
      }
      showBackButton(handleBackButtonClick)
    } else {
      hideBackButton()
    }

    return () => {
      hideBackButton()
    }
  }, [isSelectionMode, showBackButton, hideBackButton])

  useEffect(() => {
    if (products.length > 0) {
      console.log(
        "📦 Products loaded:",
        products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          formattedPrice: Math.round(p.price / 1000),
          left: p.left,
          currency: p.currency,
        })),
      )
    }
  }, [products])

  const handleLongPress = (product: Product) => {
    if (product.left === 0) {
      hapticFeedback("notification", "error")
      return
    }

    setIsSelectionMode(true)
    setSelectedProducts([product])
    hapticFeedback("impact", "heavy")
  }

  const handleProductSelect = (product: Product) => {
    if (product.left === 0) {
      hapticFeedback("notification", "error")
      return
    }

    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id)
      if (isSelected) {
        const newSelected = prev.filter((p) => p.id !== product.id)
        if (newSelected.length === 0) {
          setIsSelectionMode(false)
          hapticFeedback("impact", "light")
          return []
        }
        return newSelected
      } else {
        return [...prev, product]
      }
    })
  }

  const handleExitSelection = () => {
    setIsSelectionMode(false)
    setSelectedProducts([])
    hapticFeedback("impact", "light")
  }

  const handleBuySelected = async () => {
    try {
      await handlePurchase(selectedProducts)
      setIsSelectionMode(false)
      setSelectedProducts([])
      hapticFeedback("impact", "heavy")
    } catch (error) {
      console.error('Purchase failed:', error)
      hapticFeedback("notification", "error")
    }
  }

  const totalSelectedPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0)

  const shouldShowLoader = products.length === 0 && !error
  const shouldShowProducts = products.length > 0
  const shouldShowError = !!error

  console.log("🎯 Render state:", {
    productsLength: products.length,
    isLoading,
    error,
    hasInitiallyLoaded,
    shouldShowLoader,
    shouldShowProducts,
    shouldShowError,
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      <Header showCart={true} isSelectionMode={isSelectionMode} selectedCount={selectedProducts.length} />

      <main
        className="pb-20"
        style={{
          paddingTop: `calc(46px + 44px + 8px)`,
        }}
      >
        <AnimatePresence mode="wait">
          {shouldShowLoader ? (
            <motion.div
              key="loader"
              className="min-h-[60vh] flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div
                  className="w-16 h-16 border-4 border-t-transparent rounded-full"
                  style={{ borderColor: `${textColor}33`, borderTopColor: textColor }}
                ></div>
              </motion.div>
              <motion.p
                style={{ color: textColor }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                Loading products...
              </motion.p>
            </motion.div>
          ) : shouldShowError ? (
            <motion.div
              key="error"
              className="flex flex-col items-center justify-center py-20 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center max-w-md">
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                  ⚠️
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: textColor }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  Connection Issue
                </motion.h2>
                <motion.p
                  className="mb-6 text-sm"
                  style={{ color: textColor }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  {error}
                </motion.p>
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <button
                    onClick={() => {
                      console.log("🔄 Manual retry triggered")
                      window.location.reload()
                    }}
                    className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: buttonColor,
                      color: buttonTextColor,
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      console.log("📦 Loading with fallback data")
                      fetchProducts()
                    }}
                    className="w-full px-6 py-3 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor:
                        themeParams.secondary_bg_color || (colorScheme === "light" ? "#f7f7f7" : "#1a1a1a"),
                      color: textColor,
                    }}
                  >
                    Continue Offline
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ) : shouldShowProducts ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ProductGrid
                products={products}
                isSelectionMode={isSelectionMode}
                selectedProducts={selectedProducts}
                onLongPress={handleLongPress}
                onSelect={handleProductSelect}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSelectionMode && selectedProducts.length > 0 ? (
          <motion.div
            className="fixed bottom-0 left-0 right-0 p-4 border-t safe-area-bottom px-4"
            style={{
              backgroundColor: bgColor,
              borderTopColor: themeParams.secondary_bg_color || (colorScheme === "light" ? "#f7f7f7" : "#1a1a1a"),
            }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleBuySelected}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl font-medium text-lg disabled:opacity-50"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
            >
              {isProcessing ? 'Processing...' : `Buy for ${totalSelectedPrice} NOT`}
            </button>
          </motion.div>
        ) : (
          <BottomNavigation />
        )}
      </AnimatePresence>

      {isCartOpen && <CartModal />}
      <SuccessModal isVisible={purchaseSuccess} onClose={closePurchaseSuccess} />
    </div>
  )
}
