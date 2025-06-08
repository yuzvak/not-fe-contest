"use client"

import type React from "react"
import { useEffect } from "react"
import { useTelegram } from "./telegram-provider"
import { useStore } from "@/store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTelegram()
  const setTheme = useStore((state) => state.setTheme)

  useEffect(() => {
    setTheme(colorScheme)
  }, [colorScheme, setTheme])

  return <>{children}</>
}
