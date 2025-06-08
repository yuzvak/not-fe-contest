"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface StaggeredListProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
}

export function StaggeredList({ children, staggerDelay = 0.05, className = "" }: StaggeredListProps) {
  return (
    <motion.div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * staggerDelay, duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
