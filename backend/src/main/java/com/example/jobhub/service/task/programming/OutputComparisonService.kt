package com.example.jobhub.service.task.programming

import org.springframework.stereotype.Component
import tools.jackson.databind.JsonNode
import kotlin.math.abs

@Component
class OutputComparisonService {

    private val epsilon = 1e-6

    fun compare(actual: JsonNode, expected: JsonNode, orderInsensitive: Boolean = false): Boolean {
        return when {
            expected.isNumber && actual.isNumber ->
                abs(expected.asDouble() - actual.asDouble()) < epsilon
            expected.isArray && actual.isArray ->
                compareArrays(actual, expected, orderInsensitive)
            else -> actual == expected
        }
    }

    private fun compareArrays(actual: JsonNode, expected: JsonNode, orderInsensitive: Boolean): Boolean {
        if (actual.size() != expected.size()) return false

        val actualElements = actual.toList()
        val expectedElements = expected.toList()

        return if (orderInsensitive) {
            val actualSorted = actualElements.sortedBy { it.toString() }
            val expectedSorted = expectedElements.sortedBy { it.toString() }
            actualSorted.zip(expectedSorted).all { (a, e) -> compare(a, e, orderInsensitive = false) }
        } else {
            actualElements.zip(expectedElements).all { (a, e) -> compare(a, e, orderInsensitive = false) }
        }
    }
}