package com.example.jobhub.repository

import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.UserSocialSnapshot
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface UserSocialSnapshotRepository: JpaRepository<UserSocialSnapshot, UUID> {

    fun findByUserIdAndPlatform(userId: UUID, platform: SocialPlatform): Optional<UserSocialSnapshot>

    fun findByUserId(userId: UUID): List<UserSocialSnapshot>

    fun findByUserIdIn(userIds: Collection<UUID>): List<UserSocialSnapshot>

    fun deleteByUserIdAndPlatform(userId: UUID, platform: SocialPlatform)
}