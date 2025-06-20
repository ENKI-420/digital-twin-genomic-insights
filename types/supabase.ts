export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinicians: {
        Row: {
          id: string
          first_name: string
          last_name: string
          specialty: string | null
          email: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          specialty?: string | null
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          specialty?: string | null
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patient_clinicians: {
        Row: {
          id: string
          patient_id: string
          clinician_id: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          clinician_id: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          clinician_id?: string
          created_at?: string
        }
      }
      diagnostic_reports: {
        Row: {
          id: string
          patient_id: string
          report_type: string
          status: string
          issued_date: string
          raw_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          report_type: string
          status: string
          issued_date: string
          raw_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          report_type?: string
          status?: string
          issued_date?: string
          raw_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      conversation_history: {
        Row: {
          id: string
          patient_id: string
          user_message: string
          agent_response: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          user_message: string
          agent_response: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          user_message?: string
          agent_response?: string
          created_at?: string
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
