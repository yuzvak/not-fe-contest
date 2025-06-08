"use client"

import { Search, ShoppingBag, User } from "lucide-react"
import { motion } from "framer-motion"

interface EmptyStateProps {
  title: string
  description: string
  icon: "search" | "cart" | "history"
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  const IconComponent = {
    search: Search,
    cart: ShoppingBag,
    history: User,
  }[icon]

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4"
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
      >
        <IconComponent className="w-8 h-8 text-zinc-400" />
      </motion.div>
      <motion.h3
        className="text-lg font-medium mb-2 text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-zinc-400 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {description}
      </motion.p>
    </motion.div>
  )
}
