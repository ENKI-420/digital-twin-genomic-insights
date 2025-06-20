// Agent Logger System

import fs from 'fs';
import path from 'path';
import { AgentResult, AgentRole } from './types';

export class AgentLogger {
  private logPath: string;
  private stream: fs.WriteStream | null = null;

  constructor(logPath: string = 'agentmc3.log') {
    this.logPath = logPath;
    this.initializeLogger();
  }

  private initializeLogger() {
    try {
      // Create log directory if it doesn't exist
      const dir = path.dirname(this.logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Open write stream with append mode
      this.stream = fs.createWriteStream(this.logPath, { flags: 'a' });

      // Write session header
      this.writeSessionHeader();
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }

  private writeSessionHeader() {
    const header = `
================================================================================
SESSION START: ${new Date().toISOString()}
================================================================================
`;
    this.stream?.write(header);
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    };

    const formattedLog = `[${timestamp}] ${level.toUpperCase()}: ${message}${
      data ? '\n' + JSON.stringify(data, null, 2) : ''
    }\n`;

    // Write to file
    this.stream?.write(formattedLog);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Agent] ${level}:`, message, data || '');
    }
  }

  public logAgentStart(role: AgentRole, context: any) {
    this.log('info', `Starting ${role} agent`, { role, context });
  }

  public logAgentResult(result: AgentResult) {
    const status = result.success ? 'SUCCESS' : 'FAILURE';
    this.log(
      result.success ? 'info' : 'error',
      `${result.role} agent ${status} (${result.duration}ms)`,
      {
        role: result.role,
        success: result.success,
        duration: result.duration,
        artifacts: result.artifacts,
        error: result.error
      }
    );
  }

  public logHotkeyAction(action: string, agents: AgentRole[]) {
    this.log('info', `Hotkey [${action}] triggered`, { action, agents });
  }

  public logModelCall(provider: string, model: string, tokens: number) {
    this.log('debug', `Model API call`, { provider, model, tokens });
  }

  public async flush() {
    return new Promise<void>((resolve) => {
      if (this.stream) {
        this.stream.end(() => resolve());
      } else {
        resolve();
      }
    });
  }

  public close() {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}

// Singleton instance
export const agentLogger = new AgentLogger();