package com.example.jobhub.service.social;

import com.example.jobhub.dto.OrcidEmploymentDto;
import com.example.jobhub.dto.OrcidPersonDto;
import com.example.jobhub.dto.OrcidProfile;
import com.example.jobhub.dto.OrcidWorkDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class OrcidService implements SocialService<OrcidProfile> {

    private final RestClient restClient;

    public OrcidService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://pub.orcid.org/v3.0")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Override
    public OrcidProfile fetch(String id) {
        return null;
    }

    @Override
    public SocialType getType() {
        return SocialType.ORCID;
    }

    private OrcidPersonDto getPerson(String orcidId) {
        return restClient.get()
                .uri("/{orcid}/person", orcidId)
                .retrieve()
                .body(OrcidPersonDto.class);
    }


    private OrcidEmploymentDto getEmployments(String orcidId) {
        return restClient.get()
                .uri("/{orcid}/employments", orcidId)
                .retrieve()
                .body(OrcidEmploymentDto.class);
    }

    private OrcidWorkDto getWorks(String orcidId) {
        return restClient.get()
                .uri("/{orcid}/works", orcidId)
                .retrieve()
                .body(OrcidWorkDto.class);
    }
}