import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Export the createClient function for direct use
export { createClient }

// Create a single supabase client for the entire server
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function createServerSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      },
    )
  }

  return supabaseClient
}

// For client-side usage (with user's session)
export function createClientSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storageKey: "supabase.auth.token",
    },
  })
}

// Default export for convenience
export default createClientSupabaseClient
