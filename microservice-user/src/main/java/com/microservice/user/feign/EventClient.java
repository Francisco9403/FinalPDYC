package com.microservice.user.feign;

import com.microservice.user.feign.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "msvc-event", url = "localhost:8092")
public interface EventClient {
    
    @GetMapping("/api/event/search/{id}")
    EventDTO getById(@PathVariable("id") Long id);
}
