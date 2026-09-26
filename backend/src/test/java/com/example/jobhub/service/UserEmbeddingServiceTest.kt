package com.example.jobhub.service

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.DevtoProfile
import com.example.jobhub.dto.GithubProfile
import com.example.jobhub.dto.social.EmbeddingSource
import com.example.jobhub.model.Skill
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.SocialLink
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.User
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.embedding.*
import com.example.jobhub.service.social.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.*
import tools.jackson.databind.ObjectMapper
import java.util.*

class UserEmbeddingServiceTest {

    private lateinit var githubService: GithubService
    private lateinit var devtoService: DevtoService
    private lateinit var orcidService: OrcidService
    private lateinit var portfolioService: PortfolioService
    private lateinit var stackoverflowService: StackoverflowService
    private lateinit var githubEmbeddingService: GithubEmbeddingService
    private lateinit var devtoEmbeddingService: DevtoEmbeddingService
    private lateinit var orcidEmbeddingService: OrcidEmbeddingService
    private lateinit var portfolioEmbeddingService: PortfolioEmbeddingService
    private lateinit var stackoverflowEmbeddingService: StackoverflowEmbeddingService
    private lateinit var platformEmbeddingService: PlatformEmbeddingService
    private lateinit var userSocialSnapshotService: UserSocialSnapshotService
    private lateinit var userRepository: UserRepository
    private lateinit var embeddingApiClient: EmbeddingApiClient
    private lateinit var objectMapper: ObjectMapper
    private lateinit var userEmbeddingService: UserEmbeddingService

    private val userId = UUID.randomUUID()
    private lateinit var user: User

    @BeforeEach
    fun setUp() {
        embeddingApiClient = mock(EmbeddingApiClient::class.java)
        objectMapper = ObjectMapper()

        githubService = mock(GithubService::class.java)
        devtoService = mock(DevtoService::class.java)
        orcidService = mock(OrcidService::class.java)
        portfolioService = mock(PortfolioService::class.java)
        stackoverflowService = mock(StackoverflowService::class.java)
        githubEmbeddingService = GithubEmbeddingService(embeddingApiClient)
        devtoEmbeddingService = DevtoEmbeddingService(embeddingApiClient)
        orcidEmbeddingService = OrcidEmbeddingService(embeddingApiClient)
        portfolioEmbeddingService = PortfolioEmbeddingService(embeddingApiClient, objectMapper)
        stackoverflowEmbeddingService = StackoverflowEmbeddingService(embeddingApiClient)
        platformEmbeddingService = PlatformEmbeddingService(embeddingApiClient)
        userSocialSnapshotService = mock(UserSocialSnapshotService::class.java)
        userRepository = mock(UserRepository::class.java)

        userEmbeddingService = UserEmbeddingService(
            githubService = githubService,
            devtoService = devtoService,
            orcidService = orcidService,
            portfolioService = portfolioService,
            stackoverflowService = stackoverflowService,
            githubEmbeddingService = githubEmbeddingService,
            devtoEmbeddingService = devtoEmbeddingService,
            orcidEmbeddingService = orcidEmbeddingService,
            portfolioEmbeddingService = portfolioEmbeddingService,
            stackoverflowEmbeddingService = stackoverflowEmbeddingService,
            platformEmbeddingService = platformEmbeddingService,
            userSocialSnapshotService = userSocialSnapshotService,
            userRepository = userRepository,
            embeddingApiClient = embeddingApiClient,
            objectMapper = objectMapper
        )

        user = User().apply {
            id = userId
            name = "Sugham"
            email = "sugham@example.com"
            title = "Senior Backend Engineer"
            bio = "Passionate about Kotlin, Spring Boot, and ML embeddings"
            skills = mutableListOf(
                Skill().apply {
                    name = "Kotlin"
                    level = SkillLevel.EXPERT
                }
            )
            socialLinks = mutableListOf()
        }

        `when`(userRepository.findById(userId)).thenReturn(Optional.of(user))
        `when`(userRepository.save(any(User::class.java))).thenAnswer { it.arguments[0] }
        `when`(embeddingApiClient.embed(any(String::class.java) ?: "")).thenReturn(FloatArray(256) { 0.7f })
    }

    @Test
    fun `should extract identifiers from various URL formats correctly`() {
        assertEquals("sugham019", userEmbeddingService.extractIdentifier(SocialPlatform.GITHUB, "https://github.com/sugham019"))
        assertEquals("sugham019", userEmbeddingService.extractIdentifier(SocialPlatform.GITHUB, "sugham019"))
        assertEquals("sugham019", userEmbeddingService.extractIdentifier(SocialPlatform.GITHUB, "https://github.com/sugham019/"))

        assertEquals("ultimate_coder", userEmbeddingService.extractIdentifier(SocialPlatform.DEV_TO, "https://dev.to/ultimate_coder"))
        assertEquals("ultimate_coder", userEmbeddingService.extractIdentifier(SocialPlatform.DEV_TO, "ultimate_coder"))

        assertEquals("0000-0001-8314-8497", userEmbeddingService.extractIdentifier(SocialPlatform.ORCID, "https://orcid.org/0000-0001-8314-8497"))
        assertEquals("0000-0001-8314-8497", userEmbeddingService.extractIdentifier(SocialPlatform.ORCID, "0000-0001-8314-8497"))

        assertEquals("1808924", userEmbeddingService.extractIdentifier(SocialPlatform.STACKOVERFLOW, "https://stackoverflow.com/users/1808924/john-doe"))
        assertEquals("1808924", userEmbeddingService.extractIdentifier(SocialPlatform.STACKOVERFLOW, "1808924"))

        assertEquals("https://myportfolio.com", userEmbeddingService.extractIdentifier(SocialPlatform.PORTFOLIO, "https://myportfolio.com"))
        assertEquals("https://myportfolio.com", userEmbeddingService.extractIdentifier(SocialPlatform.PORTFOLIO, "myportfolio.com"))
    }

    @Test
    fun `syncSocialPlatform should only sync that specific social platform embedding and snapshot`() {
        val githubProfile = GithubProfile(
            "sugham019",
            "Sugham",
            "Software engineer",
            emptyList(),
            setOf("Kotlin", "Java")
        )
        val expectedEmbed = FloatArray(256) { 0.7f }
        `when`(githubService.fetch("sugham019")).thenReturn(githubProfile)

        val result = userEmbeddingService.syncSocialPlatform(userId, SocialPlatform.GITHUB, "https://github.com/sugham019")

        assertTrue(result.success)
        assertEquals(SocialPlatform.GITHUB, result.platform)
        assertEquals("sugham019", result.identifier)
        assertTrue(result.embeddingGenerated)
        assertTrue(result.snapshotSaved)

        assertArrayEquals(expectedEmbed, user.githubEmbedding)
        verify(userSocialSnapshotService, times(1)).save(eqNonNull(userId), eqNonNull(SocialPlatform.GITHUB), anyNonNull(""))
        verify(userRepository, times(1)).save(user)
    }

    @Test
    fun `syncSocialPlatform with invalid URL should return failure result gracefully`() {
        val result = userEmbeddingService.syncSocialPlatform(userId, SocialPlatform.GITHUB, "   ")

        assertFalse(result.success)
        assertNull(result.identifier)
        assertFalse(result.embeddingGenerated)
        assertFalse(result.snapshotSaved)
        verify(userSocialSnapshotService, never()).save(anyNonNull(userId), anyNonNull(SocialPlatform.GITHUB), anyNonNull(""))
    }

    @Test
    fun `syncPlatformEmbedding should generate and persist platform embedding`() {
        val result = userEmbeddingService.syncPlatformEmbedding(userId)

        assertTrue(result.success)
        assertTrue(result.embeddingGenerated)
        assertNotNull(user.platformEmbedding)
        verify(userRepository, times(1)).save(user)
    }

    @Test
    fun `syncEmbeddingSource with PLATFORM should invoke platform sync`() {
        val result = userEmbeddingService.syncEmbeddingSource(userId, EmbeddingSource.PLATFORM)

        assertTrue(result.success)
        assertEquals(EmbeddingSource.PLATFORM, result.source)
        assertTrue(result.embeddingGenerated)
    }

    @Test
    fun `syncEmbeddingSource with social platform source should sync that social platform`() {
        val link = SocialLink().apply {
            platform = SocialPlatform.GITHUB
            url = "https://github.com/sugham019"
        }
        user.socialLinks = mutableListOf(link)

        `when`(githubService.fetch("sugham019")).thenReturn(GithubProfile("sugham019", "Sugham", "Engineer", emptyList(), setOf("Kotlin")))

        val result = userEmbeddingService.syncEmbeddingSource(userId, EmbeddingSource.GITHUB)

        assertTrue(result.success)
        assertEquals(EmbeddingSource.GITHUB, result.source)
        assertEquals("sugham019", result.identifier)
        assertTrue(result.embeddingGenerated)
        assertTrue(result.snapshotSaved)
    }

    @Test
    fun `syncAllEmbeddings with multiple social links should run parallel fetch & embed and commit single DB update`() {
        val link1 = SocialLink().apply {
            platform = SocialPlatform.GITHUB
            url = "https://github.com/sugham019"
        }
        val link2 = SocialLink().apply {
            platform = SocialPlatform.DEV_TO
            url = "https://dev.to/sugham019"
        }
        user.socialLinks = mutableListOf(link1, link2)

        `when`(githubService.fetch("sugham019")).thenReturn(
            GithubProfile("sugham019", "Sugham", "Engineer", emptyList(), setOf("Kotlin"))
        )
        `when`(devtoService.fetch("sugham019")).thenReturn(
            DevtoProfile(
                12345L,
                "sugham019",
                "Sugham",
                "Engineer",
                "sugham019",
                "https://dev.to/sugham019",
                "Kathmandu",
                emptyList()
            )
        )

        val response = userEmbeddingService.syncAllEmbeddings(userId)

        assertTrue(response.overallSuccess)
        assertTrue(response.profileEmbeddingUpdated)
        assertTrue(response.platformEmbeddingUpdated)
        assertEquals(2, response.socialResults.size)
        assertTrue(response.socialResults.all { it.success })

        assertNotNull(user.profileEmbedding)
        assertNotNull(user.platformEmbedding)
        assertNotNull(user.githubEmbedding)
        assertNotNull(user.devtoEmbedding)

        verify(userSocialSnapshotService, times(1)).save(eqNonNull(userId), eqNonNull(SocialPlatform.GITHUB), anyNonNull(""))
        verify(userSocialSnapshotService, times(1)).save(eqNonNull(userId), eqNonNull(SocialPlatform.DEV_TO), anyNonNull(""))
        verify(userRepository, times(1)).save(user)
    }

    @Test
    fun `syncAllEmbeddings with no social links should still generate platform and profile embeddings`() {
        user.socialLinks = mutableListOf()

        val response = userEmbeddingService.syncAllEmbeddings(userId)

        assertTrue(response.overallSuccess)
        assertTrue(response.profileEmbeddingUpdated)
        assertTrue(response.platformEmbeddingUpdated)
        assertEquals(0, response.socialResults.size)
        assertNotNull(user.profileEmbedding)
        assertNotNull(user.platformEmbedding)
        verify(userRepository, times(1)).save(user)
    }

    private fun <T> anyNonNull(fallback: T): T {
        any<T>()
        return fallback
    }

    private fun <T> eqNonNull(value: T): T {
        eq(value)
        return value
    }
}
