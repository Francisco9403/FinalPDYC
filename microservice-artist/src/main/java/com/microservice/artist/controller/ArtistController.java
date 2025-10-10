package com.microservice.artist.controller;

import com.microservice.artist.entity.Artist;
import com.microservice.artist.service.ArtistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artist")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    // Crear artista (solo USER o ADMIN)
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Artist artist,
                                    @RequestHeader("X-Auth-Roles") String roles) {
        if (!roles.contains("user") && !roles.contains("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(artistService.save(artist));
    }

    // Obtener todos los artistas (endpoint público)
    @GetMapping("/all")
    public ResponseEntity<List<Artist>> all(@RequestParam(required = false) String genero) {
        return ResponseEntity.ok(artistService.findAll(genero));
    }

    // Buscar artista por ID (USER o ADMIN)
    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id,
                                  @RequestHeader("X-Auth-Roles") String roles) {
        if (!roles.contains("user") && !roles.contains("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(artistService.findById(id));
    }

    // Actualizar artista (solo ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Artist artist,
                                    @RequestHeader("X-Auth-Roles") String roles) {
        if (!roles.contains("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(artistService.update(id, artist));
    }

    // Eliminar o desactivar artista (solo ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @RequestHeader("X-Auth-Roles") String roles) {
        if (!roles.contains("admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        artistService.deleteOrDeactivate(id);
        return ResponseEntity.ok().build();
    }


    // --------------------
    // Endpoints públicos
    // --------------------
    // Obtener artista por ID sin roles
    @GetMapping("/public/{id}")
    public Artist getByIdPublic(@PathVariable Long id) {
        return artistService.findById(id);
    }

    // Obtener todos los artistas (público)
    @GetMapping("/public/all")
    public List<Artist> getAllPublic(@RequestParam(required = false) String genero) {
        return artistService.findAll(genero);
    }
}

