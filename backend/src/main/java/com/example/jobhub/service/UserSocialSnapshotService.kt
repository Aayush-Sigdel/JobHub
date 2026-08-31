package com.example.jobhub.service

import com.example.jobhub.model.SocialPlatform
import com.example.jobhub.model.UserSocialSnapshot
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.repository.UserSocialSnapshotRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserSocialSnapshotService(
    private val snapshotRepository: UserSocialSnapshotRepository,
    private val userRepository: UserRepository
) {

    fun save(userId: UUID, platform: SocialPlatform, data: String): UserSocialSnapshot {
        val snapshot = snapshotRepository
            .findByUserIdAndPlatform(userId, platform)
            .orElseGet {
                val user = userRepository.findById(userId)
                    .orElseThrow {
                        IllegalArgumentException("User not found: $userId")
                    }
                UserSocialSnapshot.builder()
                    .user(user)
                    .platform(platform)
                    .build()
            }
        snapshot.data = data
        return snapshotRepository.save(snapshot)
    }

    fun find(userId: UUID, platform: SocialPlatform): UserSocialSnapshot? {
        return snapshotRepository
            .findByUserIdAndPlatform(userId, platform)
            .orElse(null)
    }

    fun findByUserId(userId: UUID): List<UserSocialSnapshot> {
        return snapshotRepository.findByUserId(userId)
    }

    fun findByUserIds(userIds: Collection<UUID>): List<UserSocialSnapshot> {
        if (userIds.isEmpty()) return emptyList()
        return snapshotRepository.findByUserIdIn(userIds)
    }

    fun delete(userId: UUID, platform: SocialPlatform) {
        snapshotRepository.deleteByUserIdAndPlatform(
            userId,
            platform
        )
    }
}