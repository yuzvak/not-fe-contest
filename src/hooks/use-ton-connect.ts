"use client"

import { useTonConnect as useTonConnectContext } from "@/providers/ton-connect-provider"

export function useTonConnect() {
  return useTonConnectContext()
}
