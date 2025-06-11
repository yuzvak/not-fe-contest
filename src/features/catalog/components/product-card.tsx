"use client"

import type React from "react"

import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Product } from "@/types"
import { ROUTES } from "@/lib/constants"
import { motion } from "framer-motion"
import { memo, useState, useRef, useEffect } from "react"
import { useTelegram } from "@/providers/telegram-provider"

interface ProductCardProps {
  product: Product
  index?: number
  isSelectionMode?: boolean
  isSelected?: boolean
  onLongPress?: (product: Product) => void
  onSelect?: (product: Product) => void
}

function ProductCardComponent({
  product,
  index = 0,
  isSelectionMode = false,
  isSelected = false,
  onLongPress,
  onSelect,
}: ProductCardProps) {
  const router = useRouter()
  const { hapticFeedback, colorScheme, themeParams } = useTelegram()
  const [currentImage, setCurrentImage] = useState((product.id - 1) % product.images.length)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const hintColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")

  const isSoldOut = product.left === 0

  useEffect(() => {
    if (product.images.length <= 1) return

    const preloadImages = async () => {
      try {
        const imagePromises = product.images.slice(0, 4).map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = src
            img.onload = resolve
            img.onerror = reject
            img.crossOrigin = "anonymous"
          })
        })

        await Promise.all(imagePromises)
      } catch (error) {
        console.warn("Failed to preload some images:", error)
      }
    }

    preloadImages()
  }, [product.images])

  useEffect(() => {
    router.prefetch(`/product/${product.id}`)
  }, [product.id, router])

  useEffect(() => {
    if (isSelectionMode) {
      setIsLongPressing(false)
    }
  }, [isSelectionMode])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isDragging) return

    if (isSelectionMode) {
      if (isSoldOut) {
        hapticFeedback("notification", "error")
        return
      }

      setIsLongPressing(false)
      hapticFeedback("selection")
      onSelect?.(product)
      return
    }

    if (isLongPressing) {
      setIsLongPressing(false)
      return
    }

    hapticFeedback("impact", "light")

    try {
      localStorage.setItem(`product-${product.id}`, JSON.stringify(product))
    } catch (e) {
    }

    router.push(ROUTES.PRODUCT(product.id))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSelectionMode) return

    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(false)
    setIsLongPressing(false)

    if (isSoldOut) return

    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true)
      hapticFeedback("impact", "medium")
      onLongPress?.(product)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX
    setTouchEnd(currentX)
    
    const swipeDistance = Math.abs(touchStart - currentX)
    
    if (swipeDistance > 5) {
      setIsDragging(true)
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    if (!isSelectionMode && product.images.length > 1 && swipeDistance > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (!isDragging || isSelectionMode || product.images.length <= 1) {
      setIsDragging(false)
      return
    }

    const minSwipeDistance = 30
    const swipeDistance = touchStart - touchEnd
    const swipeVelocity = Math.abs(swipeDistance)

    if (swipeVelocity >= minSwipeDistance) {
      if (swipeDistance > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }

    setTimeout(() => setIsDragging(false), 100)
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

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSoldOut) {
      hapticFeedback("notification", "error")
      return
    }

    hapticFeedback("selection")
    onSelect?.(product)
  }

  const formatProductName = (name: string, category: string) => {
    return `${category} ${name}`
  }

  const formatPrice = (price: number) => {
    return price
  }

  const formattedName = formatProductName(product.name, product.category)
  const formattedPrice = formatPrice(product.price)

  return (
    <motion.div
      ref={cardRef}
      className="cursor-pointer relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.2,
      }}
      whileTap={{ scale: isDragging ? 1 : 0.98 }}
      layout={false}
    >
      {/* Hero Image */}
      <div
        className="aspect-square relative rounded-3xl overflow-hidden mb-2"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full">
          {product.images.map((image, idx) => (
            <motion.div
              key={idx}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: idx === currentImage ? 1 : 0,
                scale: idx === currentImage ? 1 : 1.05
              }}
              transition={{ 
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={index < 4 && idx === 0}
                loading={index < 4 || idx === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
        </div>

        {/* Sold Out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-medium">Sold Out</span>
          </div>
        )}

        {/* Selection checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 right-3" onClick={handleCheckboxClick}>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isSoldOut
                  ? "bg-zinc-600 border-zinc-500 cursor-not-allowed opacity-50"
                  : isSelected
                    ? "bg-white border-white"
                    : "bg-black/50 border-white/50"
              }`}
            >
              {isSelected && !isSoldOut && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {isSoldOut && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {product.images.length > 1 && !isSelectionMode && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {product.images.map((_, imgIndex) => (
              <div
                key={imgIndex}
                className={`h-1 rounded-full transition-all duration-300 ${
                  imgIndex === currentImage ? "w-6 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-1" onClick={handleClick}>
        <h3 className="text-lg font-medium mb-0.5 line-clamp-1" style={{ color: textColor }}>
          {formattedName}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: textColor }}>
            {formattedPrice}
          </span>
          <span style={{ color: hintColor }}>{product.currency}</span>
        </div>

        {product.left > 0 && product.left <= 10 && (
          <p className="text-xs text-orange-400 mt-1">Only {product.left} left</p>
        )}
      </div>
    </motion.div>
  )
}

export const ProductCard = memo(ProductCardComponent)
