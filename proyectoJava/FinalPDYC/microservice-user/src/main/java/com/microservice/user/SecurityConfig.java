// Ruta: microservice-user/src/main/java/com/microservice/user/SecurityConfig.java
package com.microservice.user;

// 1. Importa tu PasswordEncoderUtil
import com.microservice.user.util.PasswordEncoderUtil;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
// 2. Importa la interfaz PasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // Importante para nuevo .csrf()
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final PasswordEncoderUtil passwordEncoderUtil;

    public SecurityConfig(PasswordEncoderUtil passwordEncoderUtil) {
        this.passwordEncoderUtil = passwordEncoderUtil;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Usar la nueva forma de deshabilitar CSRF
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authz -> authz
                        // Rutas públicas (Login y Registro)
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/auth/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/public/**")).permitAll()

                        // --- ¡NUEVA REGLA! ---
                        // Permite las rutas del perfil de usuario ("/me/...")
                        // porque asumimos que el Gateway ya validó el token.
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/user/me/**")).permitAll() // O podrías usar .authenticated() si configuras header auth
                        // ---------------------

                        // El resto SÍ requiere autenticación (ej: /api/admin/**)
                        // OJO: Si tienes otras rutas bajo /api/user/ que NO sean /me/, necesitarán estar permitidas
                        // o requerirán una configuración de autenticación basada en headers.
                        // Por simplicidad ahora, podrías permitir
                        // .requestMatchers(AntPathRequestMatcher.antMatcher("/api/user/**")).permitAll() // Opción más permisiva
                        .anyRequest().authenticated() // Mantenemos esto para rutas no especificadas (como /api/admin)
                );
        return http.build();
    }

    // --- 4. Define el Bean de PasswordEncoder ---
    // Este método le dice a Spring Security: "Usa ESTE encoder".
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Creamos una instancia de PasswordEncoder que DELEGA
        // a los métodos de tu PasswordEncoderUtil existente.
        return new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                // Llama al método encode() de tu clase
                return passwordEncoderUtil.encode(rawPassword.toString());
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                // Llama al método matches() de tu clase
                return passwordEncoderUtil.matches(rawPassword.toString(), encodedPassword);
            }
        };
    }
    // ------------------------------------------
}