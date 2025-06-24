import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = req.cookies.get('gt_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const gatewayUrl = `${process.env.NEXT_PUBLIC_FHIR_GATEWAY_URL}/fhir/${params.path.join('/')}${req.nextUrl.search}`;
  const resp = await fetch(gatewayUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await resp.json();
  return NextResponse.json(data, { status: resp.status });
}