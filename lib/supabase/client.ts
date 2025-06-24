import { createClient } from "@supabase/supabase-js"
import { databaseConfig } from "@/lib/config/environment"

// Export the createClient function for direct use
export { createClient }

// Create Supabase client with proper error handling
export const supabase = databaseConfig.supabase.url && databaseConfig.supabase.anonKey
  ? createClient(databaseConfig.supabase.url, databaseConfig.supabase.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

// Server-side client for admin operations
export const supabaseAdmin = databaseConfig.supabase.url && databaseConfig.supabase.serviceKey
  ? createClient(databaseConfig.supabase.url, databaseConfig.supabase.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Type-safe database types (these would be generated from your schema)
export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          date_of_birth: string
          gender: string
          medical_record_number: string
          epic_patient_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name: string
          date_of_birth: string
          gender: string
          medical_record_number: string
          epic_patient_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          date_of_birth?: string
          gender?: string
          medical_record_number?: string
          epic_patient_id?: string
        }
      }
      genomic_analyses: {
        Row: {
          id: string
          patient_id: string
          created_at: string
          analysis_type: string
          status: string
          results: any
          epic_diagnostic_report_id?: string
        }
        Insert: {
          id?: string
          patient_id: string
          created_at?: string
          analysis_type: string
          status: string
          results: any
          epic_diagnostic_report_id?: string
        }
        Update: {
          id?: string
          patient_id?: string
          created_at?: string
          analysis_type?: string
          status?: string
          results?: any
          epic_diagnostic_report_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Legacy compatibility exports
export const createServerSupabaseClient = () => supabaseAdmin
export const createClientSupabaseClient = () => supabase

// Default export for convenience
export default supabase
