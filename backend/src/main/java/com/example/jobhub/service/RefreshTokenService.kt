package com.example.jobhub.service

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class RefreshTokenService(
    private val redisTemplate: StringRedisTemplate
) {
    private fun key(userId: String) = "refresh_token:$userId"

    fun save(userId: String, token: String, expiryMs: Long) {
        redisTemplate.opsForValue().set(key(userId), token, Duration.ofMillis(expiryMs))
    }

    fun isValid(userId: String, token: String): Boolean {
        val stored = redisTemplate.opsForValue().get(key(userId))
        return stored != null && stored == token
    }

    fun revoke(userId: String) {
        redisTemplate.delete(key(userId))
    }
}