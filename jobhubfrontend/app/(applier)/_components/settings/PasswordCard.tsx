'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PasswordCard() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements checks
  const hasMinLength = newPw.length >= 8;
  const hasUpper = /[A-Z]/.test(newPw);
  const hasLower = /[a-z]/.test(newPw);
  const hasNumber = /[0-9]/.test(newPw);
  const isMatch = newPw.length > 0 && newPw === confirm;
  const isFormValid = current.length > 0 && hasMinLength && hasUpper && hasLower && hasNumber && isMatch;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (!current) {
        toast.error('Please enter your current password.');
        return;
      }
      if (newPw !== confirm) {
        toast.error('New passwords do not match.');
        return;
      }
      if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
        toast.error('Password does not meet the security requirements.');
        return;
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock / API call simulation
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Your password has been changed successfully.');
      setOpen(false);
      setCurrent('');
      setNewPw('');
      setConfirm('');
    } catch {
      toast.error('Failed to update password. Please verify your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setCurrent('');
    setNewPw('');
    setConfirm('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-muted/60 border border-border/70 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Password</h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className={`rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer shrink-0 transition-all ${
            open ? 'bg-muted border-foreground/30 text-foreground' : 'hover:border-foreground/30'
          }`}
        >
          {open ? 'Cancel' : 'Change Password'}
        </Button>
      </div>

      {/* Modal-Free Inline Expandable Box */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSave} className="mt-5 pt-5 border-t border-border/70 space-y-4 max-w-lg">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="cur-pw" className="text-xs font-semibold text-foreground">
                  Current password
                </Label>
                <div className="relative">
                  <Input
                    id="cur-pw"
                    type={showCurrent ? 'text' : 'password'}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="Enter current password"
                    className="rounded-xl pr-10 text-xs sm:text-sm h-10 border-border bg-muted/20 focus:ring-1 focus:ring-primary/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new-pw" className="text-xs font-semibold text-foreground">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Enter new password"
                    className="rounded-xl pr-10 text-xs sm:text-sm h-10 border-border bg-muted/20 focus:ring-1 focus:ring-primary/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Requirements Checklist */}
                {newPw.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {hasMinLength ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                      <span>8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasUpper ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {hasUpper ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                      <span>1 uppercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasLower ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {hasLower ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                      <span>1 lowercase letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {hasNumber ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                      <span>1 number</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="conf-pw" className="text-xs font-semibold text-foreground">
                  Confirm new password
                </Label>
                <Input
                  id="conf-pw"
                  type={showNew ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="rounded-xl text-xs sm:text-sm h-10 border-border bg-muted/20 focus:ring-1 focus:ring-primary/40"
                  required
                />
                {confirm.length > 0 && (
                  <p
                    className={`text-[11px] font-medium flex items-center gap-1 mt-1 ${
                      isMatch ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
                    }`}
                  >
                    {isMatch ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> Passwords match
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="rounded-xl text-xs font-semibold h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!isFormValid || isSubmitting}
                  className="rounded-xl text-xs font-bold h-9 px-4 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Password'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

