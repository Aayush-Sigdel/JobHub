package com.example.jobhub.dto

data class UpdateUserProfileRequest(
    val name: String?,
    val title: String?,
    val bio: String?,
    val location: String?,
    val imageUrl: String?,
    val contactNumbers: List<String>?,
    val skills: List<CreateSkillRequest>?,
    val experiences: List<CreateExperienceRequest>?,
    val educations: List<CreateEducationRequest>?,
    val socialLinks: List<CreateSocialLinkRequest>?
)
