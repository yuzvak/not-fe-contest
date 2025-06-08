"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeOptions {
  threshold?: number
  preventDefault?: boolean
}

export function useSwipe(ref: React.RefObject<HTMLElement>, handlers: SwipeHandlers, options: SwipeOptions = {}) {
  const { threshold = 50, preventDefault = true } = options
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
    setIsSwiping(false)
  }, [])

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }

      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      })
      setIsSwiping(true)
    },
    [preventDefault],
  )

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !isSwiping) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY)

    if (isHorizontal) {
      if (Math.abs(distanceX) > threshold) {
        if (distanceX > 0) {
          handlers.onSwipeLeft?.()
        } else {
          handlers.onSwipeRight?.()
        }
      }
    } else {
      if (Math.abs(distanceY) > threshold) {
        if (distanceY > 0) {
          handlers.onSwipeUp?.()
        } else {
          handlers.onSwipeDown?.()
        }
      }
    }

    setIsSwiping(false)
  }, [touchStart, touchEnd, isSwiping, threshold, handlers])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener("touchstart", onTouchStart)
    element.addEventListener("touchmove", onTouchMove, { passive: !preventDefault })
    element.addEventListener("touchend", onTouchEnd)

    return () => {
      element.removeEventListener("touchstart", onTouchStart)
      element.removeEventListener("touchmove", onTouchMove)
      element.removeEventListener("touchend", onTouchEnd)
    }
  }, [ref, onTouchStart, onTouchMove, onTouchEnd, preventDefault])

  return { isSwiping }
}
