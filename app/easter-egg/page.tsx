"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTelegram } from "@/providers/telegram-provider"

interface FloatingScore {
  id: number
  x: number
  y: number
  value: number
}

export default function EasterEggPage() {
  const router = useRouter()
  const { hapticFeedback, showBackButton, hideBackButton, colorScheme, themeParams } = useTelegram()

  const [score, setScore] = useState(0)
  const [energy, setEnergy] = useState(1000)
  const [maxEnergy] = useState(1000)
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [isPressed, setIsPressed] = useState(false)
  const [combo, setCombo] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [isHighLoad, setIsHighLoad] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const floatingIdRef = useRef(0)
  const energyRegenRef = useRef<NodeJS.Timeout | null>(null)
  const comboResetRef = useRef<NodeJS.Timeout | null>(null)
  const tapThrottleRef = useRef(false)
  const tapCountRef = useRef(0)
  const performanceCheckRef = useRef<NodeJS.Timeout | null>(null)
  const coinRef = useRef<HTMLDivElement>(null)

  const bgColor = "#000000"
  const textColor = "#ffffff"
  const goldColor = "#FFD700"
  const energyColor = "#00D4FF"

  useEffect(() => {
    setMounted(true)

    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleBackButtonClick = () => {
      router.back()
    }
    showBackButton(handleBackButtonClick)
    return () => hideBackButton()
  }, [router, showBackButton, hideBackButton, mounted])

  useEffect(() => {
    if (!mounted) return

    if (energy < maxEnergy) {
      energyRegenRef.current = setTimeout(() => {
        setEnergy((prev) => Math.min(prev + 1, maxEnergy))
      }, 500)
    }
    return () => {
      if (energyRegenRef.current) {
        clearTimeout(energyRegenRef.current)
      }
    }
  }, [energy, maxEnergy, mounted])

  useEffect(() => {
    if (!mounted) return

    if (combo > 0) {
      if (comboResetRef.current) {
        clearTimeout(comboResetRef.current)
      }
      comboResetRef.current = setTimeout(() => {
        setCombo(0)
      }, 2000)
    }
    return () => {
      if (comboResetRef.current) {
        clearTimeout(comboResetRef.current)
      }
    }
  }, [combo, mounted])

  useEffect(() => {
    if (!mounted) return

    performanceCheckRef.current = setInterval(() => {
      if (tapCountRef.current > 5) {
        setIsHighLoad(true)
      } else {
        setIsHighLoad(false)
      }
      tapCountRef.current = 0
    }, 100)

    return () => {
      if (performanceCheckRef.current) {
        clearInterval(performanceCheckRef.current)
      }
    }
  }, [mounted])

  const handleTap = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!mounted) return

      tapCountRef.current += 1

      if (tapThrottleRef.current) return

      if (isHighLoad) {
        tapThrottleRef.current = true
        setTimeout(() => {
          tapThrottleRef.current = false
        }, 50)
      }

      if (energy <= 0) {
        hapticFeedback("notification", "error")
        return
      }

      const currentTime = Date.now()
      const timeDiff = currentTime - lastTapTime

      if (timeDiff < 500 && combo < 10) {
        setCombo((prev) => prev + 1)
      } else if (timeDiff >= 500) {
        setCombo(1)
      }

      setLastTapTime(currentTime)

      let coinCenterX = windowSize.width / 2
      let coinCenterY = windowSize.height / 2

      if (coinRef.current) {
        const coinRect = coinRef.current.getBoundingClientRect()
        coinCenterX = coinRect.left + coinRect.width / 2
        coinCenterY = coinRect.top + coinRect.height / 2
      }

      const basePoints = 1
      const comboMultiplier = Math.floor(combo / 2) + 1
      const earnedPoints = basePoints * comboMultiplier

      setScore((prev) => prev + earnedPoints)
      setEnergy((prev) => Math.max(prev - 1, 0))

      if (floatingScores.length < 20) {
        const offsetX = (Math.random() - 0.5) * 100
        const offsetY = (Math.random() - 0.5) * 100

        const newFloatingScore: FloatingScore = {
          id: floatingIdRef.current++,
          x: coinCenterX + offsetX,
          y: coinCenterY + offsetY,
          value: earnedPoints,
        }
        setFloatingScores((prev) => [...prev, newFloatingScore])

        setTimeout(() => {
          setFloatingScores((prev) => prev.filter((fs) => fs.id !== newFloatingScore.id))
        }, 1000)
      }

      if (combo >= 8) {
        hapticFeedback("impact", "heavy")
      } else if (combo >= 4) {
        hapticFeedback("impact", "medium")
      } else {
        hapticFeedback("impact", "light")
      }

      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 100)
    },
    [combo, energy, floatingScores.length, hapticFeedback, isHighLoad, mounted, windowSize],
  )

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${goldColor}15 0%, transparent 50%), 
                        radial-gradient(circle at 20% 80%, ${energyColor}10 0%, transparent 40%),
                        radial-gradient(circle at 80% 20%, ${goldColor}08 0%, transparent 60%)`,
          }}
          animate={{
            background: [
              `radial-gradient(circle at 50% 50%, ${goldColor}15 0%, transparent 50%), 
               radial-gradient(circle at 20% 80%, ${energyColor}10 0%, transparent 40%),
               radial-gradient(circle at 80% 20%, ${goldColor}08 0%, transparent 60%)`,
              `radial-gradient(circle at 60% 40%, ${goldColor}20 0%, transparent 50%), 
               radial-gradient(circle at 30% 70%, ${energyColor}15 0%, transparent 40%),
               radial-gradient(circle at 70% 30%, ${goldColor}12 0%, transparent 60%)`,
              `radial-gradient(circle at 40% 60%, ${goldColor}15 0%, transparent 50%), 
               radial-gradient(circle at 10% 90%, ${energyColor}10 0%, transparent 40%),
               radial-gradient(circle at 90% 10%, ${goldColor}08 0%, transparent 60%)`,
            ],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {!isHighLoad && windowSize.width > 0 && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: i % 2 === 0 ? goldColor : energyColor,
                  opacity: 0.6,
                }}
                initial={{
                  x: Math.random() * windowSize.width,
                  y: windowSize.height + 20,
                }}
                animate={{
                  y: -20,
                  x: Math.random() * windowSize.width,
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: Math.random() * 8 + 6,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 4,
                  ease: "linear",
                }}
              />
            ))}

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`big-particle-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: goldColor,
                  opacity: 0.3,
                }}
                initial={{
                  x: Math.random() * windowSize.width,
                  y: Math.random() * windowSize.height,
                }}
                animate={{
                  x: [
                    Math.random() * windowSize.width,
                    Math.random() * windowSize.width,
                    Math.random() * windowSize.width,
                  ],
                  y: [
                    Math.random() * windowSize.height,
                    Math.random() * windowSize.height,
                    Math.random() * windowSize.height,
                  ],
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: Math.random() * 12 + 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </div>

      <motion.div
        className="flex items-center justify-between p-4 z-10 relative"
        style={{
          paddingTop: `calc(var(--tg-safe-area-inset-top) + 44px + 16px)`,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              width="41"
              height="32"
              viewBox="0 0 41 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <g clipPath="url(#clip0_3001_872)">
                <path
                  d="M15.9943 20.6719L19.4849 14.6965L19.4849 21.0067H16.2057C16.1669 21.0012 16.1303 20.9879 16.0983 20.9682C16.0607 20.9451 16.0308 20.9141 16.0101 20.8787C15.9895 20.8434 15.9787 20.8049 15.9774 20.7667C15.9764 20.7349 15.9819 20.7027 15.9943 20.6719Z"
                  fill="white"
                />
                <path
                  d="M24.7951 21.0067H21.5156L21.5156 14.6963L25.0066 20.6718C25.0188 20.7023 25.0244 20.7345 25.0233 20.7667C25.022 20.8054 25.0112 20.8438 24.9907 20.8787C24.9702 20.9138 24.9403 20.9449 24.9024 20.9682C24.8703 20.9879 24.8338 21.0012 24.7951 21.0067Z"
                  fill="white"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.5 29C27.1274 29 32.5 23.6274 32.5 17C32.5 10.3726 27.1274 5 20.5 5C13.8726 5 8.5 10.3726 8.5 17C8.5 23.6274 13.8726 29 20.5 29ZM21.377 10.4332C21.1949 10.1216 20.8611 9.92998 20.5002 9.92999C20.1393 9.92999 19.8055 10.1216 19.6235 10.4332L14.2176 19.6871C14.2066 19.706 14.1961 19.7254 14.1863 19.745C14.0178 20.0819 13.9353 20.4558 13.9477 20.8334C13.9601 21.211 14.067 21.5786 14.257 21.9037C14.4471 22.2288 14.7145 22.5014 15.035 22.6984C15.3554 22.8953 15.7189 23.0105 16.0931 23.0352C16.1154 23.0367 16.1378 23.0375 16.1601 23.0375H24.8407C24.8631 23.0375 24.8854 23.0367 24.9077 23.0352C25.2821 23.0105 25.6454 22.8952 25.9657 22.6984C26.2859 22.5016 26.5536 22.2291 26.7438 21.9037C26.9342 21.5782 27.0406 21.2105 27.053 20.8334C27.0654 20.4563 26.9833 20.0824 26.8146 19.745C26.8048 19.7254 26.7943 19.706 26.7832 19.687L21.377 10.4332Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_3001_872">
                  <rect width="40" height="32" fill="white" transform="translate(0.5)" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold">We all got used to tapping</div>
            <div className="text-sm opacity-70">Feel it again</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="text-center py-4 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.div
          className="text-5xl font-bold"
          style={{ color: goldColor }}
          animate={isPressed ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.1 }}
        >
          {formatNumber(score)}
        </motion.div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20"
              style={{ color: energyColor }}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-lg font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                x{Math.floor(combo / 2) + 1} COMBO!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={coinRef}
          className="relative cursor-pointer"
          onTouchStart={handleTap}
          onMouseDown={handleTap}
          animate={
            isPressed
              ? {
                  scale: 0.95,
                }
              : {
                  scale: 1,
                }
          }
          transition={{ duration: 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          {!isHighLoad && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${goldColor}40 0%, transparent 70%)`,
                filter: "blur(20px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}

          <motion.div
            className="w-64 h-64 rounded-full flex items-center justify-center relative z-10"
            style={{
              background: `linear-gradient(135deg, ${goldColor} 0%, #FFA500 100%)`,
              boxShadow: `0 20px 40px ${goldColor}40`,
            }}
          >
            <svg
              width="164"
              height="128"
              viewBox="0 0 41 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-32 h-24"
            >
              <g clipPath="url(#clip0_3001_872)">
                <path
                  d="M15.9943 20.6719L19.4849 14.6965L19.4849 21.0067H16.2057C16.1669 21.0012 16.1303 20.9879 16.0983 20.9682C16.0607 20.9451 16.0308 20.9141 16.0101 20.8787C15.9895 20.8434 15.9787 20.8049 15.9774 20.7667C15.9764 20.7349 15.9819 20.7027 15.9943 20.6719Z"
                  fill="black"
                />
                <path
                  d="M24.7951 21.0067H21.5156L21.5156 14.6963L25.0066 20.6718C25.0188 20.7023 25.0244 20.7345 25.0233 20.7667C25.022 20.8054 25.0112 20.8438 24.9907 20.8787C24.9702 20.9138 24.9403 20.9449 24.9024 20.9682C24.8703 20.9879 24.8338 21.0012 24.7951 21.0067Z"
                  fill="black"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.5 29C27.1274 29 32.5 23.6274 32.5 17C32.5 10.3726 27.1274 5 20.5 5C13.8726 5 8.5 10.3726 8.5 17C8.5 23.6274 13.8726 29 20.5 29ZM21.377 10.4332C21.1949 10.1216 20.8611 9.92998 20.5002 9.92999C20.1393 9.92999 19.8055 10.1216 19.6235 10.4332L14.2176 19.6871C14.2066 19.706 14.1961 19.7254 14.1863 19.745C14.0178 20.0819 13.9353 20.4558 13.9477 20.8334C13.9601 21.211 14.067 21.5786 14.257 21.9037C14.4471 22.2288 14.7145 22.5014 15.035 22.6984C15.3554 22.8953 15.7189 23.0105 16.0931 23.0352C16.1154 23.0367 16.1378 23.0375 16.1601 23.0375H24.8407C24.8631 23.0375 24.8854 23.0367 24.9077 23.0352C25.2821 23.0105 25.6454 22.8952 25.9657 22.6984C26.2859 22.5016 26.5536 22.2291 26.7438 21.9037C26.9342 21.5782 27.0406 21.2105 27.053 20.8334C27.0654 20.4563 26.9833 20.0824 26.8146 19.745C26.8048 19.7254 26.7943 19.706 26.7832 19.687L21.377 10.4332Z"
                  fill="black"
                />
              </g>
              <defs>
                <clipPath id="clip0_3001_872">
                  <rect width="40" height="32" fill="white" transform="translate(0.5)" />
                </clipPath>
              </defs>
            </svg>

            {!isHighLoad && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {floatingScores.slice(0, isHighLoad ? 5 : 20).map((floatingScore) => (
            <motion.div
              key={floatingScore.id}
              className="absolute pointer-events-none font-bold text-2xl z-30"
              style={{
                left: floatingScore.x - 20,
                top: floatingScore.y - 20,
                color: goldColor,
                textShadow: "0 0 10px rgba(255, 215, 0, 0.8)",
              }}
              initial={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              animate={{
                opacity: 0,
                scale: 1.5,
                y: -120,
                x: (Math.random() - 0.5) * 80,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: isHighLoad ? 0.5 : 1, ease: "easeOut" }}
            >
              +{floatingScore.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Energy Bar */}
      <motion.div
        className="p-4 relative z-10"
        style={{
          paddingBottom: `calc(var(--tg-safe-area-inset-bottom) + 16px)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="text-lg">⚡</div>
          <div className="flex-1">
            <div className="text-sm opacity-70">Energy</div>
            <div className="text-lg font-bold">
              {energy} / {maxEnergy}
            </div>
          </div>
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${energyColor} 0%, #0099CC 100%)`,
              width: `${(energy / maxEnergy) * 100}%`,
            }}
            animate={{
              boxShadow: energy > 0 ? `0 0 10px ${energyColor}80` : "none",
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {energy === 0 && (
          <motion.div
            className="text-center mt-2 text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Energy depleted! Wait for regeneration...
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
