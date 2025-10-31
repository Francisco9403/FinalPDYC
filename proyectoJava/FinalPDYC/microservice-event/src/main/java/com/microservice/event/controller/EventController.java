package com.microservice.event.controller;

import com.microservice.event.entity.Event;
import com.microservice.event.service.EventService;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import javax.management.relation.RelationNotFoundException;

@RestController
@RequestMapping("/api/event")
public class EventController {

    @Autowired
    private EventService service;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Event event,
                                    @RequestHeader("X-Auth-Roles") String roles) {
        // --- Convertir a minúsculas ---
        String lowerCaseRoles = roles.toLowerCase();
        // --- Usar la versión en minúsculas en el IF ---
        if (!lowerCaseRoles.contains("user") && !lowerCaseRoles.contains("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.save(event));
    }

    @GetMapping("/all")
    public List<Event> all(@RequestParam(required = false) String state) {
        return service.findAll(state); // público, sin restricción
    }

    // Si la ruta real es /search/{id}, ajusta el @GetMapping
    @GetMapping("/{id}")
    public Event byId(@PathVariable Long id) {
        return service.findById(id);
    }
    // --- FIN CORRECCIÓN ---

    @PostMapping("/{id}/artists")
    public ResponseEntity<?> addArtist(@PathVariable Long id,
                                       @RequestBody Map<String, Long> body,
                                       @RequestHeader("X-Auth-Roles") String roles) {
        String lowerCaseRoles = roles.toLowerCase(); // <-- CORREGIR
        if (!lowerCaseRoles.contains("admin")) {     // <-- CORREGIR
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.addArtist(id, body.get("artistId")));
    }
    /*@PostMapping("/{eventId}/artists/{artistId}") // Cambia la URL
        public ResponseEntity<?> addArtist(
                                            @PathVariable Long eventId,                 // El ID del evento
                                            @PathVariable Long artistId,                // El ID del artista (nuevo)
                                            @RequestHeader("X-Auth-Roles") String roles) throws RelationNotFoundException {
        // 1. Lógica de autorización (sin cambios)
        String lowerCaseRoles = roles.toLowerCase();
        if (!lowerCaseRoles.contains("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // 2. Lógica de negocio con Manejo de Excepciones
        try {
            // Llama al servicio con los dos IDs
            Object result = service.addArtist(eventId, artistId);

            // Si el servicio devuelve el artista/evento actualizado o un DTO de éxito
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            // Ejemplo de excepción: Si el artista ya está en el evento, o algún error de validación de negocio
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        // NOTA: Debes asegurarte de que tu capa de servicio (service.addArtist)
        // lance estas excepciones (ResourceNotFoundException, IllegalArgumentException, etc.).
    }*/

    @DeleteMapping("/{id}/artists/{artistId}")
    public ResponseEntity<?> removeArtist(@PathVariable Long id,
                                          @PathVariable Long artistId,
                                          @RequestHeader("X-Auth-Roles") String roles) {
        String lowerCaseRoles = roles.toLowerCase(); // <-- CORREGIR
        if (!lowerCaseRoles.contains("admin")) {     // <-- CORREGIR
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.removeArtist(id, artistId));
    }

    @PutMapping("/{id}/confirmed")
    public ResponseEntity<?> confirm(@PathVariable Long id,
                                     @RequestHeader("X-Auth-Roles") String roles) {
        String lowerCaseRoles = roles.toLowerCase(); // <-- CORREGIR
        if (!lowerCaseRoles.contains("admin")) {     // <-- CORREGIR
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.confirm(id));
    }

    @PutMapping("/{id}/rescheduled")
    public ResponseEntity<?> reschedule(@PathVariable Long id,
                                        @RequestBody @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate,
                                        @RequestHeader("X-Auth-Roles") String roles) {
        String lowerCaseRoles = roles.toLowerCase(); // <-- CORREGIR
        if (!lowerCaseRoles.contains("admin")) {     // <-- CORREGIR
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.reschedule(id, newDate));
    }

    @PutMapping("/{id}/canceled")
    public ResponseEntity<?> cancel(@PathVariable Long id,
                                    @RequestHeader("X-Auth-Roles") String roles) {
        String lowerCaseRoles = roles.toLowerCase(); // <-- CORREGIR
        if (!lowerCaseRoles.contains("admin")) {     // <-- CORREGIR
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.cancel(id));
    }
}
