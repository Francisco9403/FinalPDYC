package com.microservice.event.feign;

import com.microservice.event.dto.EventStateChangedDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "msvc-user")
public interface UserClient {
    @PostMapping("/api/user/notify-by-artists")
    void notifyByArtists(EventStateChangedDTO dto);
}
