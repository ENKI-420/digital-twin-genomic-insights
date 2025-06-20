import type { NextAuthOptions } from "next-auth"

interface EpicTokenSet {
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
  scope: string
  patient?: string
  encounter?: string
}

interface EpicProfile {
  sub: string
  name: string
  given_name: string
  family_name: string
  email?: string
  fhirUser?: string
}

export const epicProvider = {
  id: "epic",
  name: "Epic",
  type: "oauth" as const,
  authorization: {
    url: process.env.EPIC_AUTHORIZATION_URL!,
    params: {
      scope: process.env.EPIC_SCOPES || "openid fhirUser patient/*.read",
      response_type: "code",
      aud: process.env.EPIC_FHIR_BASE_URL!,
    },
  },
  token: process.env.EPIC_TOKEN_URL!,
  userinfo: {
    url: `${process.env.EPIC_FHIR_BASE_URL}/api/FHIR/R4/metadata`,
    async request({ tokens }: { tokens: EpicTokenSet }) {
      // Get practitioner info from Epic FHIR
      const response = await fetch(`${process.env.EPIC_FHIR_BASE_URL}/api/FHIR/R4/Practitioner`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/fhir+json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch Epic user info")
      }

      const data = await response.json()
      return {
        id: tokens.sub || data.id,
        name: data.name?.[0]?.text || `${data.name?.[0]?.given?.[0]} ${data.name?.[0]?.family}`,
        email: data.telecom?.find((t: any) => t.system === "email")?.value,
        epicId: data.id,
        fhirUser: tokens.fhirUser,
      }
    },
  },
  clientId: process.env.EPIC_CLIENT_ID!,
  clientSecret: process.env.EPIC_CLIENT_SECRET!,
  profile(profile: EpicProfile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      epicId: profile.fhirUser,
    }
  },
}

export const authOptions: NextAuthOptions = {
  providers: [epicProvider],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.epicId = (profile as any).epicId
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.epicId = token.epicId as string
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
