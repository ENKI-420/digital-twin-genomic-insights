import { cookies } from 'next/headers'

export default async function TestAuthPage() {
  const cookieStore = await cookies()
  const demoAuth = cookieStore.get('demo_auth')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>demo_auth cookie:</strong> {demoAuth ? demoAuth.value : 'Not found'}</p>
        <p><strong>Cookie exists:</strong> {demoAuth ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}