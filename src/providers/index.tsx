"use client"

import type React from "react"
import { AppProvider } from "./app-provider"
import { TonConnectProvider } from "./ton-connect-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectProvider>
      <AppProvider>{children}</AppProvider>
    </TonConnectProvider>
  )
}
