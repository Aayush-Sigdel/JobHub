package com.example.jobhub.service.task.programming

import org.springframework.stereotype.Component
import java.nio.file.Path
import java.util.concurrent.TimeUnit

data class ProcessResult(
    val exitCode: Int,
    val stdout: String,
    val stderr: String,
    val timedOut: Boolean
)

@Component
class SandboxRunner {

    fun run(workDir: Path, command: List<String>, timeoutSeconds: Long = 10): ProcessResult {
        val process = ProcessBuilder(
            "docker", "run", "--rm",
            "--memory=256m", "--memory-swap=256m",
            "--cpus=0.5", "--pids-limit=128",
            "--network=none", "--read-only", "--tmpfs", "/tmp",
            "-v", "${workDir.toAbsolutePath()}:/code",
            "-w", "/code",
            "coderunner-java",
            "sh", "-c", command.joinToString(" ")
        ).start()

        val finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS)
        if (!finished) {
            process.destroyForcibly()
            return ProcessResult(-1, "", "", timedOut = true)
        }
        return ProcessResult(
            exitCode = process.exitValue(),
            stdout = process.inputStream.bufferedReader().readText(),
            stderr = process.errorStream.bufferedReader().readText(),
            timedOut = false
        )
    }
}