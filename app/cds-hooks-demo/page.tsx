'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle, InfoIcon, Activity, Pill } from 'lucide-react'

// Mock medication options for demo
const medications = [
  { code: 'clopidogrel', display: 'Clopidogrel 75mg', category: 'Antiplatelet' },
  { code: 'warfarin', display: 'Warfarin 5mg', category: 'Anticoagulant' },
  { code: 'simvastatin', display: 'Simvastatin 40mg', category: 'Statin' },
  { code: 'omeprazole', display: 'Omeprazole 20mg', category: 'PPI' },
]

interface CDSCard {
  summary: string
  indicator: 'info' | 'warning' | 'critical'
  detail?: string
  source: { label: string }
}

export default function CDSHooksDemo() {
  const [selectedMed, setSelectedMed] = useState('')
  const [cdsCards, setCdsCards] = useState<CDSCard[]>([])
  const [loading, setLoading] = useState(false)

  const triggerCDSHook = async () => {
    if (!selectedMed) return

    setLoading(true)
    try {
      const response = await fetch('/api/cds-hooks/medication-prescribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hook: 'medication-prescribe',
          hookInstance: 'demo-123',
          fhirServer: 'https://demo.fhir.org',
          context: {
            patientId: 'BH-0001',
            draftOrders: {
              resourceType: 'Bundle',
              entry: [{
                resource: {
                  resourceType: 'MedicationRequest',
                  status: 'draft',
                  intent: 'order',
                  medicationCodeableConcept: {
                    coding: [{
                      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                      code: selectedMed,
                      display: medications.find(m => m.code === selectedMed)?.display
                    }]
                  },
                  subject: { reference: 'Patient/BH-0001' }
                }
              }]
            }
          }
        })
      })

      const data = await response.json()
      setCdsCards(data.cards || [])
    } catch (error) {
      console.error('Error triggering CDS hook:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCardIcon = (indicator: string) => {
    switch (indicator) {
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />
      default: return <InfoIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getCardColor = (indicator: string) => {
    switch (indicator) {
      case 'warning': return 'border-amber-200 bg-amber-50'
      case 'critical': return 'border-red-200 bg-red-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CDS Hooks Demo</h1>
          <p className="text-gray-600 mt-2">
            Simulate medication prescribing with real-time clinical decision support
          </p>
        </div>

        {/* Stakeholder Banner */}
        <Alert className="bg-baptist-blue/10 border-baptist-blue">
          <Activity className="h-4 w-4 text-baptist-blue" />
          <AlertTitle className="text-baptist-blue">For Clinical Leaders</AlertTitle>
          <AlertDescription>
            This demo shows how CDS Hooks integrate with your EHR to provide real-time guidance
            at the point of care, improving patient safety and reducing medication errors.
          </AlertDescription>
        </Alert>

        {/* Medication Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-baptist-blue" />
              Prescribe Medication
            </CardTitle>
            <CardDescription>
              Select a medication to simulate prescribing for patient Sarah Johnson (BH-0001)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Medication</label>
                <Select value={selectedMed} onValueChange={setSelectedMed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((med) => (
                      <SelectItem key={med.code} value={med.code}>
                        <div>
                          <div className="font-medium">{med.display}</div>
                          <div className="text-xs text-gray-500">{med.category}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={triggerCDSHook}
                  disabled={!selectedMed || loading}
                  className="w-full bg-baptist-blue hover:bg-baptist-blue/90"
                >
                  {loading ? 'Checking...' : 'Check CDS Recommendations'}
                </Button>
              </div>
            </div>

            {/* Patient Context */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Patient Context</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span> Sarah Johnson
                </div>
                <div>
                  <span className="text-gray-600">MRN:</span> BH-0001
                </div>
                <div>
                  <span className="text-gray-600">Known Variants:</span> CYP2C19 *2/*17
                </div>
                <div>
                  <span className="text-gray-600">Current Meds:</span> 3 active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CDS Cards */}
        {cdsCards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Clinical Decision Support Cards</h2>
            {cdsCards.map((card, idx) => (
              <Card key={idx} className={getCardColor(card.indicator)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCardIcon(card.indicator)}
                      <span className="text-lg">{card.summary}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.source.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                {card.detail && (
                  <CardContent>
                    <p className="text-sm text-gray-700">{card.detail}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}