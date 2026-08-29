package com.example.jobhub.service.social;

import com.example.jobhub.dto.*;
import com.example.jobhub.model.SocialPlatform;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GithubService implements SocialService<GithubProfile> {

    private static final int MAX_PINNED_REPOS = 6;
    private static final int MAX_OTHER_REPOS = 10;

    private final RestClient restClient;
    private final boolean hasToken;

    public GithubService(@Value("${github.token:}") String token) {
        this.hasToken = token != null && !token.isBlank();

        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github+json");
        if (hasToken) {
            builder.defaultHeader("Authorization", "Bearer " + token);
        }
        this.restClient = builder.build();
    }

    @Override
    public GithubProfile fetch(String username) {
        GithubUserDto user = getUser(username);
        List<GithubRepoDto> allRepos = getRepos(username);

        List<GithubRepoDto> nonForked = allRepos.stream()
                .filter(repo -> repo.fork() == null || !repo.fork())
                .toList();

        Set<String> pinnedNames = hasToken ? getPinnedRepoNames(username) : Set.of();

        List<GithubRepoDto> pinned = nonForked.stream()
                .filter(repo -> pinnedNames.contains(repo.name()))
                .limit(MAX_PINNED_REPOS)
                .toList();

        Set<String> pinnedNameSet = pinned.stream()
                .map(GithubRepoDto::name)
                .collect(Collectors.toSet());

        List<GithubRepoDto> others = nonForked.stream()
                .filter(repo -> !pinnedNameSet.contains(repo.name()))
                .sorted(Comparator.comparing(
                        GithubRepoDto::pushedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(MAX_OTHER_REPOS)
                .toList();

        List<GithubProfile.Repository> repositories = new ArrayList<>();
        repositories.addAll(buildRepositories(username, pinned, true));
        repositories.addAll(buildRepositories(username, others, false));

        Set<String> uniqueLanguages = new LinkedHashSet<>();
        repositories.forEach(r -> uniqueLanguages.addAll(r.languages().keySet()));

        return new GithubProfile(
                user.username(),
                user.name(),
                user.bio(),
                repositories,
                uniqueLanguages
        );
    }

    private List<GithubProfile.Repository> buildRepositories(
            String username, List<GithubRepoDto> repos, boolean pinned
    ) {
        return repos.stream()
                .map(repo -> new GithubProfile.Repository(
                        repo.name(),
                        repo.description(),
                        getRepoLanguages(username, repo.name()),
                        repo.topics() == null ? List.of() : repo.topics(),
                        pinned,
                        getReadme(username, repo.name())
                ))
                .toList();
    }

    @Override
    public SocialPlatform getType() {
        return SocialPlatform.GITHUB;
    }

    public GithubUserDto getUser(String username) {
        return restClient.get()
                .uri("/users/{username}", username)
                .retrieve()
                .body(GithubUserDto.class);
    }

    public List<GithubRepoDto> getRepos(String username) {
        GithubRepoDto[] repos = restClient.get()
                .uri("/users/{username}/repos?per_page=100", username)
                .retrieve()
                .body(GithubRepoDto[].class);
        return repos == null ? List.of() : Arrays.asList(repos);
    }

    private Map<String, Integer> getRepoLanguages(String owner, String repoName) {
        Map<String, Integer> languages = restClient.get()
                .uri("/repos/{owner}/{repo}/languages", owner, repoName)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
        return languages == null ? Map.of() : languages;
    }

    private String getReadme(String owner, String repoName) {
        try {
            GithubReadmeDto readme = restClient.get()
                    .uri("/repos/{owner}/{repo}/readme", owner, repoName)
                    .retrieve()
                    .body(GithubReadmeDto.class);
            if (readme == null || readme.content() == null) return null;
            byte[] decoded = Base64.getMimeDecoder().decode(readme.content());
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) return null;
            throw e;
        }
    }

    private Set<String> getPinnedRepoNames(String username) {
        String query = """
                query($username: String!) {
                  user(login: $username) {
                    pinnedItems(first: 6, types: REPOSITORY) {
                      nodes {
                        ... on Repository { name }
                      }
                    }
                  }
                }
                """;

        Map<String, Object> body = Map.of(
                "query", query,
                "variables", Map.of("username", username)
        );

        try {
            GithubGraphQLResponse response = restClient.post()
                    .uri("/graphql")
                    .body(body)
                    .retrieve()
                    .body(GithubGraphQLResponse.class);

            if (response == null || response.data() == null || response.data().user() == null) {
                return Set.of();
            }
            return response.data().user().pinnedItems().nodes().stream()
                    .map(GithubGraphQLResponse.Node::name)
                    .collect(Collectors.toSet());
        } catch (Exception e) {
            return Set.of();
        }
    }
}