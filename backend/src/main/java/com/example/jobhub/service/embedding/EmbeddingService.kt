package com.example.jobhub.service.embedding

import com.example.jobhub.service.social.SocialType

interface EmbeddingService<T> {

    suspend fun generateEmbeddings(source: T): FloatArray

    fun getType(): SocialType
}