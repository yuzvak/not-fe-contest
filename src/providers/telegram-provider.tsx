"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { telegramWebApp } from "@/services/telegram/webapp"

interface SafeAreaInset {
  top: number
  bottom: number
  left: number
  right: number
}

interface TelegramThemeParams {
  accent_text_color?: string
  bg_color?: string
  button_color?: string
  button_text_color?: string
  bottom_bar_bg_color?: string
  destructive_text_color?: string
  header_bg_color?: string
  hint_color?: string
  link_color?: string
  secondary_bg_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  text_color?: string
}

interface TelegramContextType {
  webApp: any
  user: any
  isReady: boolean
  colorScheme: "light" | "dark"
  themeParams: TelegramThemeParams
  isExpanded: boolean
  safeAreaInset: SafeAreaInset
  contentSafeAreaInset: SafeAreaInset
  hapticFeedback: (type: "impact" | "notification" | "selection", style?: string) => void
  showAlert: (message: string) => Promise<void>
  showConfirm: (message: string) => Promise<boolean>
  showMainButton: (text: string, onClick: () => void) => void
  hideMainButton: () => void
  showBackButton: (callback: () => void | boolean) => void
  hideBackButton: () => void
  requestFullscreen: () => void
  disableVerticalSwipes: () => void
  exitFullscreen: () => void
  requestTheme: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  shareMessage: (msgId: string, callback?: (success: boolean) => void) => void
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
  colorScheme: "dark",
  themeParams: {},
  isExpanded: false,
  safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
  contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
  hapticFeedback: () => {},
  showAlert: async () => {},
  showConfirm: async () => false,
  showMainButton: () => {},
  hideMainButton: () => {},
  showBackButton: () => {},
  hideBackButton: () => {},
  requestFullscreen: () => {},
  exitFullscreen: () => {},
  requestTheme: () => {},
  setHeaderColor: () => {},
  setBackgroundColor: () => {},
  shareMessage: () => {},
})

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState(null)
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark")
  const [themeParams, setThemeParams] = useState<TelegramThemeParams>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [safeAreaInset, setSafeAreaInset] = useState<SafeAreaInset>({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState<SafeAreaInset>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    const initTelegram = async () => {
      try {
        console.log("TelegramProvider: Starting initialization...")

        if (document.readyState === "loading") {
          await new Promise((resolve) => {
            document.addEventListener("DOMContentLoaded", resolve)
          })
        }

        const checkTelegramScript = () => {
          return new Promise<void>((resolve) => {
            if (typeof window !== "undefined" && window.Telegram?.WebApp) {
              console.log("Telegram WebApp script already loaded")
              resolve()
              return
            }

            let attempts = 0
            const maxAttempts = 50

            const checkScript = () => {
              attempts++
              if (typeof window !== "undefined" && window.Telegram?.WebApp) {
                console.log(`Telegram WebApp script loaded after ${attempts} attempts`)
                resolve()
              } else if (attempts >= maxAttempts) {
                console.warn("Telegram WebApp script not loaded, continuing without it")
                resolve()
              } else {
                setTimeout(checkScript, 100)
              }
            }

            checkScript()
          })
        }

        await checkTelegramScript()

        await new Promise((resolve) => setTimeout(resolve, 200))

        await telegramWebApp.init()

        const telegramUser = telegramWebApp.getUser()
        const telegramColorScheme = telegramWebApp.getColorScheme()
        const telegramThemeParams = telegramWebApp.getThemeParams()
        const telegramIsExpanded = telegramWebApp.isExpanded()
        const telegramSafeAreaInset = telegramWebApp.getSafeAreaInset()
        const telegramContentSafeAreaInset = telegramWebApp.getContentSafeAreaInset()

        setUser(telegramUser)
        setColorScheme(telegramColorScheme)
        setThemeParams(telegramThemeParams)
        setIsExpanded(telegramIsExpanded)
        setSafeAreaInset(telegramSafeAreaInset)
        setContentSafeAreaInset(telegramContentSafeAreaInset)

        const handleThemeChange = (newThemeParams: TelegramThemeParams, newColorScheme: "light" | "dark") => {
          console.log("🎨 Theme changed in provider:", { newThemeParams, newColorScheme })
          setThemeParams(newThemeParams)
          setColorScheme(newColorScheme)
        }

        telegramWebApp.onThemeChange(handleThemeChange)

        setIsReady(true)

        console.log("TelegramProvider: Initialization successful", {
          user: telegramUser,
          colorScheme: telegramColorScheme,
          themeParams: telegramThemeParams,
          isExpanded: telegramIsExpanded,
          safeAreaInset: telegramSafeAreaInset,
          contentSafeAreaInset: telegramContentSafeAreaInset,
        })
      } catch (error) {
        console.warn("TelegramProvider: Failed to initialize, using fallback:", error)

        setUser({ id: 1, first_name: "Alex", username: "alex_dev" })
        setColorScheme("dark")
        setThemeParams({})
        setIsExpanded(true)
        setSafeAreaInset({ top: 0, bottom: 0, left: 0, right: 0 })
        setContentSafeAreaInset({ top: 0, bottom: 0, left: 0, right: 0 })
        setIsReady(true)
      }
    }

    initTelegram()
  }, [])

  const contextValue: TelegramContextType = {
    webApp: telegramWebApp,
    user,
    isReady,
    colorScheme,
    themeParams,
    isExpanded,
    safeAreaInset,
    contentSafeAreaInset,
    hapticFeedback: telegramWebApp.hapticFeedback.bind(telegramWebApp),
    showAlert: telegramWebApp.showAlert.bind(telegramWebApp),
    showConfirm: telegramWebApp.showConfirm.bind(telegramWebApp),
    showMainButton: telegramWebApp.showMainButton.bind(telegramWebApp),
    hideMainButton: telegramWebApp.hideMainButton.bind(telegramWebApp),
    showBackButton: telegramWebApp.showBackButton.bind(telegramWebApp),
    hideBackButton: telegramWebApp.hideBackButton.bind(telegramWebApp),
    requestFullscreen: telegramWebApp.requestFullscreen.bind(telegramWebApp),
    disableVerticalSwipes: telegramWebApp.disableVerticalSwipes.bind(telegramWebApp),
    exitFullscreen: telegramWebApp.exitFullscreen.bind(telegramWebApp),
    requestTheme: telegramWebApp.requestTheme.bind(telegramWebApp),
    setHeaderColor: telegramWebApp.setHeaderColor.bind(telegramWebApp),
    setBackgroundColor: telegramWebApp.setBackgroundColor.bind(telegramWebApp),
    shareMessage: telegramWebApp.shareMessage.bind(telegramWebApp),
  }

  return <TelegramContext.Provider value={contextValue}>{children}</TelegramContext.Provider>
}

export const useTelegram = () => useContext(TelegramContext)
