import { NextRequest, NextResponse } from 'next/server'
import { getSMARTAuth } from '@/lib/epic/auth'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Epic OAuth Error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, request.url)
    )
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/auth/error?error=invalid_request&description=Missing required parameters', request.url)
    )
  }

  try {
    const smartAuth = getSMARTAuth()

    // Exchange authorization code for access token
    const tokenResponse = await smartAuth.exchangeCodeForToken(code, state)

    // Extract launch context
    const launchContext = smartAuth.getLaunchContext(tokenResponse)

    // Create session with Epic token information
    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    // Set secure cookies with token information
    response.cookies.set('epic_access_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in || 3600,
      path: '/'
    })

    if (tokenResponse.refresh_token) {
      response.cookies.set('epic_refresh_token', tokenResponse.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 30, // 30 days
        path: '/'
      })
    }

    // Store launch context
    if (launchContext.patient) {
      response.cookies.set('epic_patient_id', launchContext.patient, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenResponse.expires_in || 3600,
        path: '/'
      })
    }

    if (launchContext.encounter) {
      response.cookies.set('epic_encounter_id', launchContext.encounter, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenResponse.expires_in || 3600,
        path: '/'
      })
    }

    if (launchContext.practitioner) {
      response.cookies.set('epic_practitioner_id', launchContext.practitioner, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenResponse.expires_in || 3600,
        path: '/'
      })
    }

    return response

  } catch (error) {
    console.error('Epic OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/auth/error?error=token_exchange_failed&description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    )
  }
}

// Handle SMART App Launch redirect
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const launch = formData.get('launch') as string
    const iss = formData.get('iss') as string

    if (!launch || !iss) {
      return NextResponse.json(
        { error: 'Missing launch or iss parameter' },
        { status: 400 }
      )
    }

    const smartAuth = getSMARTAuth()
    const authUrl = smartAuth.generateEHRLaunchUrl(launch)

    return NextResponse.json({ authUrl })

  } catch (error) {
    console.error('SMART launch error:', error)
    return NextResponse.json(
      { error: 'Failed to handle SMART launch' },
      { status: 500 }
    )
  }
}
