export { authOptions } from './options'
export * from './rbac'
export * from './session-manager'
export * from './epic-auth'
export * from './epic-oauth'

// Add NextAuth handler export for API routes
import { getServerSession } from "next-auth"
import { authOptions } from "./options"

export const auth = () => getServerSession(authOptions)