import { SupabaseClient } from '@supabase/supabase-js'
import { Session } from 'next-auth'
import { z } from 'zod'

export interface ServiceContext {
  session: Session
  supabase: SupabaseClient
  logger: {
    info: (message: string, data?: any) => Promise<void>
    error: (message: string, data?: any) => Promise<void>
    warn: (message: string, data?: any) => Promise<void>
  }
}

export abstract class BaseService {
  protected session: Session
  protected supabase: SupabaseClient
  protected logger: ServiceContext['logger']
  protected userId: string

  constructor(context: ServiceContext) {
    this.session = context.session
    this.supabase = context.supabase
    this.logger = context.logger
    this.userId = context.session.user?.id || ''
  }

  // Common validation methods
  protected validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw new Error(`Validation error: ${result.error.message}`)
    }
    return result.data
  }

  // Common permission checks
  protected async checkPermission(resource: string, action: string): Promise<boolean> {
    // Implementation would check user roles and permissions
    // For now, returning true for all authenticated users
    return true
  }

  // Common database helpers
  protected async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      this.logger.error(`Error fetching ${table} by id`, { error, id })
      throw error
    }

    return data as T
  }

  protected async create<T>(table: string, data: any): Promise<T> {
    const { data: created, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) {
      this.logger.error(`Error creating ${table}`, { error, data })
      throw error
    }

    return created as T
  }

  protected async update<T>(table: string, id: string, updates: any): Promise<T> {
    const { data: updated, error } = await this.supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      this.logger.error(`Error updating ${table}`, { error, id, updates })
      throw error
    }

    return updated as T
  }

  protected async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      this.logger.error(`Error deleting from ${table}`, { error, id })
      throw error
    }
  }

  // Audit logging
  protected async audit(action: string, resourceType: string, resourceId: string, details?: any) {
    await this.logger.info('Audit Log', {
      userId: this.userId,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString()
    })
  }

  // Error handling
  protected handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unknown error occurred')
  }

  // Response formatting
  protected successResponse<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }
  }

  protected errorResponse(error: string, details?: any) {
    return {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString()
    }
  }
}