package com.microservice.event.feign;

import com.microservice.event.feign.dto.ArtistDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "msvc-artist", url = "localhost:8091")//seguramente hay que cambiar a 8080
public interface ArtistClient {

    @GetMapping("/api/artist/{id}")
    ArtistDTO getById(@PathVariable("id") Long id);
}
