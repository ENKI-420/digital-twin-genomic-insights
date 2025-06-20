"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronRight } from "lucide-react"

/* global window fetch speechSynthesis */

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

// simple analytics helper (fire-and-forget)
async function track(event:string,data:Record<string,unknown>){
  try{await fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event,...data})})}catch{/* ignore network errors */}
}

function getOrgFromHostname(){
  if(typeof window==="undefined") return "default"
  const host=window.location.hostname
  const sub=host.split(".")[0]
  return sub&&sub!=="www"?sub:"default"
}

// extend steps map
const EXTENDED_STEPS:Record<string,TourStep[]>={
  baptist:[
    {title:"Baptist Health + AGENT","message":"Empowering clinicians with genomics-driven AI across Baptist Health network."},
    {title:"Epic Embedded","message":"Our Epic-certified CDS cards surface insights directly in Baptist's EHR workflows."},
    {title:"Cost Savings","message":"Projected $2.3M annual efficiency via automated pharmacogenomics."}
  ],
  research:[{title:"Accelerate Discovery","message":"Real-time collaboration, large-scale cohort builder & AI summarization for grant writing."}],
  default:TOUR_STEPS.default
}

export default function InteractiveTour({ industry, onDismiss }: InteractiveTourProps) {
  const org=getOrgFromHostname()
  const steps=EXTENDED_STEPS[org]||EXTENDED_STEPS[industry]||EXTENDED_STEPS.default
  const [step, setStep] = useState(0)
  const [stream, setStream] = useState("")
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // stream characters one by one for current step
    const full = steps[step].message
    let idx = 0
    intervalRef.current = window.setInterval(() => {
      idx += 1
      setStream(full.slice(0, idx))
      if (idx >= full.length && intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }, 25)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [step])

  useEffect(()=>{track("tour_start",{org,step})},[])
  useEffect(()=>{
    // voice-over
    if(typeof window!=="undefined"&&"speechSynthesis"in window){
      const utter=new SpeechSynthesisUtterance(steps[step].message)
      utter.rate=1
      speechSynthesis.cancel();speechSynthesis.speak(utter)
    }
  },[step])

  const next = () => {
    track("tour_next",{org,step})
    if (step < steps.length - 1) {
      setStream("")
      setStep(step + 1)
    } else {
      onDismiss()
    }
  }

  const dismiss = () => {
    track("tour_dismiss",{org})
    speechSynthesis.cancel()
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="w-full max-w-sm mb-8 pointer-events-auto">
        <Card className="shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-lg">{steps[step].title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={dismiss}>
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

        {/* Optional video bubble */}
        <div className="absolute -top-16 right-4 w-28 h-28 rounded-full overflow-hidden shadow-lg border-2 border-white bg-black/10">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/videos/ai-avatar-loop.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </div>
  )
}