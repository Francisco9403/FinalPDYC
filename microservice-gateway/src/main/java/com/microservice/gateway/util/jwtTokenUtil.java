package com.microservice.gateway.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class jwtTokenUtil {

    //El secret esta en el application.yml del gateway en el MSVC-config
    @Value("${security.jwt.secret}")
    private String secret;

    private String stripBearer(String token) { // Eliminar el prefijo "Bearer " si está presente
        if (token == null) return null;
        if (token.startsWith("Bearer ")) {
            return token.substring(7).trim();
        }
        return token;
    }

    public boolean verify(String token){                //Verifica que el token sea válido (firma, expiración, formato).
        try {
            token = stripBearer(token);                 // Eliminar el prefijo "Bearer " si está presente
                                                                                       //Contrullo un verificador (de tipo JWTVerifier)
            JWTVerifier verifier = JWT.require(Algorithm.HMAC512(secret)).build(); //se le pasa el "algoritmo de firma" con el que va a estar firmado el token y que la secret key(del token) debeCoincidirConLaQueLePasemos
            verifier.verify(token);                     // se lanzara excepción si no es válido, firma valida, no expirado, bien formado (manejado por "verifier")
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }

    public String getSubject(String token){             //Devuelve el subject (normalmente el username o userId).        
        token = stripBearer(token);                     // Quitar el prefijo "Bearer " si está presente

        DecodedJWT jwt = JWT.require(Algorithm.HMAC512(secret))//se prepara el verificador con el algoritmo HMAC512 y la clave secreta usada para firmar el token.
                .build()
                .verify(token);                         //se verifica que el token sea valido                
        return jwt.getSubject();                        //esta linea es la que devuelve lo que necesitamos
    }                                                   //Nota: se prodria agregar un bloque try catch por las dudas


    public List<String> getRoles(String token) {        // Devuelve la lista de roles asociados al token.
        token = stripBearer(token);                     //Soporta claim "roles" como array JSON o como string separado por comas
        DecodedJWT jwt = JWT.require(Algorithm.HMAC512(secret))
                .build()
                .verify(token);

        List<String> roles = jwt.getClaim("roles").asList(String.class); //Si los roles son un JSON ["ROLE_ADMIN","ROLE_USER"]
        if (roles == null) {
            String rolesStr = jwt.getClaim("roles").asString();          //Si los roles son un String  "ROLE_ADMIN,ROLE_USER"
            if (rolesStr != null && !rolesStr.isEmpty()) {
                return List.of(rolesStr.split(","));
            }
            return Collections.emptyList();
        }
        return roles;
    }

}