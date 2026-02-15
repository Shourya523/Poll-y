"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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

export default function MakePoll() {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      })
      
      setIsOpen(false)
      setQuestion("")
      setOptions(["", ""])
      router.push(`/poll/${docRef.id}`)
    } catch (error) {
      console.error("Error creating poll:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Poll</Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Poll Configuration</DialogTitle>
        </DialogHeader>

        <FieldSet>
          <FieldLegend>Poll Details</FieldLegend>
          <FieldDescription>
            Fill in the details below to launch your live poll.
          </FieldDescription>

          <FieldGroup>
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