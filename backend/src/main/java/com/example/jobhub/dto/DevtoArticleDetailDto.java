package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DevtoArticleDetailDto(
        @JsonProperty("body_markdown")
        String bodyMarkdown
) {}