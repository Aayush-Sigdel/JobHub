'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function TwoFactorCard() {
  const [open, setOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const secretKey = 'JHUB-4892-7104-KL98-WX21';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    toast.success('Setup key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsEnabled(true);
      setOpen(false);
      setCode('');
      toast.success('Two-factor authentication has been activated successfully.');
    } catch {
      toast.error('Invalid authentication code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable = () => {
    setIsEnabled(false);
    toast.info('Two-factor authentication has been disabled.');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/70 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Two-factor authentication</h2>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isEnabled
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {isEnabled ? 'Active' : 'Not Enabled'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
              Require an authentication code from your mobile device when logging into your JobHub account.
            </p>
          </div>
        </div>

        {isEnabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDisable}
            className="rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 shrink-0"
          >
            Disable 2FA
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(!open)}
            className={`rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer shrink-0 transition-all ${
              open ? 'bg-muted border-foreground/30 text-foreground' : 'hover:border-foreground/30'
            }`}
          >
            {open ? 'Cancel' : 'Set Up 2FA'}
          </Button>
        )}
      </div>

      {/* Modal-Free Inline Expandable Setup */}
      <AnimatePresence>
        {open && !isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form onSubmit={handleVerify} className="mt-5 pt-5 border-t border-border/70 space-y-4 max-w-lg">
              <div className="space-y-3 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  1. Open your authenticator app (e.g., <span className="font-semibold text-foreground">Google Authenticator</span>, <span className="font-semibold text-foreground">Authy</span>, or <span className="font-semibold text-foreground">1Password</span>).
                </p>
                <p className="leading-relaxed">
                  2. Add a new account using the manual setup key below:
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/40 max-w-md">
                  <QrCode className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-xs font-bold text-foreground flex-1 select-all">
                    {secretKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copy key"
                    aria-label="Copy key"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="2fa-code" className="text-xs font-semibold text-foreground">
                  3. Enter the 6-digit verification code from the app:
                </Label>
                <Input
                  id="2fa-code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="rounded-xl font-mono text-center tracking-widest text-sm h-10 max-w-[200px] border-border bg-muted/20 focus:ring-1 focus:ring-primary/40"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setCode('');
                  }}
                  className="rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={code.length < 6 || isVerifying}
                  className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify and Enable'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
