package com.example.jobhub.service.social;

import com.example.jobhub.dto.*;
import com.example.jobhub.model.SocialPlatform;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StackoverflowService implements SocialService<StackoverflowProfile> {

    private static final int MAX_TAGS = 10;
    private static final int MAX_ANSWER_TITLES = 30;
    private static final int MAX_QUESTION_TITLES = 30;
    private static final String SITE = "stackoverflow";

    private final RestClient restClient;
    private final String apiKey;

    public StackoverflowService(@Value("${stackoverflow.key:}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.stackexchange.com/2.3")
                .build();
    }
    @Override
    public StackoverflowProfile fetch(String identifier) {
        long userId = Long.parseLong(identifier.trim());

        StackoverflowUserDto user = getUser(userId);
        List<StackoverflowTagDto> tags = getTopAnswerTags(userId);
        List<String> answerTitles = getTopAnswerTitles(userId);
        List<String> questionTitles = getTopQuestionTitles(userId);

        List<StackoverflowProfile.TagInfo> tagInfos = tags.stream()
                .map(t -> new StackoverflowProfile.TagInfo(
                        t.tagName(),
                        t.answerCount(),
                        t.answerScore()))
                .toList();

        StackoverflowProfile.BadgeCounts badges = user.badgeCounts() == null ? null
                : new StackoverflowProfile.BadgeCounts(
                user.badgeCounts().gold(),
                user.badgeCounts().silver(),
                user.badgeCounts().bronze());

        return new StackoverflowProfile(
                user.userId(),
                user.displayName(),
                user.reputation(),
                badges,
                tagInfos,
                answerTitles,
                questionTitles);
    }

    @Override
    public SocialPlatform getType() {
        return SocialPlatform.STACKOVERFLOW;
    }

    private List<String> getTopQuestionTitles(long userId) {
        try {
            StackoverflowWrapper<StackoverflowQuestionDto> response = restClient.get()
                    .uri(b -> {
                        var uri = b.path("/users/{id}/questions")
                                .queryParam("site", SITE)
                                .queryParam("sort", "creation")
                                .queryParam("order", "desc")
                                .queryParam("pagesize", MAX_QUESTION_TITLES);

                        if (hasKey()) {
                            uri = uri.queryParam("key", apiKey);
                        }

                        return uri.build(userId);
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response == null
                    || response.items() == null
                    || response.items().isEmpty()) {
                return List.of();
            }

            return response.items().stream()
                    .map(StackoverflowQuestionDto::title)
                    .map(this::decodeHtmlEntities)
                    .filter(Objects::nonNull)
                    .filter(title -> !title.isBlank())
                    .toList();

        } catch (RestClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }

    private StackoverflowUserDto getUser(long userId) {
        StackoverflowWrapper<StackoverflowUserDto> response = restClient.get()
                .uri(b -> {
                    var uri = b.path("/users/{id}").queryParam("site", SITE);
                    if (hasKey()) uri = uri.queryParam("key", apiKey);
                    return uri.build(userId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.items() == null || response.items().isEmpty()) {
            throw new RuntimeException("Stack Overflow user not found: " + userId);
        }
        return response.items().get(0);
    }

    private List<StackoverflowTagDto> getTopAnswerTags(long userId) {
        try {
            StackoverflowWrapper<StackoverflowTagDto> response = restClient.get()
                    .uri(b -> {
                        var uri = b.path("/users/{id}/top-answer-tags")
                                .queryParam("site", SITE)
                                .queryParam("pagesize", MAX_TAGS);
                        if (hasKey()) uri = uri.queryParam("key", apiKey);
                        return uri.build(userId);
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            return response == null || response.items() == null ? List.of() : response.items();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) return List.of();
            throw e;
        }
    }

    private List<String> getTopAnswerTitles(long userId) {
        StackoverflowWrapper<StackoverflowAnswerDto> answersResponse = restClient.get()
                .uri(b -> {
                    var uri = b.path("/users/{id}/answers")
                            .queryParam("site", SITE)
                            .queryParam("sort", "creation")
                            .queryParam("order", "desc")
                            .queryParam("pagesize", MAX_ANSWER_TITLES);
                    if (hasKey()) uri = uri.queryParam("key", apiKey);
                    return uri.build(userId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (answersResponse == null
                || answersResponse.items() == null
                || answersResponse.items().isEmpty()) {
            return List.of();
        }

        String questionIds = answersResponse.items().stream()
                .map(a -> String.valueOf(a.questionId()))
                .collect(Collectors.joining(";"));

        StackoverflowWrapper<StackoverflowQuestionDto> questionsResponse = restClient.get()
                .uri(b -> {
                    var uri = b.path("/questions/{ids}").queryParam("site", SITE);
                    if (hasKey()) uri = uri.queryParam("key", apiKey);
                    return uri.build(questionIds);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (questionsResponse == null || questionsResponse.items() == null) return List.of();

        Map<Long, String> titleById = questionsResponse.items().stream()
                .collect(Collectors.toMap(
                        StackoverflowQuestionDto::questionId,
                        q -> decodeHtmlEntities(q.title())));

        return answersResponse.items().stream()
                .map(a -> titleById.get(a.questionId()))
                .filter(Objects::nonNull)
                .filter(t -> !t.isBlank())
                .toList();
    }

    private boolean hasKey() {
        return apiKey != null && !apiKey.isBlank();
    }

    private String decodeHtmlEntities(String text) {
        if (text == null) return null;
        return text
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .replace("&nbsp;", " ");
    }
}