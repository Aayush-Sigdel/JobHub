package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StackoverflowAnswerDto(
        @JsonProperty("answer_id") Long answerId,
        @JsonProperty("question_id") Long questionId,
        Integer score
) {}