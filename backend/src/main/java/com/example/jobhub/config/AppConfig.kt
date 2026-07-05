package com.example.jobhub.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
class AppConfig(
    val defaultImageUrl: String
)
