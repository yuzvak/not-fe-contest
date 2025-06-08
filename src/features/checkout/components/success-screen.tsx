"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants"

export function SuccessScreen() {
  const router = useRouter()

  const handleContinue = () => {
    router.push(ROUTES.HOME)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-6">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 10L10 40V80L60 110L110 80V40L60 10Z" fill="#FFD700" />
          <path d="M60 10L10 40V80L60 110L110 80V40L60 10Z" stroke="#FFD700" strokeWidth="2" />
          <path d="M40 50L55 65L80 40" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="text-4xl font-bold mb-4">You Got It!</h1>
      <p className="text-xl text-zinc-400 mb-12">Your purchase is on the way</p>

      <button
        onClick={handleContinue}
        className="w-full max-w-md bg-white text-black py-3 px-6 rounded-full font-medium"
      >
        Awesome
      </button>
    </div>
  )
}
