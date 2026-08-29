package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DevtoArticleDto(
        @JsonProperty("type_of")
        String typeOf,

        Long id,
        String title,
        String description,

        @JsonProperty("tag_list")
        List<String> tagList,

        @JsonProperty("positive_reactions_count")
        Integer positiveReactionsCount,

        @JsonProperty("reading_time_minutes")
        Integer readingTimeMinutes,

        @JsonProperty("published_at")
        String publishedAt,

        String url,

        @JsonProperty("body_markdown")
        String bodyMarkdown
) {}