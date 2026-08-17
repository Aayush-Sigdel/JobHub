package com.example.jobhub.dto

import com.example.jobhub.model.SkillLevel
import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.Parameter
import com.example.jobhub.model.task.TaskScope
import tools.jackson.databind.JsonNode

data class CreateProgrammingTask(
    val title: String,
    val instruction: String,
    val skillLevel: SkillLevel,
    val scope: TaskScope,
    val methodName: String,
    val parameters: List<Parameter>,
    val returnType: DataType,
    val orderInsensitiveOutput: Boolean,
    val testCases: List<ProgrammingTestCase>
)

data class ProgrammingTaskDto(
    val id: String,
    val title: String,
    val instructions: String,
    val skillLevel: SkillLevel,
    val scope: TaskScope,
    val methodName: String,
    val parameters: List<Parameter>,
    val returnType: DataType,
    val exampleTestCases: List<ProgrammingTestCase>,
    val orderInsensitiveOutput: Boolean
)

data class ProgrammingTestCase(
    val input: List<JsonNode>,
    val expectedOutput: JsonNode
)
