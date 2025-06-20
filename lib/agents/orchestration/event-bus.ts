import { EventEmitter } from 'events';
import { createCipher, createDecipher, randomBytes } from 'crypto';
import { AgentMessage, MessageType, AgentRole } from '../types';

export class SecureEventBus extends EventEmitter {
  private encryptionKey: Buffer;
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  constructor(encryptionKey?: string) {
    super();
    this.encryptionKey = Buffer.from(encryptionKey || process.env.EVENT_BUS_KEY || randomBytes(32).toString('hex'), 'hex');
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.on('error', (error) => {
      console.error('EventBus Error:', error);
      // Implement circuit breaker pattern
      this.emit('circuit_breaker', { error, timestamp: Date.now() });
    });
  }

  private encryptMessage(message: AgentMessage): string {
    const cipher = createCipher('aes-256-gcm', this.encryptionKey);
    const messageStr = JSON.stringify(message);
    let encrypted = cipher.update(messageStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptMessage(encryptedMessage: string): AgentMessage {
    const decipher = createDecipher('aes-256-gcm', this.encryptionKey);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  async publish(topic: string, message: AgentMessage): Promise<void> {
    try {
      const encryptedMessage = this.encryptMessage(message);
      const messageId = `${message.senderId}-${Date.now()}-${Math.random()}`;

      // Store in queue for reliability
      if (!this.messageQueue.has(topic)) {
        this.messageQueue.set(topic, []);
      }
      this.messageQueue.get(topic)!.push({
        ...message,
        id: messageId,
        timestamp: Date.now(),
        encrypted: encryptedMessage
      });

      // Emit with retry logic
      await this.emitWithRetry(topic, encryptedMessage, messageId);

    } catch (error) {
      console.error('Publish error:', error);
      throw error;
    }
  }

  private async emitWithRetry(topic: string, encryptedMessage: string, messageId: string): Promise<void> {
    const maxRetries = this.maxRetries;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        this.emit(topic, encryptedMessage);
        this.retryAttempts.delete(messageId);
        return;
      } catch (error) {
        attempts++;
        this.retryAttempts.set(messageId, attempts);

        if (attempts >= maxRetries) {
          this.emit('message_failed', { messageId, topic, error, attempts });
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
  }

  subscribe(topic: string, handler: (message: AgentMessage) => void): void {
    this.on(topic, (encryptedMessage: string) => {
      try {
        const message = this.decryptMessage(encryptedMessage);
        handler(message);
      } catch (error) {
        console.error('Message decryption error:', error);
        this.emit('decryption_error', { topic, error });
      }
    });
  }

  async requestResponse(topic: string, message: AgentMessage, timeout: number = 5000): Promise<AgentMessage> {
    return new Promise((resolve, reject) => {
      const responseTopic = `${topic}.response.${message.senderId}`;
      const timeoutId = setTimeout(() => {
        this.removeAllListeners(responseTopic);
        reject(new Error('Request timeout'));
      }, timeout);

      this.once(responseTopic, (encryptedResponse: string) => {
        clearTimeout(timeoutId);
        try {
          const response = this.decryptMessage(encryptedResponse);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });

      this.publish(topic, message);
    });
  }

  // Health monitoring
  getHealthMetrics() {
    return {
      queueSize: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      retryCount: this.retryAttempts.size,
      listenerCount: this.eventNames().reduce((sum, event) => sum + this.listenerCount(event), 0),
      activeTopics: this.eventNames()
    };
  }

  // Cleanup failed messages
  cleanupFailedMessages(): void {
    const failedMessages = Array.from(this.retryAttempts.entries())
      .filter(([_, attempts]) => attempts >= this.maxRetries);

    failedMessages.forEach(([messageId]) => {
      this.retryAttempts.delete(messageId);
      // Remove from queues
      this.messageQueue.forEach((queue, topic) => {
        const index = queue.findIndex(msg => msg.id === messageId);
        if (index !== -1) {
          queue.splice(index, 1);
        }
      });
    });
  }
}

// Singleton instance
export const eventBus = new SecureEventBus();