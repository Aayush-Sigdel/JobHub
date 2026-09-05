'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      // Mock / API call simulation
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Your account has been permanently deleted.');
      setOpen(false);
      setConfirmText('');
    } catch {
      toast.error('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCancel = () => {
    setOpen(false);
    setConfirmText('');
  };

  return (
    <div className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-bold text-destructive">Delete account</h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
              Permanently remove your personal profile, test submissions, saved jobs, and active applications.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            if (open) {
              handleCancel();
            } else {
              setOpen(true);
            }
          }}
          className="rounded-xl text-xs font-bold h-9 px-3.5 cursor-pointer shrink-0 shadow-xs"
        >
          {open ? 'Cancel' : 'Delete Account'}
        </Button>
      </div>

      {/* Modal-Free Inline Expandable Danger Zone */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form onSubmit={handleDelete} className="mt-5 pt-5 border-t border-destructive/20 space-y-4 max-w-lg">
              {/* Warning Banner */}
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Warning: This action is irreversible</span>
                </div>
                <p className="leading-relaxed text-muted-foreground dark:text-destructive/90">
                  Once your account is deleted, your profile credentials, portfolio links, coding challenge results, and
                  all active job applications will be immediately removed and cannot be recovered.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="text-xs font-semibold text-foreground">
                  To confirm, type <span className="font-mono font-bold text-destructive">DELETE</span> in the box below:
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="rounded-xl font-mono text-xs sm:text-sm h-10 border-destructive/40 bg-destructive/5 focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
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
                  variant="destructive"
                  size="sm"
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="rounded-xl text-xs font-bold h-9 px-4 cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  {isDeleting ? 'Deleting account...' : 'Permanently Delete My Account'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

