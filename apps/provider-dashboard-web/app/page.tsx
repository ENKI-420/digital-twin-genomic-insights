'use client';
import Link from 'next/link';

export default function ProviderHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">GenomicTwin</h1>
          <h2 className="text-xl text-gray-600">Provider Dashboard</h2>
          <p className="text-gray-700">
            Access patient genomic insights, clinical decision support, and trial matches.
          </p>
          <Link
            href="/auth/launch"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Connect via EHR
          </Link>
        </div>
      </div>
    </div>
  );
}