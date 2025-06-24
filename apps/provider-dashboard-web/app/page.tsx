'use client';
import Link from 'next/link';
import { Button, Card, LayoutShell } from '@genomictwin/design-system';

export default function ProviderHome() {
  return (
    <LayoutShell title="GenomicTwin – Provider Dashboard">
      <div className="max-w-xl mx-auto">
        <Card className="text-center space-y-4">
          <p>
            Access patient genomic insights, clinical decision support, and trial matches.
          </p>
          <Link href="/auth/launch">
            <Button variant="secondary">Connect via EHR</Button>
          </Link>
        </Card>
      </div>
    </LayoutShell>
  );
}