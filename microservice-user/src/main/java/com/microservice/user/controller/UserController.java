package com.microservice.user.controller;

import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserAuthDTO;
import com.microservice.user.entity.User;
import com.microservice.user.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired private UserService userService;
    @Autowired private ModelMapper modelMapper;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserAuthDTO dto) {
        try {
            userService.create(dto);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // endpoint que llama msvc-event para pedir notificación por artists
    @PostMapping("/notify-by-artists")
    public ResponseEntity<?> notifyByArtists(@RequestBody EventStateChangedDTO dto) {
        userService.notifyByArtists(dto);
        return ResponseEntity.ok().build();
    }

        // endpoint para que event pida la lista de destinatarios (opcional)
    @PostMapping("/recipients-by-artists")
    public ResponseEntity<List<User>> recipients(@RequestBody EventStateChangedDTO dto) {
        return ResponseEntity.ok(userService.recipientsByArtists(dto));
    }

    // endpoints para seguir/dejar seguir artistas y eventos:
    @PostMapping("/{userId}/seguidos/{artistId}")
    public ResponseEntity<?> seguir(@PathVariable Long userId, @PathVariable Long artistId) {
        try { userService.seguirArtista(userId, artistId); return ResponseEntity.ok().build(); }
        catch(Exception e){ return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));}
    }
    @DeleteMapping("/{userId}/seguidos/{artistId}")
    public ResponseEntity<?> dejarSeguir(@PathVariable Long userId, @PathVariable Long artistId) {
        try { userService.dejarSeguirArtista(userId, artistId); return ResponseEntity.ok().build(); }
        catch(Exception e){ return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));}
    }

    @PostMapping("/{userId}/favoritos/{eventId}")
    public ResponseEntity<?> seguirEvento(@PathVariable Long userId, @PathVariable Long eventId) {
        try { userService.seguirEvento(userId, eventId); return ResponseEntity.ok().build(); }
        catch(Exception e){ return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));}
    }
    @DeleteMapping("/{userId}/favoritos/{eventId}")
    public ResponseEntity<?> dejarSeguirEvento(@PathVariable Long userId, @PathVariable Long eventId) {
        try { userService.dejarSeguirEvento(userId, eventId); return ResponseEntity.ok().build(); }
        catch(Exception e){ return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));}
    }
}
