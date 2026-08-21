package com.example.jobhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class JobHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobHubApplication.class, args);
    }
}
