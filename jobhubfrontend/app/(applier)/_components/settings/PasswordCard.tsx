"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordCard() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSave() {
    if (!current || !newPw || !confirm) return;
    if (newPw !== confirm) return;
    // call API here
    // await updatePassword({ current, newPw })
    setOpen(false);
    setCurrent("");
    setNewPw("");
    setConfirm("");
  }

  return (
    <div className="rounded-xl border p-6 mb-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium">Password</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a strong and unique password to secure your account.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Change my password
        </Button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <Label htmlFor="cur-pw" className="text-xs text-muted-foreground">
              Current password
            </Label>
            <Input
              id="cur-pw"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-pw" className="text-xs text-muted-foreground">
              New password
            </Label>
            <Input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="conf-pw" className="text-xs text-muted-foreground">
              Confirm new password
            </Label>
            <Input
              id="conf-pw"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                alert("Password changed successfully!");
              }}
            >
              Save password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
