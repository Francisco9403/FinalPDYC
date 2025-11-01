package com.microservice.event.feign;

import com.microservice.event.feign.dto.ArtistDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "msvc-artist") // Usa Eureka
public interface ArtistClient {

    // --- CORRECCIÓN ---
    // Cambia el método para que apunte al endpoint PÚBLICO
    @GetMapping("/api/artist/public/{id}")
    ArtistDTO getById(@PathVariable("id") Long id);
    // --------------------

    @GetMapping("/api/artist/public/all") // Esta ruta parece ser pública y correcta
    List<ArtistDTO> getAllPublic();
}
