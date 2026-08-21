package com.example.jobhub.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.customizers.OpenApiCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    private val securitySchemeName = "BearerAuth"
    private val publicAuthPaths = setOf(
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/refresh",
        "/api/auth/verify-otp"
    )

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

    @Bean
    fun operationSecurityCustomizer(): OpenApiCustomizer {
        return OpenApiCustomizer { openApi ->
            openApi.paths?.forEach { (path, pathItem) ->
                pathItem.readOperations().forEach { operation ->
                    if (path in publicAuthPaths) {
                        operation.security = mutableListOf()
                    } else if (operation.security == null) {
                        operation.security = mutableListOf(
                            SecurityRequirement().addList(securitySchemeName)
                        )
                    }
                }
            }
        }
    }
}
