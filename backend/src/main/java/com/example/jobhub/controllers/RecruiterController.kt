package com.example.jobhub.controllers

import com.example.jobhub.dto.job.JobApplicationResponse
import com.example.jobhub.dto.recruiter.CandidateDashboardResponse
import com.example.jobhub.dto.recruiter.CandidateFilterRequest
import com.example.jobhub.dto.recruiter.RecruiterJobSummaryResponse
import com.example.jobhub.dto.recruiter.UpdateApplicationStatusRequest
import com.example.jobhub.model.job.ApplicationStatus
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.RecruiterDashboardService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasRole('EMPLOYER')")
class RecruiterController(
    private val recruiterDashboardService: RecruiterDashboardService
) {

    @GetMapping("/jobs")
    fun getMyJobPostings(
        @AuthenticationPrincipal userDetails: UserPrincipal
    ): ResponseEntity<List<RecruiterJobSummaryResponse>> {
        val jobs = recruiterDashboardService.getEmployerJobs(userDetails.id)
        return ResponseEntity.ok(jobs)
    }

    @GetMapping("/jobs/{jobId}/candidates")
    fun getCandidatesForJob(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable jobId: UUID,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) fromDateTime: Instant?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) toDateTime: Instant?,
        @RequestParam(required = false) minSimilarity: Double?,
        @RequestParam(required = false) status: ApplicationStatus?,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false, defaultValue = "similarity") sortBy: String
    ): ResponseEntity<List<CandidateDashboardResponse>> {
        val filter = CandidateFilterRequest(
            fromDateTime = fromDateTime,
            toDateTime = toDateTime,
            minSimilarity = minSimilarity,
            status = status,
            search = search,
            sortBy = sortBy
        )
        val candidates = recruiterDashboardService.getCandidatesForJob(userDetails.id, jobId, filter)
        return ResponseEntity.ok(candidates)
    }

    @GetMapping("/jobs/{jobId}/candidates/{candidateId}/snapshots")
    fun getCandidateSocialSnapshots(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable jobId: UUID,
        @PathVariable candidateId: UUID
    ): ResponseEntity<List<com.example.jobhub.dto.recruiter.CandidateSocialSnapshotDto>> {
        val snapshots = recruiterDashboardService.getCandidateSocialSnapshots(userDetails.id, jobId, candidateId)
        return ResponseEntity.ok(snapshots)
    }

    @PutMapping("/applications/{applicationId}/status")
    fun updateApplicationStatus(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable applicationId: UUID,
        @RequestBody request: UpdateApplicationStatusRequest
    ): ResponseEntity<JobApplicationResponse> {
        val updated = recruiterDashboardService.updateApplicationStatus(userDetails.id, applicationId, request.status)
        return ResponseEntity.ok(updated)
    }
}
