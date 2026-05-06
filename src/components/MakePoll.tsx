"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../utils/firebaseConfig"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldContent,
} from "@/src/components/ui/field"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog"
import { PlusCircle } from "lucide-react"

export const ROOMS = [
  { id: "general",  label: "General",    emoji: "💬" },
  { id: "tech",     label: "Tech",       emoji: "💻" },
  { id: "gaming",   label: "Gaming",     emoji: "🎮" },
  { id: "sports",   label: "Sports",     emoji: "⚽" },
  { id: "music",    label: "Music",      emoji: "🎵" },
  { id: "movies",   label: "Movies",     emoji: "🎬" },
  { id: "food",     label: "Food",       emoji: "🍕" },
  { id: "science",  label: "Science",    emoji: "🔬" },
]

export default function MakePoll() {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [room, setRoom] = useState("general")

  const { user } = useAuth()
  const router = useRouter()

  const addOption = () => setOptions([...options, ""])

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async () => {
    const validOptions = options.filter(opt => opt.trim() !== "")
    if (!question.trim() || validOptions.length < 2) return

    setIsSubmitting(true)
    try {
      const docRef = await addDoc(collection(db, "polls"), {
        question: question.trim(),
        options: validOptions.map((opt) => ({
          id: Math.random().toString(36).substring(2, 9),
          text: opt.trim(),
          votes: 0
        })),
        createdBy: user?.uid || "anonymous",
        createdAt: serverTimestamp(),
        room: room,
      })

      setIsOpen(false)
      setQuestion("")
      setOptions(["", ""])
      setRoom("general")
      router.push(`/poll/${docRef.id}`)
    } catch (error) {
      console.error("Error creating poll:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRoom = ROOMS.find(r => r.id === room)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/30">
          <PlusCircle size={18} />
          Create Poll
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Poll</DialogTitle>
        </DialogHeader>

        <FieldSet>
          <FieldLegend>Poll Details</FieldLegend>
          <FieldDescription>
            Fill in the details below to launch your live poll.
          </FieldDescription>

          <FieldGroup>
            {/* Room Picker */}
            <Field>
              <FieldLabel htmlFor="poll-room">Room</FieldLabel>
              <div className="relative">
                <select
                  id="poll-room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full appearance-none bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {ROOMS.map(r => (
                    <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <FieldDescription>Polls will appear in the selected room.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="poll-question">Question</FieldLabel>
              <Input
                id="poll-question"
                placeholder="What is your favorite programming language?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <FieldDescription>This will be the main heading of your poll.</FieldDescription>
            </Field>

            <FieldSet className="gap-4">
              <FieldLegend variant="label">Poll Options</FieldLegend>
              {options.map((option, index) => (
                <Field key={index}>
                  <FieldContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      {options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FieldContent>
                </Field>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-2"
                onClick={addOption}
              >
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </FieldSet>
          </FieldGroup>
        </FieldSet>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !question || options.filter(o => o.trim()).length < 2}
          >
            {isSubmitting ? "Creating..." : "Create Poll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}