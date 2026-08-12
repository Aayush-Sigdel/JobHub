package com.example.jobhub.service.social;

import com.example.jobhub.dto.GithubProfile;
import com.example.jobhub.dto.GithubRepoDto;
import com.example.jobhub.dto.GithubUserDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Service
public class GithubService implements SocialService<GithubProfile> {

    private final RestClient restClient;

    public GithubService(@Value("${github.token:}") String token) {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github+json");

        if (token != null && !token.isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + token);
        }
        this.restClient = builder.build();
    }

    @Override
    public GithubProfile fetch(String username) {
        return null;
    }

    @Override
    public SocialType getType() {
        return SocialType.ORCID;
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
        return Arrays.asList(repos);
    }

}
