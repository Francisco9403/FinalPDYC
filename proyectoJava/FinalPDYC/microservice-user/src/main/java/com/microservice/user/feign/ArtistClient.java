package com.microservice.user.feign;

import com.microservice.user.feign.dto.ArtistDTO;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

// --- ¡CAMBIO AQUÍ! Se quitó url = "..." ---
// Ahora usará Eureka para encontrar "msvc-artist"
@FeignClient(name = "msvc-artist")
public interface ArtistClient {

    // Obtener artista por ID (publico, sin roles)
    @GetMapping("/api/artist/public/{id}")
    ArtistDTO getByIdPublic(@PathVariable("id") Long id);

    // Obtener todos los artistas (publico, sin roles)
    @GetMapping("/api/artist/public/all")
    List<ArtistDTO> getAllPublic(@RequestParam(value = "genero", required = false) String genero);
}
