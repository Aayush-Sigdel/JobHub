package com.example.jobhub.service.embedding

import com.example.jobhub.model.SocialPlatform

interface EmbeddingService<T> {

    suspend fun generateEmbeddings(source: T): FloatArray

    fun getType(): SocialPlatform
}