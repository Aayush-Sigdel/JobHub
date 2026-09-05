package com.example.jobhub.dto

import java.time.Instant
import java.util.UUID

data class UserProfileResponse(
    val id: UUID,
    val name: String,
    val email: String,
    val title: String?,
    val bio: String?,
    val location: String?,
    val imageUrl: String?,
    val employer: Boolean,
    val isVerified: Boolean,
    val onboardingCompleted: Boolean,
    val discoverable: Boolean,
    val contactNumbers: List<String>,
    val skills: List<SkillDto>,
    val experiences: List<ExperienceDto>,
    val educations: List<EducationDto>,
    val socialLinks: List<SocialLinkDto>,
    val createdAt: Instant,
    val updatedAt: Instant
)
