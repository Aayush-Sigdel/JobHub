package com.example.jobhub.service

import com.example.jobhub.dto.job.JobApplicationResponse
import com.example.jobhub.dto.recruiter.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.JobMapper
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.mapper.UserMapper
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.User
import com.example.jobhub.model.job.ApplicationStatus
import com.example.jobhub.model.job.JobApplication
import com.example.jobhub.model.job.JobPost
import com.example.jobhub.model.job.TabSwitchEvent
import com.example.jobhub.repository.JobApplicationRepository
import com.example.jobhub.repository.JobPostRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.embedding.JobMatchBreakdown
import com.example.jobhub.service.embedding.JobMatchService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.time.Instant
import java.util.UUID

private const val SNAPSHOT_REPLAY_LIMIT = 10
private const val SNAPSHOT_SUMMARY_LIMIT = 3

@Service
class RecruiterDashboardService(
    private val jobPostRepository: JobPostRepository,
    private val jobApplicationRepository: JobApplicationRepository,
    private val userRepository: UserRepository,
    private val userSocialSnapshotService: UserSocialSnapshotService,
    private val jobMatchService: JobMatchService,
    private val userMapper: UserMapper,
    private val taskSubmissionMapper: TaskSubmissionMapper,
    private val jobMapper: JobMapper,
    private val objectMapper: ObjectMapper
) {

    private val logger = LoggerFactory.getLogger(RecruiterDashboardService::class.java)

    @Transactional(readOnly = true)
    fun getEmployerJobs(employerId: UUID): List<RecruiterJobSummaryResponse> {
        val jobs = jobPostRepository.findByPostedByIdOrderByCreatedAtDesc(employerId)
        if (jobs.isEmpty()) return emptyList()

        val jobIds = jobs.mapNotNull { it.id }
        val allApplications = jobApplicationRepository.findByJobPostIdIn(jobIds)
        val appsByJobId = allApplications.groupBy { it.jobPost?.id }

        return jobs.map { job ->
            val jobApps = appsByJobId[job.id] ?: emptyList()
            val totalApplicants = jobApps.size.toLong()
            val pendingReview = jobApps.count { it.status == ApplicationStatus.APPLIED }.toLong()
            val shortlisted = jobApps.count { it.status == ApplicationStatus.SHORTLISTED }.toLong()

            RecruiterJobSummaryResponse(
                id = job.id!!,
                title = job.title,
                companyName = job.companyName,
                location = job.location,
                jobType = job.jobType,
                workplaceType = job.workplaceType,
                isActive = job.isActive,
                tabLock = job.tabLock,
                totalApplicants = totalApplicants,
                pendingReviewCount = pendingReview,
                shortlistedCount = shortlisted,
                hasDesignTask = job.designTask != null,
                hasProgrammingTask = job.programmingTask != null,
                hasSqlTask = job.sqlTask != null,
                createdAt = job.createdAt
            )
        }
    }

    @Transactional(readOnly = true)
    fun getEmployerJob(employerId: UUID, jobId: UUID) =
        jobPostRepository.findByIdAndPostedById(jobId, employerId)
            .map(jobMapper::toJobPostResponse)
            .orElseThrow {
                ApiException("Job post not found or not owned by recruiter", HttpStatus.NOT_FOUND)
            }

    @Transactional(readOnly = true)
    fun getCandidatesForJob(
        employerId: UUID,
        jobId: UUID,
        filter: CandidateFilterRequest
    ): List<CandidateDashboardResponse> {
        val job = jobPostRepository.findByIdAndPostedById(jobId, employerId).orElseThrow {
            ApiException("Job post not found or not owned by recruiter", HttpStatus.NOT_FOUND)
        }

        val applications = jobApplicationRepository.findByJobPostIdOrderByCreatedAtDesc(jobId)

        val candidateResponses = applications.mapNotNull { app ->
            val candidate = app.candidate ?: return@mapNotNull null

            if (filter.fromDateTime != null && app.createdAt?.isBefore(filter.fromDateTime) == true) {
                return@mapNotNull null
            }
            if (filter.toDateTime != null && app.createdAt?.isAfter(filter.toDateTime) == true) {
                return@mapNotNull null
            }

            if (filter.status != null && app.status != filter.status) {
                return@mapNotNull null
            }

            if (!filter.search.isNullOrBlank()) {
                val query = filter.search.trim().lowercase()
                val nameMatch = candidate.name?.lowercase()?.contains(query) == true
                val emailMatch = candidate.email?.lowercase()?.contains(query) == true
                val titleMatch = candidate.title?.lowercase()?.contains(query) == true
                val skillMatch = candidate.skills?.any { it.name?.lowercase()?.contains(query) == true } == true

                if (!nameMatch && !emailMatch && !titleMatch && !skillMatch) {
                    return@mapNotNull null
                }
            }

            val jobEmbedding = job.embedding
            val simScores = jobMatchService.calculate(jobEmbedding, candidate)
            val overallSim = simScores.overall

            if (filter.minSimilarity != null && (overallSim == null || overallSim < filter.minSimilarity)) {
                return@mapNotNull null
            }

            buildCandidateDashboardResponse(
                candidate = candidate,
                job = job,
                application = app,
                simScores = simScores
            )
        }

        return when (filter.sortBy.lowercase()) {
            "date" -> candidateResponses.sortedByDescending { it.appliedAt ?: Instant.MIN }
            "score" -> candidateResponses.sortedByDescending {
                var scoreSum = 0.0
                it.designSubmission?.let { s -> scoreSum += s.achievedScore }
                it.programmingSubmission?.let { s -> scoreSum += s.achievedScore }
                it.sqlSubmission?.let { s -> scoreSum += s.achievedScore }
                scoreSum
            }
            "name" -> candidateResponses.sortedBy { it.name.lowercase() }
            else -> candidateResponses.sortedByDescending { it.overallSimilarity ?: -1.0 }
        }
    }

    @Transactional(readOnly = true)
    fun getCandidateSocialSnapshots(
        employerId: UUID,
        jobId: UUID,
        candidateId: UUID
    ): List<CandidateSocialSnapshotDto> {
        jobPostRepository.findByIdAndPostedById(jobId, employerId).orElseThrow {
            ApiException("Job post not found or not owned by recruiter", HttpStatus.NOT_FOUND)
        }

        jobApplicationRepository.findByJobPostIdAndCandidateId(jobId, candidateId).orElseThrow {
            ApiException("Candidate has not applied for this job", HttpStatus.NOT_FOUND)
        }

        val snapshots = userSocialSnapshotService.findByUserId(candidateId)
        return snapshots.map { parseSocialSnapshot(it.platform, it.updatedAt, it.data) }
    }

    @Transactional
    fun updateApplicationStatus(
        employerId: UUID,
        applicationId: UUID,
        newStatus: ApplicationStatus
    ): JobApplicationResponse {
        val application = jobApplicationRepository.findById(applicationId).orElseThrow {
            ApiException("Job application not found", HttpStatus.NOT_FOUND)
        }

        val job = application.jobPost ?: throw ApiException("Job post not found", HttpStatus.NOT_FOUND)
        if (job.postedBy?.id != employerId) {
            throw ApiException("You are not authorized to update applications for this job", HttpStatus.FORBIDDEN)
        }

        application.status = newStatus
        val updated = jobApplicationRepository.save(application)
        return jobMapper.toJobApplicationResponse(updated)
    }

    private fun buildCandidateDashboardResponse(
        candidate: User,
        job: JobPost,
        application: JobApplication,
        simScores: JobMatchBreakdown
    ): CandidateDashboardResponse {
        val tabSwitchEvents: List<TabSwitchEvent>? = application.tabSwitchEventsJson?.let {
            try {
                objectMapper.readValue(
                    it,
                    objectMapper.typeFactory.constructCollectionType(List::class.java, TabSwitchEvent::class.java)
                )
            } catch (e: Exception) {
                null
            }
        }

        val designSub = application.designSubmission?.let { taskSubmissionMapper.toTaskSubmissionResponse(it) }
        val progSub = application.programmingSubmission?.let { taskSubmissionMapper.toTaskSubmissionResponse(it) }
        val sqlSub = application.sqlSubmission?.let { taskSubmissionMapper.toTaskSubmissionResponse(it) }

        val requiredTasksCount = listOfNotNull(job.designTask, job.programmingTask, job.sqlTask).size
        val passedTasksCount = listOfNotNull(
            designSub?.takeIf { it.passed },
            progSub?.takeIf { it.passed },
            sqlSub?.takeIf { it.passed }
        ).size

        val allTasksPassed = requiredTasksCount == 0 || passedTasksCount == requiredTasksCount

        return CandidateDashboardResponse(
            candidateId = candidate.id,
            name = candidate.name,
            email = candidate.email,
            title = candidate.title,
            bio = candidate.bio,
            location = candidate.location,
            imageUrl = candidate.imageUrl,
            skills = candidate.skills?.map { userMapper.toSkillDto(it) } ?: emptyList(),
            experiences = candidate.experiences?.map { userMapper.toExperienceDto(it) } ?: emptyList(),
            educations = candidate.educations?.map { userMapper.toEducationDto(it) } ?: emptyList(),
            socialLinks = candidate.socialLinks?.map { userMapper.toSocialLinkDto(it) } ?: emptyList(),
            applicationId = application.id,
            jobId = job.id,
            jobTitle = job.title,
            appliedAt = application.createdAt,
            status = application.status,
            coverNote = application.coverNote,
            tabSwitchCount = application.tabSwitchCount,
            tabSwitchLimitExceeded = application.tabSwitchCount >= job.tabLockWarningLimit,
            tabSwitchEvents = tabSwitchEvents,
            designSubmission = designSub,
            programmingSubmission = progSub,
            sqlSubmission = sqlSub,
            allTasksPassed = allTasksPassed,
            overallSimilarity = simScores.overall,
            matchPercentage = simScores.percentage,
            platformSimilarity = simScores.platform,
            githubSimilarity = simScores.github,
            devtoSimilarity = simScores.devto,
            orcidSimilarity = simScores.orcid,
            stackoverflowSimilarity = simScores.stackoverflow,
            portfolioSimilarity = simScores.portfolio
        )
    }

    private fun parseSocialSnapshot(
        platform: SocialPlatform,
        updatedAt: Instant?,
        dataJson: String
    ): CandidateSocialSnapshotDto {
        val processingItems = mutableListOf<String>()
        val summary = mutableMapOf<String, Any?>()

        try {
            val rootNode: JsonNode = objectMapper.readTree(dataJson)

            when (platform) {
                SocialPlatform.GITHUB -> {
                    val reposNode = rootNode.get("repositories")
                    if (reposNode != null && reposNode.isArray) {
                        summary["repoCount"] = reposNode.size()
                        val topRepositories = mutableListOf<String>()
                        var processedCount = 0
                        reposNode.forEach { repo ->
                            val name = repo.get("name")?.asText() ?: "unknown"
                            val isPinned = repo.get("pinned")?.asBoolean() ?: false
                            val pinnedText = if (isPinned) "[Pinned] " else ""
                            if (processedCount < SNAPSHOT_REPLAY_LIMIT) {
                                processingItems.add("Processing repo: $pinnedText$name")
                                processedCount++
                            }
                            if (topRepositories.size < SNAPSHOT_SUMMARY_LIMIT) {
                                topRepositories.add("$pinnedText$name")
                            }
                        }
                        if (topRepositories.isNotEmpty()) {
                            summary["topRepositories"] = topRepositories
                        }
                    }
                    val langsNode = rootNode.get("uniqueLanguages")
                    if (langsNode != null && langsNode.isArray) {
                        val langs = mutableListOf<String>()
                        langsNode.forEach {
                            if (langs.size < SNAPSHOT_SUMMARY_LIMIT) langs.add(it.asText())
                        }
                        summary["languages"] = langs
                        if (langs.isNotEmpty()) {
                            processingItems.add("Extracted primary languages: ${langs.joinToString(", ")}")
                        }
                    }
                }
                SocialPlatform.DEV_TO -> {
                    val articlesNode = rootNode.get("articles")
                    if (articlesNode != null && articlesNode.isArray) {
                        summary["articleCount"] = articlesNode.size()
                        val topArticles = mutableListOf<String>()
                        var processedCount = 0
                        articlesNode.forEach { article ->
                            val title = article.get("title")?.asText() ?: "untitled"
                            if (processedCount < SNAPSHOT_REPLAY_LIMIT) {
                                processingItems.add("Processing Dev.to article: $title")
                                processedCount++
                            }
                            if (topArticles.size < SNAPSHOT_SUMMARY_LIMIT) {
                                topArticles.add(title)
                            }
                        }
                        if (topArticles.isNotEmpty()) {
                            summary["topArticles"] = topArticles
                        }
                    }
                }
                SocialPlatform.STACKOVERFLOW -> {
                    val rep = rootNode.get("reputation")?.asLong()
                    if (rep != null) summary["reputation"] = rep
                    val tagsNode = rootNode.get("topTags")
                    if (tagsNode != null && tagsNode.isArray) {
                        val tagNames = mutableListOf<String>()
                        tagsNode.forEach { tagNode ->
                            tagNode.get("tagName")?.asText()?.let { tagNames.add(it) }
                        }
                        summary["topTags"] = tagNames.take(SNAPSHOT_SUMMARY_LIMIT)
                        if (tagNames.isNotEmpty()) {
                            processingItems.add("Analyzed StackOverflow tags: ${tagNames.take(5).joinToString(", ")}")
                        }
                    }
                    val questions = rootNode.get("topAnswerTitles")
                    if (questions != null && questions.isArray) {
                        val topAnswers = mutableListOf<String>()
                        var count = 0
                        questions.forEach { q ->
                            if (count < SNAPSHOT_SUMMARY_LIMIT) {
                                processingItems.add("Processing top answer: ${q.asText()}")
                                topAnswers.add(q.asText())
                                count++
                            }
                        }
                        if (topAnswers.isNotEmpty()) summary["topAnswers"] = topAnswers
                    }
                }
                SocialPlatform.ORCID -> {
                    val works = rootNode.get("works")
                    if (works != null && works.isArray) {
                        summary["worksCount"] = works.size()
                        val topPublications = mutableListOf<String>()
                        var count = 0
                        works.forEach { work ->
                            if (count < SNAPSHOT_REPLAY_LIMIT) {
                                val title = work.get("title")?.asText() ?: "untitled"
                                processingItems.add("Processing ORCID publication: $title")
                                if (topPublications.size < SNAPSHOT_SUMMARY_LIMIT) {
                                    topPublications.add(title)
                                }
                                count++
                            }
                        }
                        if (topPublications.isNotEmpty()) {
                            summary["topPublications"] = topPublications
                        }
                    }
                    val keywords = rootNode.get("keywords")
                    if (keywords != null && keywords.isArray) {
                        val kw = mutableListOf<String>()
                        keywords.forEach { kw.add(it.asText()) }
                        summary["keywords"] = kw.take(SNAPSHOT_SUMMARY_LIMIT)
                        if (kw.isNotEmpty()) {
                            processingItems.add("Identified research domains: ${kw.joinToString(", ")}")
                        }
                    }
                }
                SocialPlatform.PORTFOLIO, SocialPlatform.WEBSITE -> {
                    val title = rootNode.get("title")?.asText()
                    if (!title.isNullOrBlank()) {
                        processingItems.add("Processing portfolio: $title")
                    }
                    val headings = rootNode.get("headings")
                    if (headings != null && headings.isArray) {
                        val topSections = mutableListOf<String>()
                        var count = 0
                        headings.forEach { h ->
                            if (count < SNAPSHOT_REPLAY_LIMIT) {
                                processingItems.add("Analyzed section: ${h.asText()}")
                                if (topSections.size < SNAPSHOT_SUMMARY_LIMIT) {
                                    topSections.add(h.asText())
                                }
                                count++
                            }
                        }
                        if (topSections.isNotEmpty()) summary["topSections"] = topSections
                    }
                    val links = rootNode.get("links")
                    if (links != null && links.isArray) {
                        summary["linkCount"] = links.size()
                    }
                }
                else -> {
                    processingItems.add("Processing social snapshot for $platform")
                }
            }
        } catch (e: Exception) {
            logger.warn("Could not parse social snapshot JSON for $platform: ${e.message}")
            processingItems.add("Processing raw snapshot for $platform")
        }

        return CandidateSocialSnapshotDto(
            platform = platform,
            updatedAt = updatedAt,
            aiCoolFeedItems = processingItems,
            summary = summary
        )
    }
}
