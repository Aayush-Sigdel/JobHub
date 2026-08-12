package com.example.jobhub.service.embedding

import com.example.jobhub.dto.Portfolio
import com.example.jobhub.service.social.SocialType
import org.springframework.stereotype.Service

@Service
class PortfolioEmbeddingService: EmbeddingService<Portfolio> {

    override suspend fun generateEmbeddings(source: Portfolio): FloatArray {
        TODO("Not yet implemented")
    }

    override fun getType(): SocialType {
        return SocialType.PORTFOLIO
    }
}