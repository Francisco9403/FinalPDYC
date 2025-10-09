package com.microservice.user.util;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import org.springframework.beans.factory.annotation.Value;


public class JwtTokenUtil {

    //El secret esta en el application.yml del user en el MSVC-config
    @Value("${security.jwt.secret}")
    private String secret;
    
    // Generar token con id, nombre y roles
    public String generateToken(Long id, String username, String rol) {
        Date expirationDate = new Date(System.currentTimeMillis() + 10 * 24 * 60 * 60 * 1000); // Fecha de expiración: 10 días desde ahora
                                                                                               //Leer de izquierda a derecha, un segundo (1000 mili.seg)*60= 1min, *60=1hr, *24=1dia, *10=10dias
        String token = JWT.create()
                .withClaim("id", id)
                .withClaim("username", username)
                .withClaim("roles", rol)
                .withExpiresAt(expirationDate)
                .sign(Algorithm.HMAC512(secret));

        return "Bearer " + token;
    }
}