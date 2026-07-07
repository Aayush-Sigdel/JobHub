package com.example.jobhub.dto

import com.example.jobhub.model.SocialPlatform
import java.util.UUID

data class SocialLinkDto(
    val id: UUID?,
    val platform: SocialPlatform,
    val url: String
)

data class CreateSocialLinkRequest(
    val platform: SocialPlatform,
    val url: String
)

data class UpdateSocialLinkRequest(
    val platform: SocialPlatform?,
    val url: String?
)
