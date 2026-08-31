package com.example.jobhub.service

import com.example.jobhub.dto.*
import com.example.jobhub.dto.social.*
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.UserMapper
import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository,
    private val skillRepository: SkillRepository,
    private val experienceRepository: ExperienceRepository,
    private val educationRepository: EducationRepository,
    private val socialLinkRepository: SocialLinkRepository,
    private val userSocialSnapshotService: UserSocialSnapshotService,
    private val userEmbeddingService: UserEmbeddingService,
    private val userMapper: UserMapper
) {

    fun getUserProfile(userId: UUID): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        return userMapper.toUserProfileResponse(user)
    }

    fun getUserBasicInfo(userId: UUID): UserBasicInfoResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        return userMapper.toUserBasicInfoResponse(user)
    }

    @Transactional
    fun updateUserProfile(userId: UUID, updateRequest: UpdateUserProfileRequest): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

        updateRequest.name?.let { user.name = it }
        updateRequest.title?.let { user.title = it }
        updateRequest.bio?.let { user.bio = it }
        updateRequest.location?.let { user.location = it }
        updateRequest.imageUrl?.let { user.imageUrl = it }
        updateRequest.contactNumbers?.let { user.contactNumbers = it }

        updateRequest.skills?.forEach { skillRequest ->
            val skill = userMapper.toSkill(skillRequest, user)
            val savedSkill = skillRepository.save(skill)
            user.skills.add(savedSkill)
        }

        updateRequest.experiences?.forEach { experienceRequest ->
            val experience = userMapper.toExperience(experienceRequest, user)
            val savedExp = experienceRepository.save(experience)
            user.experiences.add(savedExp)
        }

        updateRequest.educations?.forEach { educationRequest ->
            val education = userMapper.toEducation(educationRequest, user)
            val savedEdu = educationRepository.save(education)
            user.educations.add(savedEdu)
        }

        updateRequest.socialLinks?.forEach { socialLinkRequest ->
            val socialLink = userMapper.toSocialLink(socialLinkRequest, user)
            val savedLink = socialLinkRepository.save(socialLink)
            user.socialLinks.add(savedLink)
        }

        user.isOnboardingCompleted = true
        userRepository.save(user)

        userEmbeddingService.syncAllEmbeddings(userId)

        val updatedUser = userRepository.findById(userId).orElse(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    @Transactional
    fun setUserTitle(userId: UUID, title: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        user.title = title
        val updatedUser = userRepository.save(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    @Transactional
    fun setUserBio(userId: UUID, bio: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        user.bio = bio
        val updatedUser = userRepository.save(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    @Transactional
    fun setUserLocation(userId: UUID, location: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        user.location = location
        val updatedUser = userRepository.save(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    fun setUserImage(userId: UUID, imageUrl: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        user.imageUrl = imageUrl
        val updatedUser = userRepository.save(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    fun addContactNumber(userId: UUID, contactNumber: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        if (!user.contactNumbers.contains(contactNumber)) {
            user.contactNumbers.add(contactNumber)
        }
        val updatedUser = userRepository.save(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    fun removeContactNumber(userId: UUID, contactNumber: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        user.contactNumbers.remove(contactNumber)
        val updatedUser = userRepository.save(user)
        return userMapper.toUserProfileResponse(updatedUser)
    }

    @Transactional
    fun addSkill(userId: UUID, createSkillRequest: CreateSkillRequest): SkillDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        val skill = userMapper.toSkill(createSkillRequest, user)
        val savedSkill = skillRepository.save(skill)
        user.skills.add(savedSkill)
        userRepository.save(user)
        return userMapper.toSkillDto(savedSkill)
    }

    @Transactional
    fun updateSkill(userId: UUID, skillId: UUID, updateSkillRequest: UpdateSkillRequest): SkillDto {
        val skill = skillRepository.findByIdAndUserId(skillId, userId)
            ?: throw ApiException("Skill not found", HttpStatus.NOT_FOUND)
        updateSkillRequest.name?.let { skill.name = it }
        updateSkillRequest.level?.let { skill.level = it }
        val updatedSkill = skillRepository.save(skill)
        return userMapper.toSkillDto(updatedSkill)
    }

    @Transactional
    fun deleteSkill(userId: UUID, skillId: UUID) {
        val skill = skillRepository.findByIdAndUserId(skillId, userId)
            ?: throw ApiException("Skill not found", HttpStatus.NOT_FOUND)
        skillRepository.delete(skill)
        userRepository.findById(userId).ifPresent { user ->
            user.skills.removeIf { it.id == skillId }
            userRepository.save(user)
        }
    }

    @Transactional
    fun addExperience(userId: UUID, createExperienceRequest: CreateExperienceRequest): ExperienceDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        val experience = userMapper.toExperience(createExperienceRequest, user)
        val savedExperience = experienceRepository.save(experience)
        user.experiences.add(savedExperience)
        userRepository.save(user)
        return userMapper.toExperienceDto(savedExperience)
    }

    @Transactional
    fun updateExperience(userId: UUID, experienceId: UUID, updateExperienceRequest: UpdateExperienceRequest): ExperienceDto {
        val experience = experienceRepository.findByIdAndUserId(experienceId, userId)
            ?: throw ApiException("Experience not found", HttpStatus.NOT_FOUND)
        updateExperienceRequest.title?.let { experience.title = it }
        updateExperienceRequest.company?.let { experience.company = it }
        updateExperienceRequest.startDate?.let { experience.startDate = it }
        updateExperienceRequest.endDate?.let { experience.endDate = it }
        updateExperienceRequest.isCurrentRole?.let { experience.isCurrentRole = it }
        updateExperienceRequest.description?.let { experience.description = it }
        val updatedExperience = experienceRepository.save(experience)
        return userMapper.toExperienceDto(updatedExperience)
    }

    @Transactional
    fun deleteExperience(userId: UUID, experienceId: UUID) {
        val experience = experienceRepository.findByIdAndUserId(experienceId, userId)
            ?: throw ApiException("Experience not found", HttpStatus.NOT_FOUND)
        experienceRepository.delete(experience)
        userRepository.findById(userId).ifPresent { user ->
            user.experiences.removeIf { it.id == experienceId }
            userRepository.save(user)
        }
    }

    @Transactional
    fun addEducation(userId: UUID, createEducationRequest: CreateEducationRequest): EducationDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        val education = userMapper.toEducation(createEducationRequest, user)
        val savedEducation = educationRepository.save(education)
        user.educations.add(savedEducation)
        userRepository.save(user)
        return userMapper.toEducationDto(savedEducation)
    }

    @Transactional
    fun updateEducation(userId: UUID, educationId: UUID, updateEducationRequest: UpdateEducationRequest): EducationDto {
        val education = educationRepository.findByIdAndUserId(educationId, userId)
            ?: throw ApiException("Education not found", HttpStatus.NOT_FOUND)
        updateEducationRequest.institution?.let { education.institution = it }
        updateEducationRequest.degree?.let { education.degree = it }
        updateEducationRequest.fieldOfStudy?.let { education.fieldOfStudy = it }
        updateEducationRequest.startDate?.let { education.startDate = it }
        updateEducationRequest.endDate?.let { education.endDate = it }
        updateEducationRequest.description?.let { education.description = it }
        val updatedEducation = educationRepository.save(education)
        return userMapper.toEducationDto(updatedEducation)
    }

    @Transactional
    fun deleteEducation(userId: UUID, educationId: UUID) {
        val education = educationRepository.findByIdAndUserId(educationId, userId)
            ?: throw ApiException("Education not found", HttpStatus.NOT_FOUND)
        educationRepository.delete(education)
        userRepository.findById(userId).ifPresent { user ->
            user.educations.removeIf { it.id == educationId }
            userRepository.save(user)
        }
    }

    fun addSocialLink(userId: UUID, createSocialLinkRequest: CreateSocialLinkRequest): SocialLinkDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }
        val socialLink = userMapper.toSocialLink(createSocialLinkRequest, user)
        val savedSocialLink = socialLinkRepository.save(socialLink)

        savedSocialLink.platform?.let { platform ->
            savedSocialLink.url?.let { url ->
                userEmbeddingService.syncSocialPlatform(userId, platform, url)
            }
        }

        return userMapper.toSocialLinkDto(savedSocialLink)
    }

    fun updateSocialLink(userId: UUID, socialLinkId: UUID, updateSocialLinkRequest: UpdateSocialLinkRequest): SocialLinkDto {
        val socialLink = socialLinkRepository.findByIdAndUserId(socialLinkId, userId)
            ?: throw ApiException("Social link not found", HttpStatus.NOT_FOUND)
        updateSocialLinkRequest.platform?.let { socialLink.platform = it }
        updateSocialLinkRequest.url?.let { socialLink.url = it }
        val updatedSocialLink = socialLinkRepository.save(socialLink)

        updatedSocialLink.platform?.let { platform ->
            updatedSocialLink.url?.let { url ->
                userEmbeddingService.syncSocialPlatform(userId, platform, url)
            }
        }

        return userMapper.toSocialLinkDto(updatedSocialLink)
    }

    fun deleteSocialLink(userId: UUID, socialLinkId: UUID) {
        val socialLink = socialLinkRepository.findByIdAndUserId(socialLinkId, userId)
            ?: throw ApiException("Social link not found", HttpStatus.NOT_FOUND)
        val platform = socialLink.platform
        socialLinkRepository.delete(socialLink)
        if (platform != null) {
            userSocialSnapshotService.delete(userId, platform)
        }
    }

    fun syncAllEmbeddings(userId: UUID): UserEmbeddingSyncResponse {
        return userEmbeddingService.syncAllEmbeddings(userId)
    }

    fun syncPlatformEmbedding(userId: UUID): PlatformEmbeddingSyncResult {
        return userEmbeddingService.syncPlatformEmbedding(userId)
    }

    fun syncEmbeddingSource(userId: UUID, source: EmbeddingSource): EmbeddingSyncResult {
        return userEmbeddingService.syncEmbeddingSource(userId, source)
    }
}
