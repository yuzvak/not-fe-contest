"use client"

import { motion } from "framer-motion"

export function EmptyHistory() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <motion.div
        className="text-6xl mb-4"
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
      >
        📦
      </motion.div>
      <motion.h3
        className="text-lg font-medium mb-2 text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        No history yet
      </motion.h3>
      <motion.p
        className="text-zinc-400 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Let's change that
      </motion.p>
    </motion.div>
  )
}
