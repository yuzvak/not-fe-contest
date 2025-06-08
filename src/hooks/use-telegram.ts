"use client"

import { useEffect, useState } from "react"
import { telegramWebApp } from "@/services/telegram/webapp"

export function useTelegram() {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState(null)
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    if (telegramWebApp.isAvailable()) {
      telegramWebApp.init()
      setUser(telegramWebApp.getUser())
      setColorScheme(telegramWebApp.getColorScheme())
      setIsReady(true)
    } else {
      setUser({ id: 1, first_name: "Alex" })
      setColorScheme("dark")
      setIsReady(true)
    }
  }, [])

  return {
    isReady,
    user,
    colorScheme,
    webApp: telegramWebApp,
  }
}
