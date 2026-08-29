package com.example.jobhub.dto.social

import com.example.jobhub.model.SocialPlatform
import java.time.Instant

enum class EmbeddingSource {
    PLATFORM,
    GITHUB,
    DEV_TO,
    ORCID,
    STACKOVERFLOW,
    PORTFOLIO,
    WEBSITE;

    fun toSocialPlatform(): SocialPlatform? = when (this) {
        GITHUB -> SocialPlatform.GITHUB
        DEV_TO -> SocialPlatform.DEV_TO
        ORCID -> SocialPlatform.ORCID
        STACKOVERFLOW -> SocialPlatform.STACKOVERFLOW
        PORTFOLIO -> SocialPlatform.PORTFOLIO
        WEBSITE -> SocialPlatform.WEBSITE
        PLATFORM -> null
    }

    companion object {
        fun fromSocialPlatform(platform: SocialPlatform): EmbeddingSource? = when (platform) {
            SocialPlatform.GITHUB -> GITHUB
            SocialPlatform.DEV_TO -> DEV_TO
            SocialPlatform.ORCID -> ORCID
            SocialPlatform.STACKOVERFLOW -> STACKOVERFLOW
            SocialPlatform.PORTFOLIO -> PORTFOLIO
            SocialPlatform.WEBSITE -> WEBSITE
            else -> null
        }
    }
}

data class SocialSyncPlatformResult(
    val platform: SocialPlatform,
    val success: Boolean,
    val identifier: String?,
    val embeddingGenerated: Boolean,
    val snapshotSaved: Boolean,
    val message: String? = null
)

data class PlatformEmbeddingSyncResult(
    val success: Boolean,
    val embeddingGenerated: Boolean,
    val message: String? = null
)

data class EmbeddingSyncResult(
    val source: EmbeddingSource,
    val success: Boolean,
    val identifier: String? = null,
    val embeddingGenerated: Boolean,
    val snapshotSaved: Boolean = false,
    val message: String? = null
)

data class SocialSyncResponse(
    val userId: String,
    val syncedAt: Instant = Instant.now(),
    val overallSuccess: Boolean,
    val results: List<SocialSyncPlatformResult>,
    val profileEmbeddingUpdated: Boolean,
    val platformEmbeddingUpdated: Boolean
)

data class UserEmbeddingSyncResponse(
    val userId: String,
    val syncedAt: Instant = Instant.now(),
    val overallSuccess: Boolean,
    val platformResult: PlatformEmbeddingSyncResult? = null,
    val socialResults: List<SocialSyncPlatformResult> = emptyList(),
    val profileEmbeddingUpdated: Boolean,
    val platformEmbeddingUpdated: Boolean
)
