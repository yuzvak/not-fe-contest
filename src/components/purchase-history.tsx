"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface HistoryItem {
  timestamp: number
  id: number
  total: number
  currency: string
}

interface PurchaseHistoryProps {
  history: HistoryItem[]
}

export function PurchaseHistory({ history }: PurchaseHistoryProps) {
  const formatPrice = (price: number) => {
    return (price / 1000).toFixed(0)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <motion.h3
        className="text-lg font-semibold mb-4 text-white"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        History
      </motion.h3>
      <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
        {history.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3 bg-zinc-900 rounded-lg p-3"
            variants={item}
            whileHover={{ scale: 1.02, backgroundColor: "#27272a" }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="Product"
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white">Order #{item.id}</p>
              <p className="text-xs text-zinc-400">{formatDate(item.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm text-white">
                {formatPrice(item.total)} {item.currency}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
