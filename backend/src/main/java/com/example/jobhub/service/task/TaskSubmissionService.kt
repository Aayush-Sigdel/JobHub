package com.example.jobhub.service.task

import com.example.jobhub.dto.TaskSubmissionCodeResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.repository.JobApplicationRepository
import com.example.jobhub.repository.TaskSubmissionRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TaskSubmissionService(
    private val taskSubmissionRepository: TaskSubmissionRepository,
    private val jobApplicationRepository: JobApplicationRepository,
    private val taskSubmissionMapper: TaskSubmissionMapper,
) {

    @Transactional(readOnly = true)
    fun getSubmission(userId: UUID, submissionId: UUID): TaskSubmissionCodeResponse {
        val submission = taskSubmissionRepository.findById(submissionId)
            .orElseThrow { ApiException("Submission not found", HttpStatus.NOT_FOUND) }
        if (submission.solvedBy.id != userId && !isEmployerOfSubmission(userId, submissionId)) {
            throw ApiException("You are not authorized to view this submission", HttpStatus.FORBIDDEN)
        }
        return taskSubmissionMapper.toTaskSubmissionCodeResponse(submission)
    }

    private fun isEmployerOfSubmission(userId: UUID, submissionId: UUID): Boolean {
        return jobApplicationRepository.findBySubmissionId(submissionId)
            .any { it.jobPost?.postedBy?.id == userId }
    }
}
