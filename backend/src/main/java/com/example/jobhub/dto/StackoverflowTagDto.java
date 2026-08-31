package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StackoverflowTagDto(
        @JsonProperty("tag_name") String tagName,
        @JsonProperty("answer_count") Integer answerCount,
        @JsonProperty("answer_score") Integer answerScore
) {}