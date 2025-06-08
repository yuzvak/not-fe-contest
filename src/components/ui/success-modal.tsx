"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface SuccessModalProps {
  isVisible: boolean
  onClose: () => void
  purchaseAmount?: number
  currency?: string
}

export function SuccessModal({ isVisible, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          aria-describedby="success-description"
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative flex flex-col items-center justify-center w-full max-w-sm px-6 py-12 mx-4 text-center"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="relative w-64 h-64"
                initial={{ rotate: -30 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <img 
                  src="/images/party-popper.webp" 
                  alt="Party popper" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-center"
            >
              <h2 id="success-title" className="text-4xl font-bold mb-2 text-white">
                You Got It!
              </h2>
              <p id="success-description" className="text-lg text-white/80 mb-6">
                Your purchase is on the way
              </p>
            </motion.div>
            <motion.button
                onClick={onClose}
                className="w-full bg-white text-black py-3 px-5 rounded-xl font-medium text-lg mt-10 focus:outline-none"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                autoFocus
              >
                Awesome
              </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
