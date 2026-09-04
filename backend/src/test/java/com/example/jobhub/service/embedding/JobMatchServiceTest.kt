package com.example.jobhub.service.embedding

import com.example.jobhub.model.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class JobMatchServiceTest {

    private val service = JobMatchService()

    @Test
    fun `uses profile embedding when source embeddings are unavailable`() {
        val candidate = User().apply {
            profileEmbedding = floatArrayOf(1f, 0f)
        }

        val result = service.calculate(floatArrayOf(1f, 0f), candidate)

        assertEquals(1.0, result.overall)
        assertEquals(100, result.percentage)
    }

    @Test
    fun `uses the recruiter source weighting when source embeddings exist`() {
        val candidate = User().apply {
            platformEmbedding = floatArrayOf(1f, 0f)
            githubEmbedding = floatArrayOf(0f, 1f)
        }

        val result = service.calculate(floatArrayOf(1f, 0f), candidate)

        assertEquals(0.625, result.overall)
        assertEquals(63, result.percentage)
        assertEquals(1.0, result.platform)
        assertEquals(0.0, result.github)
    }

    @Test
    fun `returns unavailable when no comparable embeddings exist`() {
        val result = service.calculate(floatArrayOf(1f, 0f), User())

        assertNull(result.overall)
        assertNull(result.percentage)
    }
}
