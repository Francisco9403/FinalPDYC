// Ruta: microservice-user/src/main/java/com/microservice/user/feign/EventClient.java
package com.microservice.user.feign;

import com.microservice.user.feign.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
// Quitamos RequestParam ya que no lo usamos en los métodos definidos aquí
// import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "msvc-event") // Usa Eureka
public interface EventClient {

    /**
     * Obtiene un evento por su ID.
     * Coincide con @GetMapping("/{id}") en EventController.
     */
    @GetMapping("/api/event/{id}") // <-- RUTA CORRECTA para getById
    EventDTO getById(@PathVariable("id") Long id);

    /**
     * Obtiene todos los eventos.
     * Coincide con @GetMapping("/all") en EventController.
     * El parámetro 'state' es opcional en el controller, así que no necesitamos definirlo aquí.
     */
    @GetMapping("/api/event/all") // <-- RUTA CORREGIDA (quitamos /public)
    List<EventDTO> getAllPublic(); // <-- FIRMA SIN CAMBIOS

}