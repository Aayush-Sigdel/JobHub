package com.example.jobhub.service.social;

import com.example.jobhub.dto.DevtoArticleDetailDto;
import com.example.jobhub.dto.DevtoArticleDto;
import com.example.jobhub.dto.DevtoProfile;
import com.example.jobhub.dto.DevtoUserDto;
import com.example.jobhub.model.SocialPlatform;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class DevtoService implements SocialService<DevtoProfile> {

    private static final int MAX_ARTICLES = 20;
    private static final String BASE_URL = "https://dev.to/api";

    private final RestClient restClient;

    public DevtoService() {
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader("User-Agent", "JobHub/1.0")
                .build();
    }

    @Override
    public DevtoProfile fetch(String identifier) {
        String username = identifier.trim();

        DevtoUserDto user = getUser(username);
        List<DevtoArticleDto> articles = getArticles(username);

        List<DevtoProfile.ArticleInfo> articleInfos = articles.stream()
                .map(this::toArticleInfo)
                .toList();

        return new DevtoProfile(
                user.id(),
                user.username(),
                user.name(),
                user.summary(),
                user.githubUsername(),
                user.websiteUrl(),
                user.location(),
                articleInfos
        );
    }

    @Override
    public SocialPlatform getType() {
        return SocialPlatform.DEV_TO;
    }

    private DevtoUserDto getUser(String username) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/users/by_username")
                        .queryParam("url", username)
                        .build())
                .retrieve()
                .body(DevtoUserDto.class);
    }

    private List<DevtoArticleDto> getArticles(String username) {
        List<DevtoArticleDto> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/articles")
                        .queryParam("username", username)
                        .queryParam("per_page", MAX_ARTICLES)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null) {
            return List.of();
        }

        return response;
    }

    private DevtoProfile.ArticleInfo toArticleInfo(
            DevtoArticleDto article
    ) {
        DevtoArticleDetailDto fullArticle = getArticle(article.id());

        return new DevtoProfile.ArticleInfo(
                article.id(),
                article.title(),
                article.description(),
                article.tagList(),
                article.positiveReactionsCount(),
                article.readingTimeMinutes(),
                article.publishedAt(),
                fullArticle.bodyMarkdown()
        );
    }

    private DevtoArticleDetailDto getArticle(Long articleId) {
        return restClient.get()
                .uri("/articles/{id}", articleId)
                .retrieve()
                .body(DevtoArticleDetailDto.class);
    }
}