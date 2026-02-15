"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "@/src/utils/firebaseConfig"
import { Button } from "@/src/components/ui/button"
import { FieldSet, FieldLegend, FieldGroup } from "@/src/components/ui/field"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/src/components/AuthProvider" 
import { Lock, Share2, CheckCircle2 } from "lucide-react"
import TopBar from "@/src/components/TopBar"

export default function PollPage() {
    const { id } = useParams()
    const { user } = useAuth() 
    const [poll, setPoll] = useState<any>(null)
    const [hasVoted, setHasVoted] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        const unsub = onSnapshot(doc(db, "polls", id as string), (doc) => {
            if (doc.exists()) {
                setPoll({ id: doc.id, ...doc.data() })
            }
        })
        const voted = localStorage.getItem(`voted_${id}`)
        if (voted) setHasVoted(true)

        return () => unsub()
    }, [id])

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleVote = async (optionId: string) => {
        if (!user || hasVoted || isSubmitting) return
        
        // Set voted state IMMEDIATELY to prevent double-clicking
        setHasVoted(true)
        setSelectedId(optionId)
        setIsSubmitting(true)

        const pollRef = doc(db, "polls", id as string)
        const updatedOptions = poll.options.map((opt: any) => {
            if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 }
            }
            return opt
        })

        try {
            await updateDoc(pollRef, { options: updatedOptions })
            localStorage.setItem(`voted_${id}`, "true")
        } catch (error) {
            console.error("Error voting:", error)
            // Revert on error
            setHasVoted(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!poll) return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
        </div>
    )

    const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + opt.votes, 0)

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <TopBar />
            
            <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-24">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full rounded-[2.5rem] border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md sm:p-12"
                >
                    <div className="flex w-full flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10 text-center"
                        >
                            <FieldLegend className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                                {poll.question}
                            </FieldLegend>
                        </motion.div>

                        <FieldGroup className="w-full gap-4">
                            {poll.options.map((option: any, index: number) => {
                                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

                                return (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative w-full"
                                    >
                                        <Button
                                            variant="outline"
                                            disabled={!user || hasVoted || isSubmitting}
                                            onClick={() => handleVote(option.id)}
                                            className={`relative h-24 w-full justify-between overflow-hidden rounded-[1.25rem] border-zinc-700/50 bg-zinc-800/50 px-8 text-xl transition-all duration-500 sm:text-2xl ${
                                                user && !hasVoted && !isSubmitting
                                                ? "hover:border-white hover:bg-zinc-700/80 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                                                : "cursor-default"
                                            }`}
                                        >
                                            <AnimatePresence>
                                                {hasVoted && (
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                        className="absolute left-0 top-0 h-full bg-white/10"
                                                    />
                                                )}
                                            </AnimatePresence>

                                            <div className="z-10 flex items-center gap-3 font-semibold">
                                                {hasVoted && option.id === selectedId && <CheckCircle2 className="h-6 w-6 text-white" />}
                                                <span className={hasVoted && option.id === selectedId ? "text-white" : "text-zinc-300"}>
                                                    {option.text}
                                                </span>
                                            </div>

                                            {hasVoted && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="z-10 font-mono font-bold text-white/90"
                                                >
                                                    {percentage}%
                                                </motion.span>
                                            )}
                                        </Button>
                                    </motion.div>
                                )
                            })}
                        </FieldGroup>

                        <div className="mt-12 flex w-full flex-col items-center gap-6">
                            <AnimatePresence mode="wait">
                                {!user ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 rounded-full bg-zinc-800/80 px-6 py-3 border border-zinc-700"
                                    >
                                        <Lock className="h-4 w-4 text-zinc-500" />
                                        <p className="text-sm font-medium text-zinc-400">Sign in to cast your vote</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center"
                                    >
                                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                                            {totalVotes.toLocaleString()} total votes
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                onClick={handleShare}
                                variant="ghost"
                                className="group h-12 gap-2 rounded-full px-6 text-zinc-400 hover:bg-white hover:text-black transition-all"
                            >
                                {copied ? "Link Copied!" : "Share Poll"}
                                <Share2 className={`h-4 w-4 ${copied ? "hidden" : "block"}`} />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    )
}