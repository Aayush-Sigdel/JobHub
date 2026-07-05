package com.example.jobhub.util

import com.example.jobhub.exception.ApiException
import io.jsonwebtoken.JwtException
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

    fun generateAccessToken(userId: String): String = generateToken(userId, accessTokenExpiryMs, "access")
    fun generateRefreshToken(userId: String): String = generateToken(userId, refreshTokenExpiryMs, "refresh")

    private fun generateToken(userId: String, expiryMs: Long, type: String): String {
        val now = Date()
        val expiry = Date(now.time + expiryMs)
        return Jwts.builder()
            .subject(userId)
            .claim("type", type)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    fun extractUserId(token: String): String = parseClaims(token).subject

    fun extractAccessTokenUserId(token: String): String {
        val claims = parseClaims(token)
        if (claims["type"] != "access") throw ApiException("Invalid token type", HttpStatus.UNAUTHORIZED)
        return claims.subject
    }

    private fun parseClaims(token: String) = try {
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload
    } catch (e: JwtException) {
        throw ApiException("Invalid or expired token", HttpStatus.UNAUTHORIZED)
    }
}