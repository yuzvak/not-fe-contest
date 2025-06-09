"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useTelegram } from "@/providers/telegram-provider"
import { motion } from "framer-motion"
import Image from "next/image"

export default function AccountPage() {
  const router = useRouter()
  const { user, colorScheme, themeParams } = useTelegram()
  const history = useStore((state) => state.history)
  const isHistoryLoading = useStore((state) => state.isLoading)
  const fetchHistory = useStore((state) => state.fetchHistory)
  const products = useStore((state) => state.products)
  const fetchProducts = useStore((state) => state.fetchProducts)
  
  const [displayedItemsCount, setDisplayedItemsCount] = useState(15)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const bgColor = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const hintColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")
  const skeletonColor = colorScheme === "light" ? "#f0f0f0" : "#1a1a1a"

  const userName = user?.first_name || "User"
  const userPhotoUrl = user?.photo_url || "/placeholder.svg?height=128&width=128"

  useEffect(() => {
    fetchHistory()
    if (products.length === 0) {
      fetchProducts()
    }
  }, [fetchHistory, fetchProducts, products.length])

  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || displayedItemsCount >= history.length) return
    
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedItemsCount(prev => Math.min(prev + 10, history.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, displayedItemsCount, history.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isHistoryLoading) {
          loadMoreItems()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreItems, isHistoryLoading])

  const formatPrice = (price: number) => {
    return (price / 1000).toFixed(0)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
  }

  const getProductById = (id: number) => {
    return products.find((product) => product.id === id)
  }

  const HistorySkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex-shrink-0"
            style={{ backgroundColor: skeletonColor }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-3 rounded"
              style={{ backgroundColor: skeletonColor, width: "60%" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div
              className="h-4 rounded"
              style={{ backgroundColor: skeletonColor, width: "80%" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
            />
          </div>

          {/* Price skeleton */}
          <div className="text-right space-y-2">
            <motion.div
              className="h-3 rounded"
              style={{ backgroundColor: skeletonColor, width: "50px" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="h-4 rounded"
              style={{ backgroundColor: skeletonColor, width: "70px" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
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
          className="w-32 h-32 rounded-full overflow-hidden mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 300 }}
        >
          <Image
            src={userPhotoUrl || "/placeholder.svg"}
            alt="Profile"
            width={128}
            height={128}
            className="object-cover w-full h-full"
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

        {isHistoryLoading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 15 }}
            >
              📦
            </motion.div>
            <motion.h2
              className="text-2xl font-bold mb-2"
              style={{ color: textColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              No history yet
            </motion.h2>
            <motion.p
              style={{ color: hintColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              Let's change that
            </motion.p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.slice(0, displayedItemsCount).map((item, index) => {
              const product = getProductById(item.id)
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image
                      src={product?.images[0] || "/placeholder.svg"}
                      alt={product?.name || "Product"}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: hintColor }}>
                      {product?.category || "product"}
                    </div>
                    <h3 className="font-medium" style={{ color: textColor }}>
                      {product?.name || `Order #${item.id}`}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ color: hintColor }}>
                      {formatDate(item.timestamp)}
                    </div>
                    <div className="font-bold" style={{ color: textColor }}>
                      {formatPrice(item.total)} {item.currency}
                    </div>
                  </div>
                </motion.div>
              )
            })}
            
            {displayedItemsCount < history.length && (
              <div ref={observerRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <motion.div
                    className="w-6 h-6 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: hintColor }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  <div className="text-sm" style={{ color: hintColor }}>
                    Scroll to load more...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <BottomNavigation />
    </motion.div>
  )
}
