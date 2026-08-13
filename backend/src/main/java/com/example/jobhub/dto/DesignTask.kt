package com.example.jobhub.dto

import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.task.TaskScope
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

data class CreateDesignTask(
    val title: String,
    val image: MultipartFile,
    val minimumMatchingScore: Double,
    val instructions: String,
    val skillLevel: SkillLevel,
    val scope: TaskScope
)

data class DesignTaskDto (
    val id: UUID,
    val title: String,
    val imageBytes: ByteArray,
    val imageContentType: String,
    val minimumMatchingScore: Double,
    val instructions: String,
    val skillLevel: SkillLevel,
    val scope: TaskScope,
    val createdBy: UUID
)

