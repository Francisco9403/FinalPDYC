package com.microservice.user.controller;

//import com.microservice.user.dto.RegisterRequestDTO;
import com.microservice.user.dto.UserDTO;
//import com.microservice.user.dto.LoginRequestDTO;
//import com.microservice.user.entity.User;
import com.microservice.user.feign.dto.ArtistDTO;
import com.microservice.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

//import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private UserService userService;

    // REGISTRO DE USUARIO
    @PostMapping("/registrarUsuario")
    public ResponseEntity<?> registrarUsuario(@RequestBody UserDTO userDTO) throws Exception {
        try {
            userService.create(userDTO);
            return ResponseEntity.ok(Map.of("message", "Usuario creado con éxito"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    // OBTENER TODOS LOS ARTISTAS POR GENERO (delegado a UserService)
    @GetMapping("/artistasGenero")
    public List<ArtistDTO> listarArtistasPorGenero(String genero) {
        // UserService se encarga de traer solo los artistas activos
        return userService.getGeneroArtists(genero);
    }

    // OBTENER TODOS LOS EVENTOS VIGENTES Y PRÓXIMOS (delegado a UserService)
    @GetMapping("/eventos")
    public List<?> listarEventosVigYprox() {
        // UserService filtra por eventos confirmados/reprogramados y fechas futuras
        return userService.getUpcomingEvents();
    }

    // OBTENER EVENTOS DE UN ARTISTA ESPECÍFICO
    @GetMapping("/eventosDeArtista/{id}")
    public List<?> eventosDeArtista(@PathVariable Long id) {
        return userService.getEventsByArtist(id);
    }

    // OBTENER DETALLE DE UN EVENTO
    @GetMapping("/evento/{id}")
    public Object mostrarEvento(@PathVariable Long id) {
        Object e = userService.getEventById(id);

        // Si el evento está en estado TENTATIVE, bloqueo el acceso
        if (userService.isTentativeEvent(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "No se puede acceder a información de eventos en estado TENTATIVE"
            );
        }
        return e;
    }
}
