import { redirect } from 'next/navigation';

export default async function ProviderLaunchRedirect() {
  redirect(
    `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_EPIC_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL + '/oauth/callback')}&response_type=code&scope=${encodeURIComponent('launch openid fhirUser user/*.read')}`
  );
  return null;
}