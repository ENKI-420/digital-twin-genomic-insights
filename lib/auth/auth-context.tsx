"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  {
    id: "pathdx-101",
    email: "pathdxconsult@gmail.com",
    password: "beaker agent",
    name: "Pathology Consultant",
    role: "clinician",
  },
]

type User = {
  id: string
  email: string
  name: string
  role: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simple mock authentication
    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return { success: true }
    }

    return { success: false, error: "Invalid email or password" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
