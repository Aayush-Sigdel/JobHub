'use client';

import React, { useState } from 'react';
import { Laptop, Smartphone, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SessionsCard() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOutOthers = async () => {
    setIsSigningOut(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Signed out of all other active sessions successfully.');
    } catch {
      toast.error('Failed to sign out of other devices.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/70 flex items-center justify-center shrink-0">
            <Laptop className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Active Sessions</h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
              Devices and browsers currently authenticated with your JobHub account.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSigningOut}
          onClick={handleSignOutOthers}
          className="rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer shrink-0 gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign out other sessions'}</span>
        </Button>
      </div>

      {/* Session List */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        {/* Current Device */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
              <Laptop className="h-4.5 w-4.5 text-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Chrome on Linux</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                  <span>Current Session</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Kathmandu, Nepal • IP: 103.198.*.*
              </p>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block">
            Active now
          </span>
        </div>

        {/* Previous Device */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted/40 border border-border flex items-center justify-center shrink-0">
              <Smartphone className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">Mobile Safari on iOS</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Kathmandu, Nepal • Last active 2 days ago
              </p>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block">
            Offline
          </span>
        </div>
      </div>
    </div>
  );
}
