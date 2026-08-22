package com.example.jobhub.dto

import java.util.UUID

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val id: UUID,
    val name: String,
    val imageUrl: String,
    val onboardingCompleted: Boolean
)
