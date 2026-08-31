package com.example.jobhub.service.embedding

import kotlin.math.sqrt

object CosineSimilarity {

    fun compute(a: FloatArray, b: FloatArray): Double {
        require(a.size == b.size) {
            "Embeddings must be the same dimension, got ${a.size} and ${b.size}"
        }
        var dot = 0.0
        var normA = 0.0
        var normB = 0.0
        for (i in a.indices) {
            dot += a[i] * b[i]
            normA += a[i] * a[i]
            normB += b[i] * b[i]
        }
        if (normA == 0.0 || normB == 0.0) return 0.0
        return dot / (sqrt(normA) * sqrt(normB))
    }
}