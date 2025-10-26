// Ruta: microservice-gateway/src/main/java/com/microservice/gateway/util/jwtAuthenticationFilter.java
package com.microservice.gateway.util;

import org.slf4j.Logger; // Importar Logger
import org.slf4j.LoggerFactory; // Importar LoggerFactory
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class jwtAuthenticationFilter implements GlobalFilter, Ordered {

    // Logger para depuración
    private static final Logger log = LoggerFactory.getLogger(jwtAuthenticationFilter.class);

    private final jwtTokenUtil jwtTokenUtil;
    private final List<String> whitelist;
    private final List<String> normalizedWhitelist; // Lista pre-procesada

    public jwtAuthenticationFilter(jwtTokenUtil jwtTokenUtil,
                                   JwtConfigProperties jwtConfig) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.whitelist = jwtConfig.getWhitelist() != null ? jwtConfig.getWhitelist() : Collections.emptyList();

        // Pre-procesamos la whitelist una sola vez en el constructor
        this.normalizedWhitelist = this.whitelist.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(p -> {
                    if (p.endsWith("/**")) return p.substring(0, p.length() - 3);
                    if (p.endsWith("/*")) return p.substring(0, p.length() - 2); // Corregido: era -1
                    // Quitamos '*' al final si no es parte de /** o /*
                    if (p.endsWith("*") && p.length() > 1 && p.charAt(p.length() - 2) != '*') return p.substring(0, p.length() - 1);
                    return p;
                })
                .filter(p -> !p.isEmpty()) // Evitar prefijos vacíos
                .collect(Collectors.toList());

        log.info("[jwtFilter] Whitelist cargada: {}", this.whitelist);
        log.info("[jwtFilter] Whitelist normalizada (prefijos): {}", this.normalizedWhitelist);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        log.debug("[jwtFilter] Petición entrante: {} {}", method, path);

        // 1. Permitir SIEMPRE peticiones OPTIONS (CORS pre-flight)
        if (method == HttpMethod.OPTIONS) {
            log.debug("[jwtFilter] Petición OPTIONS permitida (CORS): {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.OK);
            return exchange.getResponse().setComplete();
        }

        // --- ¡NUEVO CHECK EXPLÍCITO! ---
        // 2. Permitir explícitamente rutas públicas de artistas ANTES de la whitelist general
        if (path.startsWith("/api/artist/public/")) {
            log.debug("[jwtFilter] Ruta pública de artista permitida explícitamente: {}", path);
            return chain.filter(exchange); // Pasa al siguiente filtro SIN validar token
        }
        // ---------------------------------

        // 3. Chequear contra la whitelist normalizada
        if (isWhitelisted(path)) {
            log.debug("[jwtFilter] Ruta en whitelist permitida: {}", path);
            return chain.filter(exchange); // Pasa al siguiente filtro SIN validar token
        }

        // --- A partir de aquí, la ruta requiere autenticación ---
        log.debug("[jwtFilter] Ruta NO pública/whitelist, requiere token: {}", path);

        // 4. Obtener cabecera Authorization
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.toLowerCase().startsWith("bearer ")) {
            log.warn("[jwtFilter] Cabecera Authorization ausente o inválida para {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED); // 401
            return exchange.getResponse().setComplete();
        }

        // 5. Extraer y verificar el token
        String token = authHeader.substring(7); // Quita "Bearer "
        boolean isValidToken = false;
        try {
            log.debug("[jwtFilter] Intentando validar token para {}", path);
            isValidToken = jwtTokenUtil.verify(token); // verify ya quita "Bearer " si existe
        } catch (Exception e) {
            log.error("[jwtFilter] EXCEPCIÓN durante verificación de token para {}: {}", path, e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED); // 401
            return exchange.getResponse().setComplete();
        }

        if (!isValidToken) {
            log.warn("[jwtFilter] Token INVÁLIDO para {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED); // 401
            return exchange.getResponse().setComplete();
        }

        log.debug("[jwtFilter] Token VÁLIDO para {}", path);

        // 6. Extraer claims y añadir cabeceras
        String username = jwtTokenUtil.getSubject(token); // Subject (suele ser username/email)
        List<String> roles = jwtTokenUtil.getRoles(token);
        Long userId = jwtTokenUtil.getUserId(token);

        log.debug("[jwtFilter] Claims extraídos: userId={}, username={}, roles={}", userId, username, roles);

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Auth-User", username == null ? "" : username)
                .header("X-Auth-Roles", String.join(",", roles == null ? Collections.emptyList() : roles))
                .header("X-User-Id", userId == null ? "" : String.valueOf(userId))
                .build();

        log.debug("[jwtFilter] Cabeceras X-* añadidas para {}", path);

        // 7. Pasar al siguiente filtro con la petición modificada
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    // Método isWhitelisted usando la lista normalizada
    private boolean isWhitelisted(String path) {
        if (normalizedWhitelist.isEmpty()) return false;
        // Comprueba si el path comienza con alguno de los prefijos normalizados
        return normalizedWhitelist.stream().anyMatch(prefix -> path.startsWith(prefix));
    }

    @Override
    public int getOrder() {
        // Podríamos probar un orden más alto (número más bajo) para asegurarnos
        // de que se ejecute antes que otros filtros que podrían interferir.
        // Por ejemplo, antes del ReactiveLoadBalancerClientFilter (orden 10150).
        // return -1; // O incluso más bajo si es necesario
        return 1; // Mantenemos el orden que teníamos por ahora
    }
}