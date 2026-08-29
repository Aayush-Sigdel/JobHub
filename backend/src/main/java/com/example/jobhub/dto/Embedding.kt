package com.example.jobhub.dto

class EmbeddingRequest(val text: String)

class EmbeddingResponse(val embedding: FloatArray)