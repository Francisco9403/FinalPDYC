package com.microservice.gateway.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

@Component
public class jwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final jwtTokenUtil jwtTokenUtil;
    private final List<String> whitelist;

    public jwtAuthenticationFilter(jwtTokenUtil jwtTokenUtil,
                                   @Value("${security.jwt.whitelist:}") String whitelistProp) {
        this.jwtTokenUtil = jwtTokenUtil;

        if (whitelistProp == null || whitelistProp.trim().isEmpty()) {
            this.whitelist = Collections.emptyList();
        } else {
            // si YAML viene como lista, Spring lo expone como comma-separated; aparte toleramos comas y newlines
            this.whitelist = Arrays.stream(whitelistProp.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    // normalizamos patrones con "/**" o "*" final para usar startsWith
                    .map(p -> {
                        if (p.endsWith("/**")) return p.substring(0, p.length() - 3);
                        if (p.endsWith("/*")) return p.substring(0, p.length() - 1);
                        if (p.endsWith("*")) return p.substring(0, p.length() - 1);
                        return p;
                    })
                    .collect(Collectors.toList());
        }
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Si la ruta está en el whitelist → permitir sin token
        if (isWhitelisted(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtTokenUtil.verify(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Extraer datos del token
        String username = jwtTokenUtil.getSubject(token);
        List<String> roles = jwtTokenUtil.getRoles(token);

        // Agregar headers personalizados (evitamos NPE)
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-Auth-User", username == null ? "" : username)
                .header("X-Auth-Roles", String.join(",", roles == null ? Collections.emptyList() : roles))
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isWhitelisted(String path) {
        if (whitelist == null || whitelist.isEmpty()) return false;
        return whitelist.stream().anyMatch(prefix -> path.startsWith(prefix));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
