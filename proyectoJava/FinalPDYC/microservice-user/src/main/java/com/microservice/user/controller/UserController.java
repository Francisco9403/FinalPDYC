package com.microservice.user.controller;

import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserDTO;
import com.microservice.user.entity.User;
import com.microservice.user.service.UserService;
//import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired private UserService userService;
    //@Autowired private ModelMapper modelMapper;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        try {
            userService.create(dto);
            return ResponseEntity.ok(Map.of("message", "Usuario creado con éxito"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // ---------- Consultas de usuarios ----------
    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("X-Auth-Roles") String roles) {
        // Puede acceder USER o ADMIN
        if (!roles.contains("USER") && !roles.contains("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Acceso denegado"));
        }
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.getInstance(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody UserDTO dto) {
        try{
            userService.update(userId, dto);
            return ResponseEntity.ok(Map.of("message", "Perfil actualizado"));
        } catch(Exception e){
            return ResponseEntity.status(403).build();
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(@RequestHeader("X-User-Id") Long userId) {
        userService.delete(userId);
        return ResponseEntity.ok(Map.of("message", "Cuenta eliminada"));
    }
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    // ---------- Seguir / Dejar de seguir artistas ----------
    @PostMapping("/me/seguidos/{artistId}")
    public ResponseEntity<?> seguirArtista(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long artistId) {

        // --- LOG 1: Ver si el método del controlador empieza ---
        log.info("[UserController] Intentando seguir: userId={}, artistId={}", userId, artistId);

        try {
            userService.seguirArtista(userId, artistId);

            // --- LOG 2: Ver si el servicio terminó bien ---
            log.info("[UserController] Éxito al seguir: userId={}, artistId={}", userId, artistId);

            return ResponseEntity.ok(Map.of("message", "Artista seguido"));
        } catch(Exception e) {
            // --- LOG 3: Ver la excepción capturada ---
            log.error("[UserController] ERROR al seguir: userId={}, artistId={}. Causa: {}",
                    userId, artistId, e.getMessage(), e); // Imprime el stack trace

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Error al seguir al artista: " + e.getMessage())); // Devuelve un mensaje más útil
        }
    }

    @DeleteMapping("/me/seguidos/{artistId}")
    public ResponseEntity<?> dejarSeguirArtista(@RequestHeader("X-User-Id") Long userId,
                                                @PathVariable Long artistId) {
        try{
            userService.dejarSeguirArtista(userId, artistId);
            return ResponseEntity.ok(Map.of("message", "Artista eliminado de seguidos"));
        } catch(Exception e){
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/me/seguidos-artistas")
    public ResponseEntity<?> listarArtistasSeguidos(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.listaArtista(userId));
    }

    // ---------- Favoritos ----------
    @PostMapping("/me/favoritos/{eventId}")
    public ResponseEntity<?> agregarFavorito(@RequestHeader("X-User-Id") Long userId,
                                             @PathVariable Long eventId) {
        try{                                        
            userService.seguirEvento(userId, eventId);
            return ResponseEntity.ok(Map.of("message", "Evento agregado a favoritos"));
        } catch(Exception e){
            return ResponseEntity.status(403).build();
        }
    }

    @DeleteMapping("/me/favoritos/{eventId}")
    public ResponseEntity<?> eliminarFavorito(@RequestHeader("X-User-Id") Long userId,
                                              @PathVariable Long eventId) {
        try{
            userService.dejarSeguirEvento(userId, eventId);
            return ResponseEntity.ok(Map.of("message", "Evento eliminado de favoritos"));
        } catch(Exception e){
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/me/favoritos")
    public ResponseEntity<?> listarFavoritos(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.listaEventoVigente(userId));
    }

    @GetMapping("/me/eventos-favoritos")
    public ResponseEntity<?> listarFavoritosProximos(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userService.listaEventoProximosDeMisArtistas(userId));
    }

    // ---------- Notificaciones ----------
    @PostMapping("/notify-by-artists")
    public ResponseEntity<?> notifyByArtists(@RequestBody EventStateChangedDTO dto) {
        userService.notifyByArtists(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/recipients-by-artists")
    public ResponseEntity<List<User>> recipientsByArtists(@RequestBody EventStateChangedDTO dto) {
        return ResponseEntity.ok(userService.recipientsByArtists(dto));
    }

}
