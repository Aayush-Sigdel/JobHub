package com.example.jobhub.service.task.programming.executor.java

import com.example.jobhub.exception.ApiException
import com.example.jobhub.model.task.Language
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.service.task.programming.SandboxRunner
import com.example.jobhub.service.task.programming.driver.java.JavaDriverTemplateGenerator
import com.example.jobhub.service.task.programming.executor.CodeExecutor
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.nio.file.Files
@Component
class JavaCodeExecutor(
    private val driverGenerator: JavaDriverTemplateGenerator,
    private val sandboxRunner: SandboxRunner,
    private val objectMapper: ObjectMapper
) : CodeExecutor {

    override val language = Language.JAVA

    private val libsClasspath = "/libs/jackson-databind.jar:/libs/jackson-core.jar:/libs/jackson-annotations.jar"

    override fun execute(
        task: ProgrammingTask,
        candidateCode: String,
        testCaseInputs: List<List<JsonNode>>
    ): List<String> {
        val workDir = Files.createTempDirectory("prog_exec_")
        try {
            Files.writeString(workDir.resolve("Solution.java"), candidateCode)
            Files.writeString(workDir.resolve("Driver.java"), driverGenerator.generate(task))
            Files.writeString(workDir.resolve("testcases.json"), objectMapper.writeValueAsString(testCaseInputs))

            val compileResult = sandboxRunner.run(
                workDir,
                listOf("javac", "-cp", libsClasspath, "Solution.java", "Driver.java"),
                timeoutSeconds = 10
            )
            if (compileResult.timedOut) {
                throw ApiException("Compilation timed out", HttpStatus.BAD_REQUEST)
            }
            if (compileResult.exitCode != 0) {
                throw ApiException("Compilation failed: ${compileResult.stderr}", HttpStatus.BAD_REQUEST)
            }

            val runResult = sandboxRunner.run(
                workDir,
                listOf("java", "-cp", ".:$libsClasspath", "Driver", "testcases.json"),
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