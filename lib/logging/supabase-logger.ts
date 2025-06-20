import { createServerSupabaseClient } from "../supabase/client"

export enum LogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export enum LogAction {
  AUTH_SUCCESS = "auth_success",
  AUTH_FAILURE = "auth_failure",
  REPORT_FETCH = "report_fetch",
  REPORT_FETCH_ERROR = "report_fetch_error",
  CSV_DOWNLOAD = "csv_download",
  SESSION_TIMEOUT = "session_timeout",
  SESSION_REFRESH = "session_refresh",
}

interface LogEntry {
  level: LogLevel
  action: LogAction
  message: string
  user_id?: string
  patient_id?: string
  details?: any
  timestamp: string
}

export async function logEvent(
  level: LogLevel,
  action: LogAction,
  message: string,
  userId?: string,
  patientId?: string,
  details?: any,
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()

    const logEntry: LogEntry = {
      level,
      action,
      message,
      user_id: userId,
      patient_id: patientId,
      details: details ? JSON.stringify(details) : null,
      timestamp: new Date().toISOString(),
    }

    const { error } = await supabase.from("activity_logs").insert(logEntry)

    if (error) {
      console.error("Failed to log event to Supabase:", error)
    }
  } catch (error) {
    console.error("Error logging to Supabase:", error)
  }
}
