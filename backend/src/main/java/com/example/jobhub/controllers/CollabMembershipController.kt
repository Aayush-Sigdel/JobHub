package com.example.jobhub.controllers

import com.example.jobhub.dto.collab.InviteMemberRequest
import com.example.jobhub.dto.collab.MembershipResponse
import com.example.jobhub.dto.collab.RequestToJoinRequest
import com.example.jobhub.dto.collab.UpdateMembershipRequest
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.collab.CollabMembershipService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/collab")
@PreAuthorize("hasRole('CANDIDATE')")
class CollabMembershipController(
    private val collabMembershipService: CollabMembershipService
) {

    @PostMapping("/projects/{projectId}/invite")
    fun invite(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: InviteMemberRequest
    ): ResponseEntity<MembershipResponse> {
        val response = collabMembershipService.invite(userDetails.id, projectId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping("/projects/{projectId}/request")
    fun requestToJoin(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: RequestToJoinRequest
    ): ResponseEntity<MembershipResponse> {
        val response = collabMembershipService.requestToJoin(userDetails.id, projectId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PatchMapping("/memberships/{membershipId}")
    fun updateMembership(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable membershipId: UUID,
        @Valid @RequestBody request: UpdateMembershipRequest
    ): ResponseEntity<MembershipResponse> =
        ResponseEntity.ok(
            collabMembershipService.updateMembership(userDetails.id, membershipId, request.action)
        )

    @GetMapping("/projects/{projectId}/memberships")
    fun getProjectMemberships(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable projectId: UUID
    ): ResponseEntity<List<MembershipResponse>> =
        ResponseEntity.ok(collabMembershipService.getProjectMemberships(userDetails.id, projectId))

    @GetMapping("/memberships/mine")
    fun getMyMemberships(
        @AuthenticationPrincipal userDetails: UserPrincipal
    ): ResponseEntity<List<MembershipResponse>> =
        ResponseEntity.ok(collabMembershipService.getMyMemberships(userDetails.id))
}
