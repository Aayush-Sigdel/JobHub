package com.example.jobhub.controllers

import com.example.jobhub.dto.job.*
import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.job.JobType
import com.example.jobhub.model.job.WorkplaceType
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.JobService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/jobs")
class JobController(
    private val jobService: JobService
) {

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    fun createJobPost(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @Valid @RequestBody request: CreateJobPostRequest
    ): ResponseEntity<JobPostResponse> {
        val response = jobService.createJobPost(userDetails.id, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    fun updateJobPost(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable jobId: UUID,
        @Valid @RequestBody request: UpdateJobPostRequest
    ): ResponseEntity<JobPostResponse> {
        val response = jobService.updateJobPost(userDetails.id, jobId, request)
        return ResponseEntity.ok(response)
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    fun deleteJobPost(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable jobId: UUID
    ): ResponseEntity<Void> {
        jobService.deleteJobPost(userDetails.id, jobId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    fun searchJobs(
        @AuthenticationPrincipal userDetails: UserPrincipal?,
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) jobType: JobType?,
        @RequestParam(required = false) workplaceType: WorkplaceType?,
        @RequestParam(required = false) experienceLevel: SkillLevel?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) salaryMin: Double?,
        @RequestParam(required = false) hasTasks: Boolean?,
        @RequestParam(required = false, defaultValue = "false") semanticSearch: Boolean,
        @RequestParam(required = false, defaultValue = "similarity") sortBy: String
    ): ResponseEntity<List<JobPostResponse>> {
        val filter = JobSearchRequest(
            query = query,
            jobType = jobType,
            workplaceType = workplaceType,
            experienceLevel = experienceLevel,
            location = location,
            salaryMin = salaryMin,
            hasTasks = hasTasks,
            semanticSearch = semanticSearch,
            sortBy = sortBy
        )
        val jobs = jobService.searchJobs(filter, userDetails?.id)
        return ResponseEntity.ok(jobs)
    }

    @GetMapping("/{jobId}")
    fun getJobDetails(
        @AuthenticationPrincipal userDetails: UserPrincipal?,
        @PathVariable jobId: UUID
    ): ResponseEntity<JobPostDetailResponse> {
        val details = jobService.getJobDetails(jobId, userDetails?.id)
        return ResponseEntity.ok(details)
    }

    @PostMapping("/{jobId}/apply")
    fun applyForJob(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable jobId: UUID,
        @Valid @RequestBody request: ApplyJobRequest
    ): ResponseEntity<JobApplicationResponse> {
        val application = jobService.applyForJob(userDetails.id, jobId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(application)
    }

    @PostMapping("/{jobId}/tab-switch")
    fun recordTabSwitch(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable jobId: UUID,
        @Valid @RequestBody request: RecordTabSwitchRequest
    ): ResponseEntity<RecordTabSwitchResponse> {
        val response = jobService.recordTabSwitch(userDetails.id, jobId, request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/my-applications")
    fun getMyApplications(
        @AuthenticationPrincipal userDetails: UserPrincipal
    ): ResponseEntity<List<JobApplicationResponse>> {
        val applications = jobService.getMyApplications(userDetails.id)
        return ResponseEntity.ok(applications)
    }
}
