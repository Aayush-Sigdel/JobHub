package com.example.jobhub.service.task.programming.driver

import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask

interface DriverTemplateGenerator {

    val language: Language
    fun generate(task: ProgrammingTask): String
}