package com.microservice.user.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenUtil {

    // mover a properties en producción
    private static final String SECRET_KEY = "mate_amargo123";

    public String generateToken(String subject){
        Date expiration = new Date(System.currentTimeMillis() + 10L * 24 * 60 * 60 * 1000);
        return "Bearer " + JWT.create().withSubject(subject).withExpiresAt(expiration).sign(Algorithm.HMAC512(SECRET_KEY));
    }

    public boolean verify(String token){
        try {
            if (token.startsWith("Bearer ")) token = token.substring(7);
            JWTVerifier verifier = JWT.require(Algorithm.HMAC512(SECRET_KEY)).build();
            verifier.verify(token);
            return true;
        } catch (Exception e) { return false; }
    }

    public String getSubject(String token){
        if (token.startsWith("Bearer ")) token = token.substring(7);
        return JWT.require(Algorithm.HMAC512(SECRET_KEY)).build().verify(token).getSubject();
    }
}
