package com.example.jobhub.controllers

import com.example.jobhub.dto.LoginRequest
import com.example.jobhub.dto.LoginResponse
import com.example.jobhub.dto.LogoutRequest
import com.example.jobhub.dto.RefreshRequest
import com.example.jobhub.dto.RegisterRequest
import com.example.jobhub.dto.RefreshResponse
import com.example.jobhub.dto.VerifyOtpRequest
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<String> {
        authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful. Please verify your email.");
    }

    @PostMapping("/verify-otp")
    fun verifyOtp(@RequestBody request: VerifyOtpRequest): ResponseEntity<String> {
        authService.verifyOtp(request)
        return ResponseEntity.ok("Email verified successfully.")
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val loginResponse = authService.login(request)
        return ResponseEntity.ok(loginResponse)
    }

    @PostMapping("/refresh")
    fun refresh(@RequestBody request: RefreshRequest): ResponseEntity<RefreshResponse> {
        val token = authService.refresh(request)
        return ResponseEntity.ok(token)
    }

    @PostMapping("/logout")
    fun logout(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @RequestBody request: LogoutRequest
    ): ResponseEntity<String> {

        authService.logout(userDetails.username, request)
        return ResponseEntity.ok("Logged out successfully.")
    }
}