package com.example.jobhub.exception

import org.springframework.http.HttpStatus

class ApiException(
    message: String,
    val status: HttpStatus = HttpStatus.BAD_REQUEST
) : RuntimeException(message)