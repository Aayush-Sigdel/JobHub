package com.example.jobhub.service

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class OtpService(
    private val redisTemplate: StringRedisTemplate
){

    private fun key(email: String) = "otp:$email"
    private fun cooldownKey(email: String) = "otp:cooldown:$email"

    fun saveOtp(email: String, otp: String) {
        redisTemplate.opsForValue().set(key(email), otp, Duration.ofMinutes(5))
    }

    fun verifyOtp(email: String, otp: String): Boolean {
        val stored = redisTemplate.opsForValue().get(key(email)) ?: return false
        if (stored == otp) {
            redisTemplate.delete(key(email))
            return true
        }
        return false
    }

    fun canRequestOtp(email: String): Boolean {
        return redisTemplate.opsForValue().get(cooldownKey(email)) == null
    }
}