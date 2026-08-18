package com.example.jobhub.service.task.programming

import com.example.jobhub.exception.ApiException
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.executor.CodeExecutor
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper

data class TestCaseResult(
    val passed: Boolean,
    val actual: String?,
    val expected: String
)

@Service
class ProgrammingJudgeService(
    executors: List<CodeExecutor>,
    private val comparisonService: OutputComparisonService,
    private val objectMapper: ObjectMapper
) {
    private val executorsByLanguage = executors.associateBy { it.language }

    fun judge(task: ProgrammingTask, code: String, language: Language, testCases: List<com.example.jobhub.dto.ProgrammingTestCase>): List<TestCaseResult> {
        val executor = executorsByLanguage[language]
            ?: throw ApiException("Language $language is not supported yet", HttpStatus.BAD_REQUEST)

        val actualOutputs = executor.execute(task, code, testCases.map { it.input })

        if (actualOutputs.size != testCases.size) {
            throw ApiException(
                "Expected ${testCases.size} outputs but received ${actualOutputs.size}, candidate code may have crashed mid-execution",
                HttpStatus.BAD_REQUEST
            )
        }

        return testCases.zip(actualOutputs).map { (tc, actualRaw) ->
            val actualNode = try {
                objectMapper.readTree(actualRaw)
            } catch (e: Exception) {
                return@map TestCaseResult(passed = false, actual = actualRaw, expected = tc.expectedOutput.toString())
            }
            val passed = comparisonService.compare(actualNode, tc.expectedOutput, task.isOrderInsensitiveOutput)
            TestCaseResult(passed, actualRaw, tc.expectedOutput.toString())
        }
    }
}