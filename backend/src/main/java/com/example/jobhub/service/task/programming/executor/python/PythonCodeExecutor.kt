package com.example.jobhub.service.task.programming.executor.python

import com.example.jobhub.exception.ApiException
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.SandboxRunner
import com.example.jobhub.service.task.programming.driver.python.PythonDriverTemplateGenerator
import com.example.jobhub.service.task.programming.executor.CodeExecutor
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.nio.file.Files

@Component
class PythonCodeExecutor(
    private val driverGenerator: PythonDriverTemplateGenerator,
    private val sandboxRunner: SandboxRunner,
    private val objectMapper: ObjectMapper,
    @param:Value("\${sandbox.image-python}")
    private val pythonSandboxImageName: String
) : CodeExecutor {

    override val language = Language.PYTHON

    override fun execute(
        task: ProgrammingTask,
        candidateCode: String,
        testCaseInputs: List<List<JsonNode>>
    ): List<String> {
        val workDir = Files.createTempDirectory("prog_exec_")
        try {
            Files.writeString(workDir.resolve("Solution.py"), candidateCode)
            Files.writeString(workDir.resolve("driver.py"), driverGenerator.generate(task))
            Files.writeString(workDir.resolve("testcases.json"), objectMapper.writeValueAsString(testCaseInputs))

            val runResult = sandboxRunner.run(
                workDir,
                pythonSandboxImageName,
                listOf("python3", "driver.py", "testcases.json"),
                timeoutSeconds = 10
            )
            if (runResult.timedOut) {
                throw ApiException("Execution timed out", HttpStatus.BAD_REQUEST)
            }
            if (runResult.exitCode != 0) {
                throw ApiException("Runtime error: ${runResult.stderr}", HttpStatus.BAD_REQUEST)
            }

            return runResult.stdout.trim().lines().filter { it.isNotBlank() }
        } finally {
            workDir.toFile().deleteRecursively()
        }
    }
}
