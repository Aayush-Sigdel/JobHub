package com.example.jobhub.dto

import java.util.UUID

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val id: UUID,
    val email: String,
    val name: String,
    val isVerified: Boolean,
    val imageUrl: String
)
