package com.netflix.clone.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry){
        registry
                .addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET","POST","PATCH","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Location","Content-Disposition")
                .allowCredentials(false)
                .maxAge(3600);
    }

}
