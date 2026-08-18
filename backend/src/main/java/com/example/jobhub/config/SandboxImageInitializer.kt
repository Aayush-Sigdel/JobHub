package com.example.jobhub.config

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "sandbox")
data class SandboxProperties(
    var images: List<SandboxImageSpec> = emptyList()
)

data class SandboxImageSpec(
    var imageName: String,
    var dockerfileDir: String
)

@Component
class SandboxImageInitializer(
    private val sandboxProperties: SandboxProperties
) : CommandLineRunner {

    override fun run(vararg args: String) {
        sandboxProperties.images.forEach { spec -> ensureImageBuilt(spec) }
    }

    private fun ensureImageBuilt(spec: SandboxImageSpec) {
        if (imageExists(spec.imageName)) {
            println("[SandboxImageInitializer] '${spec.imageName}' already exists, skipping build.")
            return
        }
        val dockerfileDir = java.nio.file.Paths.get(spec.dockerfileDir).toAbsolutePath().normalize().toString()
        println("[SandboxImageInitializer] '${spec.imageName}' not found — building now from $dockerfileDir...")
        val build = ProcessBuilder(
            "docker", "build", "-t", spec.imageName, dockerfileDir
        ).redirectErrorStream(true).start()

        build.inputStream.bufferedReader().forEachLine { println("[docker build:${spec.imageName}] $it") }
        val exitCode = build.waitFor()
        if (exitCode != 0) {
            throw IllegalStateException("Failed to build sandbox image '${spec.imageName}' (exit code $exitCode).")
        }
        println("[SandboxImageInitializer] '${spec.imageName}' built successfully.")
    }

    private fun imageExists(imageName: String): Boolean {
        val check = ProcessBuilder("docker", "images", "-q", imageName).start()
        val output = check.inputStream.bufferedReader().readText().trim()
        check.waitFor()
        return output.isNotEmpty()
    }
}