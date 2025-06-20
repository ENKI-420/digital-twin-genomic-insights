import { NextRequest, NextResponse } from 'next/server'
import { GenomicsAgent } from '@/lib/agents/department/genomics-agent'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id

    // Mock digital twin data for demo
    const mockDigitalTwin = {
      patientId,
      genomicProfile: {
        variants: [
          {
            id: 'VAR001',
            chromosome: '17',
            position: 41276045,
            reference: 'C',
            alternative: 'T',
            gene: 'BRCA1',
            clinicalSignificance: 'Pathogenic',
            acmgClassification: 'Pathogenic (PVS1, PM2, PP3)',
            alleleFrequency: 0.00001
          },
          {
            id: 'VAR002',
            chromosome: '1',
            position: 97915614,
            reference: 'C',
            alternative: 'T',
            gene: 'DPYD',
            clinicalSignificance: 'Likely Pathogenic',
            acmgClassification: 'Likely Pathogenic (PS3, PM2)',
            alleleFrequency: 0.0002
          }
        ],
        riskScores: {
          'Breast Cancer': 0.78,
          'Type 2 Diabetes': 0.45,
          'Coronary Artery Disease': 0.52,
          'Alzheimer Disease': 0.31
        },
        pharmacogenomics: [
          {
            gene: 'DPYD',
            variant: '*2A',
            drugName: '5-Fluorouracil',
            effect: 'increased_toxicity',
            recommendation: 'Reduce dose by 50% or use alternative therapy',
            level: 'high'
          },
          {
            gene: 'CYP2D6',
            variant: '*4/*4',
            drugName: 'Codeine',
            effect: 'decreased_efficacy',
            recommendation: 'Use alternative analgesic',
            level: 'medium'
          }
        ]
      },
      predictions: {
        diseaseRisk: [
          {
            disease: 'Breast Cancer',
            risk: 0.78,
            confidence: 0.85,
            timeframe: '10 years',
            modifiableFactors: ['Regular screening', 'Lifestyle modifications', 'Chemoprevention options']
          },
          {
            disease: 'Coronary Artery Disease',
            risk: 0.52,
            confidence: 0.80,
            timeframe: '20 years',
            modifiableFactors: ['Diet', 'Exercise', 'Cholesterol management', 'Blood pressure control']
          },
          {
            disease: 'Type 2 Diabetes',
            risk: 0.45,
            confidence: 0.75,
            timeframe: '15 years',
            modifiableFactors: ['Weight management', 'Diet', 'Physical activity', 'Regular glucose monitoring']
          },
          {
            disease: 'Alzheimer Disease',
            risk: 0.31,
            confidence: 0.70,
            timeframe: '30 years',
            modifiableFactors: ['Cognitive exercises', 'Social engagement', 'Mediterranean diet', 'Regular exercise']
          }
        ],
        drugResponse: [
          {
            drugName: '5-Fluorouracil',
            response: 'adverse',
            dosageAdjustment: 'Reduce by 50%',
            alternatives: ['Capecitabine with dose adjustment', 'Alternative regimen']
          },
          {
            drugName: 'Codeine',
            response: 'poor',
            alternatives: ['Morphine', 'Oxycodone']
          }
        ],
        optimalTherapies: [
          {
            name: 'Enhanced Breast Cancer Screening',
            type: 'procedure',
            efficacyScore: 0.92,
            safetyScore: 0.98,
            personalizedReason: 'BRCA1 pathogenic variant carrier'
          },
          {
            name: 'Statin Therapy',
            type: 'medication',
            efficacyScore: 0.85,
            safetyScore: 0.95,
            personalizedReason: 'Elevated cardiovascular risk profile'
          }
        ]
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(mockDigitalTwin)
  } catch (error) {
    console.error('Error fetching digital twin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch digital twin data' },
      { status: 500 }
    )
  }
}