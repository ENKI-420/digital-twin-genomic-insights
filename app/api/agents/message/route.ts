import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agents/orchestration/orchestrator';
import { AgentMessage, MessageType, AgentRole } from '@/lib/agents/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      senderId,
      senderRole,
      senderDepartment,
      targetDepartment,
      data,
      priority = 'normal',
      sensitivity = 'internal'
    } = body;

    // Validate required fields
    if (!type || !senderId || !senderRole || !senderDepartment) {
      return NextResponse.json({
        status: 'error',
        error: 'Missing required fields: type, senderId, senderRole, senderDepartment',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate message type
    if (!Object.values(MessageType).includes(type)) {
      return NextResponse.json({
        status: 'error',
        error: `Invalid message type. Must be one of: ${Object.values(MessageType).join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate sender role
    if (!Object.values(AgentRole).includes(senderRole)) {
      return NextResponse.json({
        status: 'error',
        error: `Invalid sender role. Must be one of: ${Object.values(AgentRole).join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Create message
    const message: AgentMessage = {
      id: `${senderId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      senderId,
      senderRole,
      senderDepartment,
      targetDepartment,
      timestamp: Date.now(),
      priority,
      sensitivity,
      data,
      sessionId: request.headers.get('x-session-id') || undefined
    };

    // Send message through orchestrator
    const responses = await orchestrator.sendMessage(message);

    return NextResponse.json({
      status: 'success',
      data: {
        messageId: message.id,
        responses: responses.map(response => ({
          id: response.id,
          senderId: response.senderId,
          senderRole: response.senderRole,
          senderDepartment: response.senderDepartment,
          timestamp: response.timestamp,
          data: response.data
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Message sending failed:', error);

    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Message sending failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const senderId = searchParams.get('senderId');
    const type = searchParams.get('type');

    // For now, return basic message status
    // In a real implementation, you'd query a message store
    return NextResponse.json({
      status: 'success',
      data: {
        messageId,
        senderId,
        type,
        status: 'delivered',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Message query failed:', error);

    return NextResponse.json({
      status: 'error',
      error: 'Message query failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}