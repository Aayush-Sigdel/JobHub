export type EmbeddingSource = "PLATFORM" | "GITHUB" | "DEV_TO" | "ORCID" | "STACKOVERFLOW" | "PORTFOLIO" | "WEBSITE";
export type SocialPlatform = "GITHUB" | "LINKEDIN" | "PORTFOLIO" | "WEBSITE" | "ORCID" | "STACKOVERFLOW" | "DEV_TO" | "OTHER";
export type SocialSource = 'GITHUB' | 'DEV_TO' | 'ORCID' | 'STACKOVERFLOW' | 'PORTFOLIO' | 'WEBSITE';

export interface PlatformEmbeddingSyncResult {
  success: boolean;
  embeddingGenerated: boolean;
  message?: string;
}

export interface SocialSyncPlatformResult {
  platform: SocialPlatform;
  success: boolean;
  identifier?: string;
  embeddingGenerated: boolean;
  snapshotSaved: boolean;
  message?: string;
}

export interface UserEmbeddingSyncResponse {
  userId: string;
  syncedAt: string;
  overallSuccess: boolean;
  platformResult?: PlatformEmbeddingSyncResult;
  socialResults: SocialSyncPlatformResult[];
  profileEmbeddingUpdated: boolean;
  platformEmbeddingUpdated: boolean;
}

export interface EmbeddingSyncResult {
  source: EmbeddingSource;
  success: boolean;
  identifier?: string;
  embeddingGenerated: boolean;
  snapshotSaved: boolean;
  message?: string;
}

export interface GithubSnapshot {
  reposCount: number;
  topLanguages: Record<string, number>;
  contributions: number;
  followers: number;
}

export interface StackOverflowSnapshot {
  reputation: number;
  badges: { gold: number; silver: number; bronze: number };
  topTags: string[];
}

export interface DevToSnapshot {
  articlesCount: number;
  totalReactions: number;
}

export interface OrcidSnapshot {
  publicationsCount: number;
  latestPublication?: string;
}

export interface SocialSnapshot {
  source: SocialSource;
  lastSyncedAt: string;
  data: GithubSnapshot | StackOverflowSnapshot | DevToSnapshot | OrcidSnapshot | any;
}
