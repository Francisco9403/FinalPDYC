package com.microservice.artist.controller;

import com.microservice.artist.entity.Artist;
import com.microservice.artist.service.ArtistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artist")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Artist create(@RequestBody Artist artist) {
        return artistService.save(artist);
    }

    @GetMapping("/all")
    public List<Artist> all(@RequestParam(required = false) String genero) {
        return artistService.findAll(genero);
    }

    @GetMapping("/{id}")
    public Artist byId(@PathVariable Long id) {
        return artistService.findById(id);
    }

    @PutMapping("/{id}")
    public Artist update(@PathVariable Long id, @RequestBody Artist artist) {
        return artistService.update(id, artist);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        artistService.deleteOrDeactivate(id);
    }
}
