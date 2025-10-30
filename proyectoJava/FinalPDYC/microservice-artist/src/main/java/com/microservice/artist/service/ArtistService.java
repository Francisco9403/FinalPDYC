package com.microservice.artist.service;

import com.microservice.artist.entity.Artist;

import java.util.List;

public interface ArtistService {
    List<Artist> findAll(String genero);
    Artist findById(Long id);
    Artist save(Artist artist);
    Artist update(Long id, Artist artist);
    void deleteOrDeactivate(Long id);
}
