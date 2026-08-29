package com.example.jobhub.dto;

import java.util.List;

public record StackoverflowProfile(
        Long userId,
        String displayName,
        Integer reputation,
        BadgeCounts badgeCounts,
        List<TagInfo> topTags,
        List<String> topAnswerTitles,
        List<String> topQuestionTitles
) {
    public record BadgeCounts(Integer gold, Integer silver, Integer bronze) {}

    public record TagInfo(String name, Integer answerCount, Integer answerScore) {}
}