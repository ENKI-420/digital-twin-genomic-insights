import React from 'react';
import { Button } from './Button';

interface Props {
  title: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

export function LayoutShell({ title, onLogout, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {onLogout && (
          <Button variant="outline" onClick={onLogout} className="text-sm">
            Logout
          </Button>
        )}
      </header>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}