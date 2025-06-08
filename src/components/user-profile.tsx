"use client"

import { useTelegram } from "@/providers/telegram-provider"
import { motion } from "framer-motion"

export function UserProfile() {
  const { user } = useTelegram()

  return (
    <motion.div
      className="p-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <motion.div
        className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
      >
        {user?.photo_url ? (
          <img
            src={user.photo_url || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {user?.first_name?.[0] || "A"}
          </motion.span>
        )}
      </motion.div>
      <motion.h2
        className="text-xl font-semibold mb-1 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {user?.first_name || "Alex"}
      </motion.h2>
    </motion.div>
  )
}
