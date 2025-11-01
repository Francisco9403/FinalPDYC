// Ruta: microservice-gateway/src/main/java/com/microservice/gateway/SecurityConfig.java

package com.microservice.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                // 1. Activa la configuración de CORS de abajo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Desactiva CSRF
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // 3. Desactiva la seguridad de Spring Security
                // para que tu GlobalFilter (jwtAuthenticationFilter)
                // sea el único que maneje la autenticación.
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll()
                );

        return http.build();
    }

    // 4. Este es el Bean de CORS que se usará para responder
    // a las peticiones OPTIONS.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // La URL de tu frontend de React
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }
}