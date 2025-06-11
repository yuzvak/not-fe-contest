"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { useTelegram } from "@/providers/telegram-provider"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, SearchIcon } from "lucide-react"

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const products = useStore((state) => state.products)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const [isSearching, setIsSearching] = useState(false)
  const { colorScheme, themeParams, showBackButton, hideBackButton, hapticFeedback } = useTelegram()

  const bgColor = colorScheme === "light" ? "#FFFFFF" : "#000000"
  const textColor = colorScheme === "light" ? "#000000" : "#FFFFFF"
  const searchBgColor = colorScheme === "light" ? "#F2F2F7" : "#1C1C1E"
  const searchTextColor = colorScheme === "light" ? "#000000" : "#FFFFFF"
  const placeholderColor = colorScheme === "light" ? "#8E8E93" : "#8E8E93"
  const hintColor = colorScheme === "light" ? "#999999" : "#666666"

  useEffect(() => {
    const handleBackButtonClick = () => {
      router.back()
    }

    showBackButton(handleBackButtonClick)

    return () => {
      hideBackButton()
    }
  }, [router, showBackButton, hideBackButton])

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products.length, fetchProducts])

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts(products)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    setTimeout(() => {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.id.toString().includes(query),
      )
      setFilteredProducts(filtered)
      setIsSearching(false)
    }, 200)
  }, [query, products])

  const handleClose = () => {
    router.back()
  }

  const handleClearSearch = () => {
    hapticFeedback("impact", "light")
    setQuery("")
  }

  const showNoResults = query && !isSearching && filteredProducts.length === 0
  const showResults = !isSearching && (query ? filteredProducts.length > 0 : products.length > 0)
  const resultsToShow = query ? filteredProducts : products

  return (
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor: bgColor, color: textColor }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header - fixed with background from the very top */}
      <header className="fixed top-0 left-0 right-0 z-40" style={{ backgroundColor: bgColor, color: textColor }}>
        <div
          className="flex items-center p-4"
          style={{
            paddingTop: `calc(var(--tg-safe-area-inset-top) + 44px + 12px)`,
          }}
        >
          <div className="relative flex-1 mr-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-10 pl-10 pr-10 py-2 rounded-full focus:outline-none"
              style={{
                backgroundColor: searchBgColor,
                color: searchTextColor,
              }}
              autoFocus
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon size={20} color={placeholderColor} />
            </div>

            <AnimatePresence>
              {query && (
                <motion.button
                  className="absolute right-3 top-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: colorScheme === "light" ? "#D1D1D6" : "#3A3A3C",
                  }}
                  onClick={handleClearSearch}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={14} color={colorScheme === "light" ? "#000000" : "#FFFFFF"} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleClose} style={{ color: textColor }}>
            Cancel
          </button>
        </div>
      </header>

      {/* Search Results */}
      <main
        className="px-4 pb-4"
        style={{
          paddingTop: `calc(44px + 70px)`,
          paddingBottom: `calc(var(--tg-safe-area-inset-bottom) + 16px)`,
        }}
      >
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="searching"
              className="flex items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    stroke={textColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    strokeDashoffset="15"
                  />
                </svg>
              </motion.div>
            </motion.div>
          ) : showNoResults ? (
            <motion.div
              key="no-results"
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="mb-6 relative w-32 h-32"
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
              >
                <Image
                  src="/images/hatching-chick.webp"
                  alt="Hatching Chick"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
              <motion.h2
                className="text-3xl font-bold mb-2"
                style={{ color: textColor }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Not Found
              </motion.h2>
              <motion.p
                className="text-lg"
                style={{ color: hintColor }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                This style doesn't exist
              </motion.p>
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {resultsToShow.map((product, index) => (
                <motion.div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
                    <Image
                      src={product.images[product.id - 1] || "/placeholder.svg?width=400&height=400&query=clothing item"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  <h3 className="text-lg font-medium mb-0.5 line-clamp-1" style={{ color: textColor }}>
                    {product.category} {product.name}
                  </h3>

                  <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: textColor }}>
                    {product.price}
                  </span>
                  <span style={{ color: hintColor }}>{product.currency}</span>
                </div>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
