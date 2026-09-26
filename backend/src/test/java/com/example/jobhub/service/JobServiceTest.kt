package com.example.jobhub.service

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.service.embedding.JobMatchService
import com.example.jobhub.dto.job.ApplyJobRequest
import com.example.jobhub.dto.job.CreateJobPostRequest
import com.example.jobhub.dto.job.JobSearchRequest
import com.example.jobhub.dto.job.RecordTabSwitchRequest
import com.example.jobhub.mapper.JobMapper
import com.example.jobhub.mapper.TaskMapper
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.User
import com.example.jobhub.model.job.*
import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.SQLTask
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.model.task.TaskSubmission
import com.example.jobhub.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.*
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.core.ValueOperations
import tools.jackson.databind.ObjectMapper
import java.time.Instant
import java.util.*

class JobServiceTest {

    private lateinit var jobPostRepository: JobPostRepository
    private lateinit var jobApplicationRepository: JobApplicationRepository
    private lateinit var userRepository: UserRepository
    private lateinit var designTaskRepository: DesignTaskRepository
    private lateinit var programmingTaskRepository: ProgrammingTaskRepository
    private lateinit var sqlTaskRepository: SQLTaskRepository
    private lateinit var taskSubmissionRepository: TaskSubmissionRepository
    private lateinit var embeddingApiClient: EmbeddingApiClient
    private lateinit var redisTemplate: StringRedisTemplate
    private lateinit var objectMapper: ObjectMapper
    private lateinit var jobMapper: JobMapper
    private lateinit var jobService: JobService

    private val employerId = UUID.randomUUID()
    private val candidateId = UUID.randomUUID()
    private lateinit var employer: User
    private lateinit var candidate: User

    @BeforeEach
    fun setUp() {
        jobPostRepository = mock(JobPostRepository::class.java)
        jobApplicationRepository = mock(JobApplicationRepository::class.java)
        userRepository = mock(UserRepository::class.java)
        designTaskRepository = mock(DesignTaskRepository::class.java)
        programmingTaskRepository = mock(ProgrammingTaskRepository::class.java)
        sqlTaskRepository = mock(SQLTaskRepository::class.java)
        taskSubmissionRepository = mock(TaskSubmissionRepository::class.java)
        embeddingApiClient = mock(EmbeddingApiClient::class.java)
        redisTemplate = mock(StringRedisTemplate::class.java)
        @Suppress("UNCHECKED_CAST")
        val valueOps = mock(ValueOperations::class.java) as ValueOperations<String, String>
        `when`(redisTemplate.opsForValue()).thenReturn(valueOps)
        objectMapper = ObjectMapper()

        val taskMapper = TaskMapper(objectMapper)
        val taskSubmissionMapper = TaskSubmissionMapper()
        jobMapper = JobMapper(taskMapper, taskSubmissionMapper, objectMapper)

        jobService = JobService(
            jobPostRepository = jobPostRepository,
            jobApplicationRepository = jobApplicationRepository,
            userRepository = userRepository,
            designTaskRepository = designTaskRepository,
            programmingTaskRepository = programmingTaskRepository,
            sqlTaskRepository = sqlTaskRepository,
            taskSubmissionRepository = taskSubmissionRepository,
            embeddingApiClient = embeddingApiClient,
            jobMatchService = JobMatchService(),
            redisTemplate = redisTemplate,
            jobMapper = jobMapper,
            objectMapper = objectMapper
        )

        employer = User().apply {
            id = employerId
            name = "Tech Corp"
            email = "recruiter@techcorp.com"
            isEmployer = true
        }

        candidate = User().apply {
            id = candidateId
            name = "Alice Dev"
            email = "alice@example.com"
            profileEmbedding = FloatArray(256) { 0.5f }
        }

        `when`(userRepository.findById(employerId)).thenReturn(Optional.of(employer))
        `when`(userRepository.findById(candidateId)).thenReturn(Optional.of(candidate))
        `when`(embeddingApiClient.embed(anyNonNull(""))).thenReturn(FloatArray(256) { 0.5f })
        `when`(jobPostRepository.save(any(JobPost::class.java))).thenAnswer { invocation ->
            val post = invocation.arguments[0] as JobPost
            if (post.id == null) post.id = UUID.randomUUID()
            post
        }
        `when`(jobApplicationRepository.save(any(JobApplication::class.java))).thenAnswer { invocation ->
            val app = invocation.arguments[0] as JobApplication
            if (app.id == null) app.id = UUID.randomUUID()
            app
        }
    }

    @Test
    fun `should create job post with attached tasks, tabLock, and embedding`() {
        val designTaskId = UUID.randomUUID()
        val programmingTaskId = UUID.randomUUID()
        val sqlTaskId = UUID.randomUUID()

        val designTask = DesignTask("Landing Page", ByteArray(10), 0.8, "image/png", "instructions", SkillLevel.INTERMEDIATE, TaskScope.PUBLIC, employer).apply { id = designTaskId }
        val programmingTask = ProgrammingTask("Two Sum", "instructions", SkillLevel.INTERMEDIATE, TaskScope.PUBLIC, "twoSum", emptyList(), DataType.INT_ARRAY, false, "[]", employer).apply { id = programmingTaskId }
        val sqlTask = SQLTask("Top Customers", emptyList(), emptyList(), "instructions", SkillLevel.INTERMEDIATE, TaskScope.PUBLIC, employer).apply { id = sqlTaskId }

        `when`(designTaskRepository.findById(designTaskId)).thenReturn(Optional.of(designTask))
        `when`(programmingTaskRepository.findById(programmingTaskId)).thenReturn(Optional.of(programmingTask))
        `when`(sqlTaskRepository.findById(sqlTaskId)).thenReturn(Optional.of(sqlTask))

        val request = CreateJobPostRequest(
            title = "Senior Backend Engineer",
            companyName = "Tech Corp",
            description = "Build scalable services in Kotlin & Postgres",
            requirements = "5+ years Kotlin/Java experience",
            location = "Remote",
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.EXPERT,
            tabLock = true,
            tabLockWarningLimit = 3,
            designTaskId = designTaskId,
            programmingTaskId = programmingTaskId,
            sqlTaskId = sqlTaskId
        )

        val response = jobService.createJobPost(employerId, request)

        assertNotNull(response.id)
        assertEquals("Senior Backend Engineer", response.title)
        assertTrue(response.tabLock)
        assertEquals(3, response.tabLockWarningLimit)
        assertTrue(response.hasDesignTask)
        assertTrue(response.hasProgrammingTask)
        assertTrue(response.hasSqlTask)
        assertEquals(designTaskId, response.designTaskId)
        assertEquals(programmingTaskId, response.programmingTaskId)
        assertEquals(sqlTaskId, response.sqlTaskId)
        verify(embeddingApiClient, atLeastOnce()).embed(anyNonNull(""))
    }

    @Test
    fun `should apply for job and compute similarity score`() {
        val jobId = UUID.randomUUID()
        val job = JobPost(
            title = "Backend Engineer",
            companyName = "Tech Corp",
            description = "Kotlin Developer",
            requirements = "Kotlin",
            location = "Remote",
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.INTERMEDIATE,
            salaryMin = 90000.0,
            salaryMax = 120000.0,
            salaryCurrency = "USD",
            tabLock = true,
            tabLockWarningLimit = 3,
            deadline = Instant.now().plusSeconds(86400),
            isActive = true,
            postedBy = employer,
            designTask = null,
            programmingTask = null,
            sqlTask = null,
            embedding = FloatArray(256) { 0.5f }
        ).apply { id = jobId }

        `when`(jobPostRepository.findById(jobId)).thenReturn(Optional.of(job))
        `when`(jobApplicationRepository.existsByJobPostIdAndCandidateId(jobId, candidateId)).thenReturn(false)

        val applyRequest = ApplyJobRequest(
            coverNote = "Excited about this role!",
            tabSwitchCount = 0
        )

        val response = jobService.applyForJob(candidateId, jobId, applyRequest)

        assertNotNull(response.id)
        assertEquals(jobId, response.jobPostId)
        assertEquals(candidateId, response.candidateId)
        assertEquals(ApplicationStatus.APPLIED, response.status)
        assertNotNull(response.similarityScore)
        assertTrue(response.similarityScore!! > 0.99) // Exact matching embeddings
    }

    @Test
    fun `should record tab switch and flag limit exceeded`() {
        val jobId = UUID.randomUUID()
        val job = JobPost(
            title = "Backend Engineer",
            companyName = "Tech Corp",
            description = "Kotlin",
            requirements = null,
            location = null,
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.BEGINNER,
            salaryMin = null,
            salaryMax = null,
            salaryCurrency = "USD",
            tabLock = true,
            tabLockWarningLimit = 2,
            deadline = null,
            isActive = true,
            postedBy = employer,
            designTask = null,
            programmingTask = null,
            sqlTask = null,
            embedding = null
        ).apply { id = jobId }

        val application = JobApplication(
            jobPost = job,
            candidate = candidate,
            status = ApplicationStatus.APPLIED,
            tabSwitchCount = 1
        )

        `when`(jobPostRepository.findById(jobId)).thenReturn(Optional.of(job))
        `when`(jobApplicationRepository.findByJobPostIdAndCandidateId(jobId, candidateId)).thenReturn(Optional.of(application))

        val tabSwitchReq = RecordTabSwitchRequest(
            eventType = "TAB_BLUR",
            durationSeconds = 5,
            details = "Candidate switched window"
        )

        val result = jobService.recordTabSwitch(candidateId, jobId, tabSwitchReq)

        assertEquals(2, result.tabSwitchCount)
        assertEquals(2, result.warningLimit)
        assertTrue(result.warningLimitExceeded)
        assertTrue(result.message.contains("Warning: Tab switch limit exceeded"))
    }

    @Test
    fun `should reject non-employer creating a job post`() {
        val nonEmployerId = UUID.randomUUID()
        val nonEmployer = User().apply {
            id = nonEmployerId
            isEmployer = false
        }
        `when`(userRepository.findById(nonEmployerId)).thenReturn(Optional.of(nonEmployer))

        val request = CreateJobPostRequest(
            title = "Dev",
            companyName = "Tech Corp",
            description = "Desc"
        )

        val ex = assertThrows(com.example.jobhub.exception.ApiException::class.java) {
            jobService.createJobPost(nonEmployerId, request)
        }
        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, ex.status)
    }

    @Test
    fun `should reject candidate applying with someone else's submission`() {
        val jobId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val otherUser = User().apply { id = otherUserId }

        val job = JobPost(
            title = "Backend",
            companyName = "Tech Corp",
            description = "Desc",
            requirements = null,
            location = null,
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.BEGINNER,
            salaryMin = null,
            salaryMax = null,
            salaryCurrency = "USD",
            tabLock = false,
            tabLockWarningLimit = 3,
            deadline = null,
            isActive = true,
            postedBy = employer,
            designTask = null,
            programmingTask = null,
            sqlTask = null,
            embedding = null
        ).apply { id = jobId }

        val submissionId = UUID.randomUUID()
        val stolenSubmission = TaskSubmission(
            UUID.randomUUID(),
            com.example.jobhub.model.task.TaskType.PROGRAMMING,
            "code",
            true,
            100.0,
            10.0,
            otherUser // Solved by someone else!
        ).apply { id = submissionId }

        `when`(jobPostRepository.findById(jobId)).thenReturn(Optional.of(job))
        `when`(taskSubmissionRepository.findById(submissionId)).thenReturn(Optional.of(stolenSubmission))

        val request = ApplyJobRequest(programmingSubmissionId = submissionId)

        val ex = assertThrows(com.example.jobhub.exception.ApiException::class.java) {
            jobService.applyForJob(candidateId, jobId, request)
        }
        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, ex.status)
    }

    @Test
    fun `should reject employer attaching another employer's private task`() {
        val privateTaskId = UUID.randomUUID()
        val otherEmployer = User().apply { id = UUID.randomUUID() }
        val privateTask = DesignTask("Secret", ByteArray(0), 0.8, "image/png", "inst", SkillLevel.INTERMEDIATE, TaskScope.PRIVATE, otherEmployer)
            .apply { id = privateTaskId }

        `when`(designTaskRepository.findById(privateTaskId)).thenReturn(Optional.of(privateTask))

        val request = CreateJobPostRequest(
            title = "Role",
            companyName = "Tech",
            description = "Desc",
            designTaskId = privateTaskId
        )

        val ex = assertThrows(com.example.jobhub.exception.ApiException::class.java) {
            jobService.createJobPost(employerId, request)
        }
        assertEquals(org.springframework.http.HttpStatus.FORBIDDEN, ex.status)
    }

    @Test
    fun `should reject application to assessed job when required task is missing`() {
        val jobId = UUID.randomUUID()
        val programmingTaskId = UUID.randomUUID()
        val programmingTask = ProgrammingTask("Two Sum", "inst", SkillLevel.INTERMEDIATE, TaskScope.PUBLIC, "twoSum", emptyList(), DataType.INT_ARRAY, false, "[]", employer)
            .apply { id = programmingTaskId }

        val job = JobPost(
            title = "Backend Engineer",
            companyName = "Tech Corp",
            description = "Kotlin",
            requirements = null,
            location = null,
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.BEGINNER,
            salaryMin = null,
            salaryMax = null,
            salaryCurrency = "USD",
            tabLock = false,
            tabLockWarningLimit = 3,
            deadline = null,
            isActive = true,
            postedBy = employer,
            designTask = null,
            programmingTask = programmingTask,
            sqlTask = null,
            embedding = null
        ).apply { id = jobId }

        `when`(jobPostRepository.findById(jobId)).thenReturn(Optional.of(job))

        val request = ApplyJobRequest(coverNote = "Applying without task")

        val ex = assertThrows(com.example.jobhub.exception.ApiException::class.java) {
            jobService.applyForJob(candidateId, jobId, request)
        }
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex.status)
        assertTrue(ex.message!!.contains("Programming task submission is required"))
    }

    @Test
    fun `should allow application with failed task submission`() {
        val jobId = UUID.randomUUID()
        val programmingTaskId = UUID.randomUUID()
        val programmingTask = ProgrammingTask("Two Sum", "inst", SkillLevel.INTERMEDIATE, TaskScope.PUBLIC, "twoSum", emptyList(), DataType.INT_ARRAY, false, "[]", employer)
            .apply { id = programmingTaskId }

        val job = JobPost(
            title = "Backend Engineer",
            companyName = "Tech Corp",
            description = "Kotlin",
            requirements = null,
            location = null,
            jobType = JobType.FULL_TIME,
            workplaceType = WorkplaceType.REMOTE,
            experienceLevel = SkillLevel.BEGINNER,
            salaryMin = null,
            salaryMax = null,
            salaryCurrency = "USD",
            tabLock = false,
            tabLockWarningLimit = 3,
            deadline = null,
            isActive = true,
            postedBy = employer,
            designTask = null,
            programmingTask = programmingTask,
            sqlTask = null,
            embedding = null
        ).apply { id = jobId }

        val submissionId = UUID.randomUUID()
        val failedSubmission = TaskSubmission(
            programmingTaskId,
            com.example.jobhub.model.task.TaskType.PROGRAMMING,
            "broken code",
            false, // Failed task
            2.0,
            10.0,
            candidate
        ).apply { id = submissionId }

        `when`(jobPostRepository.findById(jobId)).thenReturn(Optional.of(job))
        `when`(taskSubmissionRepository.findById(submissionId)).thenReturn(Optional.of(failedSubmission))

        val request = ApplyJobRequest(programmingSubmissionId = submissionId)

        val response = jobService.applyForJob(candidateId, jobId, request)
        assertNotNull(response.id)
        assertNotNull(response.programmingSubmission)
        assertEquals(false, response.programmingSubmission?.passed)
        assertEquals(2.0, response.programmingSubmission?.achievedScore)
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
