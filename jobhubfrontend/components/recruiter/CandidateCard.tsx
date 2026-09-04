import React from "react";
import type { CandidateDashboardResponse } from "@/types/api/recruiter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { calculateSupportedOverallSimilarity, getSimilaritySources } from "@/lib/semantic-match";

interface CandidateCardProps {
  candidate: CandidateDashboardResponse;
  onSelect?: (candidate: CandidateDashboardResponse) => void;
}

export default function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  const evidenceSources = getSimilaritySources(candidate);
  const overallSimilarity = calculateSupportedOverallSimilarity(candidate);

  return (
    <Card className="bg-card shadow-sm transition-colors hover:border-primary/50">
      <button type="button" className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onClick={() => onSelect?.(candidate)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={candidate.imageUrl} />
              <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm leading-none">{candidate.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{candidate.title || "Applicant"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-lg font-bold tabular-nums text-foreground">{overallSimilarity?.toFixed(3) ?? "N/A"}</span>
            <span className="text-[11px] text-muted-foreground">Overall similarity</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground">Evidence {evidenceSources.length}/5 sources</span>
            <span className="inline-flex items-center gap-1 font-medium text-primary">Review <ArrowRight className="size-3" /></span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {evidenceSources.length <= 1 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                Limited evidence
              </Badge>
            )}
            {candidate.allTasksPassed ? (
              <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200 hover:bg-green-50/50 text-[10px] px-1.5 py-0">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Passed All
              </Badge>
            ) : (candidate.designSubmission || candidate.programmingSubmission || candidate.sqlSubmission) ? (
              <Badge variant="outline" className="bg-yellow-50/50 text-yellow-700 border-yellow-200 hover:bg-yellow-50/50 text-[10px] px-1.5 py-0">
                <AlertCircle className="w-3 h-3 mr-1" /> Tasks Pending/Failed
              </Badge>
            ) : null}
            {candidate.tabSwitchLimitExceeded && (
              <Badge variant="outline" className="bg-red-50/50 text-red-700 border-red-200 hover:bg-red-50/50 text-[10px] px-1.5 py-0">
                <AlertCircle className="w-3 h-3 mr-1" /> Flagged
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      </button>
    </Card>
  );
}
