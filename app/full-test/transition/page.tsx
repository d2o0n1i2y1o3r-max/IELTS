'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ModuleTransition from '@/components/ModuleTransition';
import { ModuleType } from '@/lib/types';

function TransitionContent() {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get('module') as ModuleType;

  if (!moduleParam) {
    return null;
  }

  return <ModuleTransition completedModule={moduleParam} />;
}

export default function FullTestTransitionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    }>
      <TransitionContent />
    </Suspense>
  );
}
