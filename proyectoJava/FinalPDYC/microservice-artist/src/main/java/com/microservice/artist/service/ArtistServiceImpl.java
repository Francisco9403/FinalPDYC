package com.microservice.artist.service;

import com.microservice.artist.entity.Artist;
import com.microservice.artist.repository.ArtistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ArtistServiceImpl implements ArtistService {

    @Autowired
    private ArtistRepository repo;

    @Override
    public List<Artist> findAll(String genero) {
        if (genero != null) return repo.findByGenero(genero);
        return repo.findAll();
    }

    @Override
    public Artist findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Override
    public Artist save(Artist artist) {
        artist.setActive(true);
        return repo.save(artist);
    }

    @Override
    public Artist update(Long id, Artist artist) {
        Artist existing = findById(id);
        if (!existing.isActive()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artista desactivado no editable");
        existing.setNombre(artist.getNombre());
        existing.setGenero(artist.getGenero());
        existing.setEmail(artist.getEmail());
        existing.setActive(artist.isActive());

        return repo.save(existing);
    }

    @Override
    public void deleteOrDeactivate(Long id) {
        Artist existing = findById(id);
        // Aquí no podemos acceder a events; en microservicio event decide si borrar por relaciones.
        // Simplificamos: desactivar.
        existing.setActive(false);
        repo.save(existing);
    }
}
