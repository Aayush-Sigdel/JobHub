package com.example.jobhub.controllers

import com.example.jobhub.dto.collab.*
import com.example.jobhub.model.collab.ProjectStatus
import com.example.jobhub.model.job.WorkplaceType
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.collab.CollabMatchingService
import com.example.jobhub.service.collab.CollabProjectService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/collab/projects")
@PreAuthorize("hasRole('CANDIDATE')")
class CollabProjectController(
    private val collabProjectService: CollabProjectService,
    private val collabMatchingService: CollabMatchingService
) {

    @PostMapping
    fun createProject(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @Valid @RequestBody request: CreateCollabProjectRequest
    ): ResponseEntity<CollabProjectResponse> {
        val response = collabProjectService.createProject(userDetails.id, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PutMapping("/{projectId}")
    fun updateProject(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: UpdateCollabProjectRequest
    ): ResponseEntity<CollabProjectResponse> =
        ResponseEntity.ok(collabProjectService.updateProject(userDetails.id, projectId, request))

    @PatchMapping("/{projectId}/status")
    fun updateStatus(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: UpdateProjectStatusRequest
    ): ResponseEntity<CollabProjectResponse> =
        ResponseEntity.ok(collabProjectService.updateStatus(userDetails.id, projectId, request.status))

    @DeleteMapping("/{projectId}")
    fun deleteProject(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID
    ): ResponseEntity<Void> {
        collabProjectService.deleteProject(userDetails.id, projectId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    fun searchProjects(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) status: ProjectStatus?,
        @RequestParam(required = false) workplaceType: WorkplaceType?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) maxCommitmentHours: Int?
    ): ResponseEntity<List<CollabProjectResponse>> =
        ResponseEntity.ok(
            collabProjectService.searchProjects(query, status, workplaceType, location, maxCommitmentHours)
        )

    @GetMapping("/mine")
    fun getMyProjects(
        @AuthenticationPrincipal userDetails: UserPrincipal
    ): ResponseEntity<List<CollabProjectResponse>> =
        ResponseEntity.ok(collabProjectService.getMyProjects(userDetails.id))

    @GetMapping("/for-me")
    fun getProjectsForMe(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestParam(defaultValue = "20") limit: Int
    ): ResponseEntity<List<ProjectSuggestionResponse>> =
        ResponseEntity.ok(collabMatchingService.suggestProjectsForUser(userDetails.id, limit))

    @GetMapping("/{projectId}")
    fun getProjectDetail(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID
    ): ResponseEntity<CollabProjectDetailResponse> =
        ResponseEntity.ok(collabProjectService.getProjectDetail(projectId, userDetails.id))

    @GetMapping("/{projectId}/suggestions")
    fun getSquadSuggestions(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID,
        @RequestParam(required = false) poolSize: Int?,
        @RequestParam(required = false) shortlistSize: Int?,
        @RequestParam(required = false) location: String?
    ): ResponseEntity<SquadSuggestionResponse> =
        ResponseEntity.ok(
            collabMatchingService.suggestSquad(
                projectId = projectId,
                requesterId = userDetails.id,
                poolSize = poolSize,
                shortlistSize = shortlistSize,
                location = location
            )
        )
}
