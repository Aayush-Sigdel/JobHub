package com.example.jobhub.service.task.programming

import org.springframework.stereotype.Component
import java.nio.file.Path
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit

data class ProcessResult(
    val exitCode: Int,
    val stdout: String,
    val stderr: String,
    val timedOut: Boolean
)

@Component
class SandboxRunner {

    fun run(workDir: Path, imageName: String, command: List<String>, timeoutSeconds: Long = 10): ProcessResult {
        require(command.isNotEmpty()) { "Command cannot be empty" }
        require(imageName.isNotBlank()) { "Image name cannot be blank" }
        check(imageExists(imageName)) { "Docker image '$imageName' does not exist" }

        val dockerCommand = mutableListOf(
            "docker", "run", "--rm",
            "--memory=256m", "--memory-swap=256m",
            "--cpus=0.5", "--pids-limit=128",
            "--network=none", "--read-only", "--tmpfs", "/tmp",
            "-v", "${workDir.toAbsolutePath()}:/code",
            "-w", "/code",
            imageName
        ).apply {
            addAll(command)
        }

        val process = ProcessBuilder(dockerCommand).start()
        val streamDrainer = Executors.newFixedThreadPool(2)
        val stdoutFuture: Future<String> = streamDrainer.submit<String> {
            process.inputStream.bufferedReader().use { it.readText() }
        }
        val stderrFuture: Future<String> = streamDrainer.submit<String> {
            process.errorStream.bufferedReader().use { it.readText() }
        }

        try {
            val finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS)
            if (!finished) {
                process.destroyForcibly()
                process.waitFor()
                return ProcessResult(-1, stdoutFuture.get(), stderrFuture.get(), timedOut = true)
            }

            return ProcessResult(
                exitCode = process.exitValue(),
                stdout = stdoutFuture.get(),
                stderr = stderrFuture.get(),
                timedOut = false
            )
        } finally {
            streamDrainer.shutdown()
        }
    }

    private fun imageExists(imageName: String): Boolean {
        val check = ProcessBuilder("docker", "images", "-q", imageName).start()
        val output = check.inputStream.bufferedReader().use { it.readText().trim() }
        check.waitFor()
        return output.isNotEmpty()
    }
}
