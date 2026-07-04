package com.example.jobhub.service.social;

import com.example.jobhub.dto.PortfolioDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

@Service
public class PortfolioScraperService {

    public PortfolioDto extract(String url) {

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(5000)
                    .get();

            String title = doc.title();

            String description = Optional.ofNullable(
                    doc.selectFirst("meta[name=description]")
            ).map(e -> e.attr("content")).orElse(null);

            List<String> headings = doc.select("h1, h2, h3")
                    .stream()
                    .map(Element::text)
                    .filter(s -> !s.isBlank())
                    .toList();

            List<String> paragraphs = doc.select("p")
                    .stream()
                    .map(Element::text)
                    .filter(s -> s.length() > 20)
                    .limit(30)
                    .toList();

            List<String> links = doc.select("a[href]")
                    .stream()
                    .map(e -> e.attr("abs:href"))
                    .filter(h -> h.startsWith("http"))
                    .distinct()
                    .limit(30)
                    .toList();

            List<String> jsonLd = doc.select("script[type=application/ld+json]")
                    .stream()
                    .map(Element::html)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .limit(3)
                    .toList();

            return new PortfolioDto(
                    url,
                    title,
                    description,
                    headings,
                    paragraphs,
                    links,
                    jsonLd
            );

        } catch (Exception e) {
            return new PortfolioDto(url, null, null,
                    List.of(), List.of(), List.of(), List.of());
        }
    }
}