package com.example.jobhub.service

import com.example.jobhub.dto.recruiter.CandidateFilterRequest
import com.example.jobhub.mapper.JobMapper
import com.example.jobhub.mapper.TaskMapper
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.mapper.UserMapper
import com.example.jobhub.model.Skill
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.User
import com.example.jobhub.model.UserSocialSnapshot
import com.example.jobhub.model.job.*
import com.example.jobhub.model.task.TaskSubmission
import com.example.jobhub.model.task.TaskType
import com.example.jobhub.repository.JobApplicationRepository
import com.example.jobhub.repository.JobPostRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.embedding.JobMatchService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import tools.jackson.databind.ObjectMapper
import java.time.Instant
import java.util.*

class RecruiterDashboardServiceTest {

    private lateinit var jobPostRepository: JobPostRepository
    private lateinit var jobApplicationRepository: JobApplicationRepository
    private lateinit var userRepository: UserRepository
    private lateinit var userSocialSnapshotService: UserSocialSnapshotService
    private lateinit var objectMapper: ObjectMapper
    private lateinit var recruiterDashboardService: RecruiterDashboardService

    private val employerId = UUID.randomUUID()
    private val jobId = UUID.randomUUID()
    private val candidateId = UUID.randomUUID()

    private lateinit var employer: User
    private lateinit var candidate: User
    private lateinit var job: JobPost
    private lateinit var application: JobApplication

    @BeforeEach
    fun setUp() {
        jobPostRepository = mock(JobPostRepository::class.java)
        jobApplicationRepository = mock(JobApplicationRepository::class.java)
        userRepository = mock(UserRepository::class.java)
        userSocialSnapshotService = mock(UserSocialSnapshotService::class.java)
        objectMapper = ObjectMapper()

        val userMapper = UserMapper()
        val taskSubmissionMapper = TaskSubmissionMapper()
        val taskMapper = TaskMapper(objectMapper)
        val jobMapper = JobMapper(taskMapper, taskSubmissionMapper, objectMapper)

        recruiterDashboardService = RecruiterDashboardService(
            jobPostRepository = jobPostRepository,
            jobApplicationRepository = jobApplicationRepository,
            userRepository = userRepository,
            userSocialSnapshotService = userSocialSnapshotService,
            jobMatchService = JobMatchService(),
            userMapper = userMapper,
            taskSubmissionMapper = taskSubmissionMapper,
            jobMapper = jobMapper,
            objectMapper = objectMapper
        )

        employer = User().apply {
            id = employerId
            name = "Acme Corp"
            isEmployer = true
        }

        candidate = User().apply {
            id = candidateId
            name = "Bob Coder"
            email = "bob@example.com"
            title = "Full Stack Engineer"
            skills = mutableListOf(Skill().apply { name = "Kotlin"; level = SkillLevel.EXPERT })
            profileEmbedding = FloatArray(256) { 0.5f }
            platformEmbedding = FloatArray(256) { 0.5f }
            githubEmbedding = FloatArray(256) { 0.4f }
        }

        job = JobPost(
            title = "Lead Kotlin Engineer",
            companyName = "Acme Corp",
            description = "Kotlin Expert",
            requirements = "Kotlin",
            location = "Remote",
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.EXPERT,
            salaryMin = 100000.0,
            salaryMax = 150000.0,
            salaryCurrency = "USD",
            tabLock = true,
            tabLockWarningLimit = 3,
            deadline = null,
            isActive = true,
            postedBy = employer,
            designTask = null,
            programmingTask = null,
            sqlTask = null,
            embedding = FloatArray(256) { 0.5f }
        ).apply { id = jobId }

        val submission = TaskSubmission(
            UUID.randomUUID(),
            TaskType.PROGRAMMING,
            "fun twoSum() {}",
            true,
            100.0,
            80.0,
            candidate
        )

        application = JobApplication(
            jobPost = job,
            candidate = candidate,
            status = ApplicationStatus.APPLIED,
            similarityScore = 0.95,
            tabSwitchCount = 1,
            coverNote = "Ready to start",
            programmingSubmission = submission
        ).apply {
            id = UUID.randomUUID()
            createdAt = Instant.now()
        }

        `when`(jobPostRepository.findByIdAndPostedById(jobId, employerId)).thenReturn(Optional.of(job))
        `when`(jobApplicationRepository.findByJobPostIdOrderByCreatedAtDesc(jobId)).thenReturn(listOf(application))
    }

    @Test
    fun `should return candidates with embedding similarity and scores`() {
        val filter = CandidateFilterRequest(
            minSimilarity = 0.8,
            sortBy = "similarity"
        )

        val candidates = recruiterDashboardService.getCandidatesForJob(employerId, jobId, filter)

        assertEquals(1, candidates.size)
        val candidateResp = candidates[0]
        assertEquals(candidateId, candidateResp.candidateId)
        assertEquals("Bob Coder", candidateResp.name)
        assertTrue((candidateResp.overallSimilarity ?: 0.0) >= 0.8)
        assertNotNull(candidateResp.platformSimilarity)
        assertEquals(1, candidateResp.tabSwitchCount)
        assertFalse(candidateResp.tabSwitchLimitExceeded)
    }

    @Test
    fun `should return candidate social snapshots with per-platform aiCoolFeedItems`() {
        val githubSnapshotData = """
            {
                "username": "bobcoder",
                "name": "Bob Coder",
                "repositories": [
                    {"name": "jobhub-api", "pinned": true, "languages": {"Kotlin": 15000}},
                    {"name": "react-flow", "pinned": false, "languages": {"TypeScript": 8000}}
                ],
                "uniqueLanguages": ["Kotlin", "TypeScript"]
            }
        """.trimIndent()

        val devtoSnapshotData = """
            {
                "articles": [
                    {"title": "High Performance Microservices in Spring Boot 4"}
                ]
            }
        """.trimIndent()

        val githubSnapshot = UserSocialSnapshot.builder()
            .id(UUID.randomUUID())
            .user(candidate)
            .platform(SocialPlatform.GITHUB)
            .data(githubSnapshotData)
            .updatedAt(Instant.now())
            .build()

        val devtoSnapshot = UserSocialSnapshot.builder()
            .id(UUID.randomUUID())
            .user(candidate)
            .platform(SocialPlatform.DEV_TO)
            .data(devtoSnapshotData)
            .updatedAt(Instant.now())
            .build()

        `when`(jobApplicationRepository.findByJobPostIdAndCandidateId(jobId, candidateId)).thenReturn(Optional.of(application))
        `when`(userSocialSnapshotService.findByUserId(candidateId)).thenReturn(listOf(githubSnapshot, devtoSnapshot))

        val snapshots = recruiterDashboardService.getCandidateSocialSnapshots(employerId, jobId, candidateId)

        assertEquals(2, snapshots.size)
        val githubDto = snapshots.first { it.platform == SocialPlatform.GITHUB }
        val devtoDto = snapshots.first { it.platform == SocialPlatform.DEV_TO }

        // Verify GitHub specific feed items
        assertTrue(githubDto.aiCoolFeedItems.any { it.contains("Processing repo: [Pinned] jobhub-api") })
        assertTrue(githubDto.aiCoolFeedItems.any { it.contains("Extracted primary languages: Kotlin, TypeScript") })
        assertEquals(2, githubDto.summary["repoCount"])

        // Verify Dev.to specific feed items
        assertTrue(devtoDto.aiCoolFeedItems.any { it.contains("Processing Dev.to article: High Performance Microservices") })
        assertEquals(1, devtoDto.summary["articleCount"])
    }

    @Test
    fun `should filter candidates by date range`() {
        // Request candidates from the future - should filter out current application
        val filter = CandidateFilterRequest(
            fromDateTime = Instant.now().plusSeconds(3600)
        )

        val candidates = recruiterDashboardService.getCandidatesForJob(employerId, jobId, filter)
        assertEquals(0, candidates.size)
    }
}
