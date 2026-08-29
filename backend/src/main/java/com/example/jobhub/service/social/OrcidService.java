package com.example.jobhub.service.social;

import com.example.jobhub.dto.OrcidEmploymentDto;
import com.example.jobhub.dto.OrcidPersonDto;
import com.example.jobhub.dto.OrcidProfile;
import com.example.jobhub.dto.OrcidWorkDto;
import com.example.jobhub.model.SocialPlatform;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class OrcidService implements SocialService<OrcidProfile> {

    private static final int MAX_WORKS = 20;
    private static final int MAX_EMPLOYMENTS = 10;

    private final RestClient restClient;

    public OrcidService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://pub.orcid.org/v3.0")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Override
    public OrcidProfile fetch(String id) {
        OrcidPersonDto person = getPerson(id);
        OrcidEmploymentDto employments = getEmployments(id);
        OrcidWorkDto works = getWorks(id);

        List<String> keywords = person.keywords() == null || person.keywords().keyword() == null
                ? List.of()
                : person.keywords().keyword().stream()
                .map(OrcidPersonDto.Keyword::content)
                .filter(Objects::nonNull)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();

        List<OrcidProfile.ResearcherUrl> researcherUrls = person.researcherUrls() == null || person.researcherUrls().researcherUrl() == null
                ? List.of()
                : person.researcherUrls().researcherUrl().stream()
                .map(url -> new OrcidProfile.ResearcherUrl(
                        url.urlName(),
                        url.url() == null ? null : url.url().value()
                ))
                .filter(entry -> entry.url() != null && !entry.url().isBlank())
                .toList();

        List<OrcidProfile.Employment> flattenedEmployments = employments == null || employments.affiliationGroup() == null
                ? List.of()
                : employments.affiliationGroup().stream()
                .flatMap(group -> group.summaries() == null
                                  ? Stream.empty()
                                  : group.summaries().stream())
                .map(OrcidEmploymentDto.Summary::employmentSummary)
                .filter(Objects::nonNull)
                .map(summary -> new OrcidProfile.Employment(
                        summary.roleTitle(),
                        summary.departmentName(),
                        summary.organization() == null ? null : summary.organization().name(),
                        toYearMonth(summary.startDate()),
                        toYearMonth(summary.endDate())
                ))
                .sorted(Comparator.comparing(
                        OrcidProfile.Employment::startDate,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(MAX_EMPLOYMENTS)
                .toList();

        List<OrcidProfile.Work> flattenedWorks = works == null || works.group() == null
                ? List.of()
                : works.group().stream()
                .flatMap(group -> group.workSummary() == null
                                  ? Stream.empty()
                                  : group.workSummary().stream())
                .map(work -> new OrcidProfile.Work(
                        work.title() != null && work.title().title() != null
                        ? work.title().title().value()
                        : null,
                        work.type(),
                        work.journalTitle() == null ? null : work.journalTitle().value(),
                        work.publicationDate() != null && work.publicationDate().year() != null
                        ? work.publicationDate().year().value()
                        : null
                ))
                .filter(work -> work.title() != null && !work.title().isBlank())
                .sorted(Comparator.comparing(
                        OrcidProfile.Work::publicationYear,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(MAX_WORKS)
                .toList();

        String givenName = person.name() != null && person.name().givenNames() != null
                ? person.name().givenNames().value()
                : null;
        String familyName = person.name() != null && person.name().familyName() != null
                ? person.name().familyName().value()
                : null;

        return new OrcidProfile(
                id,
                formatName(givenName, familyName),
                person.biography() == null ? null : person.biography().content(),
                keywords,
                researcherUrls,
                flattenedEmployments,
                flattenedWorks
        );
    }

    @Override
    public SocialPlatform getType() {
        return SocialPlatform.ORCID;
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

    private String formatName(String givenName, String familyName) {
        String safeGivenName = givenName == null ? "" : givenName.trim();
        String safeFamilyName = familyName == null ? "" : familyName.trim();
        String fullName = (safeGivenName + " " + safeFamilyName).trim();
        return fullName.isBlank() ? null : fullName;
    }

    private String toYearMonth(OrcidEmploymentDto.DatePart datePart) {
        if (datePart == null
                || datePart.year() == null
                || datePart.year().value() == null
                || datePart.year().value().isBlank()) {
            return null;
        }
        if (datePart.month() == null
                || datePart.month().value() == null
                || datePart.month().value().isBlank()) {
            return datePart.year().value();
        }
        return datePart.year().value() + "-" + datePart.month().value();
    }
}