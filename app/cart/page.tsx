"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useStore } from "@/store"
import { WalletConnect } from "@/features/checkout/components/wallet-connect"
import { SuccessScreen } from "@/features/checkout/components/success-screen"
import { useTonConnect } from "@/hooks/use-ton-connect"
import { useTelegram } from "@/providers/telegram-provider"
import { ROUTES } from "@/lib/constants"
import { Header } from "@/components/layout/header"

export default function CartPage() {
  const router = useRouter()
  const items = useStore((state) => state.items)
  const total = useStore((state) => state.total)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const clearCart = useStore((state) => state.clearCart)

  const { connected, sendTransaction, getAddress } = useTonConnect()
  const { hapticFeedback } = useTelegram()

  const [showWalletConnect, setShowWalletConnect] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCheckout = () => {
    console.log("🛒 Checkout button clicked", { connected, itemsCount: items.length })
    hapticFeedback("impact", "medium")

    if (connected) {
      console.log("💳 Wallet already connected, proceeding to payment")
      handlePayment()
    } else {
      console.log("🔗 Wallet not connected, showing connect modal")
      setShowWalletConnect(true)
    }
  }

  const handleWalletConnectSuccess = () => {
    console.log("✅ Wallet connected successfully from cart")
    setShowWalletConnect(false)
    hapticFeedback("notification", "success")
    setTimeout(() => {
      handlePayment()
    }, 500)
  }

  const handleWalletConnectClose = () => {
    console.log("❌ Wallet connect modal closed")
    setShowWalletConnect(false)
    hapticFeedback("impact", "light")
  }

  const handlePayment = async () => {
    if (!connected) {
      console.error("❌ Wallet not connected for payment")
      return
    }

    setIsProcessingPayment(true)
    hapticFeedback("impact", "heavy")

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: "UQBmcMcpmoG8bDsenKkmolD1gOl1SSlMNf7QF6CYSWMhG4No",
            amount: "10000000",
          },
        ],
      }

      console.log("💳 Processing payment for cart:", {
        items: items.length,
        total: total,
        testAmount: "0.01 TON",
        walletAddress: getAddress(),
      })

      const result = await sendTransaction(transaction)

      console.log("✅ Payment successful:", result)
      hapticFeedback("notification", "success")

      clearCart()

      setShowSuccess(true)
    } catch (error) {
      console.error("❌ Payment failed:", error)
      hapticFeedback("notification", "error")

      if (error instanceof Error) {
        if (error.message.includes("rejected")) {
          alert("Payment was cancelled. Please try again.")
        } else {
          alert(`Payment failed: ${error.message}`)
        }
      } else {
        alert("Payment failed. Please try again.")
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (items.length === 0) {
    router.push(ROUTES.HOME)
    return null
  }

  console.log("🎨 Rendering cart page", {
    showWalletConnect,
    showSuccess,
    connected,
    itemsCount: items.length,
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Header showCart={false} />

      <main className="pb-20 pt-4">
        <div className="p-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
              </div>

              <div className="text-right">
                <div className="font-bold">
                  {item.price} {item.currency}
                </div>
              </div>

              <button onClick={() => removeFromCart(item.id)} className="p-2 bg-zinc-900 rounded-full">
                <span className="sr-only">Remove</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <span className="text-blue-300 font-medium">Test Mode</span>
            </div>
            <p className="text-sm text-blue-200">
              This is a test purchase. You will be charged 0.01 TON regardless of the cart total.
            </p>
            {connected && (
              <p className="text-xs text-blue-300 mt-2">
                Connected: {getAddress()?.slice(0, 8)}...{getAddress()?.slice(-6)}
              </p>
            )}
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs">
              <div>Connected: {connected ? "Yes" : "No"}</div>
              <div>Show Wallet Modal: {showWalletConnect ? "Yes" : "No"}</div>
              <div>Show Success: {showSuccess ? "Yes" : "No"}</div>
              <div>Processing: {isProcessingPayment ? "Yes" : "No"}</div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-800">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-zinc-400">
            <span>Cart Total:</span>
            <span>{total} NOT</span>
          </div>
          <div className="flex justify-between items-center text-sm text-blue-300">
            <span>Test Charge:</span>
            <span>0.01 TON</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessingPayment}
            className="w-full bg-white text-black py-3 px-6 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : connected ? (
              `Pay 0.01 TON`
            ) : (
              `Connect Wallet & Pay`
            )}
          </button>

          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => {
                console.log("🧪 Test button clicked")
                setShowWalletConnect(true)
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm"
            >
              Test: Force Open Wallet Modal
            </button>
          )}
        </div>
      </div>

      {showWalletConnect && <WalletConnect onClose={handleWalletConnectClose} onSuccess={handleWalletConnectSuccess} />}

      {showSuccess && <SuccessScreen />}
    </div>
  )
}
