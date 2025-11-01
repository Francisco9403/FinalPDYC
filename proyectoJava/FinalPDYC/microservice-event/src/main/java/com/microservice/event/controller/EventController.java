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
