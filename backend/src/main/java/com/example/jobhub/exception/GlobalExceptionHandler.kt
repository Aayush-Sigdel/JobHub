package com.example.jobhub.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException): ResponseEntity<ErrorResponse> {
        val body = ErrorResponse(
            status = ex.status.value(),
            error = ex.status.reasonPhrase,
            message = ex.message
        )
        return ResponseEntity.status(ex.status).body(body)
    }
}