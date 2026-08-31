package com.example.jobhub.repository

import com.example.jobhub.model.job.JobPost
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional
import java.util.UUID

interface JobPostRepository : JpaRepository<JobPost, UUID>, JpaSpecificationExecutor<JobPost> {

    fun findByPostedByIdOrderByCreatedAtDesc(postedById: UUID): List<JobPost>

    fun findByIsActiveTrueOrderByCreatedAtDesc(): List<JobPost>

    fun findByIdAndPostedById(id: UUID, postedById: UUID): Optional<JobPost>

    @Query("""
        SELECT j FROM JobPost j 
        WHERE j.isActive = true 
        AND (
            LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) 
            OR LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')) 
            OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) 
            OR (j.location IS NOT NULL AND LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')))
            OR (j.requirements IS NOT NULL AND LOWER(j.requirements) LIKE LOWER(CONCAT('%', :query, '%')))
        )
        ORDER BY j.createdAt DESC
    """)
    fun searchJobs(@Param("query") query: String): List<JobPost>
}
