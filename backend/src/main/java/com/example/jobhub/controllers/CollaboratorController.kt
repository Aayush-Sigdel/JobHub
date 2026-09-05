package com.example.jobhub.controllers

import com.example.jobhub.dto.collaborator.CollaboratorMatchResponse
import com.example.jobhub.model.CollaboratorSource
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.CollaboratorService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/collaborators")
@PreAuthorize("hasRole('CANDIDATE')")
class CollaboratorController(
    private val collaboratorService: CollaboratorService
) {

    @GetMapping
    fun findCollaborators(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestParam(defaultValue = "OVERALL") source: CollaboratorSource,
        @RequestParam(required = false) location: String?,
        @RequestParam(defaultValue = "20") limit: Int
    ): ResponseEntity<List<CollaboratorMatchResponse>> {
        val matches = collaboratorService.findCollaborators(userDetails.id, source, location, limit)
        return ResponseEntity.ok(matches)
    }
}
