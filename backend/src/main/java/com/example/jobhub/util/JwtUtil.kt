package com.example.jobhub.util

import com.example.jobhub.exception.ApiException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") secret: String,
    @param:Value("\${jwt.access-token-expiry-ms}") private val accessTokenExpiryMs: Long,
    @param:Value("\${jwt.refresh-token-expiry-ms}") private val refreshTokenExpiryMs: Long,
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateAccessToken(userId: String): String = generateToken(userId, accessTokenExpiryMs)

    fun generateRefreshToken(userId: String): String = generateToken(userId, refreshTokenExpiryMs)

    fun getRefreshTokenExpiryMs(): Long = refreshTokenExpiryMs

    private fun generateToken(userId: String, expiryMs: Long): String {
        val now = Date()
        val expiry = Date(now.time + expiryMs)
        return Jwts.builder()
            .subject(userId)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    fun extractUserId(token: String): String {
        return try {
            Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token)
                .payload
                .subject
        } catch (e: Exception) {
            throw ApiException("Invalid or expired token", HttpStatus.UNAUTHORIZED)
        }
    }
}
