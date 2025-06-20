"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useTelegram } from "@/providers/telegram-provider"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const ImageWithPlaceholder = ({ src, alt, width, height, className, isRounded = false }: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  isRounded?: boolean
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { colorScheme } = useTelegram()
  const skeletonColor = colorScheme === "light" ? "#f0f0f0" : "#1a1a1a"
  const shimmerColor = colorScheme === "light" ? "#e0e0e0" : "#2a2a2a"

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="placeholder"
            className={`absolute inset-0 ${isRounded ? 'rounded-full' : 'rounded-2xl'} overflow-hidden`}
            style={{ backgroundColor: skeletonColor }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
              }}
              animate={{
                x: [-200, 200],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="image"
            className={`absolute inset-0 ${isRounded ? 'rounded-full' : 'rounded-2xl'} overflow-hidden`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="object-cover w-full h-full"
              onError={() => {
                setHasError(true)
                setIsLoading(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="opacity-0 absolute inset-0"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const { user, colorScheme, themeParams } = useTelegram()
  const history = useStore((state) => state.history)
  const isHistoryLoading = useStore((state) => state.isLoading)
  const historyError = useStore((state) => state.error)
  const fetchHistory = useStore((state) => state.fetchHistory)
  const products = useStore((state) => state.products)
  const fetchProducts = useStore((state) => state.fetchProducts)
  
  const [displayedItemsCount, setDisplayedItemsCount] = useState(25)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)



  const bgColor = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const hintColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")
  const skeletonColor = colorScheme === "light" ? "#f0f0f0" : "#1a1a1a"

  const userName = user?.first_name || "User"
  const userPhotoUrl = user?.photo_url || "/placeholder.svg?height=128&width=128"

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
    
    const timer = setTimeout(async () => {
      await fetchHistory()
      setIsInitialLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [fetchHistory, fetchProducts, products.length])

  const loadMoreItems = useCallback(() => {
    console.log('loadMoreItems called:', { isLoadingMore, displayedItemsCount, historyLength: history.length })
    if (isLoadingMore || displayedItemsCount >= history.length) {
      console.log('loadMoreItems blocked:', { isLoadingMore, displayedItemsCount, historyLength: history.length })
      return
    }
    
    console.log('Loading more items...')
    setIsLoadingMore(true)
    setDisplayedItemsCount(prev => {
      const newCount = Math.min(prev + 25, history.length)
      console.log('Updated displayedItemsCount:', prev, '->', newCount)
      return newCount
    })
    setTimeout(() => {
      setIsLoadingMore(false)
    }, 50)
  }, [isLoadingMore, displayedItemsCount, history.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        console.log('Observer triggered:', { 
          isIntersecting: entry.isIntersecting, 
          isHistoryLoading, 
          isLoadingMore, 
          isInitialLoading,
          historyLength: history.length,
          displayedItemsCount 
        })
        
        if (entry.isIntersecting && 
            !isHistoryLoading && 
            !isLoadingMore && 
            !isInitialLoading && 
            history.length > 0 &&
            displayedItemsCount < history.length) {
          console.log('Calling loadMoreItems from observer')
          loadMoreItems()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    const setupObserver = () => {
      const currentRef = observerRef.current
      console.log('Observer setup:', { currentRef: !!currentRef, canLoadMore: displayedItemsCount < history.length })
      
      if (currentRef && displayedItemsCount < history.length) {
        observer.observe(currentRef)
        console.log('Observer attached to ref')
        return true
      }
      return false
    }

    if (!setupObserver() && displayedItemsCount < history.length) {
      let attempts = 0
      const maxAttempts = 5
      
      const retrySetup = () => {
        attempts++
        if (setupObserver() || attempts >= maxAttempts) {
          return
        }
        setTimeout(retrySetup, 100 * attempts)
      }
      
      setTimeout(retrySetup, 100)
      
      return () => {
        observer.disconnect()
      }
    }

    return () => {
      const currentRef = observerRef.current
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [loadMoreItems, isHistoryLoading, isLoadingMore, isInitialLoading, history.length, displayedItemsCount])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }).replace(/\s/g, " ").replace(/(\d{2})\s(\w{3})\s(\d{2})/, "$1 $2 '$3")
  }

  const getProductById = (id: number) => {
    return products.find((product) => product.id === id)
  }

  const HistorySkeleton = () => (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {[...Array(15)].map((_, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.1, 
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex-shrink-0"
            style={{ backgroundColor: skeletonColor }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          <div className="flex-1 space-y-2">
            <motion.div
              className="h-3 rounded"
              style={{ backgroundColor: skeletonColor, width: "60%" }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div
              className="h-4 rounded"
              style={{ backgroundColor: skeletonColor, width: "80%" }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
            />
          </div>

          <div className="text-right space-y-2">
            <motion.div
              className="h-3 rounded"
              style={{ backgroundColor: skeletonColor, width: "50px" }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="h-4 rounded"
              style={{ backgroundColor: skeletonColor, width: "70px" }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )

  return (
    <motion.div
      className="min-h-screen"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col items-center py-8"
        style={{
          paddingTop: `calc(var(--tg-safe-area-inset-top) + 44px)`, 
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <motion.div
          className="mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 300 }}
        >
          <ImageWithPlaceholder
            src={userPhotoUrl || "/placeholder.svg"}
            alt="Profile"
            width={128}
            height={128}
            className="w-32 h-32"
            isRounded={true}
          />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold"
          style={{ color: textColor }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {userName}
        </motion.h1>
      </motion.div>

      {/* History Section */}
      <motion.div
        className="px-4 pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <motion.h2
          className="text-2xl font-bold mb-6"
          style={{ color: textColor }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          History
        </motion.h2>

        <AnimatePresence mode="wait">
          {isInitialLoading || isHistoryLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HistorySkeleton />
            </motion.div>
          ) : !isInitialLoading && !isHistoryLoading && (history.length === 0 || historyError) ? (
            <motion.div
              key="empty"
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                No history yet
              </h3>
              <p className="text-sm" style={{ color: hintColor }}>
                {historyError ? "Failed to load history" : "Your purchase history will appear here"}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {history.slice(0, displayedItemsCount).map((item, index) => {
                const product = getProductById(item.id)
                const isNewItem = index >= displayedItemsCount - 25 && index < displayedItemsCount
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, y: 5, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: isNewItem ? (index - (displayedItemsCount - 25)) * 0.02 : 0, 
                      duration: 0.15,
                      ease: "easeOut"
                    }}
                  >
                    <ImageWithPlaceholder
                      src={`https://not-contest-cdn.openbuilders.xyz/items/${item.id}.${item.id === 6 ? 'png' : 'jpg'}`} // thanks for creating troubles for this :D
                      alt={product?.name || "Product"}
                      width={64}
                      height={64}
                      className="w-16 h-16 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: hintColor }}>
                        {product?.category || "product"}
                      </div>
                      <h3 className="text-lg font-medium mb-0.5 line-clamp-1" style={{ color: textColor }}>
                        {product?.name || `Order #${item.id}`}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{ color: hintColor }}>
                        {formatDate(item.timestamp)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold" style={{ color: textColor }}>
                          {item.total}
                        </span>
                        <span style={{ color: hintColor }}>{item.currency}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              
              {displayedItemsCount < history.length && (
                <div ref={observerRef} className="h-4 w-full bg-transparent" style={{ minHeight: '1px' }} />
              )}
              
              <div className="flex justify-center py-4">
                {isLoadingMore && displayedItemsCount < history.length && (
                  <motion.div
                    className="w-6 h-6 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: hintColor }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                )}
              </div>
            </motion.div>
           )}
         </AnimatePresence>
      </motion.div>

      <BottomNavigation />
    </motion.div>
  )
}
