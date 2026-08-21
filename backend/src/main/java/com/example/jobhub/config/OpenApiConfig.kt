package com.example.jobhub.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    private val securitySchemeName = "BearerAuth"

    @Bean
    fun jobHubOpenAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("JobHub API")
                    .description("RESTful API documentation for the JobHub backend application")
                    .version("v1.0.0")
                    .contact(
                        Contact()
                            .name("JobHub Team")
                    )
                    .license(
                        License()
                            .name("Apache 2.0")
                            .url("https://springdoc.org")
                    )
            )
            .addSecurityItem(
                SecurityRequirement().addList(securitySchemeName)
            )
            .components(
                Components()
                    .addSecuritySchemes(
                        securitySchemeName,
                        SecurityScheme()
                            .name(securitySchemeName)
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("Provide JWT access token for authorization")
                    )
            )
    }
}
