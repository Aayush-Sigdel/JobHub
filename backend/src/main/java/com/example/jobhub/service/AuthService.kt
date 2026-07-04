package com.example.jobhub.service

import com.example.jobhub.dto.LoginRequest
import com.example.jobhub.dto.LogoutRequest
import com.example.jobhub.dto.RefreshRequest
import com.example.jobhub.dto.RegisterRequest
import com.example.jobhub.dto.TokenResponse
import com.example.jobhub.dto.VerifyOtpRequest
import com.example.jobhub.exception.ApiException
import com.example.jobhub.model.User
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.util.AuthUtil
import com.example.jobhub.util.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val otpService: OtpService,
    private val authUtil: AuthUtil,
    private val jwtUtil: JwtUtil,
    private val refreshTokenService: RefreshTokenService
){

    fun registerUser(registerRequest: RegisterRequest) {
        val existingUser = userRepository.findByEmail(registerRequest.email)
        if (existingUser != null) throw ApiException("User already exists with given email '${existingUser.email}'")

        if (!authUtil.isPasswordValid(registerRequest.password)) throw RuntimeException("Password format is invalid")
        val passwordHash = authUtil.hashPassword(registerRequest.password)
            ?: throw ApiException("Error while processing password")
        val user = User(registerRequest.email, registerRequest.name, passwordHash, registerRequest.employer)
        userRepository.save(user)
        createAndSendOtp(registerRequest.email);
    }

    fun createAndSendOtp(email: String) {
        if (!otpService.canRequestOtp(email)) {
            throw ApiException("Please wait before requesting another OTP")
        }
        val otp = authUtil.generateOTP(6)
        otpService.saveOtp(email, otp)
        emailService.sendEmail(
            arrayOf(email),
            "TechHub Email Verification Code",
            otp
        )
    }

    fun verifyOtp(verifyRequest: VerifyOtpRequest) {
        val user = userRepository.findByEmail(verifyRequest.email)
            ?: throw ApiException("User not found")
        if (!otpService.verifyOtp(verifyRequest.email, verifyRequest.otp)) {
            throw ApiException("Invalid or expired OTP")
        }
        user.isVerified = true
        userRepository.save(user)
    }

    fun login(request: LoginRequest): TokenResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED)

        if (!authUtil.matchesPassword(request.password, user.password)) {
            throw ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED)
        }
        if (!user.isVerified) {
            throw ApiException("Please verify your email before logging in", HttpStatus.FORBIDDEN)
        }
        val accessToken = jwtUtil.generateAccessToken(user.id.toString())
        val refreshToken = jwtUtil.generateRefreshToken(user.id.toString())
        refreshTokenService.save(user.id.toString(), refreshToken, jwtUtil.getRefreshTokenExpiryMs())
        return TokenResponse(accessToken, refreshToken)
    }

    fun refresh(request: RefreshRequest): TokenResponse {
        val userId = jwtUtil.extractUserId(request.refreshToken)
        if (!refreshTokenService.isValid(userId, request.refreshToken)) {
            throw ApiException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED)
        }
        val newAccessToken = jwtUtil.generateAccessToken(userId)
        val newRefreshToken = jwtUtil.generateRefreshToken(userId)
        refreshTokenService.save(userId, newRefreshToken, jwtUtil.getRefreshTokenExpiryMs())

        return TokenResponse(newAccessToken, newRefreshToken)
    }

    fun logout(request: LogoutRequest) {
        val userId = jwtUtil.extractUserId(request.refreshToken)
        refreshTokenService.revoke(userId)
    }
}