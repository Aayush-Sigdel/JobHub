package com.example.jobhub.service

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.dto.job.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.JobMapper
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.job.ApplicationStatus
import com.example.jobhub.model.job.JobApplication
import com.example.jobhub.model.job.JobPost
import com.example.jobhub.model.job.JobType
import com.example.jobhub.model.job.TabSwitchEvent
import com.example.jobhub.model.job.WorkplaceType
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.SQLTask
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.repository.*
import com.example.jobhub.service.embedding.CosineSimilarity
import com.example.jobhub.util.FormatUtil
import jakarta.persistence.criteria.Predicate
import org.slf4j.LoggerFactory
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.databind.ObjectMapper
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class JobService(
    private val jobPostRepository: JobPostRepository,
    private val jobApplicationRepository: JobApplicationRepository,
    private val userRepository: UserRepository,
    private val designTaskRepository: DesignTaskRepository,
    private val programmingTaskRepository: ProgrammingTaskRepository,
    private val sqlTaskRepository: SQLTaskRepository,
    private val taskSubmissionRepository: TaskSubmissionRepository,
    private val embeddingApiClient: EmbeddingApiClient,
    private val redisTemplate: StringRedisTemplate,
    private val jobMapper: JobMapper,
    private val objectMapper: ObjectMapper
) {

    private val logger = LoggerFactory.getLogger(JobService::class.java)

    fun createJobPost(employerId: UUID, request: CreateJobPostRequest): JobPostResponse {
        val employer = userRepository.findById(employerId).orElseThrow {
            ApiException("Employer not found", HttpStatus.NOT_FOUND)
        }

        if (!employer.isEmployer) {
            throw ApiException("Only employer accounts can create job postings", HttpStatus.FORBIDDEN)
        }

        val designTask: DesignTask? = request.designTaskId?.let { taskId ->
            val task = designTaskRepository.findById(taskId).orElseThrow {
                ApiException("Design task not found: $taskId", HttpStatus.BAD_REQUEST)
            }
            if (task.createdBy.id != employerId && task.scope != TaskScope.PUBLIC) {
                throw ApiException("Not authorized to attach this private design task: $taskId", HttpStatus.FORBIDDEN)
            }
            task
        }

        val programmingTask: ProgrammingTask? = request.programmingTaskId?.let { taskId ->
            val task = programmingTaskRepository.findById(taskId).orElseThrow {
                ApiException("Programming task not found: $taskId", HttpStatus.BAD_REQUEST)
            }
            if (task.createdBy.id != employerId && task.scope != TaskScope.PUBLIC) {
                throw ApiException("Not authorized to attach this private programming task: $taskId", HttpStatus.FORBIDDEN)
            }
            task
        }

        val sqlTask: SQLTask? = request.sqlTaskId?.let { taskId ->
            val task = sqlTaskRepository.findById(taskId).orElseThrow {
                ApiException("SQL task not found: $taskId", HttpStatus.BAD_REQUEST)
            }
            if (task.createdBy.id != employerId && task.scope != TaskScope.PUBLIC) {
                throw ApiException("Not authorized to attach this private SQL task: $taskId", HttpStatus.FORBIDDEN)
            }
            task
        }

        val embedding = generateJobEmbedding(
            title = request.title,
            companyName = request.companyName,
            description = request.description,
            requirements = request.requirements,
            location = request.location,
            jobType = request.jobType.name,
            workplaceType = request.workplaceType.name,
            experienceLevel = request.experienceLevel.name
        )

        return saveNewJobPost(request, employer, designTask, programmingTask, sqlTask, embedding)
    }

    @Transactional
    protected fun saveNewJobPost(
        request: CreateJobPostRequest,
        employer: com.example.jobhub.model.User,
        designTask: DesignTask?,
        programmingTask: ProgrammingTask?,
        sqlTask: SQLTask?,
        embedding: FloatArray?
    ): JobPostResponse {
        val jobPost = jobMapper.toJobPost(
            request = request,
            postedBy = employer,
            designTask = designTask,
            programmingTask = programmingTask,
            sqlTask = sqlTask,
            embedding = embedding
        )

        val saved = jobPostRepository.save(jobPost)
        return jobMapper.toJobPostResponse(saved)
    }

    fun updateJobPost(employerId: UUID, jobId: UUID, request: UpdateJobPostRequest): JobPostResponse {
        val jobPost = jobPostRepository.findByIdAndPostedById(jobId, employerId).orElseThrow {
            ApiException("Job post not found or you are not authorized to edit it", HttpStatus.NOT_FOUND)
        }

        if (request.designTaskId != null && request.removeDesignTask != true) {
            val task = designTaskRepository.findById(request.designTaskId).orElseThrow {
                ApiException("Design task not found: ${request.designTaskId}", HttpStatus.BAD_REQUEST)
            }
            if (task.createdBy.id != employerId && task.scope != TaskScope.PUBLIC) {
                throw ApiException("Not authorized to attach this private design task: ${request.designTaskId}", HttpStatus.FORBIDDEN)
            }
        }

        if (request.programmingTaskId != null && request.removeProgrammingTask != true) {
            val task = programmingTaskRepository.findById(request.programmingTaskId).orElseThrow {
                ApiException("Programming task not found: ${request.programmingTaskId}", HttpStatus.BAD_REQUEST)
            }
            if (task.createdBy.id != employerId && task.scope != TaskScope.PUBLIC) {
                throw ApiException("Not authorized to attach this private programming task: ${request.programmingTaskId}", HttpStatus.FORBIDDEN)
            }
        }

        if (request.sqlTaskId != null && request.removeSqlTask != true) {
            val task = sqlTaskRepository.findById(request.sqlTaskId).orElseThrow {
                ApiException("SQL task not found: ${request.sqlTaskId}", HttpStatus.BAD_REQUEST)
            }
            if (task.createdBy.id != employerId && task.scope != TaskScope.PUBLIC) {
                throw ApiException("Not authorized to attach this private SQL task: ${request.sqlTaskId}", HttpStatus.FORBIDDEN)
            }
        }

        var updatedEmbedding: FloatArray? = null
        if (request.title != null || request.description != null || request.requirements != null) {
            updatedEmbedding = generateJobEmbedding(
                title = request.title ?: jobPost.title,
                companyName = request.companyName ?: jobPost.companyName,
                description = request.description ?: jobPost.description,
                requirements = request.requirements ?: jobPost.requirements,
                location = request.location ?: jobPost.location,
                jobType = (request.jobType ?: jobPost.jobType).name,
                workplaceType = (request.workplaceType ?: jobPost.workplaceType).name,
                experienceLevel = (request.experienceLevel ?: jobPost.experienceLevel).name
            )
        }

        return applyJobPostUpdates(jobId, employerId, request, updatedEmbedding)
    }

    @Transactional
    protected fun applyJobPostUpdates(
        jobId: UUID,
        employerId: UUID,
        request: UpdateJobPostRequest,
        updatedEmbedding: FloatArray?
    ): JobPostResponse {
        val jobPost = jobPostRepository.findByIdAndPostedById(jobId, employerId).orElseThrow {
            ApiException("Job post not found or you are not authorized to edit it", HttpStatus.NOT_FOUND)
        }

        request.title?.let { jobPost.title = it }
        request.companyName?.let { jobPost.companyName = it }
        request.description?.let { jobPost.description = it }
        request.requirements?.let { jobPost.requirements = it }
        request.location?.let { jobPost.location = it }
        request.jobType?.let { jobPost.jobType = it }
        request.workplaceType?.let { jobPost.workplaceType = it }
        request.experienceLevel?.let { jobPost.experienceLevel = it }
        request.salaryMin?.let { jobPost.salaryMin = it }
        request.salaryMax?.let { jobPost.salaryMax = it }
        request.salaryCurrency?.let { jobPost.salaryCurrency = it }
        request.tabLock?.let { jobPost.tabLock = it }
        request.tabLockWarningLimit?.let { jobPost.tabLockWarningLimit = it }
        request.deadline?.let { jobPost.deadline = it }
        request.isActive?.let { jobPost.isActive = it }

        if (request.removeDesignTask == true) {
            jobPost.designTask = null
        } else if (request.designTaskId != null) {
            jobPost.designTask = designTaskRepository.findById(request.designTaskId).orElse(null)
        }

        if (request.removeProgrammingTask == true) {
            jobPost.programmingTask = null
        } else if (request.programmingTaskId != null) {
            jobPost.programmingTask = programmingTaskRepository.findById(request.programmingTaskId).orElse(null)
        }

        if (request.removeSqlTask == true) {
            jobPost.sqlTask = null
        } else if (request.sqlTaskId != null) {
            jobPost.sqlTask = sqlTaskRepository.findById(request.sqlTaskId).orElse(null)
        }

        if (updatedEmbedding != null) {
            jobPost.embedding = updatedEmbedding
        }

        val updated = jobPostRepository.save(jobPost)
        return jobMapper.toJobPostResponse(updated)
    }

    @Transactional
    fun deleteJobPost(employerId: UUID, jobId: UUID) {
        val jobPost = jobPostRepository.findByIdAndPostedById(jobId, employerId).orElseThrow {
            ApiException("Job post not found or you are not authorized to delete it", HttpStatus.NOT_FOUND)
        }
        jobPostRepository.delete(jobPost)
    }

    @Transactional(readOnly = true)
    fun getJobDetails(jobId: UUID, currentUserId: UUID?): JobPostDetailResponse {
        val job = jobPostRepository.findById(jobId).orElseThrow {
            ApiException("Job post not found", HttpStatus.NOT_FOUND)
        }

        val applicantCount = jobApplicationRepository.countByJobPostId(jobId)

        var hasApplied = false
        var myApplicationId: UUID? = null
        var similarityScore: Double? = null

        if (currentUserId != null) {
            val appOpt = jobApplicationRepository.findByJobPostIdAndCandidateId(jobId, currentUserId)
            if (appOpt.isPresent) {
                hasApplied = true
                myApplicationId = appOpt.get().id
                similarityScore = appOpt.get().similarityScore
            } else if (job.embedding != null) {
                val userOpt = userRepository.findById(currentUserId)
                if (userOpt.isPresent && userOpt.get().profileEmbedding != null) {
                    try {
                        similarityScore = CosineSimilarity.compute(job.embedding!!, userOpt.get().profileEmbedding!!)
                    } catch (e: Exception) {
                        logger.warn("Could not compute similarity: ${e.message}")
                    }
                }
            }
        }

        return jobMapper.toJobPostDetailResponse(
            jobPost = job,
            applicantCount = applicantCount,
            hasApplied = hasApplied,
            myApplicationId = myApplicationId,
            similarityScore = similarityScore
        )
    }

    @Transactional(readOnly = true)
    fun searchJobs(filter: JobSearchRequest, currentUserId: UUID?): List<JobPostResponse> {
        val spec = Specification<JobPost> { root, _, cb ->
            val predicates = mutableListOf<Predicate>()
            predicates.add(cb.isTrue(root.get("isActive")))

            filter.jobType?.let { predicates.add(cb.equal(root.get<JobType>("jobType"), it)) }
            filter.workplaceType?.let { predicates.add(cb.equal(root.get<WorkplaceType>("workplaceType"), it)) }
            filter.experienceLevel?.let { predicates.add(cb.equal(root.get<SkillLevel>("experienceLevel"), it)) }

            if (!filter.location.isNullOrBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%${filter.location.trim().lowercase()}%"))
            }

            filter.salaryMin?.let { minSalary ->
                val maxCond = cb.greaterThanOrEqualTo(root.get("salaryMax"), minSalary)
                val minCond = cb.and(
                    cb.isNull(root.get<Double>("salaryMax")),
                    cb.greaterThanOrEqualTo(root.get("salaryMin"), minSalary)
                )
                predicates.add(cb.or(maxCond, minCond))
            }

            if (filter.hasTasks == true) {
                predicates.add(
                    cb.or(
                        cb.isNotNull(root.get<DesignTask>("designTask")),
                        cb.isNotNull(root.get<ProgrammingTask>("programmingTask")),
                        cb.isNotNull(root.get<SQLTask>("sqlTask"))
                    )
                )
            } else if (filter.hasTasks == false) {
                predicates.add(
                    cb.and(
                        cb.isNull(root.get<DesignTask>("designTask")),
                        cb.isNull(root.get<ProgrammingTask>("programmingTask")),
                        cb.isNull(root.get<SQLTask>("sqlTask"))
                    )
                )
            }

            if (!filter.query.isNullOrBlank()) {
                val q = "%${filter.query.trim().lowercase()}%"
                val titleMatch = cb.like(cb.lower(root.get("title")), q)
                val companyMatch = cb.like(cb.lower(root.get("companyName")), q)
                val descMatch = cb.like(cb.lower(root.get("description")), q)
                val locMatch = cb.like(cb.lower(root.get("location")), q)
                val reqMatch = cb.like(cb.lower(root.get("requirements")), q)
                predicates.add(cb.or(titleMatch, companyMatch, descMatch, locMatch, reqMatch))
            }

            cb.and(*predicates.toTypedArray())
        }

        val allJobs = jobPostRepository.findAll(spec)

        var candidateProfileEmbedding: FloatArray? = null
        var searchEmbedding: FloatArray? = null

        if (currentUserId != null) {
            userRepository.findById(currentUserId).ifPresent {
                candidateProfileEmbedding = it.profileEmbedding
            }
        }

        if (filter.semanticSearch && !filter.query.isNullOrBlank()) {
            try {
                searchEmbedding = embeddingApiClient.embed(FormatUtil.cleanText(filter.query))
            } catch (e: Exception) {
                logger.warn("Semantic search embed failed: ${e.message}")
            }
        }

        val referenceEmbedding = searchEmbedding ?: candidateProfileEmbedding

        val scoredJobs = allJobs.map { job ->
            var score: Double? = null
            if (referenceEmbedding != null && job.embedding != null) {
                try {
                    score = CosineSimilarity.compute(referenceEmbedding, job.embedding!!)
                } catch (e: Exception) {
                    logger.debug("Cosine similarity error: ${e.message}")
                }
            }
            Pair(job, score)
        }

        val sorted = when (filter.sortBy.lowercase()) {
            "similarity" -> scoredJobs.sortedByDescending { it.second ?: -1.0 }
            "salary" -> scoredJobs.sortedByDescending { it.first.salaryMax ?: it.first.salaryMin ?: 0.0 }
            else -> scoredJobs.sortedByDescending { it.first.createdAt ?: Instant.MIN }
        }

        return sorted.map { (job, score) ->
            jobMapper.toJobPostResponse(job, score)
        }
    }

    @Transactional
    fun applyForJob(candidateId: UUID, jobId: UUID, request: ApplyJobRequest): JobApplicationResponse {
        val candidate = userRepository.findById(candidateId).orElseThrow {
            ApiException("Candidate not found", HttpStatus.NOT_FOUND)
        }

        val job = jobPostRepository.findById(jobId).orElseThrow {
            ApiException("Job post not found", HttpStatus.NOT_FOUND)
        }

        if (job.postedBy?.id == candidateId) {
            throw ApiException("You cannot apply to your own job posting", HttpStatus.BAD_REQUEST)
        }

        if (!job.isActive) {
            throw ApiException("This job posting is no longer accepting applications", HttpStatus.BAD_REQUEST)
        }

        if (job.deadline != null && job.deadline!!.isBefore(Instant.now())) {
            throw ApiException("The deadline for this job posting has passed", HttpStatus.BAD_REQUEST)
        }

        if (jobApplicationRepository.existsByJobPostIdAndCandidateId(jobId, candidateId)) {
            throw ApiException("You have already applied for this job", HttpStatus.CONFLICT)
        }

        val designSubmission = request.designSubmissionId?.let { submissionId ->
            val submission = taskSubmissionRepository.findById(submissionId).orElseThrow {
                ApiException("Design submission not found: $submissionId", HttpStatus.BAD_REQUEST)
            }
            if (submission.solvedBy.id != candidateId) {
                throw ApiException("Design submission does not belong to this candidate", HttpStatus.FORBIDDEN)
            }
            if (job.designTask != null && submission.taskId != job.designTask!!.id) {
                throw ApiException("Design submission does not correspond to the required task for this job", HttpStatus.BAD_REQUEST)
            }
            submission
        }

        val programmingSubmission = request.programmingSubmissionId?.let { submissionId ->
            val submission = taskSubmissionRepository.findById(submissionId).orElseThrow {
                ApiException("Programming submission not found: $submissionId", HttpStatus.BAD_REQUEST)
            }
            if (submission.solvedBy.id != candidateId) {
                throw ApiException("Programming submission does not belong to this candidate", HttpStatus.FORBIDDEN)
            }
            if (job.programmingTask != null && submission.taskId != job.programmingTask!!.id) {
                throw ApiException("Programming submission does not correspond to the required task for this job", HttpStatus.BAD_REQUEST)
            }
            submission
        }

        val sqlSubmission = request.sqlSubmissionId?.let { submissionId ->
            val submission = taskSubmissionRepository.findById(submissionId).orElseThrow {
                ApiException("SQL submission not found: $submissionId", HttpStatus.BAD_REQUEST)
            }
            if (submission.solvedBy.id != candidateId) {
                throw ApiException("SQL submission does not belong to this candidate", HttpStatus.FORBIDDEN)
            }
            if (job.sqlTask != null && submission.taskId != job.sqlTask!!.id) {
                throw ApiException("SQL submission does not correspond to the required task for this job", HttpStatus.BAD_REQUEST)
            }
            submission
        }

        val redisCountKey = "tab_switch:count:$jobId:$candidateId"
        val redisEventsKey = "tab_switch:events:$jobId:$candidateId"
        val redisCount = redisTemplate.opsForValue().get(redisCountKey)?.toIntOrNull() ?: 0
        val totalTabSwitchCount = maxOf(request.tabSwitchCount, redisCount)

        val serverEvents: MutableList<TabSwitchEvent> = redisTemplate.opsForValue().get(redisEventsKey)?.let {
            try {
                objectMapper.readValue(it, objectMapper.typeFactory.constructCollectionType(List::class.java, TabSwitchEvent::class.java))
            } catch (e: Exception) {
                mutableListOf()
            }
        } ?: mutableListOf()

        val allEvents = (request.tabSwitchEvents ?: emptyList()) + serverEvents

        try {
            redisTemplate.delete(listOf(redisCountKey, redisEventsKey))
        } catch (e: Exception) {
            logger.debug("Could not clean up tab switch redis keys: ${e.message}")
        }

        var similarityScore: Double? = null
        if (job.embedding != null && candidate.profileEmbedding != null) {
            try {
                similarityScore = CosineSimilarity.compute(job.embedding!!, candidate.profileEmbedding!!)
            } catch (e: Exception) {
                logger.warn("Could not compute similarity: ${e.message}")
            }
        }

        val tabSwitchEventsJson = if (allEvents.isNotEmpty()) {
            try {
                objectMapper.writeValueAsString(allEvents)
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }

        val application = JobApplication(
            jobPost = job,
            candidate = candidate,
            status = ApplicationStatus.APPLIED,
            similarityScore = similarityScore,
            tabSwitchCount = totalTabSwitchCount,
            tabSwitchEventsJson = tabSwitchEventsJson,
            coverNote = request.coverNote,
            designSubmission = designSubmission,
            programmingSubmission = programmingSubmission,
            sqlSubmission = sqlSubmission
        )

        val saved = jobApplicationRepository.save(application)
        return jobMapper.toJobApplicationResponse(saved)
    }

    @Transactional
    fun recordTabSwitch(candidateId: UUID, jobId: UUID, request: RecordTabSwitchRequest): RecordTabSwitchResponse {
        val job = jobPostRepository.findById(jobId).orElseThrow {
            ApiException("Job not found", HttpStatus.NOT_FOUND)
        }

        val appOpt = jobApplicationRepository.findByJobPostIdAndCandidateId(jobId, candidateId)
        val event = TabSwitchEvent(
            timestamp = Instant.now(),
            eventType = request.eventType,
            durationSeconds = request.durationSeconds,
            details = request.details
        )

        var newCount: Int
        val warningLimit = job.tabLockWarningLimit

        if (appOpt.isPresent) {
            val app = appOpt.get()
            app.tabSwitchCount += 1
            newCount = app.tabSwitchCount

            val existingEvents: MutableList<TabSwitchEvent> = app.tabSwitchEventsJson?.let {
                try {
                    objectMapper.readValue(
                        it,
                        objectMapper.typeFactory.constructCollectionType(List::class.java, TabSwitchEvent::class.java)
                    )
                } catch (e: Exception) {
                    mutableListOf()
                }
            } ?: mutableListOf()

            existingEvents.add(event)
            app.tabSwitchEventsJson = objectMapper.writeValueAsString(existingEvents)
            jobApplicationRepository.save(app)
        } else {
            // Pre-application telemetry: persist in Redis
            val countKey = "tab_switch:count:$jobId:$candidateId"
            val eventsKey = "tab_switch:events:$jobId:$candidateId"

            val current = redisTemplate.opsForValue().increment(countKey) ?: 1L
            redisTemplate.expire(countKey, Duration.ofDays(7))
            newCount = current.toInt()

            val existingEvents: MutableList<TabSwitchEvent> = redisTemplate.opsForValue().get(eventsKey)?.let {
                try {
                    objectMapper.readValue(
                        it,
                        objectMapper.typeFactory.constructCollectionType(List::class.java, TabSwitchEvent::class.java)
                    )
                } catch (e: Exception) {
                    mutableListOf()
                }
            } ?: mutableListOf()

            existingEvents.add(event)
            redisTemplate.opsForValue().set(eventsKey, objectMapper.writeValueAsString(existingEvents), Duration.ofDays(7))
        }

        val exceeded = newCount >= warningLimit
        val msg = if (exceeded) {
            "Warning: Tab switch limit exceeded ($newCount/$warningLimit). Recruiter will be notified."
        } else {
            "Tab switch recorded ($newCount/$warningLimit)."
        }

        return RecordTabSwitchResponse(
            tabSwitchCount = newCount,
            warningLimit = warningLimit,
            warningLimitExceeded = exceeded,
            message = msg
        )
    }

    @Transactional(readOnly = true)
    fun getMyApplications(candidateId: UUID): List<JobApplicationResponse> {
        val applications = jobApplicationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
        return applications.map { jobMapper.toJobApplicationResponse(it) }
    }

    private fun generateJobEmbedding(
        title: String,
        companyName: String,
        description: String,
        requirements: String?,
        location: String?,
        jobType: String,
        workplaceType: String,
        experienceLevel: String
    ): FloatArray? {
        val text = buildString {
            appendLine("Job Title: $title")
            appendLine("Company: $companyName")
            location?.let { appendLine("Location: $it") }
            appendLine("Workplace: $workplaceType, Job Type: $jobType, Level: $experienceLevel")
            appendLine("Job Description: ${FormatUtil.cleanText(description)}")
            requirements?.let {
                appendLine("Requirements: ${FormatUtil.cleanText(it)}")
            }
        }

        val truncated = FormatUtil.truncate(text.trim(), 12_000)
        return try {
            embeddingApiClient.embed(truncated)
        } catch (e: Exception) {
            logger.warn("Failed to generate job embedding via EmbeddingApiClient: ${e.message}")
            null
        }
    }
}
