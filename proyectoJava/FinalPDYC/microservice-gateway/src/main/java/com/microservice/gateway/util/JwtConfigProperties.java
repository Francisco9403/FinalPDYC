package com.microservice.gateway.util;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "security.jwt") // Lee todo lo que empiece con "security.jwt"
public class JwtConfigProperties {

    private String secret;
    private long expiration;
    private List<String> whitelist; // Spring convierte tu .yml a una Lista automáticamente

    // Getters y Setters
    public String getSecret() {
        return secret;
    }
    public void setSecret(String secret) {
        this.secret = secret;
    }
    public long getExpiration() {
        return expiration;
    }
    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
    public List<String> getWhitelist() {
        return whitelist;
    }
    public void setWhitelist(List<String> whitelist) {
        this.whitelist = whitelist;
    }
}