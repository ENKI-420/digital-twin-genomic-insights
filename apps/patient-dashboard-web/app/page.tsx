'use client';
import Link from 'next/link';
import { Button, Card, LayoutShell } from '@genomictwin/design-system';

export default function Home() {
  return (
    <LayoutShell title="GenomicTwin – Patient Dashboard">
      <div className="max-w-xl mx-auto">
        <Card className="text-center space-y-4">
          <p>
            Connect your health record to get personalized genomic insights.
          </p>
          <Link href="/auth/launch">
            <Button>Connect My Health Record</Button>
          </Link>
        </Card>
      </div>
    </LayoutShell>
  );
}