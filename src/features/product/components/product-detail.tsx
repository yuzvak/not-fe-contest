"use client"

import type React from "react"

import { useState, useEffect, memo, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Share, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useStore } from "@/store"
import { useTelegram } from "@/providers/telegram-provider"
import { usePurchaseFlow } from "@/hooks/use-purchase-flow"
import { SuccessModal } from "@/components/ui/success-modal"
import type { Product } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface ProductDetailProps {
  product: Product
}

function ProductDetailComponent({ product }: ProductDetailProps) {
  const router = useRouter()
  const addToCart = useStore((state) => state.addToCart)
  const updateQuantity = useStore((state) => state.updateQuantity)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const openCart = useStore((state) => state.openCart)
  const items = useStore((state) => state.items)
  const { hapticFeedback, showBackButton, hideBackButton, shareMessage, colorScheme, themeParams } = useTelegram()
  const handlePurchaseComplete = () => {
    router.push('/')
  }
  const { handlePurchase, isProcessing, purchaseSuccess, closePurchaseSuccess } = usePurchaseFlow(handlePurchaseComplete)
  const [currentImage, setCurrentImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0)

  const imageContainerRef = useRef<HTMLDivElement>(null)

  const cartItem = items.find((item) => item.id === product.id)
  const isInCart = !!cartItem
  const quantity = cartItem?.quantity || 0

  const bgColor = colorScheme === "light" ? "#FFFFFF" : "#000000"
  const textColor = colorScheme === "light" ? "#000000" : "#FFFFFF"
  const secondaryBgColor = colorScheme === "light" ? "#F2F2F2" : "#1A1A1A"
  const hintColor = colorScheme === "light" ? "#8E8E93" : "#8E8E93"

  const addToCartBgColor = colorScheme === "light" ? "#F2F2F2" : "#1A1A1A"
  const addToCartTextColor = colorScheme === "light" ? "#000000" : "#FFFFFF"
  const buyNowBgColor = colorScheme === "light" ? "#000000" : "#FFFFFF"
  const buyNowTextColor = colorScheme === "light" ? "#FFFFFF" : "#000000"

  const isSoldOut = product.left === 0

  useEffect(() => {
    const checkScreenRatio = () => {
      const aspectRatio = window.innerWidth / window.innerHeight
      setIsWideScreen(aspectRatio > 0.6)
    }

    checkScreenRatio()
    window.addEventListener("resize", checkScreenRatio)
    return () => window.removeEventListener("resize", checkScreenRatio)
  }, [])

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = product.images.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = src
            img.onload = resolve
            img.onerror = reject
            img.crossOrigin = "anonymous"
          })
        })

        await Promise.all(imagePromises)
        setImagesLoaded(true)
      } catch (error) {
        console.warn("Failed to preload some images:", error)
        setImagesLoaded(true)
      }
    }

    preloadImages()
  }, [product.images])

  useEffect(() => {
    router.prefetch(`/product/${product.id}`)
  }, [product.id, router])

  useEffect(() => {
    setCurrentImage(0)
  }, [])

  const formatPrice = (price: number) => {
    return price
  }

  const formattedPrice = formatPrice(product.price)

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (isFullscreenOpen) {
        handleCloseFullscreen()
        return false
      } else {
        hapticFeedback("impact", "light")
        router.back()
      }
    }

    showBackButton(handleBackButtonClick)

    return () => {
      hideBackButton()
    }
  }, [router, hapticFeedback, showBackButton, hideBackButton, isFullscreenOpen])

  const handleAddToCart = () => {
    hapticFeedback("impact", "medium")
    addToCart(product)
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
    }, 800)
  }

  const handleIncreaseQuantity = () => {
    hapticFeedback("impact", "light")
    if (isInCart) {
      updateQuantity(product.id, quantity + 1)
    } else {
      addToCart(product)
    }
  }

  const handleDecreaseQuantity = () => {
    hapticFeedback("impact", "light")
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1)
    } else {
      removeFromCart(product.id)
    }
  }

  const handleBuyNow = async () => {
    hapticFeedback("impact", "heavy")

    try {
      await handlePurchase([product])
    } catch (error) {
      console.error('Purchase failed:', error)
      hapticFeedback("notification", "error")
    }
  }

  const handleImageChange = (index: number) => {
    if (index !== currentImage) {
      hapticFeedback("selection")
      setCurrentImage(index)
    }
  }

  const handleOpenFullscreen = (imageIndex: number = currentImage) => {
    hapticFeedback("impact", "light")
    setFullscreenImageIndex(imageIndex)
    setIsFullscreenOpen(true)
  }

  const handleCloseFullscreen = () => {
    hapticFeedback("impact", "light")
    setIsFullscreenOpen(false)
  }

  const handleFullscreenPrevImage = () => {
    if (product.images.length <= 1) return
    hapticFeedback("selection")
    setFullscreenImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleFullscreenNextImage = () => {
    if (product.images.length <= 1) return
    hapticFeedback("selection")
    setFullscreenImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const handleShare = () => {
    hapticFeedback("impact", "light")

    try {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp

        const shareUrl = `${window.location.origin}/product/${product.id}`

        const shareText = `🛍️ Check out this ${product.category}: ${product.name}\n💰 Price: ${formattedPrice} ${product.currency}`

        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`

        webApp.openTelegramLink(telegramShareUrl)
        console.log("✅ Product shared via Telegram")
        return
      }

      handleShareFallback()
    } catch (error) {
      console.error("❌ Telegram share failed:", error)
      handleShareFallback()
    }
  }

  const handleShareFallback = () => {
    try {
      const shareData = {
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        productPrice: formattedPrice,
        productCurrency: product.currency,
        productImage: product.images[0],
        timestamp: Date.now(),
      }

      const shareText = `🛍️ Check out this ${product.category}: ${product.name}\n💰 Price: ${formattedPrice} ${product.currency}\n\n🔗 View in Not Store`

      if (navigator.share) {
        navigator
          .share({
            title: `${product.category} ${product.name}`,
            text: shareText,
            url: window.location.href,
          })
          .then(() => {
            console.log("✅ Product shared via Web Share API")
          })
          .catch((error) => {
            console.warn("❌ Web Share API failed:", error)
            fallbackCopy()
          })
      } else {
        fallbackCopy()
      }
    } catch (error) {
      console.error("❌ Share failed:", error)
      fallbackCopy()
    }

    function fallbackCopy() {
      const shareText = `🛍️ ${product.category} ${product.name} - ${formattedPrice} ${product.currency}\n${window.location.href}`

      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(shareText)
          .then(() => {
            alert("Product link copied to clipboard!")
          })
          .catch(() => {
            alert("Failed to copy link")
          })
      } else {
        alert("Sharing not supported on this device")
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    setIsDragging(true)

    if (Math.abs(touchStart - e.targetTouches[0].clientX) > 5) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const minSwipeDistance = 30
    const swipeDistance = touchStart - touchEnd

    if (Math.abs(swipeDistance) < minSwipeDistance) {
      setIsDragging(false)
      return
    }

    if (swipeDistance > 0) {
      nextImage()
    } else {
      prevImage()
    }

    setIsDragging(false)
  }

  const nextImage = () => {
    if (product.images.length <= 1) return
    hapticFeedback("selection")
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    if (product.images.length <= 1) return
    hapticFeedback("selection")
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleFullscreenTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(false)
  }

  const handleFullscreenTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    setIsDragging(true)

    if (Math.abs(touchStart - e.targetTouches[0].clientX) > 5) {
      e.preventDefault()
    }
  }

  const handleFullscreenTouchEnd = () => {
    if (!isDragging) return

    const minSwipeDistance = 50
    const swipeDistance = touchStart - touchEnd

    if (Math.abs(swipeDistance) < minSwipeDistance) {
      setIsDragging(false)
      return
    }

    if (swipeDistance > 0) {
      handleFullscreenNextImage()
    } else {
      handleFullscreenPrevImage()
    }

    setIsDragging(false)
  }

  const formatProductName = (name: string, category: string) => {
    if (name === "boxlogo" && category === "hoodie") {
      return "t-shirt boxlogo"
    }
    if (name === "physics" && category === "hoodie") {
      return "hoodie physics"
    }
    if (name === "4 hounds" && category === "longsleeve") {
      return "longsleeve 4 hounds"
    }
    if (name === "not or never" && category === "longsleeve") {
      return "not cap not c..."
    }

    return `${category} ${name}`
  }

  const formattedName = formatProductName(product.name, product.category)



  return (
    <>
      <div
        className="fixed inset-0 bg-tg-bg text-tg-text flex flex-col overflow-hidden"
        style={{
          top: "var(--tg-safe-area-inset-top)",
          bottom: "var(--tg-safe-area-inset-bottom)",
          left: "var(--tg-safe-area-inset-left)",
          right: "var(--tg-safe-area-inset-right)",
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        <motion.div
          className="px-4 pb-4 flex-shrink-0"
          style={{
            paddingTop: `calc(44px + 24px)`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold leading-tight mb-6" style={{ color: textColor }}>
                {formattedName}
              </h1>
              <p className="text-sm leading-relaxed mb-2" style={{ color: textColor }}>
                {product.description}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="ml-4 p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "transparent",
                color: textColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = secondaryBgColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              <Share className="w-5 h-5" />
            </button>
          </div>

          {/* Теги */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-2">
            <div className="px-3 py-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryBgColor }}>
              <span className="text-xs" style={{ color: textColor }}>
                <span className="font-bold">{formattedPrice}</span>{" "}
                <span style={{ color: hintColor }}>{product.currency}</span>
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryBgColor }}>
              <span className="text-xs" style={{ color: textColor }}>
                <span className="font-bold">{product.left}</span> <span style={{ color: hintColor }}>LEFT</span>
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryBgColor }}>
              <span className="text-xs" style={{ color: textColor }}>
                <span className="font-bold">100%</span> <span style={{ color: hintColor }}>COTTON</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area - адаптивная компоновка */}
        <div className="flex-1 flex flex-col min-h-0 px-4">
          {/* Main Product Image */}
          <div
            className={`relative w-full rounded-3xl overflow-hidden cursor-pointer ${isWideScreen ? "h-64" : "flex-1"}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => handleOpenFullscreen(currentImage)}
          >
            {product.images.map((image, index) => (
              <div
                key={index}
                className="absolute inset-0 w-full h-full transition-opacity duration-300"
                style={{ opacity: index === currentImage ? 1 : 0 }}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === currentImage}
                />
              </div>
            ))}

            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {product.images.map((_, imgIndex) => (
                  <div
                    key={imgIndex}
                    className={`h-1 rounded-full transition-all duration-200 ${
                      imgIndex === currentImage ? "w-6 bg-white" : "w-1 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 10.5H12.5M10.5 8.5V12.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Section - адаптивная компоновка */}
          <div className={`flex-shrink-0 ${isWideScreen ? "mt-4" : "mt-6"}`}>
            {/* Image Thumbnails - показываем все доступные изображения */}
            {imagesLoaded && product.images.length > 1 && (
              <div className={`${isWideScreen ? "mb-4" : "mb-6"}`}>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`flex-shrink-0 ${
                        isWideScreen ? "w-20 h-20" : "w-16 h-16"
                      } rounded-xl overflow-hidden border-2 transition-all duration-200`}
                      style={{
                        borderColor: index === currentImage ? textColor : "transparent",
                      }}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} image ${index + 1}`}
                        width={isWideScreen ? 80 : 64}
                        height={isWideScreen ? 80 : 64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pb-4">
              {product.left === 0 ? (
                <button
                  disabled
                  className="w-full h-[56px] rounded-2xl font-medium text-base flex items-center justify-center cursor-not-allowed"
                  style={{
                    backgroundColor: hintColor,
                    color: bgColor,
                    opacity: 0.6,
                  }}
                >
                  Sold Out
                </button>
              ) : isInCart ? (
                <>
                  <div
                    className="flex-1 h-[56px] rounded-2xl flex items-center justify-between px-6"
                    style={{ backgroundColor: addToCartBgColor }}
                  >
                    <button
                      onClick={handleDecreaseQuantity}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                      style={{ color: addToCartTextColor }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <span className="font-medium text-base mx-4" style={{ color: addToCartTextColor }}>
                      {quantity}
                    </span>

                    <button
                      onClick={handleIncreaseQuantity}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                      style={{ color: addToCartTextColor }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    disabled={isProcessing}
                    onClick={handleBuyNow}
                    className={`flex-1 h-[56px] rounded-2xl font-medium text-base transition-colors flex items-center justify-center ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{
                      backgroundColor: buyNowBgColor,
                      color: buyNowTextColor,
                    }}
                  >
                    {isProcessing ? "Processing..." : "Buy now"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-[56px] rounded-2xl font-medium text-base transition-colors flex items-center justify-center"
                    style={{
                      backgroundColor: addToCartBgColor,
                      color: addToCartTextColor,
                    }}
                  >
                    Add to cart
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={handleBuyNow}
                    className={`flex-1 h-[56px] rounded-2xl font-medium text-base transition-colors flex items-center justify-center ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{
                      backgroundColor: buyNowBgColor,
                      color: buyNowTextColor,
                    }}
                  >
                    {isProcessing ? "Processing..." : "Buy now"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Animation */}
        <AnimatePresence>
          {addedToCart && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="px-6 py-3 rounded-full font-medium"
                style={{
                  backgroundColor: buyNowBgColor,
                  color: buyNowTextColor,
                }}
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                Added to cart!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onTouchStart={handleFullscreenTouchStart}
            onTouchMove={handleFullscreenTouchMove}
            onTouchEnd={handleFullscreenTouchEnd}
          >
            <motion.button
              onClick={handleCloseFullscreen}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                top: `calc(var(--tg-safe-area-inset-top) + 44px + 16px)`,
                right: `calc(var(--tg-safe-area-inset-right) + 16px)`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {product.images.length > 1 && (
              <>
                <motion.button
                  onClick={handleFullscreenPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{
                    left: `calc(var(--tg-safe-area-inset-left) + 16px)`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>

                <motion.button
                  onClick={handleFullscreenNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{
                    right: `calc(var(--tg-safe-area-inset-right) + 16px)`,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </motion.button>
              </>
            )}

            <motion.div
              className="relative w-full h-full flex items-center justify-center p-4"
              style={{
                paddingTop: `calc(var(--tg-safe-area-inset-top) + 64px)`,
                paddingBottom: `calc(var(--tg-safe-area-inset-bottom) + 64px)`,
                paddingLeft: `calc(var(--tg-safe-area-inset-left) + 16px)`,
                paddingRight: `calc(var(--tg-safe-area-inset-right) + 16px)`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={product.images[fullscreenImageIndex] || "/placeholder.svg"}
                  alt={`${product.name} - Image ${fullscreenImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </motion.div>

            {product.images.length > 1 && (
              <motion.div
                className="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
                style={{
                  bottom: `calc(var(--tg-safe-area-inset-bottom) + 32px)`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.3 }}
              >
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      hapticFeedback("selection")
                      setFullscreenImageIndex(index)
                    }}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      index === fullscreenImageIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </motion.div>
            )}

            <motion.div
              className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm"
              style={{
                top: `calc(var(--tg-safe-area-inset-top) + 44px + 16px)`, 
                left: `calc(var(--tg-safe-area-inset-left) + 16px)`,
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-white text-sm font-medium">
                {fullscreenImageIndex + 1} / {product.images.length}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal isVisible={purchaseSuccess} onClose={closePurchaseSuccess} />
    </>
  )
}

export const ProductDetail = memo(ProductDetailComponent)
