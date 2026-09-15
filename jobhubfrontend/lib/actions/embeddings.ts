"use server";

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";
import type {
  UserEmbeddingSyncResponse,
  PlatformEmbeddingSyncResult,
  EmbeddingSyncResult,
  SocialSource,
} from "@/types/api/embeddings";

export async function syncAllEmbeddingsAction(): Promise<UserEmbeddingSyncResponse> {
  try {
    const result = await fetchWithAuth<UserEmbeddingSyncResponse>(
      "/user/embedding/sync",
      {
        method: "POST",
      },
    );
    revalidatePath("/candidate-profile");
    revalidatePath("/home");
    revalidatePath("/find-job");
    return result;
  } catch (error) {
    // The aggregate endpoint can fail when one external social source is down.
    // Keep the core JobHub profile matching data refreshable independently.
    try {
      const platform = await syncPlatformEmbeddingAction();
      return {
        userId: "",
        syncedAt: new Date().toISOString(),
        overallSuccess: platform.success,
        platformResult: platform,
        socialResults: [],
        profileEmbeddingUpdated:
          platform.success && platform.embeddingGenerated,
        platformEmbeddingUpdated:
          platform.success && platform.embeddingGenerated,
      };
    } catch {
      throw error;
    }
  }
}

export async function syncPlatformEmbeddingAction(): Promise<PlatformEmbeddingSyncResult> {
  const result = await fetchWithAuth<PlatformEmbeddingSyncResult>(
    "/user/embedding/sync/platform",
    {
      method: "POST",
    },
  );
  revalidatePath("/candidate-profile");
  revalidatePath("/home");
  revalidatePath("/find-job");
  return result;
}

export async function syncSocialEmbeddingAction(
  source: SocialSource,
): Promise<EmbeddingSyncResult> {
  const result = await fetchWithAuth<EmbeddingSyncResult>(
    `/user/embeddings/sync/${source}`,
    {
      method: "POST",
    },
  );
  revalidatePath("/candidate-profile");
  revalidatePath("/home");
  revalidatePath("/find-job");
  return result;
}
