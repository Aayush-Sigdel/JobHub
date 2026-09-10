package com.example.jobhub.controllers

import com.example.jobhub.dto.ProgrammingTemplateDto
import com.example.jobhub.model.task.Language
import com.example.jobhub.security.UserPrincipal
import com.example.jobhub.service.task.programming.template.ProgrammingTemplateService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/task/programming/template")
class ProgrammingTemplateController(
    private val programmingTemplateService: ProgrammingTemplateService
) {

    @GetMapping("/languages")
    fun getSupportedLanguages(): ResponseEntity<List<Language>> {
        return ResponseEntity.ok(programmingTemplateService.supportedLanguages)
    }

    @GetMapping("/{taskId}")
    fun getTemplate(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable taskId: UUID,
        @RequestParam language: Language
    ): ResponseEntity<ProgrammingTemplateDto> {
        val template = programmingTemplateService.getTemplate(userDetails.id, taskId, language)
        return ResponseEntity.ok(template)
    }

    @GetMapping("/{taskId}/all")
    fun getTemplates(
        @AuthenticationPrincipal userDetails: UserPrincipal,
        @PathVariable taskId: UUID
    ): ResponseEntity<List<ProgrammingTemplateDto>> {
        val templates = programmingTemplateService.getTemplates(userDetails.id, taskId)
        return ResponseEntity.ok(templates)
    }
}
