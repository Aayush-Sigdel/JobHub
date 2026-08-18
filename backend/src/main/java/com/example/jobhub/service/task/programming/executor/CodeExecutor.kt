package com.example.jobhub.service.task.programming.executor

import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import tools.jackson.databind.JsonNode

interface CodeExecutor {

    val language: Language
    fun execute(task: ProgrammingTask, candidateCode: String, testCaseInputs: List<List<JsonNode>>): List<String>
}