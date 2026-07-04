package com.example.jobhub.util

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Component
import java.security.SecureRandom

@Component
class AuthUtil {

    private val passwordEncoder = BCryptPasswordEncoder(10)

    private val allowedCharacters = "0123456789"

    private val random = SecureRandom()

    fun hashPassword(password: String): String? {
        return passwordEncoder.encode(password)
    }

    fun matchesPassword(password: String, passwordHash: String): Boolean {
        return passwordEncoder.matches(password, passwordHash)
    }

    fun generateOTP(length: Int): String {
        return buildString(length) {
            repeat(length) {
                append(allowedCharacters[random.nextInt(allowedCharacters.length)])
            }
        }
    }

    fun isPasswordValid(password: String): Boolean {
        return password.length >= 8 &&
                password.any { it.isUpperCase() } &&
                password.any { it.isLowerCase() } &&
                password.any { it.isDigit() } &&
                password.any { it in "@#$%^&+=!" } &&
                password.none { it.isWhitespace() }
    }
}