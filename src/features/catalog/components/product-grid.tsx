"use client"

import { ProductCard } from "./product-card"
import type { Product } from "@/types"
import { motion } from "framer-motion"

interface ProductGridProps {
  products: Product[]
  isSelectionMode?: boolean
  selectedProducts?: Product[]
  onLongPress?: (product: Product) => void
  onSelect?: (product: Product) => void
}

export function ProductGrid({
  products,
  isSelectionMode = false,
  selectedProducts = [],
  onLongPress,
  onSelect,
}: ProductGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  }

  return (
    <motion.div className="grid grid-cols-2 gap-4 px-4 py-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-8" variants={container} initial="hidden" animate="show">
      {products.map((product, index) => (
        <motion.div key={product.id} variants={item} layout>
          <ProductCard
            product={product}
            index={index}
            isSelectionMode={isSelectionMode}
            isSelected={selectedProducts.some((p) => p.id === product.id)}
            onLongPress={onLongPress}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
