'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { syncAllEmbeddingsAction, syncPlatformEmbeddingAction, syncSocialEmbeddingAction } from '@/lib/actions/embeddings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SocialSource = 'GITHUB' | 'DEV_TO' | 'ORCID' | 'STACKOVERFLOW' | 'PORTFOLIO' | 'WEBSITE';

interface SyncStatus {
  source: SocialSource | 'PLATFORM';
  isLinked: boolean;
  lastSyncedAt?: string;
  hasFailed: boolean;
}

interface EmbeddingStatusCardProps {
  readinessPercentage: number;
  statuses: SyncStatus[];
}

export function EmbeddingStatusCard({ readinessPercentage, statuses }: EmbeddingStatusCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSyncAll = () => {
    startTransition(async () => {
      try {
        await syncAllEmbeddingsAction();
        toast.success('Matching data refreshed successfully.');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to refresh matching data.');
      }
    });
  };

  const handleSyncSource = (source: SocialSource | 'PLATFORM') => {
    startTransition(async () => {
      try {
        if (source === 'PLATFORM') {
          await syncPlatformEmbeddingAction();
          toast.success('JobHub profile matching data updated');
        } else {
          await syncSocialEmbeddingAction(source);
          toast.success(`${source} synced successfully`);
        }
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Failed to sync ${source}.`);
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">Matching Data Readiness</CardTitle>
          <CardDescription>Keep supported profile sources current for semantic job matching</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={isPending}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
          Resync All
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 mt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Data readiness</span>
            <span>{readinessPercentage}%</span>
          </div>
          <Progress value={readinessPercentage} className="h-2" />
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Data Sources</h4>
          <div className="grid gap-3">
            {statuses.map((status) => (
              <div key={status.source} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center space-x-3">
                  {status.hasFailed ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : status.lastSyncedAt ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {status.source.replace('_', ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!status.isLinked
                        ? 'Not linked'
                        : status.lastSyncedAt
                          ? `Synced ${new Date(status.lastSyncedAt).toLocaleDateString()}`
                          : 'Never synced'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled={!status.isLinked || isPending} onClick={() => handleSyncSource(status.source)}>
                  Sync
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
