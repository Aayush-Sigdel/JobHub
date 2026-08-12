package com.example.jobhub.service.embedding

import com.example.jobhub.dto.OrcidProfile
import com.example.jobhub.service.social.SocialType
import org.springframework.stereotype.Service

@Service
class OrcidEmbeddingService: EmbeddingService<OrcidProfile> {

    override suspend fun generateEmbeddings(source: OrcidProfile): FloatArray {
        TODO("Not yet implemented")
    }

    override fun getType(): SocialType {
        return SocialType.ORCID
    }
}