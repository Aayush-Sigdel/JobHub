'use server';

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";
import type { UserEmbeddingSyncResponse, PlatformEmbeddingSyncResult, EmbeddingSyncResult, SocialSource } from '@/types/api/embeddings';

export async function syncAllEmbeddingsAction(): Promise<UserEmbeddingSyncResponse> {
  const result = await fetchWithAuth<UserEmbeddingSyncResponse>('/user/embedding/sync', {
    method: 'POST'
  });
  revalidatePath('/candidate-profile');
  revalidatePath('/home');
  revalidatePath('/find-job');
  return result;
}

export async function syncPlatformEmbeddingAction(): Promise<PlatformEmbeddingSyncResult> {
  const result = await fetchWithAuth<PlatformEmbeddingSyncResult>('/user/embedding/sync/platform', {
    method: 'POST'
  });
  revalidatePath('/candidate-profile');
  revalidatePath('/home');
  revalidatePath('/find-job');
  return result;
}

export async function syncSocialEmbeddingAction(source: SocialSource): Promise<EmbeddingSyncResult> {
  const result = await fetchWithAuth<EmbeddingSyncResult>(`/user/embeddings/sync/${source}`, {
    method: 'POST'
  });
  revalidatePath('/candidate-profile');
  revalidatePath('/home');
  revalidatePath('/find-job');
  return result;
}
