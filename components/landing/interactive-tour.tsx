"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronRight } from "lucide-react"

interface TourStep {
  title: string
  message: string
}

interface InteractiveTourProps {
  industry: string
  onDismiss: () => void
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  default: [
    {
      title: "Welcome to AGENT Platform",
      message: "Harness AI-powered genomics to accelerate precision medicine at your organisation."
    },
    {
      title: "Real-time Insights",
      message: "Stream genomic interpretations, trial matches and evidence directly into your workflow."
    },
    {
      title: "Security & Compliance",
      message: "HIPAA-ready architecture with Epic EHR integration keeps your data protected."
    }
  ]
}

export default function InteractiveTour({ industry, onDismiss }: InteractiveTourProps) {
  const steps = TOUR_STEPS[industry] || TOUR_STEPS.default
  const [step, setStep] = useState(0)
  const [stream, setStream] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // stream characters one by one for current step
    const full = steps[step].message
    let idx = 0
    intervalRef.current = setInterval(() => {
      idx += 1
      setStream(full.slice(0, idx))
      if (idx >= full.length && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }, 25)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [step])

  const next = () => {
    if (step < steps.length - 1) {
      setStream("")
      setStep(step + 1)
    } else {
      onDismiss()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="w-full max-w-sm mb-8 pointer-events-auto">
        <Card className="shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-lg">{steps[step].title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="min-h-[60px] leading-relaxed text-sm text-gray-700">{stream}</p>
            <div className="flex justify-end mt-4">
              <Button size="sm" onClick={next}>
                {step === steps.length - 1 ? "Got it" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}