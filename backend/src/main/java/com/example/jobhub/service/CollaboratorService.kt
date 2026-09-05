package com.example.jobhub.service

import com.example.jobhub.dto.collaborator.CollaboratorMatchResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.UserMapper
import com.example.jobhub.model.CollaboratorSource
import com.example.jobhub.model.User
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.embedding.EmbeddingAggregator
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CollaboratorService(
    private val userRepository: UserRepository,
    private val userMapper: UserMapper
) {

    companion object {
        private const val MIN_LIMIT = 1
        private const val MAX_LIMIT = 50
    }

    @Transactional(readOnly = true)
    fun findCollaborators(
        userId: UUID,
        source: CollaboratorSource,
        location: String?,
        limit: Int
    ): List<CollaboratorMatchResponse> {
        val me = userRepository.findById(userId)
            .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

        val reference = referenceVector(me, source)
            ?: throw ApiException(
                "No ${source.name} embedding found on your profile. " +
                    "Sync it first via POST /api/user/embedding/sync",
                HttpStatus.CONFLICT
            )

        val hits = userRepository.searchCollaborators(
            source = source,
            queryVector = EmbeddingAggregator.toPgVector(reference),
            excludeUserId = userId,
            location = location,
            limit = limit.coerceIn(MIN_LIMIT, MAX_LIMIT)
        )
        if (hits.isEmpty()) return emptyList()

        val usersById = userRepository.findAllWithSkillsByIdIn(hits.map { it.userId })
            .associateBy { it.id }

        // The fetch join returns rows in arbitrary order, so re-apply the ranking Postgres produced.
        return hits.mapNotNull { hit ->
            usersById[hit.userId]?.let { user ->
                userMapper.toCollaboratorMatchResponse(user, hit.similarity, source)
            }
        }
    }

    private fun referenceVector(user: User, source: CollaboratorSource): FloatArray? {
        val stored = when (source) {
            CollaboratorSource.PLATFORM -> user.platformEmbedding
            CollaboratorSource.GITHUB -> user.githubEmbedding
            CollaboratorSource.DEVTO -> user.devtoEmbedding
            CollaboratorSource.STACKOVERFLOW -> user.stackoverflowEmbedding
            CollaboratorSource.ORCID -> user.orcidEmbedding
            CollaboratorSource.OVERALL -> user.overallEmbedding
        }
        return stored?.takeIf { it.isNotEmpty() }
    }
}
