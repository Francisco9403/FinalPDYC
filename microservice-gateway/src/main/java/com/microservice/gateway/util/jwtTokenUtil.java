package com.microservice.gateway.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

@Component
public class jwtTokenUtil {

    // El secret debe venir desde application.yml (o Config Server)
    @Value("${security.jwt.secret:}")
    private String secret;

    private Algorithm algorithm;

    @PostConstruct
    public void init() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("security.jwt.secret no configurado en el gateway");
        }
        this.algorithm = Algorithm.HMAC512(secret);
    }

    private String stripBearer(String token) { // Eliminar el prefijo "Bearer " si está presente
        if (token == null) return null;
        token = token.trim();
        if (token.toLowerCase().startsWith("bearer ")) {
            return token.substring(7).trim();
        }
        return token;
    }

    public boolean verify(String token) { // Verifica que el token sea válido (firma, expiración, formato).
        try {
            token = stripBearer(token);
            JWTVerifier verifier = JWT.require(algorithm).build();
            verifier.verify(token);
            return true;
        } catch (JWTVerificationException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public String getSubject(String token) { // Devuelve el subject (normalmente el username o userId).
        try {
            token = stripBearer(token);
            DecodedJWT jwt = JWT.require(algorithm).build().verify(token);
            return jwt.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public List<String> getRoles(String token) { // Devuelve la lista de roles asociados al token.
        try {
            token = stripBearer(token);
            DecodedJWT jwt = JWT.require(algorithm).build().verify(token);

            // Primero intentamos leer como lista JSON
            List<String> roles = jwt.getClaim("roles").asList(String.class);
            if (roles != null && !roles.isEmpty()) {
                // trim de cada rol
                return roles.stream().map(String::trim).filter(r -> !r.isEmpty()).collect(Collectors.toList());
            }

            // Si no viene como lista, intentamos como CSV "ROLE_USER,ROLE_ADMIN"
            String rolesStr = jwt.getClaim("roles").asString();
            if (rolesStr != null && !rolesStr.isBlank()) {
                return Arrays.stream(rolesStr.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }

            return Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
