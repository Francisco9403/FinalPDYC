package com.microservice.event.controller;

import com.microservice.event.entity.Event;
import com.microservice.event.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event")
public class EventController {

    @Autowired
    private EventService service;

    @PostMapping("/create")
    public Event create(@RequestBody Event event) { return service.save(event); }

    @GetMapping("/all")
    public List<Event> all(@RequestParam(required = false) String state) { return service.findAll(state); }

    @GetMapping("/search/{id}")
    public Event byId(@PathVariable Long id) { return service.findById(id); }

    @PostMapping("/{id}/artists")
    public Event addArtist(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return service.addArtist(id, body.get("artistId"));
    }

    @DeleteMapping("/{id}/artists/{artistId}")
    public Event removeArtist(@PathVariable Long id, @PathVariable Long artistId) {
        return service.removeArtist(id, artistId);
    }

    @PutMapping("/{id}/confirmed")
    public Event confirm(@PathVariable Long id) { return service.confirm(id); }

    @PutMapping("/{id}/rescheduled")
    public Event reschedule(@PathVariable Long id,
                            @RequestBody @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate) {
        return service.reschedule(id, newDate);
    }

    @PutMapping("/{id}/canceled")
    public Event cancel(@PathVariable Long id) { return service.cancel(id); }
}
