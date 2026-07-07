package com.example.jobhub.dto

data class UserBasicInfoResponse(
    val id: String,
    val name: String,
    val email: String,
    val title: String?,
    val imageUrl: String?
)
