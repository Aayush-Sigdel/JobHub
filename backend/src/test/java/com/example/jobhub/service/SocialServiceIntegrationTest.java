package com.example.jobhub.service;

import com.example.jobhub.dto.GithubProfile;
import com.example.jobhub.service.social.GithubService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SocialServiceIntegrationTest {

    @Autowired
    private GithubService githubService;

    @Test
    void shouldFetchGithubProfile() {
        GithubProfile profile = githubService.fetch("sugham019");
        System.out.println(profile);
    }
}