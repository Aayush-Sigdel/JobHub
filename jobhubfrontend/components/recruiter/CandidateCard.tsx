import React from "react";
import { CandidateDashboardResponse } from "@/lib/types/recruiter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getSimilaritySources, semanticMatchPercentage } from "@/lib/semantic-match";

export default function CandidateCard({ candidate }: { candidate: CandidateDashboardResponse }) {
  const matchPercentage = semanticMatchPercentage(candidate.overallSimilarity) ?? 0;
  const evidenceSources = getSimilaritySources(candidate);
  const matchColor = matchPercentage > 75 ? "text-green-500" : matchPercentage > 50 ? "text-yellow-500" : "text-muted-foreground";

  return (
    <Card className="hover:border-primary/50 transition-colors bg-card shadow-sm">
      <CardContent className="p-4 space-y-4">
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
            <span className={`text-sm font-bold ${matchColor}`}>{matchPercentage}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Semantic fit</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground">Evidence {evidenceSources.length}/6 sources</span>
            <Progress value={matchPercentage} className="h-1.5 w-24" />
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
    </Card>
  );
}
