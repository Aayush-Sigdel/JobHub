package com.example.jobhub.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.web.client.RestClient

@Configuration
class RestClientConfig {

    @Bean
    fun embeddingRestClient(props: EmbeddingApiProperties): RestClient {
        val requestFactory = SimpleClientHttpRequestFactory().apply {
            setConnectTimeout(3_000)
            setReadTimeout(15_000)
        }
        return RestClient.builder()
            .baseUrl(props.baseUrl)
            .requestFactory(requestFactory)
            .build()
    }
}