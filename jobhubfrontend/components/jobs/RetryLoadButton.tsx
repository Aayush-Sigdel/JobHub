"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryLoadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      className="mt-4 rounded-xl"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RotateCcw className={isPending ? "motion-safe:animate-spin" : undefined} />
      {isPending ? "Retrying…" : "Try again"}
    </Button>
  );
}
