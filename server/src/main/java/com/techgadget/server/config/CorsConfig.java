package com.techgadget.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
<<<<<<< HEAD
                        .allowedOrigins(
                                "http://127.0.0.1:3000",
                                "http://localhost:3000"
                        )
                        .allowedMethods("*");
=======
                        .allowedOriginPatterns(
                                "http://localhost:3000",
                                "http://127.0.0.1:5500",
                                "https://*.vercel.app"
                        )
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);
>>>>>>> 9c2238a6aaf859cef16546d8f1c5d92f6f0ad3c7
            }
        };
    }
}