"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, LogIn, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../utils/firebaseConfig"

export function AuthGate() {
  const [isOpen, setIsOpen] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      setIsOpen(false)
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 w-full"
      >
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="group flex items-center gap-3 rounded-full bg-zinc-800/80 px-6 py-6 border border-zinc-700 hover:border-white transition-all"
        >
          <Lock className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
          <p className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
            Sign in to cast your vote
          </p>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-6 top-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700">
                  <Lock className="h-8 w-8 text-white" />
                </div>

                <h2 className="mb-2 text-2xl font-bold text-white">Authentication Required</h2>
                <p className="mb-8 text-zinc-400">
                  Join the conversation and make your vote count by signing in.
                </p>

                <Button
                  onClick={handleGoogleSignIn}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white text-base font-bold text-black hover:bg-zinc-200 transition-all"
                >
                  <LogIn className="h-5 w-5" />
                  Continue with Google
                </Button>

                <p className="mt-6 text-xs text-zinc-500">
                  By signing in, you agree to our Terms of Service.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}