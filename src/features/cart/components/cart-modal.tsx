"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { useStore } from "@/store"
import { useTelegram } from "@/providers/telegram-provider"
import { usePurchaseFlow } from "@/hooks/use-purchase-flow"
import { motion, AnimatePresence } from "framer-motion"
import { SuccessModal } from "@/components/ui/success-modal"


export function CartModal() {
  const items = useStore((state) => state.items)
  const total = useStore((state) => state.total)
  const isCartOpen = useStore((state) => state.isCartOpen)
  const closeCart = useStore((state) => state.closeCart)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const { hapticFeedback, showBackButton, hideBackButton, colorScheme, themeParams } = useTelegram()

  const [isClosing, setIsClosing] = useState(false)
  
  const handleClose = () => {
    hapticFeedback("impact", "light")
    setIsClosing(true)
    setTimeout(() => {
      closeCart()
      setIsClosing(false)
    }, 300)
  }
  
  const { isProcessing, purchaseSuccess, handlePurchase, closePurchaseSuccess } = usePurchaseFlow(handleClose)

  const bgColor = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const buttonColor = themeParams.button_color || (colorScheme === "light" ? "#007aff" : "#ffffff")
  const buttonTextColor = themeParams.button_text_color || (colorScheme === "light" ? "#ffffff" : "#000000")
  const secondaryBgColor = themeParams.secondary_bg_color || (colorScheme === "light" ? "#f7f7f7" : "#1a1a1a")
  const hintColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")
  const borderColor = themeParams.secondary_bg_color || (colorScheme === "light" ? "#f0f0f0" : "#333333")

  const formatPrice = (price: number) => {
    return price
  }

  const formattedTotal = formatPrice(total)

  useEffect(() => {
    if (isCartOpen && !isClosing) {
      const handleBackButtonClick = () => {
        handleClose()
      }
      showBackButton(handleBackButtonClick)
    } else {
      hideBackButton()
    }

    return () => {
      hideBackButton()
    }
  }, [isCartOpen, isClosing, showBackButton, hideBackButton])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  useEffect(() => {
    if (isCartOpen) {
      setIsClosing(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  const handleRemoveItem = (id: number) => {
    hapticFeedback("impact", "medium")
    removeFromCart(id)
  }

  const handleCheckout = async () => {
    hapticFeedback("impact", "heavy")
    await handlePurchase()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const shouldShow = isCartOpen && !isClosing

  if (purchaseSuccess) {
    return (
      <SuccessModal
        isVisible={purchaseSuccess}
        onClose={closePurchaseSuccess}
      />
    )
  }

  return (
    <AnimatePresence>
      {(isCartOpen || isClosing) && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: shouldShow ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{
              opacity: shouldShow ? 1 : 0,
              backdropFilter: shouldShow ? "blur(8px)" : "blur(0px)",
            }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={handleBackdropClick}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          />

          {items.length === 0 ? (
            <motion.div
              className="relative rounded-t-3xl p-8 w-full max-w-lg text-center border-t"
              style={{
                backgroundColor: bgColor,
                borderTopColor: borderColor,
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{
                y: shouldShow ? 0 : "100%",
                opacity: shouldShow ? 1 : 0,
              }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                opacity: { duration: 0.25 },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: secondaryBgColor,
                  color: hintColor,
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                className="mt-8 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: shouldShow ? 0 : 20,
                  opacity: shouldShow ? 1 : 0,
                }}
                transition={{ delay: shouldShow ? 0.2 : 0, duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-4" style={{ color: textColor }}>
                  Cart's cold
                </h2>
                <p className="text-lg" style={{ color: hintColor }}>
                  No items yet
                </p>
              </motion.div>

              <motion.button
                onClick={handleClose}
                className="w-full py-4 px-6 rounded-2xl font-medium text-lg transition-colors"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: shouldShow ? 0 : 20,
                  opacity: shouldShow ? 1 : 0,
                }}
                transition={{ delay: shouldShow ? 0.3 : 0, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                OK
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="relative rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden border-t"
              style={{
                backgroundColor: bgColor,
                borderTopColor: borderColor,
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{
                y: shouldShow ? 0 : "100%",
                opacity: shouldShow ? 1 : 0,
              }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94], // Более плавная кривая анимации
                opacity: { duration: 0.25 },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="p-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: shouldShow ? 0 : 20,
                  opacity: shouldShow ? 1 : 0,
                }}
                transition={{ delay: shouldShow ? 0.1 : 0, duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: textColor }}>
                    Cart
                  </h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: secondaryBgColor,
                      color: hintColor,
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                          opacity: shouldShow ? 1 : 0,
                          y: shouldShow ? 0 : 20,
                          scale: shouldShow ? 1 : 0.95,
                        }}
                        exit={{ opacity: 0, x: -100, scale: 0.95 }}
                        transition={{
                          duration: 0.3,
                          delay: shouldShow ? index * 0.05 : 0,
                          layout: { duration: 0.2 },
                        }}
                        layout
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                          {item.quantity > 1 && (
                            <motion.div
                              className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.quantity}
                            </motion.div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-sm" style={{ color: hintColor }}>
                            {item.category}
                          </div>
                          <h3 className="font-medium" style={{ color: textColor }}>
                            {item.name}
                          </h3>
                        </div>

                        <div className="text-right">
                          {item.quantity > 1 && (
                            <div className="text-sm" style={{ color: hintColor }}>
                              {formatPrice(item.price)} each
                            </div>
                          )}
                          <div className="font-bold" style={{ color: textColor }}>
                            {formatPrice(item.price * item.quantity)} {item.currency}
                          </div>
                        </div>

                        <motion.button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 rounded-full transition-colors"
                          style={{
                            backgroundColor: secondaryBgColor,
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <span className="sr-only">Remove</span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke={textColor}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                className="p-6 border-t"
                style={{
                  borderTopColor: borderColor,
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: shouldShow ? 0 : 20,
                  opacity: shouldShow ? 1 : 0,
                }}
                transition={{ delay: shouldShow ? 0.2 : 0, duration: 0.3 }}
              >
                <motion.button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 rounded-2xl font-medium text-lg transition-colors"
                  style={{
                    backgroundColor: buttonColor,
                    color: buttonTextColor,
                  }}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: shouldShow ? 1 : 0.95,
                    opacity: shouldShow ? 1 : 0,
                  }}
                  transition={{ delay: shouldShow ? 0.3 : 0, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Buy for ${formattedTotal} NOT`}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
