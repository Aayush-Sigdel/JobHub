package com.example.jobhub.exception

import java.time.Instant

data class ErrorResponse(
    val timestamp: Instant = Instant.now(),
    val status: Int,
    val error: String,
    val message: String?
)