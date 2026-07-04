package com.example.jobhub.dto

data class RegisterRequest(
    var email: String,
    var name: String,
    var password: String,
    var employer: Boolean
)
