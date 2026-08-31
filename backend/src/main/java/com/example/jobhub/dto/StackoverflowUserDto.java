package com.example.jobhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StackoverflowUserDto(
        @JsonProperty("user_id") Long userId,
        @JsonProperty("display_name") String displayName,
        Integer reputation,
        @JsonProperty("badge_counts") BadgeCounts badgeCounts
) {
    public record BadgeCounts(Integer gold, Integer silver, Integer bronze) {}
}