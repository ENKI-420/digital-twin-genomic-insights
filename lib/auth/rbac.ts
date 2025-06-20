import { createServerSupabaseClient } from "@/lib/supabase/client"
import type { NextRequest } from "next/server"

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface UserProfile {
  id: string
  auth_user_id: string
  role_id: string
  display_name: string
  role: UserRole
}

export class RBACService {
  private supabase = createServerSupabaseClient()

  async getUserProfile(authUserId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select(`
        *,
        role:user_roles(*)
      `)
      .eq("auth_user_id", authUserId)
      .single()

    if (error || !data) {
      return null
    }

    return data as UserProfile
  }

  async createUserProfile(authUserId: string, roleName = "patient"): Promise<UserProfile | null> {
    // Get role by name
    const { data: role } = await this.supabase.from("user_roles").select("*").eq("name", roleName).single()

    if (!role) {
      throw new Error(`Role ${roleName} not found`)
    }

    // Create user profile
    const { data, error } = await this.supabase
      .from("user_profiles")
      .insert({
        auth_user_id: authUserId,
        role_id: role.id,
        display_name: "New User",
      })
      .select(`
        *,
        role:user_roles(*)
      `)
      .single()

    if (error || !data) {
      throw new Error("Failed to create user profile")
    }

    return data as UserProfile
  }

  async hasPermission(authUserId: string, permission: string): Promise<boolean> {
    const { data } = await this.supabase.rpc("check_user_permission", {
      auth_user_uuid: authUserId,
      permission_name: permission,
    })

    return data || false
  }

  async requirePermission(authUserId: string, permission: string): Promise<void> {
    const hasPermission = await this.hasPermission(authUserId, permission)
    if (!hasPermission) {
      throw new Error(`Permission denied: ${permission}`)
    }
  }

  async getUsersByRole(roleName: string): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select(`
        *,
        role:user_roles(*)
      `)
      .eq("role.name", roleName)

    if (error) {
      throw new Error("Failed to fetch users by role")
    }

    return data as UserProfile[]
  }
}

// Middleware helper for API routes
export function withRBAC(requiredPermission: string) {
  return async (request: NextRequest, handler: Function) => {
    try {
      // Get user from session (you'll need to implement session extraction)
      const authUserId = request.headers.get("x-user-id") // Placeholder

      if (!authUserId) {
        return new Response("Unauthorized", { status: 401 })
      }

      const rbac = new RBACService()
      await rbac.requirePermission(authUserId, requiredPermission)

      return handler(request)
    } catch (error) {
      return new Response("Forbidden", { status: 403 })
    }
  }
}
