import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams?.next ?? '/'

  async function handleLogin() {
    'use server'
    // Set the cookie with proper options
    const cookieStore = await cookies()
    cookieStore.set('demo_auth', 'authenticated', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: false, // Set to true in production
      maxAge: 60 * 60 * 24 // 24 hours
    })
    redirect(next)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-background">
      <h1 className="text-2xl font-semibold">Baptist Health Demo</h1>
      <form action={handleLogin}>
        <button type="submit" className="px-6 py-3 font-medium text-white rounded-md bg-primary hover:opacity-90">
          Enter Demo
        </button>
      </form>
    </div>
  )
}