"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useTelegram } from "@/providers/telegram-provider"

interface AppLoaderProps {
  isVisible: boolean
}

export function AppLoader({ isVisible }: AppLoaderProps) {
  const { colorScheme, themeParams } = useTelegram()

  const bgColor = colorScheme === "light" ? "#ffffff" : "#000000"
  const iconColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const textColor = themeParams.text_color || (colorScheme === "light" ? "#000000" : "#ffffff")
  const hintColor = themeParams.hint_color || (colorScheme === "light" ? "#999999" : "#666666")

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            backgroundColor: bgColor,
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* App Icon */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.2,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <svg width="82" height="64" viewBox="0 0 41 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_3001_872)">
                  <path
                    d="M15.9943 20.6719L19.4849 14.6965L19.4849 21.0067H16.2057C16.1669 21.0012 16.1303 20.9879 16.0983 20.9682C16.0607 20.9451 16.0308 20.9141 16.0101 20.8787C15.9895 20.8434 15.9787 20.8049 15.9774 20.7667C15.9764 20.7349 15.9819 20.7027 15.9943 20.6719Z"
                    fill={iconColor}
                  />
                  <path
                    d="M24.7951 21.0067H21.5156L21.5156 14.6963L25.0066 20.6718C25.0188 20.7023 25.0244 20.7345 25.0233 20.7667C25.022 20.8054 25.0112 20.8438 24.9907 20.8787C24.9702 20.9138 24.9403 20.9449 24.9024 20.9682C24.8703 20.9879 24.8338 21.0012 24.7951 21.0067Z"
                    fill={iconColor}
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.5 29C27.1274 29 32.5 23.6274 32.5 17C32.5 10.3726 27.1274 5 20.5 5C13.8726 5 8.5 10.3726 8.5 17C8.5 23.6274 13.8726 29 20.5 29ZM21.377 10.4332C21.1949 10.1216 20.8611 9.92998 20.5002 9.92999C20.1393 9.92999 19.8055 10.1216 19.6235 10.4332L14.2176 19.6871C14.2066 19.706 14.1961 19.7254 14.1863 19.745C14.0178 20.0819 13.9353 20.4558 13.9477 20.8334C13.9601 21.211 14.067 21.5786 14.257 21.9037C14.4471 22.2288 14.7145 22.5014 15.035 22.6984C15.3554 22.8953 15.7189 23.0105 16.0931 23.0352C16.1154 23.0367 16.1378 23.0375 16.1601 23.0375H24.8407C24.8631 23.0375 24.8854 23.0367 24.9077 23.0352C25.2821 23.0105 25.6454 22.8952 25.9657 22.6984C26.2859 22.5016 26.5536 22.2291 26.7438 21.9037C26.9342 21.5782 27.0406 21.2105 27.053 20.8334C27.0654 20.4563 26.9833 20.0824 26.8146 19.745C26.8048 19.7254 26.7943 19.706 26.7832 19.687L21.377 10.4332Z"
                    fill={iconColor}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_3001_872">
                    <rect width="40" height="32" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
            </motion.div>
          </motion.div>

          {/* App Name */}
          <motion.h1
            className="text-4xl font-bold mb-4"
            style={{ color: textColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
            }}
          >
            Not Store
          </motion.h1>

          {/* Loading Text */}
          <motion.p
            className="text-lg mb-8"
            style={{ color: hintColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
          >
            Loading your experience...
          </motion.p>

          {/* Loading Dots */}
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
            }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: iconColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
