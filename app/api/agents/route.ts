import { NextRequest, NextResponse } from 'next/server'
import { agentRegistry } from '@/lib/agents/orchestration/agent-registry'

export async function GET(request: NextRequest) {
  try {
    // Get agent health status
    const health = await agentRegistry.healthCheck()

    // Mock active agents data
    const agents = [
      {
        id: 'radiology-agent-001',
        name: 'Radiology AI Assistant',
        department: 'Radiology',
        status: 'active',
        capabilities: ['dicom_triage', 'anomaly_detection', 'report_generation'],
        messagesProcessed: 1247,
        avgResponseTime: 850,
        healthScore: 98
      },
      {
        id: 'genomics-agent-001',
        name: 'Genomics AI Assistant',
        department: 'Genomics',
        status: 'active',
        capabilities: ['variant_classification', 'acmg_tagging', 'digital_twin_creation'],
        messagesProcessed: 892,
        avgResponseTime: 1200,
        healthScore: 96
      },
      {
        id: 'oncology-agent-001',
        name: 'Oncology AI Assistant',
        department: 'Oncology',
        status: 'active',
        capabilities: ['treatment_planning', 'nccn_guidelines', 'clinical_trials'],
        messagesProcessed: 673,
        avgResponseTime: 950,
        healthScore: 94
      }
    ]

    return NextResponse.json({
      health,
      agents,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, payload } = await request.json()

    switch (action) {
      case 'send_message':
        // Route message through agent orchestrator
        await agentRegistry.routeMessage(payload)
        return NextResponse.json({ success: true })

      case 'register_agent':
        // Register new agent
        await agentRegistry.registerAgent(payload)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing agent request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}