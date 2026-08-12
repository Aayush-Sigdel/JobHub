package com.example.jobhub.service.embedding

import com.example.jobhub.dto.GithubUserDto
import com.example.jobhub.service.social.SocialType
import org.springframework.stereotype.Service

@Service
class GithubEmbeddingService: EmbeddingService<GithubUserDto> {

    override suspend fun generateEmbeddings(source: GithubUserDto): FloatArray {
        TODO("Not yet implemented")
    }

    override fun getType(): SocialType {
        return SocialType.GITHUB
    }
}