"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Users } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updateDiscoverabilityAction } from "@/lib/actions/user";

interface ProfileDiscoverabilityProps {
  initialDiscoverable: boolean;
}

export function ProfileDiscoverability({
  initialDiscoverable,
}: ProfileDiscoverabilityProps) {
  const [discoverable, setDiscoverable] = useState(initialDiscoverable);
  const [isPending, startTransition] = useTransition();
  const descriptionId = "collaboration-discoverability-description";

  const handleChange = (nextValue: boolean) => {
    startTransition(async () => {
      try {
        const profile = await updateDiscoverabilityAction(nextValue);
        setDiscoverable(profile.discoverable);
        toast.success(
          profile.discoverable
            ? "Your profile is now visible to collaborators."
            : "Your profile is hidden from collaborator search.",
        );
      } catch (error) {
        console.error("Failed to update collaboration visibility:", error);
        toast.error("Collaboration visibility could not be updated.");
      }
    });
  };

  return (
    <section
      id="collaboration-visibility"
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Users className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Collaboration visibility
              </h2>
              <p
                id={descriptionId}
                className="mt-1 text-xs leading-relaxed text-muted-foreground"
              >
                Let other candidates find you through skill-based collaborator
                matching.
              </p>
            </div>
            <Switch
              checked={discoverable}
              onCheckedChange={handleChange}
              disabled={isPending}
              aria-label="Show my profile in collaborator search"
              aria-describedby={descriptionId}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {discoverable ? (
              <Eye className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            <span aria-live="polite">
              {isPending
                ? "Saving visibility..."
                : discoverable
                  ? "Visible to candidates"
                  : "Hidden from candidates"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
