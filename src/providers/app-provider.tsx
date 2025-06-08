"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { TelegramProvider, useTelegram } from "./telegram-provider"
import { ThemeProvider } from "./theme-provider"
import { AppLoader } from "@/components/app-loader"
import { useStore } from "@/store"

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false)
  const [hasShownInitialLoader, setHasShownInitialLoader] = useState(false)
  const { isReady: isTelegramReady } = useTelegram()
  const products = useStore((state) => state.products)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const isLoading = useStore((state) => state.isLoading)
  const error = useStore((state) => state.error)
  const [hasStartedLoading, setHasStartedLoading] = useState(false)
  const initializationRef = useRef(false)
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const wasShown = sessionStorage.getItem("app-loader-shown")
    if (wasShown) {
      setHasShownInitialLoader(true)
      setIsAppReady(true)
    }
  }, [])

  useEffect(() => {
    if (isTelegramReady && !hasStartedLoading && !initializationRef.current) {
      console.log("🚀 Starting products fetch from AppProvider")
      initializationRef.current = true
      setHasStartedLoading(true)
      fetchProducts()
    }
  }, [isTelegramReady, hasStartedLoading, fetchProducts])

  useEffect(() => {
    if (hasShownInitialLoader) {
      return
    }

    const checkAppReady = async () => {
      if (!isTelegramReady) {
        console.log("⏳ Waiting for Telegram initialization...")
        return
      }

      if (error) {
        console.log("⚠️ Error occurred, showing app:", error)
        setIsAppReady(true)
        setHasShownInitialLoader(true)
        sessionStorage.setItem("app-loader-shown", "true")
        return
      }

      if (products.length > 0) {
        console.log("✅ Products loaded, showing app")
        setTimeout(() => {
          setIsAppReady(true)
          setHasShownInitialLoader(true)
          sessionStorage.setItem("app-loader-shown", "true")
        }, 1000)
        return
      }

      if (isLoading) {
        console.log("⏳ Still loading products...")
        return
      }

      if (!isLoading && products.length === 0) {
        console.log("⚠️ No products loaded and not loading, showing app anyway")
        setIsAppReady(true)
        setHasShownInitialLoader(true)
        sessionStorage.setItem("app-loader-shown", "true")
        return
      }
    }

    checkAppReady()
  }, [isTelegramReady, products.length, isLoading, error, hasShownInitialLoader])

  useEffect(() => {
    if (hasShownInitialLoader) {
      return
    }

    safetyTimeoutRef.current = setTimeout(() => {
      if (!isAppReady) {
        console.log("⏰ Safety timeout reached, showing app")
        setIsAppReady(true)
        setHasShownInitialLoader(true)
        sessionStorage.setItem("app-loader-shown", "true")
      }
    }, 8000)

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current)
      }
    }
  }, [isAppReady, hasShownInitialLoader])

  const shouldShowLoader = !isAppReady && !hasShownInitialLoader

  console.log("🎯 AppProvider state:", {
    isTelegramReady,
    hasStartedLoading,
    productsLength: products.length,
    isLoading,
    error,
    isAppReady,
    hasShownInitialLoader,
    shouldShowLoader,
  })

  return (
    <>
      <AppLoader isVisible={shouldShowLoader} />
      {children}
    </>
  )
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TelegramProvider>
      <ThemeProvider>
        <AppInitializer>{children}</AppInitializer>
      </ThemeProvider>
    </TelegramProvider>
  )
}
