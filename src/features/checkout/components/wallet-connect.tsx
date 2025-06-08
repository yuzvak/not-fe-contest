"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, ExternalLink, Smartphone } from "lucide-react"
import { useTonConnect } from "@/hooks/use-ton-connect"
import { useTelegram } from "@/providers/telegram-provider"
import type { WalletInfo } from "@tonconnect/sdk"
import { isWalletInfoCurrentlyEmbedded, isWalletInfoCurrentlyInjected, isWalletInfoRemote } from "@tonconnect/sdk"

interface WalletConnectProps {
  onClose: () => void
  onSuccess: () => void
}

export function WalletConnect({ onClose, onSuccess }: WalletConnectProps) {
  const { wallets, connect, isConnecting, error, connected } = useTonConnect()
  const { hapticFeedback, colorScheme } = useTelegram()
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null)
  const [universalLink, setUniversalLink] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const bgColor = colorScheme === "light" ? "#ffffff" : "#1a1a1a"
  const textColor = colorScheme === "light" ? "#000000" : "#ffffff"
  const secondaryBgColor = colorScheme === "light" ? "#f5f5f5" : "#2a2a2a"
  const borderColor = colorScheme === "light" ? "#e0e0e0" : "#404040"

  useEffect(() => {
    if (connected) {
      hapticFeedback("notification", "success")
      onSuccess()
    }
  }, [connected, onSuccess, hapticFeedback])

  useEffect(() => {
    if (universalLink) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(universalLink)}`
      setQrCodeUrl(qrUrl)
    }
  }, [universalLink])

  const handleWalletSelect = async (wallet: WalletInfo) => {
    setSelectedWallet(wallet)
    hapticFeedback("impact", "light")

    try {
      if (isWalletInfoCurrentlyEmbedded(wallet) || isWalletInfoCurrentlyInjected(wallet)) {
        await connect(wallet)
      } else if (isWalletInfoRemote(wallet)) {
        const link = await connect(wallet)
        if (typeof link === "string") {
          setUniversalLink(link)
        }
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      hapticFeedback("notification", "error")
    }
  }

  const handleOpenWallet = () => {
    if (universalLink) {
      hapticFeedback("impact", "medium")
      window.open(universalLink, "_blank")
    }
  }

  const embeddedWallets = wallets.filter(isWalletInfoCurrentlyEmbedded)
  const injectedWallets = wallets.filter(isWalletInfoCurrentlyInjected)
  const remoteWallets = wallets.filter(isWalletInfoRemote)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-3xl overflow-hidden"
          style={{ backgroundColor: bgColor }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderBottomColor: borderColor }}>
            <h2 className="text-xl font-bold" style={{ color: textColor }}>
              Connect your wallet
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{ backgroundColor: secondaryBgColor }}
            >
              <X className="w-5 h-5" style={{ color: textColor }} />
            </button>
          </div>

          <div className="p-6">
            {/* QR Code Section */}
            {universalLink && qrCodeUrl && (
              <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-sm mb-4" style={{ color: textColor }}>
                  Scan with your mobile wallet
                </p>

                <div className="relative inline-block">
                  <div
                    className="w-64 h-64 rounded-2xl overflow-hidden mx-auto mb-4"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-full h-full object-cover" />

                    {/* TON Logo overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">T</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenWallet}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: secondaryBgColor, color: textColor }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Wallet
                  </button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isConnecting && !universalLink && (
              <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: textColor }} />
                <p style={{ color: textColor }}>Connecting to wallet...</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                className="text-center py-4 mb-4 px-4 rounded-lg"
                style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Wallet Selection */}
            {!universalLink && !isConnecting && (
              <div className="space-y-4">
                {/* Embedded Wallets */}
                {embeddedWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletSelect(wallet)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors"
                    style={{ backgroundColor: secondaryBgColor }}
                  >
                    <img
                      src={wallet.imageUrl || "/placeholder.svg"}
                      alt={wallet.name}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium" style={{ color: textColor }}>
                        {wallet.name}
                      </div>
                      <div className="text-sm opacity-60" style={{ color: textColor }}>
                        Embedded
                      </div>
                    </div>
                  </button>
                ))}

                {/* Injected Wallets */}
                {injectedWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletSelect(wallet)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors"
                    style={{ backgroundColor: secondaryBgColor }}
                  >
                    <img
                      src={wallet.imageUrl || "/placeholder.svg"}
                      alt={wallet.name}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium" style={{ color: textColor }}>
                        {wallet.name}
                      </div>
                      <div className="text-sm opacity-60" style={{ color: textColor }}>
                        Browser Extension
                      </div>
                    </div>
                  </button>
                ))}

                {/* Remote Wallets */}
                {remoteWallets.slice(0, 4).map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletSelect(wallet)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors"
                    style={{ backgroundColor: secondaryBgColor }}
                  >
                    <img
                      src={wallet.imageUrl || "/placeholder.svg"}
                      alt={wallet.name}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium" style={{ color: textColor }}>
                        {wallet.name}
                      </div>
                      <div className="text-sm opacity-60" style={{ color: textColor }}>
                        Mobile App
                      </div>
                    </div>
                    <Smartphone className="w-4 h-4 opacity-40" style={{ color: textColor }} />
                  </button>
                ))}

                {remoteWallets.length > 4 && (
                  <button
                    className="w-full p-4 rounded-xl transition-colors text-center"
                    style={{ backgroundColor: secondaryBgColor, color: textColor }}
                  >
                    View all wallets ({remoteWallets.length - 4} more)
                  </button>
                )}
              </div>
            )}

            {/* TON Connect Branding */}
            <div
              className="flex items-center justify-center gap-2 mt-6 pt-4 border-t"
              style={{ borderTopColor: borderColor }}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="font-medium" style={{ color: textColor }}>
                TON Connect
              </span>
              <button className="p-1 rounded-full" style={{ color: textColor }}>
                <span className="text-lg">?</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
