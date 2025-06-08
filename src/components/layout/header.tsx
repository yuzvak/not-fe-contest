"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import { useTelegram } from "@/providers/telegram-provider"
import { ROUTES } from "@/lib/constants"
import { motion } from "framer-motion"

interface HeaderProps {
  showCart?: boolean
  isSelectionMode?: boolean
  selectedCount?: number
}

export function Header({ showCart = true, isSelectionMode = false, selectedCount = 0 }: HeaderProps) {
  const router = useRouter()
  const items = useStore((state) => state.items)
  const openCart = useStore((state) => state.openCart)
  const { colorScheme, themeParams } = useTelegram()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const displayCount = isSelectionMode ? selectedCount : itemCount

  const headerBg = colorScheme === "light" ? "#ffffff" : "#000000"
  const textColor = colorScheme === "light" ? "#000000" : "#ffffff"

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 bg-tg-header text-tg-text"
      style={{
        backgroundColor: headerBg,
        color: textColor,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="px-4 py-2"
        style={{
          paddingTop: `calc(var(--tg-safe-area-inset-top) + 44px + 8px)`,
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ color: textColor }}>
            Not Store
          </h1>

          <div className="flex items-center gap-4">
            <button onClick={() => router.push(ROUTES.SEARCH)} className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke={textColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke={textColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showCart && (
              <button
                onClick={isSelectionMode ? undefined : openCart}
                className={`relative flex items-center justify-center ${isSelectionMode ? "cursor-default" : "cursor-pointer"}`}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.5 12.2411V11.761C2.5 10.8399 3.0696 10.2519 4.00256 10.2519H5.91759L9.67891 3.89225C9.94407 3.45129 10.4155 3.42189 10.769 3.60808C11.1324 3.80406 11.3484 4.21562 11.0833 4.68598L7.8719 10.2519H20.1281L16.9167 4.68598C16.6516 4.21562 16.8775 3.80406 17.231 3.60808C17.5944 3.43169 18.0658 3.46109 18.3211 3.89225L22.0824 10.2519H23.9876C24.9206 10.2519 25.5 10.8399 25.5 11.761V12.2411C25.5 13.1721 24.9206 13.7404 23.9876 13.7404H4.00256C3.0696 13.7404 2.5 13.1721 2.5 12.2411ZM8.74594 24.4999C6.47737 24.4999 5.77028 23.177 5.48548 21.7561L4.13023 15.0829H23.8796L22.5145 21.7561C22.2297 23.177 21.5226 24.4999 19.2541 24.4999H8.74594ZM9.38429 22.8144C9.76729 22.7458 9.96371 22.4813 9.9146 22.1481L9.07985 17.2191C9.02092 16.8859 8.73612 16.6997 8.36294 16.7487C7.98975 16.8173 7.7737 17.0819 7.83262 17.4151L8.6772 22.3441C8.73612 22.6772 9.0111 22.8732 9.38429 22.8144ZM18.6157 22.8144C18.9791 22.8732 19.2639 22.6772 19.3228 22.3441L20.1674 17.4347C20.2263 17.1015 20.0102 16.8173 19.6371 16.7487C19.2639 16.6997 18.9791 16.8859 18.9202 17.2191L18.0854 22.1481C18.0363 22.4813 18.2327 22.7458 18.6157 22.8144ZM12.4974 22.8046C12.8608 22.785 13.1063 22.5302 13.0867 22.1873L12.7626 17.3171C12.7331 16.9741 12.4778 16.7389 12.0948 16.7683C11.7314 16.7977 11.4859 17.0427 11.5056 17.3857L11.8296 22.2559C11.8493 22.5988 12.1243 22.8242 12.4974 22.8046ZM15.5222 22.8046C15.8856 22.8242 16.1605 22.5988 16.1802 22.2559L16.5043 17.3857C16.5239 17.0427 16.2784 16.7977 15.915 16.7683C15.532 16.7389 15.2767 16.9741 15.2472 17.3171L14.9231 22.1873C14.9035 22.5302 15.149 22.785 15.5222 22.8046Z"
                    fill={textColor}
                  />
                </svg>

                {displayCount > 0 && (
                  <motion.span
                    className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                      isSelectionMode
                        ? colorScheme === "light"
                          ? "bg-blue-500 text-white"
                          : "bg-blue-500 text-white"
                        : colorScheme === "light"
                          ? "bg-black text-white"
                          : "bg-white text-black"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    key={displayCount}
                  >
                    {displayCount}
                  </motion.span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
