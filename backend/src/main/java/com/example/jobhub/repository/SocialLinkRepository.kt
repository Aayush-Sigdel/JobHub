package com.example.jobhub.repository

import com.example.jobhub.model.SocialLink
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SocialLinkRepository : JpaRepository<SocialLink, UUID> {

    fun findByIdAndUserId(id: UUID, userId: UUID): SocialLink?
}
