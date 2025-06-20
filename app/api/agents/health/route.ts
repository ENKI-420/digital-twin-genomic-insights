import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agents/orchestration/orchestrator';

export async function GET(request: NextRequest) {
  try {
    const health = await orchestrator.getSystemHealth();

    return NextResponse.json({
      status: 'success',
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentId, data } = body;

    switch (action) {
      case 'restart_agent':
        // Implement agent restart logic
        return NextResponse.json({
          status: 'success',
          message: `Agent ${agentId} restart initiated`,
          timestamp: new Date().toISOString()
        });

      case 'update_config':
        // Implement configuration update logic
        return NextResponse.json({
          status: 'success',
          message: 'Configuration updated',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          status: 'error',
          error: 'Invalid action',
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Health management failed:', error);

    return NextResponse.json({
      status: 'error',
      error: 'Health management failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}