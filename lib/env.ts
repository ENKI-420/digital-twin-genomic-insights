export const requiredServerEnvs = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "EPIC_CLIENT_ID_SANDBOX",
  "EPIC_CLIENT_SECRET",
  "EPIC_PRIVATE_KEY_PATH_SANDBOX",
] as const

export function validateServerEnvs() {
  for (const env of requiredServerEnvs) {
    if (!process.env[env]) {
      throw new Error(`Missing required server environment variable: ${env}`)
    }
  }
}
