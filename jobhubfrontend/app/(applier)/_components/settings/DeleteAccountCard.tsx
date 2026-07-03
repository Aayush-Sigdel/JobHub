"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleDelete() {
    // TODO: call your API here
    // await deleteAccount()
    setOpen(false);
  }

  return (
    <>
      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium">Delete account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Contact our{" "}
              <a href="/support" className="underline">
                customer service
              </a>{" "}
              if you need any help.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setValue("");
              setOpen(true);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete my account
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data,
              saved jobs, and settings will be removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-semibold text-foreground">DELETE</span>{" "}
              to confirm
            </p>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={value !== "DELETE"}
              onClick={() => {
                const confirmed = confirm(
                  "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
                );
                if (confirmed) {
                  //   await deleteAccount();
                  setOpen(false);
                  setValue("");
                }
              }}
            >
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
