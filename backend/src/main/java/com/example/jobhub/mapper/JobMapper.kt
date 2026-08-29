package com.example.jobhub.mapper

import com.example.jobhub.dto.job.CreateJobPostRequest
import com.example.jobhub.dto.job.JobApplicationResponse
import com.example.jobhub.dto.job.JobPostDetailResponse
import com.example.jobhub.dto.job.JobPostResponse
import com.example.jobhub.model.User
import com.example.jobhub.model.job.JobApplication
import com.example.jobhub.model.job.JobPost
import com.example.jobhub.model.job.TabSwitchEvent
import com.example.jobhub.model.task.DesignTask
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.SQLTask
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@Component
class JobMapper(
    private val taskMapper: TaskMapper,
    private val taskSubmissionMapper: TaskSubmissionMapper,
    private val objectMapper: ObjectMapper
) {

    fun toJobPost(
        request: CreateJobPostRequest,
        postedBy: User,
        designTask: DesignTask?,
        programmingTask: ProgrammingTask?,
        sqlTask: SQLTask?,
        embedding: FloatArray?
    ): JobPost {
        return JobPost(
            title = request.title,
            companyName = request.companyName,
            description = request.description,
            requirements = request.requirements,
            location = request.location,
            jobType = request.jobType,
            workplaceType = request.workplaceType,
            experienceLevel = request.experienceLevel,
            salaryMin = request.salaryMin,
            salaryMax = request.salaryMax,
            salaryCurrency = request.salaryCurrency ?: "USD",
            tabLock = request.tabLock,
            tabLockWarningLimit = request.tabLockWarningLimit,
            deadline = request.deadline,
            isActive = true,
            postedBy = postedBy,
            designTask = designTask,
            programmingTask = programmingTask,
            sqlTask = sqlTask,
            embedding = embedding
        )
    }

    fun toJobPostResponse(jobPost: JobPost, similarityScore: Double? = null): JobPostResponse {
        return JobPostResponse(
            id = jobPost.id ?: throw IllegalStateException("JobPost ID must not be null"),
            title = jobPost.title,
            companyName = jobPost.companyName,
            description = jobPost.description,
            requirements = jobPost.requirements,
            location = jobPost.location,
            jobType = jobPost.jobType,
            workplaceType = jobPost.workplaceType,
            experienceLevel = jobPost.experienceLevel,
            salaryMin = jobPost.salaryMin,
            salaryMax = jobPost.salaryMax,
            salaryCurrency = jobPost.salaryCurrency,
            tabLock = jobPost.tabLock,
            tabLockWarningLimit = jobPost.tabLockWarningLimit,
            deadline = jobPost.deadline,
            isActive = jobPost.isActive,
            postedById = jobPost.postedBy?.id ?: throw IllegalStateException("JobPost postedBy must not be null"),
            postedByName = jobPost.postedBy?.name ?: "",
            hasDesignTask = jobPost.designTask != null,
            hasProgrammingTask = jobPost.programmingTask != null,
            hasSqlTask = jobPost.sqlTask != null,
            designTaskId = jobPost.designTask?.id,
            programmingTaskId = jobPost.programmingTask?.id,
            sqlTaskId = jobPost.sqlTask?.id,
            similarityScore = similarityScore,
            createdAt = jobPost.createdAt,
            updatedAt = jobPost.updatedAt
        )
    }

    fun toJobPostDetailResponse(
        jobPost: JobPost,
        applicantCount: Long = 0,
        hasApplied: Boolean = false,
        myApplicationId: UUID? = null,
        similarityScore: Double? = null
    ): JobPostDetailResponse {
        val base = toJobPostResponse(jobPost, similarityScore)
        val designTaskDto = jobPost.designTask?.let { taskMapper.toDesignTaskDto(it) }
        val programmingTaskDto = jobPost.programmingTask?.let { taskMapper.toProgrammingTaskDto(it, 3) }
        val sqlTaskDto = jobPost.sqlTask?.let { taskMapper.toSQLTaskDto(it) }

        return JobPostDetailResponse(
            job = base,
            designTask = designTaskDto,
            programmingTask = programmingTaskDto,
            sqlTask = sqlTaskDto,
            applicantCount = applicantCount,
            hasApplied = hasApplied,
            myApplicationId = myApplicationId
        )
    }

    fun toJobApplicationResponse(application: JobApplication): JobApplicationResponse {
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

        return JobApplicationResponse(
            id = application.id ?: throw IllegalStateException("JobApplication ID must not be null"),
            jobPostId = application.jobPost?.id ?: throw IllegalStateException("JobApplication jobPost must not be null"),
            jobTitle = application.jobPost?.title ?: "",
            companyName = application.jobPost?.companyName ?: "",
            candidateId = application.candidate?.id ?: throw IllegalStateException("JobApplication candidate must not be null"),
            candidateName = application.candidate?.name ?: "",
            candidateEmail = application.candidate?.email ?: "",
            status = application.status,
            similarityScore = application.similarityScore,
            tabSwitchCount = application.tabSwitchCount,
            tabSwitchEvents = tabSwitchEvents,
            coverNote = application.coverNote,
            designSubmission = application.designSubmission?.let { taskSubmissionMapper.toTaskSubmissionResponse(it) },
            programmingSubmission = application.programmingSubmission?.let { taskSubmissionMapper.toTaskSubmissionResponse(it) },
            sqlSubmission = application.sqlSubmission?.let { taskSubmissionMapper.toTaskSubmissionResponse(it) },
            createdAt = application.createdAt,
            updatedAt = application.updatedAt
        )
    }
}
