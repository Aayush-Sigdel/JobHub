package com.example.jobhub.client

import com.example.jobhub.dto.EmbeddingRequest
import com.example.jobhub.dto.EmbeddingResponse
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.body

@Component
class EmbeddingApiClient(
    @param:Qualifier("embeddingRestClient") private val restClient: RestClient
) {

    fun embed(text: String): FloatArray {
        val response = restClient.post()
            .uri("/embed")
            .body(EmbeddingRequest(text))
            .retrieve()
            .body<EmbeddingResponse>()
            ?: throw IllegalStateException("Embedding API returned an empty response")

        return response.embedding
    }
}