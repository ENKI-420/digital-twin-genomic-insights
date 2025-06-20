import { NextRequest, NextResponse } from 'next/server';
import { agentInitializer } from '@/lib/agents/initialization';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        if (agentInitializer.isSystemInitialized()) {
          return NextResponse.json({
            status: 'success',
            message: 'Agent system already initialized',
            timestamp: new Date().toISOString()
          });
        }

        await agentInitializer.initialize();

        return NextResponse.json({
          status: 'success',
          message: 'Federated agent system initialized successfully',
          timestamp: new Date().toISOString()
        });

      case 'shutdown':
        if (!agentInitializer.isSystemInitialized()) {
          return NextResponse.json({
            status: 'success',
            message: 'Agent system not initialized',
            timestamp: new Date().toISOString()
          });
        }

        await agentInitializer.shutdown();

        return NextResponse.json({
          status: 'success',
          message: 'Federated agent system shutdown successfully',
          timestamp: new Date().toISOString()
        });

      case 'restart':
        if (agentInitializer.isSystemInitialized()) {
          await agentInitializer.shutdown();
        }
        await agentInitializer.initialize();

        return NextResponse.json({
          status: 'success',
          message: 'Federated agent system restarted successfully',
          timestamp: new Date().toISOString()
        });

      case 'status':
        return NextResponse.json({
          status: 'success',
          data: {
            initialized: agentInitializer.isSystemInitialized(),
            agents: Array.from(agentInitializer.getAllAgents().keys())
          },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          status: 'error',
          error: 'Invalid action. Must be one of: initialize, shutdown, restart, status',
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Agent system management failed:', error);

    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Agent system management failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'success',
      data: {
        initialized: agentInitializer.isSystemInitialized(),
        agents: Array.from(agentInitializer.getAllAgents().keys()),
        systemInfo: {
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to get agent system status:', error);

    return NextResponse.json({
      status: 'error',
      error: 'Failed to get agent system status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}