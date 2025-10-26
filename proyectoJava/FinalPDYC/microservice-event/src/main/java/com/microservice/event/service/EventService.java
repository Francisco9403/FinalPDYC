package com.microservice.event.service;

import com.microservice.event.entity.Event;

import java.time.LocalDate;
import java.util.List;

public interface EventService {
    List<Event> findAll(String state);
    Event findById(Long id);
    Event save(Event event);
    Event update(Long id, Event event);
    void delete(Long id);

    Event addArtist(Long eventId, Long artistId);
    Event removeArtist(Long eventId, Long artistId);
    Event confirm(Long id);
    Event reschedule(Long id, LocalDate date);
    Event cancel(Long id);
}
