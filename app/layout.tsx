import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Not Store",
  description: "Telegram Mini App Store",
  generator: "v0.dev",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script src="https://telegram.org/js/telegram-web-app.js?57" strategy="afterInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
