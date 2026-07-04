package com.example.jobhub.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val mailSender: JavaMailSender
) {

    @Value("\${spring.mail.username}")
    lateinit var senderEmail: String

    fun sendEmail(recipients: Array<String>, subject: String, body: String) {
        val message = SimpleMailMessage().apply {
            from = senderEmail
            setTo(*recipients)
            setSubject(subject)
            text=body
        }
        mailSender.send(message)
    }
}