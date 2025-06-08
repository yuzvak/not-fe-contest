"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { TonConnectUI, type Wallet } from "@tonconnect/ui"

interface TonTransaction {
  validUntil: number
  messages: Array<{
    address: string
    amount: string
    payload?: string
    stateInit?: string
  }>
}

interface TonConnectContextType {
  tonConnectUI: TonConnectUI | null
  connected: boolean
  wallet: Wallet | null
  wallets: any[]
  isConnecting: boolean
  error: string | null
  connect: (wallet?: any) => Promise<void>
  disconnect: () => Promise<void>
  sendTransaction: (transaction: TonTransaction) => Promise<any>
  getAddress: () => string | null
  getBalance: () => null
}

const TonConnectContext = createContext<TonConnectContextType | null>(null)

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  const [tonConnectUI, setTonConnectUI] = useState<TonConnectUI | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallets, setWallets] = useState<any[]>([])

  const manifestUrl = "https://not-fe-contest-bice.vercel.app/tonconnect-manifest.json"

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initTonConnectUI = async () => {
      try {
        console.log("🔄 Initializing TON Connect UI globally")

        const ui = new TonConnectUI({
          manifestUrl: manifestUrl,
        })

        unsubscribe = ui.onStatusChange((wallet) => {
          console.log("🔄 TON Connect UI status changed:", wallet)

          if (wallet) {
            setWallet(wallet)
            setError(null)
            console.log("✅ Wallet connected:", wallet.account.address)
          } else {
            setWallet(null)
            console.log("🔌 Wallet disconnected")
          }
          setIsConnecting(false)
        })

        const availableWallets = await ui.getWallets()
        setWallets(availableWallets)

        setTonConnectUI(ui)
        console.log("✅ TON Connect UI initialized globally")
      } catch (err) {
        console.error("❌ Failed to initialize TON Connect UI:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize")
      }
    }

    initTonConnectUI()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const connect = useCallback(async (wallet?: any) => {
    if (!tonConnectUI) {
      console.error('TonConnectUI not initialized')
      return
    }

    if (tonConnectUI.connected) {
      console.log('Wallet already connected')
      return
    }

    try {
      if (wallet && wallet.appName) {
        await tonConnectUI.openSingleWalletModal(wallet.appName)
      } else {
        await tonConnectUI.openModal()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [tonConnectUI])

  const disconnect = useCallback(async () => {
    if (!tonConnectUI) {
      console.warn("TON Connect UI not initialized for disconnect")
      return
    }

    try {
      await tonConnectUI.disconnect()
      setWallet(null)
      setError(null)
      console.log("🔌 Wallet disconnected")
    } catch (err) {
      console.error("❌ Disconnect failed:", err)
      setError(err instanceof Error ? err.message : "Disconnect failed")
    }
  }, [tonConnectUI])

  const sendTransaction = useCallback(
    async (transaction: TonTransaction) => {
      if (!tonConnectUI) {
        throw new Error("TON Connect UI not initialized")
      }
      
      if (!tonConnectUI.connected) {
        throw new Error("Wallet not connected")
      }

      try {
        console.log("💸 Sending transaction:", transaction)

        const result = await tonConnectUI.sendTransaction(transaction)

        console.log("✅ Transaction sent successfully:", result)
        return {
          boc: result.boc,
          hash: result.boc,
          success: true,
        }
      } catch (err) {
        console.error("❌ Transaction failed:", err)

        if (err instanceof Error) {
          if (err.message.includes("rejected") || err.message.includes("cancelled") || err.message.includes("denied")) {
            throw new Error("Transaction was rejected by user")
          }
        }

        throw err
      }
    },
    [tonConnectUI],
  )

  const getAddress = useCallback(() => {
    return wallet?.account?.address || null
  }, [wallet])

  const getBalance = useCallback(() => {
    return null
  }, [])

  const value: TonConnectContextType = {
    tonConnectUI,
    connected: tonConnectUI?.connected || false,
    wallet,
    wallets,
    isConnecting,
    error,
    connect,
    disconnect,
    sendTransaction,
    getAddress,
    getBalance,
  }

  return (
    <TonConnectContext.Provider value={value}>
      {children}
    </TonConnectContext.Provider>
  )
}

export function useTonConnect() {
  const context = useContext(TonConnectContext)
  if (!context) {
    throw new Error('useTonConnect must be used within a TonConnectProvider')
  }
  return context
}
