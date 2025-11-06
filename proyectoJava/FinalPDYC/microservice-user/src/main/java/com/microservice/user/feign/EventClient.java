// Ruta: microservice-user/src/main/java/com/microservice/user/feign/EventClient.java
package com.microservice.user.feign;

import com.microservice.user.feign.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "msvc-event") // Usa Eureka
public interface EventClient {

    //Obtiene un evento por su ID
    // Coincide con @GetMapping("/{id}") en EventController
    @GetMapping("/api/event/{id}")
    EventDTO getById(@PathVariable("id") Long id);

    //Obtiene todos los eventos Coincide con @GetMapping("/all") en EventController 
    //El parámetro 'state' es opcional en el controller
    @GetMapping("/api/event/all")
    List<EventDTO> getAllPublic();

}