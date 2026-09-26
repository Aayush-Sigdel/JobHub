package com.example.jobhub.mapper

import com.example.jobhub.dto.*
import com.example.jobhub.model.*
import org.springframework.stereotype.Component

@Component
class UserMapper {

    fun toUserProfileResponse(user: User) = UserProfileResponse(
        id = user.id,
        name = user.name,
        email = user.email,
        title = user.title,
        bio = user.bio,
        location = user.location,
        imageUrl = user.imageUrl,
        employer = user.isEmployer,
        isVerified = user.isVerified,
        onboardingCompleted = user.isOnboardingCompleted,
        discoverable = user.isDiscoverable,
        contactNumbers = user.contactNumbers,
        skills = user.skills.map { toSkillDto(it) },
        experiences = user.experiences.map { toExperienceDto(it) },
        educations = user.educations.map { toEducationDto(it) },
        socialLinks = user.socialLinks.map { toSocialLinkDto(it) },
        createdAt = user.createdAt,
        updatedAt = user.updatedAt
    )

    fun toUserBasicInfoResponse(user: User) = UserBasicInfoResponse(
        id = user.id.toString(),
        name = user.name,
        email = user.email,
        title = user.title,
        imageUrl = user.imageUrl,
        onboardingCompleted = user.isOnboardingCompleted
    )

    fun toSkillDto(skill: Skill) = SkillDto(
        id = skill.id,
        name = skill.name,
        level = skill.level
    )

    fun toExperienceDto(experience: Experience) = ExperienceDto(
        id = experience.id,
        title = experience.title,
        company = experience.company,
        startDate = experience.startDate,
        endDate = experience.endDate,
        isCurrentRole = experience.isCurrentRole,
        description = experience.description
    )

    fun toEducationDto(education: Education) = EducationDto(
        id = education.id,
        institution = education.institution,
        degree = education.degree,
        fieldOfStudy = education.fieldOfStudy,
        startDate = education.startDate,
        endDate = education.endDate,
        description = education.description
    )

    fun toSocialLinkDto(socialLink: SocialLink) = SocialLinkDto(
        id = socialLink.id,
        platform = socialLink.platform,
        url = socialLink.url
    )

    fun toSkill(request: CreateSkillRequest, user: User) =
        Skill().apply {
            name = request.name
            level = request.level
            this.user = user
        }

    fun toExperience(request: CreateExperienceRequest, user: User) =
        Experience().apply {
            title = request.title
            company = request.company
            startDate = request.startDate
            endDate = request.endDate
            isCurrentRole = request.isCurrentRole
            description = request.description
            this.user = user
        }

    fun toEducation(request: CreateEducationRequest, user: User) =
        Education().apply {
            institution = request.institution
            degree = request.degree
            fieldOfStudy = request.fieldOfStudy
            startDate = request.startDate
            endDate = request.endDate
            description = request.description
            this.user = user
        }

    fun toSocialLink(request: CreateSocialLinkRequest, user: User) =
        SocialLink().apply {
            platform = request.platform
            url = request.url
            this.user = user
        }
}