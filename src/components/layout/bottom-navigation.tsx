"use client"

import { useRouter, usePathname } from "next/navigation"
import { ROUTES } from "@/lib/constants"
import { useTelegram } from "@/providers/telegram-provider"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useRef, useCallback } from "react"

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { colorScheme, themeParams, user, hapticFeedback } = useTelegram()

  const [storeClickCount, setStoreClickCount] = useState(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const headerBg = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = colorScheme === "light" ? "#000000" : "#ffffff"
  const activeColor = themeParams.link_color || (colorScheme === "light" ? "#007aff" : "#ffffff")
  const inactiveColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")
  const borderColor = themeParams.secondary_bg_color || (colorScheme === "light" ? "#f0f0f0" : "#1a1a1a")

  const userName = user?.first_name || "User"
  const userPhotoUrl = user?.photo_url || "/placeholder.svg?height=24&width=24"

  const handleNavigation = useCallback(
    (route: string) => {
      hapticFeedback("impact", "light")

      router.prefetch(route)

      router.push(route)
    },
    [router, hapticFeedback],
  )

  const handleStoreClick = useCallback(() => {
    if (pathname === ROUTES.HOME) {
      setStoreClickCount((prevCount) => {
        const newCount = prevCount + 1

        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }

        if (newCount >= 5) {
          hapticFeedback("notification", "success")
          router.push("/easter-egg")
          setTimeout(() => setStoreClickCount(0), 100)
          return 0
        }

        if (newCount >= 3) {
          hapticFeedback("impact", "heavy")
        } else {
          hapticFeedback("impact", "medium")
        }

        clickTimeoutRef.current = setTimeout(() => {
          setStoreClickCount(0)
        }, 2000)

        return newCount
      })
    } else {
      handleNavigation(ROUTES.HOME)
      setStoreClickCount(0)
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [pathname, router, hapticFeedback, handleNavigation])

  const handleAccountClick = useCallback(() => {
    handleNavigation(ROUTES.ACCOUNT)
    setStoreClickCount(0)
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
  }, [handleNavigation])

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 border-t safe-area-bottom safe-area-x"
      style={{
        backgroundColor: headerBg,
        borderTopColor: borderColor,
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around pt-2.5">
        <motion.button
          onClick={handleStoreClick}
          className="flex flex-col items-center gap-1 relative"
          style={{
            color: pathname === ROUTES.HOME ? activeColor : inactiveColor,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <div className="w-10 h-8 flex items-center justify-center">
            <svg width="41" height="32" viewBox="0 0 41 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_3001_872)">
                <path
                  d="M15.9943 20.6719L19.4849 14.6965L19.4849 21.0067H16.2057C16.1669 21.0012 16.1303 20.9879 16.0983 20.9682C16.0607 20.9451 16.0308 20.9141 16.0101 20.8787C15.9895 20.8434 15.9787 20.8049 15.9774 20.7667C15.9764 20.7349 15.9819 20.7027 15.9943 20.6719Z"
                  fill="currentColor"
                />
                <path
                  d="M24.7951 21.0067H21.5156L21.5156 14.6963L25.0066 20.6718C25.0188 20.7023 25.0244 20.7345 25.0233 20.7667C25.022 20.8054 25.0112 20.8438 24.9907 20.8787C24.9702 20.9138 24.9403 20.9449 24.9024 20.9682C24.8703 20.9879 24.8338 21.0012 24.7951 21.0067Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.5 29C27.1274 29 32.5 23.6274 32.5 17C32.5 10.3726 27.1274 5 20.5 5C13.8726 5 8.5 10.3726 8.5 17C8.5 23.6274 13.8726 29 20.5 29ZM21.377 10.4332C21.1949 10.1216 20.8611 9.92998 20.5002 9.92999C20.1393 9.92999 19.8055 10.1216 19.6235 10.4332L14.2176 19.6871C14.2066 19.706 14.1961 19.7254 14.1863 19.745C14.0178 20.0819 13.9353 20.4558 13.9477 20.8334C13.9601 21.211 14.067 21.5786 14.257 21.9037C14.4471 22.2288 14.7145 22.5014 15.035 22.6984C15.3554 22.8953 15.7189 23.0105 16.0931 23.0352C16.1154 23.0367 16.1378 23.0375 16.1601 23.0375H24.8407C24.8631 23.0375 24.8854 23.0367 24.9077 23.0352C25.2821 23.0105 25.6454 22.8952 25.9657 22.6984C26.2859 22.5016 26.5536 22.2291 26.7438 21.9037C26.9342 21.5782 27.0406 21.2105 27.053 20.8334C27.0654 20.4563 26.9833 20.0824 26.8146 19.745C26.8048 19.7254 26.7943 19.706 26.7832 19.687L21.377 10.4332Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_3001_872">
                  <rect width="40" height="32" fill="white" transform="translate(0.5)" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <span className="text-xs">Store</span>
        </motion.button>

        <motion.button
          onClick={handleAccountClick}
          className="flex flex-col items-center gap-1"
          style={{
            color: pathname === ROUTES.ACCOUNT ? activeColor : inactiveColor,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="w-6 h-6 rounded-full overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={userPhotoUrl || "/placeholder.svg"}
              alt="Profile"
              width={24}
              height={24}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>
          <span className="text-xs">{userName}</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}
