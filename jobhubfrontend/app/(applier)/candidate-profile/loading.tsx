import { Loader2 } from "lucide-react";

export default function CandidateProfileLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">
        Loading your profile...
      </p>
    </div>
  );
}
