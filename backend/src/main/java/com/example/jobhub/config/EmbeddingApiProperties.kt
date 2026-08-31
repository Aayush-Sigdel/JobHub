package com.example.jobhub.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "services.embedding-api")
data class EmbeddingApiProperties(val baseUrl: String)
