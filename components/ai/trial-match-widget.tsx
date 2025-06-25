"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FlaskConical,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Share2
} from 'lucide-react'

interface TrialMatch {
  id: string
  title: string
  phase: string
  sponsor: string
  location: string
  distance: string
  matchScore: number
  eligibilityHighlights: string[]
  contactInfo: string
  enrollmentStatus: 'open' | 'closed' | 'pending'
  estimatedEnrollment: number
  primaryEndpoint: string
}

interface TrialMatchWidgetProps {
  patientId?: string
  genomicProfile?: any
  embedded?: boolean
  maxResults?: number
  showFilters?: boolean
  onTrialSelect?: (trial: TrialMatch) => void
}

export function TrialMatchWidget({
  patientId,
  genomicProfile,
  embedded = false,
  maxResults = 5,
  showFilters = true,
  onTrialSelect
}: TrialMatchWidgetProps) {
  const [trials, setTrials] = useState<TrialMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('all')

  // Mock trial data - in production this would come from API
  const mockTrials: TrialMatch[] = [
    {
      id: 'NCT05123456',
      title: 'Phase III CAR-T Study for B-cell Lymphoma with CD19 Expression',
      phase: 'Phase III',
      sponsor: 'Johns Hopkins University',
      location: 'Baltimore, MD',
      distance: '12 miles',
      matchScore: 94,
      eligibilityHighlights: [
        'CD19+ B-cell malignancy',
        'No prior CAR-T therapy',
        'ECOG performance status 0-1',
        'Adequate organ function'
      ],
      contactInfo: 'Dr. Sarah Chen, (410) 555-0123',
      enrollmentStatus: 'open',
      estimatedEnrollment: 120,
      primaryEndpoint: 'Overall Response Rate at 6 months'
    },
    {
      id: 'NCT05234567',
      title: 'Precision Immunotherapy Based on Tumor Genomic Profiling',
      phase: 'Phase II',
      sponsor: 'Mayo Clinic',
      location: 'Rochester, MN',
      distance: '45 miles',
      matchScore: 87,
      eligibilityHighlights: [
        'BRCA1/2 mutation positive',
        'Prior platinum-based therapy',
        'PD-L1 expression ≥1%',
        'Measurable disease'
      ],
      contactInfo: 'Clinical Trials Office, (507) 555-0156',
      enrollmentStatus: 'open',
      estimatedEnrollment: 80,
      primaryEndpoint: 'Progression-free survival'
    },
    {
      id: 'NCT05345678',
      title: 'Novel Combination Therapy for CYP2D6 Poor Metabolizers',
      phase: 'Phase I/II',
      sponsor: 'Cleveland Clinic',
      location: 'Cleveland, OH',
      distance: '89 miles',
      matchScore: 76,
      eligibilityHighlights: [
        'CYP2D6 poor metabolizer status',
        'Refractory to standard therapy',
        'Age 18-75 years',
        'No significant comorbidities'
      ],
      contactInfo: 'Dr. Michael Rodriguez, (216) 555-0189',
      enrollmentStatus: 'open',
      estimatedEnrollment: 60,
      primaryEndpoint: 'Maximum tolerated dose and safety'
    },
    {
      id: 'NCT05456789',
      title: 'Biomarker-Driven Targeted Therapy Selection',
      phase: 'Phase II',
      sponsor: 'MD Anderson Cancer Center',
      location: 'Houston, TX',
      distance: '127 miles',
      matchScore: 82,
      eligibilityHighlights: [
        'Actionable genomic alteration',
        'Advanced solid tumor',
        'Prior systemic therapy',
        'Life expectancy >12 weeks'
      ],
      contactInfo: 'Dr. Jennifer Kim, (713) 555-0234',
      enrollmentStatus: 'open',
      estimatedEnrollment: 100,
      primaryEndpoint: 'Objective response rate'
    },
    {
      id: 'NCT05567890',
      title: 'AI-Guided Treatment Optimization Platform',
      phase: 'Phase I',
      sponsor: 'Agile Defense Systems',
      location: 'Multiple Sites',
      distance: '15 miles',
      matchScore: 91,
      eligibilityHighlights: [
        'Complex genomic profile',
        'Multiple treatment failures',
        'Willing to use AI platform',
        'Good performance status'
      ],
      contactInfo: 'AGILE Clinical Team, (555) 123-4567',
      enrollmentStatus: 'open',
      estimatedEnrollment: 40,
      primaryEndpoint: 'AI platform feasibility and safety'
    }
  ]

  const filteredTrials = trials
    .filter(trial =>
      searchTerm === '' ||
      trial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(trial =>
      selectedPhase === 'all' ||
      trial.phase.toLowerCase().includes(selectedPhase.toLowerCase())
    )
    .slice(0, maxResults)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setTrials(mockTrials.sort((a, b) => b.matchScore - a.matchScore))
      setLoading(false)
    }, 1500)
  }, [patientId, genomicProfile])

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200'
    if (score >= 80) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    if (score >= 70) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleTrialClick = (trial: TrialMatch) => {
    if (onTrialSelect) {
      onTrialSelect(trial)
    } else {
      // Default action - open ClinicalTrials.gov
      window.open(`https://clinicaltrials.gov/ct2/show/${trial.id}`, '_blank')
    }
  }

  const generateWidgetCode = () => {
    return `<iframe
  src="${window.location.origin}/components/trial-match-widget?patientId=${patientId || 'demo'}"
  width="100%"
  height="600"
  frameborder="0"
  title="AGILE TrialMatch Widget">
</iframe>`
  }

  if (loading) {
    return (
      <Card className={embedded ? 'border-0 shadow-none' : ''}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={embedded ? 'border-0 shadow-none' : 'shadow-lg'}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-iris-500" />
            Clinical Trial Matches
            {patientId && (
              <Badge variant="outline" className="ml-2">
                Patient: {patientId}
              </Badge>
            )}
          </CardTitle>

          {!embedded && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Embed Widget
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="flex gap-2 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search trials, sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>
                        <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
              title="Filter by trial phase"
            >
              <option value="all">All Phases</option>
              <option value="phase i">Phase I</option>
              <option value="phase ii">Phase II</option>
              <option value="phase iii">Phase III</option>
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredTrials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No matching trials found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredTrials.map((trial) => (
            <Card
              key={trial.id}
              className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTrialClick(trial)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {trial.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {trial.sponsor}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {trial.location} • {trial.distance}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <Badge className={`border ${getMatchScoreColor(trial.matchScore)}`}>
                      {trial.matchScore}% Match
                    </Badge>
                    <div className="text-xs text-gray-500">{trial.phase}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-xs text-gray-700 mb-1">
                      Key Eligibility Criteria
                    </h4>
                    <ul className="space-y-1">
                      {trial.eligibilityHighlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-1 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{highlight}</span>
                        </li>
                      ))}
                      {trial.eligibilityHighlights.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{trial.eligibilityHighlights.length - 3} more criteria
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-xs text-gray-700 mb-1">Study Info</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs px-2 py-0 ${getStatusColor(trial.enrollmentStatus)}`}>
                          {trial.enrollmentStatus.toUpperCase()}
                        </Badge>
                        <span>{trial.estimatedEnrollment} patients</span>
                      </div>
                      <p><span className="font-medium">Contact:</span> {trial.contactInfo}</p>
                      <p><span className="font-medium">Endpoint:</span> {trial.primaryEndpoint}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    className="bg-iris-500 hover:bg-iris-700 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTrialClick(trial)
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle referral generation
                    }}
                  >
                    Generate Referral
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle contact
                    }}
                  >
                    Contact PI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {!embedded && filteredTrials.length > 0 && (
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">
              Showing {filteredTrials.length} of {trials.length} matches
            </p>
            <Button variant="outline" size="sm">
              View All Results
            </Button>
          </div>
        )}
      </CardContent>

      {embedded && (
        <div className="px-4 pb-4">
          <div className="text-center text-xs text-gray-500">
            Powered by <span className="font-semibold text-iris-500">AGILE Agent</span>
          </div>
        </div>
      )}
    </Card>
  )
}