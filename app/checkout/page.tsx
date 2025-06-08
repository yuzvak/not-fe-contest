"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { useTonConnect } from "@/hooks/use-ton-connect"
import { usePurchaseFlow } from "@/hooks/use-purchase-flow"
import { useTelegram } from "@/providers/telegram-provider"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { WalletConnect } from "@/features/checkout/components/wallet-connect"

export default function CheckoutPage() {
  const router = useRouter()
  const items = useStore((state) => state.items)
  const total = useStore((state) => state.total)
  const { connected, getAddress, isConnecting, error } = useTonConnect()
  const { isProcessing, purchaseSuccess, handlePurchase } = usePurchaseFlow()
  const { hapticFeedback, showBackButton, hideBackButton, colorScheme, themeParams } = useTelegram()

  const [mounted, setMounted] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  
  const paymentStatus = isProcessing ? "processing" : purchaseSuccess ? "success" : "idle"

  const bgColor = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const buttonColor = themeParams.button_color || (colorScheme === "light" ? "#007aff" : "#ffffff")
  const buttonTextColor = themeParams.button_text_color || (colorScheme === "light" ? "#ffffff" : "#000000")
  const hintColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleBackButtonClick = () => {
      if (paymentStatus === "success") {
        router.push("/")
      } else {
        router.back()
      }
    }
    showBackButton(handleBackButtonClick)
    return () => hideBackButton()
  }, [router, showBackButton, hideBackButton, mounted, paymentStatus])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/")
    }
  }, [items.length, router, mounted])

  const handlePayment = async () => {
    if (!connected) {
      setShowWalletModal(true)
      return
    }

    hapticFeedback("impact", "medium")
    await handlePurchase()
    
    if (purchaseSuccess) {
      hapticFeedback("notification", "success")
    }
  }

  const formatPrice = (price: number) => {
    return price
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div
        className="px-4 py-4 border-b"
        style={{
          paddingTop: `calc(var(--tg-safe-area-inset-top) + 44px + 16px)`,
          borderBottomColor: hintColor + "33",
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: textColor }}>
          Checkout
        </h1>
        {testnet && (
          <p className="text-sm mt-1" style={{ color: hintColor }}>
            Test mode - 0.01 TON will be charged for testing
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {paymentStatus === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                  Order Summary
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span style={{ color: textColor }}>{item.name}</span>
                        {item.quantity > 1 && <span style={{ color: hintColor }}> x{item.quantity}</span>}
                      </div>
                      <span style={{ color: textColor }}>
                        {formatPrice(item.price * item.quantity)} {item.currency}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="border-t mt-4 pt-4 flex justify-between items-center"
                  style={{ borderTopColor: hintColor + "33" }}
                >
                  <span className="text-lg font-bold" style={{ color: textColor }}>
                    Total:
                  </span>
                  <span className="text-lg font-bold" style={{ color: textColor }}>
                    {formatPrice(total)} NOT
                  </span>
                </div>

                {/* Test Payment Notice */}
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: hintColor + "20" }}>
                  <p className="text-sm" style={{ color: textColor }}>
                    💡 <strong>Test Payment:</strong> You will be charged 0.01 TON for testing purposes, regardless of
                    the order total.
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                  Payment Method
                </h2>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: hintColor + "33",
                    backgroundColor: colorScheme === "light" ? "#f9f9f9" : "#1a1a1a",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <div>
                      <div style={{ color: textColor }}>TON Wallet</div>
                      <div className="text-sm" style={{ color: hintColor }}>
                        {connected ? `Connected: ${getAddress()?.slice(0, 8)}...` : "Not connected"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {paymentStatus === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mb-6"
              >
                <Loader2 className="w-16 h-16" style={{ color: buttonColor }} />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                Processing Payment
              </h2>
              <p style={{ color: hintColor }}>Please confirm the transaction in your wallet</p>
              <p className="text-sm mt-2" style={{ color: hintColor }}>
                Amount: 0.01 TON
              </p>
            </motion.div>
          )}

          {paymentStatus === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="mb-6"
              >
                <CheckCircle className="w-16 h-16 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                Payment Successful!
              </h2>
              <p className="mb-4" style={{ color: hintColor }}>
                Your test payment of 0.01 TON was processed successfully
              </p>

            </motion.div>
          )}

          {error && paymentStatus === "idle" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
              <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                Payment Failed
              </h2>
              <p className="mb-4" style={{ color: hintColor }}>
                {error || "Something went wrong. Please try again."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div
        className="p-4 border-t"
        style={{
          paddingBottom: `calc(var(--tg-safe-area-inset-bottom) + 16px)`,
          borderTopColor: hintColor + "33",
        }}
      >
        <AnimatePresence mode="wait">
          {paymentStatus === "idle" && (
            <motion.button
              key="pay-button"
              onClick={handlePayment}
              disabled={isConnecting}
              className="w-full py-4 px-6 rounded-2xl font-medium text-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConnecting ? "Connecting..." : connected ? "Pay 0.01 TON (Test)" : "Connect TON Wallet"}
            </motion.button>
          )}

          {paymentStatus === "success" && (
            <motion.button
              key="continue-button"
              onClick={() => router.push("/")}
              className="w-full py-4 px-6 rounded-2xl font-medium text-lg transition-colors"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue Shopping
            </motion.button>
          )}


        </AnimatePresence>
      </div>

      {showWalletModal && (
        <WalletConnect
          onClose={() => setShowWalletModal(false)}
          onSuccess={() => {
            setShowWalletModal(false)
            setTimeout(() => {
              handlePayment()
            }, 500)
          }}
        />
      )}
    </div>
  )
}
