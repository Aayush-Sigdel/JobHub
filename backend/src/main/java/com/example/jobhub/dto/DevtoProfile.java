package com.example.jobhub.dto;

import java.util.List;

public record DevtoProfile(
        Long userId,
        String username,
        String name,
        String summary,
        String githubUsername,
        String websiteUrl,
        String location,
        List<ArticleInfo> articles
) {
    public record ArticleInfo(
            Long id,
            String title,
            String description,
            List<String> tags,
            Integer reactions,
            Integer readingTimeMinutes,
            String publishedAt,
            String bodyMarkdown
    ) {}
}