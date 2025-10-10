package com.microservice.user.util;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class JwtTokenUtil {

    private final String secret;

    // lectura desde application.yml (o desde config server)
    public JwtTokenUtil(@Value("${security.jwt.secret}") String secret) {
        this.secret = secret;
    }

    // Validación al arrancar para detectar errores de configuración rápido
    @PostConstruct
    public void init() {
        if (!StringUtils.hasText(this.secret)) {
            throw new IllegalStateException("JWT secret no configurado. Ver property 'security.jwt.secret'");
        }
    }

    // Generar token con id, nombre y roles
    public String generateToken(Long id, String username, String rol) {
        Date expirationDate = new Date(System.currentTimeMillis() + 10L * 24 * 60 * 60 * 1000); // 10 días

        String token = JWT.create()
                .withClaim("id", id)
                .withClaim("username", username)
                .withClaim("roles", rol)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC512(secret));

        // Nota: devolvemos solo el JWT; si en tu app esperás el prefijo "Bearer " en la capa superior,
        // podés concatenarlo ahí. Mantengo "Bearer " si ya lo usás así en otros lugares:
        return "Bearer " + token;
    }

    // Extra: obtener claims / username del token (sin prefijo "Bearer ")
    public String getUsernameFromToken(String tokenWithOptionalBearer) {
        String token = stripBearer(tokenWithOptionalBearer);
        DecodedJWT jwt = JWT.require(Algorithm.HMAC512(secret)).build().verify(token);
        // Si guardaste 'username' como claim:
        return jwt.getClaim("username").asString();
    }

    public boolean validateToken(String tokenWithOptionalBearer) {
        try {
            String token = stripBearer(tokenWithOptionalBearer);
            JWT.require(Algorithm.HMAC512(secret)).build().verify(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private String stripBearer(String token) {
        if (token == null) return null;
        token = token.trim();
        if (token.toLowerCase().startsWith("bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}
