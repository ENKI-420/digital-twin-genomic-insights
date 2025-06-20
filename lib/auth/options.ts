import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Mock user data for demo purposes
const MOCK_USERS = [
  {
    id: "patient-123",
    email: "patient@example.com",
    password: "password",
    name: "John Patient",
    role: "patient",
  },
  {
    id: "doctor-456",
    email: "doctor@example.com",
    password: "password",
    name: "Dr. Jane Smith",
    role: "clinician",
  },
  {
    id: "admin-789",
    email: "admin@example.com",
    password: "password",
    name: "Admin User",
    role: "admin",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, use mock data instead of Supabase
        const user = MOCK_USERS.find(
          (user) => user.email === credentials.email && user.password === credentials.password,
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Use a simple secret for demo purposes
  secret: process.env.NEXTAUTH_SECRET || "demo-secret-do-not-use-in-production",
}
