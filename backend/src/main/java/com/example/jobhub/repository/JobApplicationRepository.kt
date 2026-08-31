package com.example.jobhub.repository

import com.example.jobhub.model.job.ApplicationStatus
import com.example.jobhub.model.job.JobApplication
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.util.Optional
import java.util.UUID

interface JobApplicationRepository : JpaRepository<JobApplication, UUID>, JpaSpecificationExecutor<JobApplication> {

    fun findByJobPostId(jobPostId: UUID): List<JobApplication>

    fun findByJobPostIdOrderByCreatedAtDesc(jobPostId: UUID): List<JobApplication>

    fun findByJobPostIdAndCandidateId(jobPostId: UUID, candidateId: UUID): Optional<JobApplication>

    fun existsByJobPostIdAndCandidateId(jobPostId: UUID, candidateId: UUID): Boolean

    fun findByCandidateIdOrderByCreatedAtDesc(candidateId: UUID): List<JobApplication>

    fun countByJobPostId(jobPostId: UUID): Long

    fun countByJobPostIdAndStatus(jobPostId: UUID, status: ApplicationStatus): Long

    fun findByJobPostIdIn(jobPostIds: Collection<UUID>): List<JobApplication>
}
