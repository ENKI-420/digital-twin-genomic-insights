import { NextRequest, NextResponse } from 'next/server';
import { healthlinkGenomicTwinCore } from '@/lib/healthlink-genomic-twin/core';
import { PatientCareNavigatorAgent } from '@/lib/healthlink-genomic-twin/agents/patient-care-navigator-agent';
import { ClinicalEfficiencyAgent } from '@/lib/healthlink-genomic-twin/agents/clinical-efficiency-agent';
import { CommunityHealthCoordinatorAgent } from '@/lib/healthlink-genomic-twin/agents/community-health-coordinator-agent';

// Initialize the Healthlink-Genomic-Twin AI system
let isInitialized = false;

async function initializeSystem() {
  if (!isInitialized) {
    try {
      await healthlinkGenomicTwinCore.initialize();
      isInitialized = true;
      console.log('Healthlink-Genomic-Twin AI system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Healthlink-Genomic-Twin AI system:', error);
      throw error;
    }
  }
}

// GET - Health check and system status
export async function GET(request: NextRequest) {
  try {
    await initializeSystem();

    const healthStatus = await healthlinkGenomicTwinCore.getHealthStatus();

    return NextResponse.json({
      success: true,
      data: healthStatus,
      message: 'Healthlink-Genomic-Twin AI system is operational'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'System health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Process queries through the appropriate agent
export async function POST(request: NextRequest) {
  try {
    await initializeSystem();

    const body = await request.json();
    const { query, agentType, context } = body;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query is required'
        },
        { status: 400 }
      );
    }

    // Validate context and permissions
    if (!context?.userId || !context?.userRole) {
      return NextResponse.json(
        {
          success: false,
          error: 'User context and role are required'
        },
        { status: 400 }
      );
    }

    let result;

    // Route to appropriate agent based on agentType or query content
    switch (agentType) {
      case 'patient_care':
        const patientAgent = new PatientCareNavigatorAgent();
        result = await patientAgent.execute({
          query,
          patientId: context.patientId,
          userRole: context.userRole,
          userId: context.userId,
          sessionId: context.sessionId
        });
        break;

      case 'clinical_efficiency':
        const clinicalAgent = new ClinicalEfficiencyAgent();
        result = await clinicalAgent.execute({
          query,
          patientId: context.patientId,
          userRole: context.userRole,
          userId: context.userId,
          sessionId: context.sessionId,
          taskType: context.taskType
        });
        break;

      case 'community_health':
        const communityAgent = new CommunityHealthCoordinatorAgent();
        result = await communityAgent.execute({
          query,
          geographicArea: context.geographicArea || 'Jefferson County',
          userRole: context.userRole,
          userId: context.userId,
          sessionId: context.sessionId,
          dataType: context.dataType
        });
        break;

      default:
        // Auto-detect agent type based on query content
        result = await healthlinkGenomicTwinCore.processPatientQuery(query, {
          query,
          patientId: context.patientId,
          userRole: context.userRole,
          userId: context.userId,
          sessionId: context.sessionId
        });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Query processed successfully'
    });

  } catch (error) {
    console.error('Query processing failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Query processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}