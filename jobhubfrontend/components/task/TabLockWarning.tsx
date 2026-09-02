'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface TabLockWarningProps {
  tabSwitchCount: number;
  warningLimit: number;
  isWarning: boolean;
  isLimitExceeded: boolean;
}

export function TabLockWarning({ tabSwitchCount, warningLimit, isWarning, isLimitExceeded }: TabLockWarningProps) {
  if (tabSwitchCount === 0) return null;

  if (isLimitExceeded) {
    return (
      <Alert variant="destructive" className="fixed bottom-4 right-4 w-96 z-50 shadow-lg animate-in slide-in-from-bottom-5">
        <ShieldAlert className="h-5 w-5" />
        <AlertTitle className="font-bold">Tab Limit Exceeded!</AlertTitle>
        <AlertDescription>
          You have switched tabs {tabSwitchCount} times, exceeding the limit of {warningLimit}.
          This will be flagged in your application.
        </AlertDescription>
      </Alert>
    );
  }

  if (isWarning) {
    return (
      <Alert className="fixed bottom-4 right-4 w-96 z-50 shadow-lg border-orange-300 bg-orange-50 animate-in slide-in-from-bottom-5">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="font-bold text-orange-800">Tab Switch Warning</AlertTitle>
        <AlertDescription className="text-orange-700">
          Tab switches: {tabSwitchCount} / {warningLimit}.
          Leaving the page may affect your application.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
