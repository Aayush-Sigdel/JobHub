package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StackoverflowQuestionDto(
        @JsonProperty("question_id") Long questionId,
        String title
) {}