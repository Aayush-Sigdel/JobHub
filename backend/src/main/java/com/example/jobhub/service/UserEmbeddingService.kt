package com.example.jobhub.service

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.social.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.User
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.embedding.*
import com.example.jobhub.service.social.*
import com.example.jobhub.util.FormatUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.databind.ObjectMapper
import java.time.Instant
import java.util.UUID

@Service
class UserEmbeddingService(
    private val githubService: GithubService,
    private val devtoService: DevtoService,
    private val orcidService: OrcidService,
    private val portfolioService: PortfolioService,
    private val stackoverflowService: StackoverflowService,
    private val githubEmbeddingService: GithubEmbeddingService,
    private val devtoEmbeddingService: DevtoEmbeddingService,
    private val orcidEmbeddingService: OrcidEmbeddingService,
    private val portfolioEmbeddingService: PortfolioEmbeddingService,
    private val stackoverflowEmbeddingService: StackoverflowEmbeddingService,
    private val platformEmbeddingService: PlatformEmbeddingService,
    private val userSocialSnapshotService: UserSocialSnapshotService,
    private val userRepository: UserRepository,
    private val embeddingApiClient: EmbeddingApiClient,
    private val objectMapper: ObjectMapper
) {

    private val logger = LoggerFactory.getLogger(UserEmbeddingService::class.java)

    fun generateProfileEmbedding(user: User): FloatArray? {
        val text = buildUserProfileEmbeddingText(user)
        if (text.isBlank()) return null
        return try {
            embeddingApiClient.embed(text)
        } catch (e: Exception) {
            logger.warn("Could not generate profile embedding via EmbeddingApiClient: ${e.message}")
            null
        }
    }

    @Transactional
    fun syncPlatformEmbedding(userId: UUID): PlatformEmbeddingSyncResult {
        val user = userRepository.findById(userId).orElseThrow {
            ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
        }

        return try {
            val (profileEmbedding, platformEmbedding) = runBlocking(Dispatchers.IO) {
                val profileDeferred = async { generateProfileEmbedding(user) }
                val platformDeferred = async { platformEmbeddingService.generateEmbedding(user) }
                Pair(profileDeferred.await(), platformDeferred.await())
            }

            if (profileEmbedding != null) {
                user.profileEmbedding = profileEmbedding
            }
            if (platformEmbedding != null) {
                user.platformEmbedding = platformEmbedding
            }
            userRepository.save(user)

            if (platformEmbedding != null) {
                PlatformEmbeddingSyncResult(
                    success = true,
                    embeddingGenerated = true,
                    message = "Successfully generated and updated platform embedding"
                )
            } else {
                PlatformEmbeddingSyncResult(
                    success = true,
                    embeddingGenerated = false,
                    message = "User has no professional skills or experience to embed"
                )
            }
        } catch (e: Exception) {
            logger.error("Failed to sync platform embedding for user $userId: ${e.message}", e)
            PlatformEmbeddingSyncResult(
                success = false,
                embeddingGenerated = false,
                message = "Error syncing platform embedding: ${e.message}"
            )
        }
    }

    data class PlatformFetchResult(
        val platform: SocialPlatform,
        val identifier: String?,
        val snapshotJson: String?,
        val embedding: FloatArray?,
        val success: Boolean,
        val errorMessage: String? = null
    )

    suspend fun fetchAndEmbedPlatform(platform: SocialPlatform, rawUrl: String): PlatformFetchResult {
        val identifier = extractIdentifier(platform, rawUrl)
        if (identifier.isBlank()) {
            return PlatformFetchResult(
                platform = platform,
                identifier = null,
                snapshotJson = null,
                embedding = null,
                success = false,
                errorMessage = "Invalid identifier or URL for platform $platform"
            )
        }

        return try {
            var snapshotJson: String? = null
            var embedding: FloatArray? = null

            when (platform) {
                SocialPlatform.GITHUB -> {
                    val profile = githubService.fetch(identifier)
                    snapshotJson = objectMapper.writeValueAsString(profile)
                    embedding = githubEmbeddingService.generateEmbeddings(profile)
                }
                SocialPlatform.DEV_TO -> {
                    val profile = devtoService.fetch(identifier)
                    snapshotJson = objectMapper.writeValueAsString(profile)
                    embedding = devtoEmbeddingService.generateEmbeddings(profile)
                }
                SocialPlatform.ORCID -> {
                    val profile = orcidService.fetch(identifier)
                    snapshotJson = objectMapper.writeValueAsString(profile)
                    embedding = orcidEmbeddingService.generateEmbeddings(profile)
                }
                SocialPlatform.STACKOVERFLOW -> {
                    val profile = stackoverflowService.fetch(identifier)
                    snapshotJson = objectMapper.writeValueAsString(profile)
                    embedding = stackoverflowEmbeddingService.generateEmbeddings(profile)
                }
                SocialPlatform.PORTFOLIO, SocialPlatform.WEBSITE -> {
                    val profile = portfolioService.fetch(identifier)
                    snapshotJson = objectMapper.writeValueAsString(profile)
                    embedding = portfolioEmbeddingService.generateEmbeddings(profile)
                }
                else -> {
                    logger.info("No external embedding/snapshot service configured for platform: $platform")
                }
            }

            PlatformFetchResult(
                platform = platform,
                identifier = identifier,
                snapshotJson = snapshotJson,
                embedding = embedding,
                success = true
            )
        } catch (e: Exception) {
            logger.error("Failed to fetch/embed social platform $platform for identifier $identifier: ${e.message}", e)
            PlatformFetchResult(
                platform = platform,
                identifier = identifier,
                snapshotJson = null,
                embedding = null,
                success = false,
                errorMessage = "Error syncing $platform: ${e.message}"
            )
        }
    }

    private fun applyPlatformResult(userId: UUID, user: User, result: PlatformFetchResult): SocialSyncPlatformResult {
        if (!result.success) {
            return SocialSyncPlatformResult(
                platform = result.platform,
                success = false,
                identifier = result.identifier,
                embeddingGenerated = false,
                snapshotSaved = false,
                message = result.errorMessage ?: "Failed to sync ${result.platform}"
            )
        }

        var snapshotSaved = false
        var embeddingGenerated = false

        if (result.snapshotJson != null) {
            userSocialSnapshotService.save(userId, result.platform, result.snapshotJson)
            snapshotSaved = true
        }

        if (result.embedding != null) {
            when (result.platform) {
                SocialPlatform.GITHUB -> user.githubEmbedding = result.embedding
                SocialPlatform.DEV_TO -> user.devtoEmbedding = result.embedding
                SocialPlatform.ORCID -> user.orcidEmbedding = result.embedding
                SocialPlatform.STACKOVERFLOW -> user.stackoverflowEmbedding = result.embedding
                SocialPlatform.PORTFOLIO, SocialPlatform.WEBSITE -> user.portfolioEmbedding = result.embedding
                else -> {}
            }
            embeddingGenerated = true
        }

        return SocialSyncPlatformResult(
            platform = result.platform,
            success = true,
            identifier = result.identifier,
            embeddingGenerated = embeddingGenerated,
            snapshotSaved = snapshotSaved,
            message = "Successfully synced ${result.platform} embedding and snapshot"
        )
    }

    @Transactional
    fun syncSocialPlatform(userId: UUID, platform: SocialPlatform, rawUrl: String): SocialSyncPlatformResult {
        val user = userRepository.findById(userId).orElseThrow {
            ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
        }

        val fetchResult = runBlocking(Dispatchers.IO) {
            fetchAndEmbedPlatform(platform, rawUrl)
        }

        val syncResult = applyPlatformResult(userId, user, fetchResult)

        if (syncResult.success) {
            userRepository.save(user)
        }

        return syncResult
    }

    @Transactional
    fun syncEmbeddingSource(userId: UUID, source: EmbeddingSource): EmbeddingSyncResult {
        return if (source == EmbeddingSource.PLATFORM) {
            val res = syncPlatformEmbedding(userId)
            EmbeddingSyncResult(
                source = source,
                success = res.success,
                embeddingGenerated = res.embeddingGenerated,
                message = res.message
            )
        } else {
            val user = userRepository.findById(userId).orElseThrow {
                ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
            }
            val socialPlatform = source.toSocialPlatform()
                ?: throw ApiException("Invalid social platform mapping for $source", HttpStatus.BAD_REQUEST)
            val link = user.socialLinks.firstOrNull { it.platform == socialPlatform }
                ?: throw ApiException("No linked URL found for platform: $socialPlatform", HttpStatus.BAD_REQUEST)

            val res = syncSocialPlatform(userId, socialPlatform, link.url ?: "")
            EmbeddingSyncResult(
                source = source,
                success = res.success,
                identifier = res.identifier,
                embeddingGenerated = res.embeddingGenerated,
                snapshotSaved = res.snapshotSaved,
                message = res.message
            )
        }
    }

    @Transactional
    fun syncAllEmbeddings(userId: UUID): UserEmbeddingSyncResponse {
        val user = userRepository.findById(userId).orElseThrow {
            ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
        }

        val linksToSync = user.socialLinks.mapNotNull { link ->
            val platform = link.platform ?: return@mapNotNull null
            val url = link.url ?: return@mapNotNull null
            if (url.isNotBlank()) Pair(platform, url) else null
        }

        // Parallel fetch and embedding generation for profile + platform + all social links
        val (profileEmbedding, platformEmbedding, fetchResults) = runBlocking(Dispatchers.IO) {
            val profileDeferred = async { generateProfileEmbedding(user) }
            val platformDeferred = async { platformEmbeddingService.generateEmbedding(user) }
            val socialDeferreds = linksToSync.map { (platform, url) ->
                async { fetchAndEmbedPlatform(platform, url) }
            }
            Triple(profileDeferred.await(), platformDeferred.await(), socialDeferreds.awaitAll())
        }

        // Synchronous DB and entity updates
        if (profileEmbedding != null) {
            user.profileEmbedding = profileEmbedding
        }
        if (platformEmbedding != null) {
            user.platformEmbedding = platformEmbedding
        }

        val socialResults = fetchResults.map { fetchResult ->
            applyPlatformResult(userId, user, fetchResult)
        }

        val saved = try {
            userRepository.save(user)
            true
        } catch (e: Exception) {
            logger.error("Error saving user embeddings for user $userId: ${e.message}", e)
            false
        }

        val profileUpdated = saved && (profileEmbedding != null || user.profileEmbedding != null)
        val platformUpdated = saved && (platformEmbedding != null || user.platformEmbedding != null)
        val overallSuccess = (socialResults.isEmpty() || socialResults.all { it.success }) && profileUpdated

        return UserEmbeddingSyncResponse(
            userId = userId.toString(),
            syncedAt = Instant.now(),
            overallSuccess = overallSuccess,
            platformResult = PlatformEmbeddingSyncResult(
                success = platformUpdated,
                embeddingGenerated = user.platformEmbedding != null,
                message = if (platformUpdated) "Platform embedding refreshed" else "Failed to refresh platform embedding"
            ),
            socialResults = socialResults,
            profileEmbeddingUpdated = profileUpdated,
            platformEmbeddingUpdated = platformUpdated
        )
    }

    fun buildUserProfileEmbeddingText(user: User): String {
        val sb = StringBuilder()

        user.name?.takeIf { it.isNotBlank() }?.let { sb.appendLine("Name: $it") }
        user.title?.takeIf { it.isNotBlank() }?.let { sb.appendLine("Title: $it") }
        user.bio?.takeIf { it.isNotBlank() }?.let { sb.appendLine("Bio: ${FormatUtil.cleanText(it)}") }
        user.location?.takeIf { it.isNotBlank() }?.let { sb.appendLine("Location: $it") }

        if (!user.skills.isNullOrEmpty()) {
            val skillsText = user.skills.joinToString(", ") { "${it.name} (${it.level})" }
            sb.appendLine("Skills: $skillsText")
        }

        if (!user.experiences.isNullOrEmpty()) {
            sb.appendLine("Experience:")
            user.experiences.forEach { exp ->
                sb.appendLine("- ${exp.title} at ${exp.company}: ${FormatUtil.cleanText(exp.description ?: "")}")
            }
        }

        if (!user.educations.isNullOrEmpty()) {
            sb.appendLine("Education:")
            user.educations.forEach { edu ->
                sb.appendLine("- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}")
            }
        }

        return FormatUtil.truncate(sb.toString().trim(), 12_000)
    }

    fun extractIdentifier(platform: SocialPlatform, raw: String): String {
        val trimmed = raw.trim()
        return when (platform) {
            SocialPlatform.GITHUB -> {
                trimmed.replace(Regex("^https?://(www\\.)?github\\.com/"), "")
                    .removePrefix("/")
                    .split("/")[0]
                    .trim()
            }
            SocialPlatform.DEV_TO -> {
                trimmed.replace(Regex("^https?://(www\\.)?dev\\.to/"), "")
                    .removePrefix("/")
                    .split("/")[0]
                    .trim()
            }
            SocialPlatform.ORCID -> {
                val match = Regex("(\\d{4}-\\d{4}-\\d{4}-[\\dX]{4})").find(trimmed)
                match?.value ?: trimmed.replace(Regex("^https?://(pub\\.)?orcid\\.org/"), "").removePrefix("/").trim()
            }
            SocialPlatform.STACKOVERFLOW -> {
                val match = Regex("(?:users/)?(\\d+)").find(trimmed)
                match?.groupValues?.get(1) ?: trimmed
            }
            SocialPlatform.PORTFOLIO, SocialPlatform.WEBSITE -> {
                if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                    trimmed
                } else {
                    "https://$trimmed"
                }
            }
            else -> trimmed
        }
    }
}
