import { redirect } from 'next/navigation';

export default async function LaunchRedirect() {
  // Placeholder: In production, compute params and redirect
  redirect(
    `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_EPIC_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL + '/oauth/callback')}&response_type=code&scope=${encodeURIComponent('launch openid fhirUser patient/*.read')}`
  );
  return null;
}