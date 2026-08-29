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

    @Transactional
    fun syncPlatformEmbedding(userId: UUID): PlatformEmbeddingSyncResult {
        val user = userRepository.findById(userId).orElseThrow {
            ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
        }

        return try {
            val platformEmbedding = runBlocking {
                platformEmbeddingService.generateEmbedding(user)
            }
            if (platformEmbedding != null) {
                user.platformEmbedding = platformEmbedding
                updateUserProfileEmbedding(user)
                userRepository.save(user)
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

    @Transactional
    fun syncSocialPlatform(userId: UUID, platform: SocialPlatform, rawUrl: String): SocialSyncPlatformResult {
        val user = userRepository.findById(userId).orElseThrow {
            ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
        }

        val identifier = extractIdentifier(platform, rawUrl)
        if (identifier.isBlank()) {
            return SocialSyncPlatformResult(
                platform = platform,
                success = false,
                identifier = null,
                embeddingGenerated = false,
                snapshotSaved = false,
                message = "Invalid identifier or URL for platform $platform"
            )
        }

        try {
            var embeddingGenerated = false
            var snapshotSaved = false

            when (platform) {
                SocialPlatform.GITHUB -> {
                    val profile = githubService.fetch(identifier)
                    val json = objectMapper.writeValueAsString(profile)
                    userSocialSnapshotService.save(userId, platform, json)
                    snapshotSaved = true

                    val embedding = runBlocking {
                        githubEmbeddingService.generateEmbeddings(profile)
                    }
                    user.githubEmbedding = embedding
                    embeddingGenerated = true
                }
                SocialPlatform.DEV_TO -> {
                    val profile = devtoService.fetch(identifier)
                    val json = objectMapper.writeValueAsString(profile)
                    userSocialSnapshotService.save(userId, platform, json)
                    snapshotSaved = true

                    val embedding = runBlocking {
                        devtoEmbeddingService.generateEmbeddings(profile)
                    }
                    user.devtoEmbedding = embedding
                    embeddingGenerated = true
                }
                SocialPlatform.ORCID -> {
                    val profile = orcidService.fetch(identifier)
                    val json = objectMapper.writeValueAsString(profile)
                    userSocialSnapshotService.save(userId, platform, json)
                    snapshotSaved = true

                    val embedding = runBlocking {
                        orcidEmbeddingService.generateEmbeddings(profile)
                    }
                    user.orcidEmbedding = embedding
                    embeddingGenerated = true
                }
                SocialPlatform.STACKOVERFLOW -> {
                    val profile = stackoverflowService.fetch(identifier)
                    val json = objectMapper.writeValueAsString(profile)
                    userSocialSnapshotService.save(userId, platform, json)
                    snapshotSaved = true

                    val embedding = runBlocking {
                        stackoverflowEmbeddingService.generateEmbeddings(profile)
                    }
                    user.stackoverflowEmbedding = embedding
                    embeddingGenerated = true
                }
                SocialPlatform.PORTFOLIO, SocialPlatform.WEBSITE -> {
                    val profile = portfolioService.fetch(identifier)
                    val json = objectMapper.writeValueAsString(profile)
                    userSocialSnapshotService.save(userId, platform, json)
                    snapshotSaved = true

                    val embedding = runBlocking {
                        portfolioEmbeddingService.generateEmbeddings(profile)
                    }
                    user.portfolioEmbedding = embedding
                    embeddingGenerated = true
                }
                else -> {
                    logger.info("No external embedding/snapshot service configured for platform: $platform")
                }
            }

            updateUserProfileEmbedding(user)
            userRepository.save(user)

            return SocialSyncPlatformResult(
                platform = platform,
                success = true,
                identifier = identifier,
                embeddingGenerated = embeddingGenerated,
                snapshotSaved = snapshotSaved,
                message = "Successfully synced $platform embedding and snapshot"
            )
        } catch (e: Exception) {
            logger.error("Failed to sync social platform $platform for user $userId: ${e.message}", e)
            return SocialSyncPlatformResult(
                platform = platform,
                success = false,
                identifier = identifier,
                embeddingGenerated = false,
                snapshotSaved = false,
                message = "Error syncing $platform: ${e.message}"
            )
        }
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

        val socialResults = mutableListOf<SocialSyncPlatformResult>()
        val links = user.socialLinks

        for (link in links) {
            val platform = link.platform ?: continue
            val url = link.url ?: continue
            if (url.isNotBlank()) {
                val res = syncSocialPlatform(userId, platform, url)
                socialResults.add(res)
            }
        }

        val profileUpdated = try {
            updateUserProfileEmbedding(user)
            userRepository.save(user)
            true
        } catch (e: Exception) {
            logger.error("Error updating profile/platform embedding for user $userId: ${e.message}", e)
            false
        }

        val overallSuccess = (socialResults.isEmpty() || socialResults.all { it.success }) && profileUpdated

        return UserEmbeddingSyncResponse(
            userId = userId.toString(),
            syncedAt = Instant.now(),
            overallSuccess = overallSuccess,
            platformResult = PlatformEmbeddingSyncResult(
                success = profileUpdated,
                embeddingGenerated = user.platformEmbedding != null,
                message = if (profileUpdated) "Platform embedding refreshed" else "Failed to refresh platform embedding"
            ),
            socialResults = socialResults,
            profileEmbeddingUpdated = profileUpdated,
            platformEmbeddingUpdated = profileUpdated
        )
    }

    @Transactional
    fun syncAllSocials(userId: UUID): SocialSyncResponse {
        val user = userRepository.findById(userId).orElseThrow {
            ApiException("User not found: $userId", HttpStatus.NOT_FOUND)
        }

        val results = mutableListOf<SocialSyncPlatformResult>()
        val links = user.socialLinks

        for (link in links) {
            val platform = link.platform ?: continue
            val url = link.url ?: continue
            if (url.isNotBlank()) {
                val res = syncSocialPlatform(userId, platform, url)
                results.add(res)
            }
        }

        val profileUpdated = try {
            updateUserProfileEmbedding(user)
            userRepository.save(user)
            true
        } catch (e: Exception) {
            logger.error("Error updating profile embedding for user $userId: ${e.message}", e)
            false
        }

        val overallSuccess = (results.isEmpty() || results.all { it.success }) && profileUpdated

        return SocialSyncResponse(
            userId = userId.toString(),
            syncedAt = Instant.now(),
            overallSuccess = overallSuccess,
            results = results,
            profileEmbeddingUpdated = profileUpdated,
            platformEmbeddingUpdated = profileUpdated
        )
    }

    fun updateUserProfileEmbedding(user: User) {
        val text = buildUserProfileEmbeddingText(user)
        if (text.isNotBlank()) {
            try {
                val embedding = embeddingApiClient.embed(text)
                user.profileEmbedding = embedding
            } catch (e: Exception) {
                logger.warn("Could not generate profile embedding via EmbeddingApiClient: ${e.message}")
            }
        }

        try {
            val platformEmbedding = runBlocking {
                platformEmbeddingService.generateEmbedding(user)
            }
            if (platformEmbedding != null) {
                user.platformEmbedding = platformEmbedding
            }
        } catch (e: Exception) {
            logger.warn("Could not generate platform embedding: ${e.message}")
        }
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
