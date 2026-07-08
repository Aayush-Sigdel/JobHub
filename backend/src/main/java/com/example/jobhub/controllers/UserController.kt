package com.example.jobhub.controllers

import com.example.jobhub.dto.CreateEducationRequest
import com.example.jobhub.dto.CreateExperienceRequest
import com.example.jobhub.dto.CreateSkillRequest
import com.example.jobhub.dto.CreateSocialLinkRequest
import com.example.jobhub.dto.EducationDto
import com.example.jobhub.dto.ExperienceDto
import com.example.jobhub.dto.SkillDto
import com.example.jobhub.dto.SocialLinkDto
import com.example.jobhub.dto.UpdateEducationRequest
import com.example.jobhub.dto.UpdateExperienceRequest
import com.example.jobhub.dto.UpdateSkillRequest
import com.example.jobhub.dto.UpdateSocialLinkRequest
import com.example.jobhub.dto.UpdateUserProfileRequest
import com.example.jobhub.dto.UserBasicInfoResponse
import com.example.jobhub.dto.UserProfileResponse
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/profile")
    fun getCurrentUserProfile(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<UserProfileResponse> {
        val profile = userService.getUserProfile(userDetails.id)
        return ResponseEntity.ok(profile)
    }

    @GetMapping("/profile/{userId}")
    fun getUserProfileById(@PathVariable userId: UUID): ResponseEntity<UserProfileResponse> {
        val profile = userService.getUserProfile(userId)
        return ResponseEntity.ok(profile)
    }

    @GetMapping("/basic-info")
    fun getCurrentUserBasicInfo(@AuthenticationPrincipal userDetails: UserPrincipal): ResponseEntity<UserBasicInfoResponse> {
        val basicInfo = userService.getUserBasicInfo(userDetails.id)
        return ResponseEntity.ok(basicInfo)
    }

    @GetMapping("/basic-info/{userId}")
    fun getUserBasicInfo(@PathVariable userId: UUID): ResponseEntity<UserBasicInfoResponse> {
        val basicInfo = userService.getUserBasicInfo(userId)
        return ResponseEntity.ok(basicInfo)
    }

    @PutMapping("/profile")
    fun updateUserProfile(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody updateRequest: UpdateUserProfileRequest
    ): ResponseEntity<UserProfileResponse> {
        val updatedProfile = userService.updateUserProfile(userDetails.id, updateRequest)
        return ResponseEntity.ok(updatedProfile)
    }

    @PutMapping("/profile/title")
    fun setUserTitle(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<UserProfileResponse> {
        val title = request["title"] ?: throw IllegalArgumentException("Title is required")
        val updatedProfile = userService.setUserTitle(userDetails.id, title)
        return ResponseEntity.ok(updatedProfile)
    }

    @PutMapping("/profile/bio")
    fun settUserBio(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<UserProfileResponse> {
        val bio = request["bio"] ?: throw IllegalArgumentException("Bio is required")
        val updatedProfile = userService.setUserBio(userDetails.id, bio)
        return ResponseEntity.ok(updatedProfile)
    }

    @PutMapping("/profile/location")
    fun setUserLocation(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<UserProfileResponse> {
        val location = request["location"] ?: throw IllegalArgumentException("Location is required")
        val updatedProfile = userService.setUserLocation(userDetails.id, location)
        return ResponseEntity.ok(updatedProfile)
    }

    @PutMapping("/profile/image")
    fun setUserImage(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<UserProfileResponse> {
        val imageUrl = request["imageUrl"] ?: throw IllegalArgumentException("Image URL is required")
        val updatedProfile = userService.setUserImage(userDetails.id, imageUrl)
        return ResponseEntity.ok(updatedProfile)
    }

    @PostMapping("/profile/contact-number")
    fun addUserContactNumber(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<UserProfileResponse> {
        val contactNumber = request["contactNumber"] ?: throw IllegalArgumentException("Contact number is required")
        val updatedProfile = userService.addContactNumber(userDetails.id, contactNumber)
        return ResponseEntity.status(HttpStatus.CREATED).body(updatedProfile)
    }

    @DeleteMapping("/profile/contact-number")
    fun deleteUserContactNumber(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<UserProfileResponse> {
        val contactNumber = request["contactNumber"] ?: throw IllegalArgumentException("Contact number is required")
        val updatedProfile = userService.removeContactNumber(userDetails.id, contactNumber)
        return ResponseEntity.ok(updatedProfile)
    }

    @PostMapping("/profile/skills")
    fun addSkill(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody createSkillRequest: CreateSkillRequest
    ): ResponseEntity<SkillDto> {
        val skill = userService.addSkill(userDetails.id, createSkillRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(skill)
    }

    @PutMapping("/profile/skills/{skillId}")
    fun updateUserSkill(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable skillId: UUID,
        @RequestBody updateSkillRequest: UpdateSkillRequest
    ): ResponseEntity<SkillDto> {
        val skill = userService.updateSkill(userDetails.id, skillId, updateSkillRequest)
        return ResponseEntity.ok(skill)
    }

    @DeleteMapping("/profile/skills/{skillId}")
    fun deleteUserSkill(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable skillId: UUID
    ): ResponseEntity<Void> {
        userService.deleteSkill(userDetails.id, skillId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/profile/experiences")
    fun addExperience(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody createExperienceRequest: CreateExperienceRequest
    ): ResponseEntity<ExperienceDto> {
        val experience = userService.addExperience(userDetails.id, createExperienceRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(experience)
    }

    @PutMapping("/profile/experiences/{experienceId}")
    fun updateUserExperience(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable experienceId: UUID,
        @RequestBody updateExperienceRequest: UpdateExperienceRequest
    ): ResponseEntity<ExperienceDto> {
        val experience = userService.updateExperience(userDetails.id, experienceId, updateExperienceRequest)
        return ResponseEntity.ok(experience)
    }

    @DeleteMapping("/profile/experiences/{experienceId}")
    fun deleteUserExperience(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable experienceId: UUID
    ): ResponseEntity<Void> {
        userService.deleteExperience(userDetails.id, experienceId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/profile/educations")
    fun addEducation(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody createEducationRequest: CreateEducationRequest
    ): ResponseEntity<EducationDto> {
        val education = userService.addEducation(userDetails.id, createEducationRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(education)
    }

    @PutMapping("/profile/educations/{educationId}")
    fun updateUserEducation(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable educationId: UUID,
        @RequestBody updateEducationRequest: UpdateEducationRequest
    ): ResponseEntity<EducationDto> {
        val education = userService.updateEducation(userDetails.id, educationId, updateEducationRequest)
        return ResponseEntity.ok(education)
    }

    @DeleteMapping("/profile/educations/{educationId}")
    fun deleteUserEducation(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable educationId: UUID
    ): ResponseEntity<Void> {
        userService.deleteEducation(userDetails.id, educationId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/profile/social-links")
    fun addSocialLink(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody createSocialLinkRequest: CreateSocialLinkRequest
    ): ResponseEntity<SocialLinkDto> {
        val socialLink = userService.addSocialLink(userDetails.id, createSocialLinkRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(socialLink)
    }

    @PutMapping("/profile/social-links/{socialLinkId}")
    fun updateUserSocialLink(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable socialLinkId: UUID,
        @RequestBody updateSocialLinkRequest: UpdateSocialLinkRequest
    ): ResponseEntity<SocialLinkDto> {
        val socialLink = userService.updateSocialLink(userDetails.id, socialLinkId, updateSocialLinkRequest)
        return ResponseEntity.ok(socialLink)
    }

    @DeleteMapping("/profile/social-links/{socialLinkId}")
    fun deleteSocialLink(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable socialLinkId: UUID
    ): ResponseEntity<Void> {
        userService.deleteSocialLink(userDetails.id, socialLinkId)
        return ResponseEntity.noContent().build()
    }

}
