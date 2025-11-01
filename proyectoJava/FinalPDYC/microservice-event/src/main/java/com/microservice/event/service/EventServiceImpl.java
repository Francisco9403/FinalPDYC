package com.microservice.event.service;

import com.microservice.event.dto.EventStateChangedDTO;
import com.microservice.event.entity.Event;
import com.microservice.event.feign.ArtistClient;
import com.microservice.event.feign.UserClient;
import com.microservice.event.feign.dto.ArtistDTO;
import com.microservice.event.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository repo;

    @Autowired
    private ArtistClient artistClient;

    @Autowired
    private UserClient userClient;

    @Override
    public List<Event> findAll(String state) {
        if (state != null) return repo.findByState(state);
        return repo.findAll();
    }

    @Override
    public Event findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Override
    public Event save(Event event) {
        event.setState("TENTATIVE");
        event.getArtistIds().clear();
        return repo.save(event);
    }

    @Override
        public Event update(Long id, Event event) {
        Event e = findById(id);
        if (!"TENTATIVE".equals(e.getState())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo tentativos editables");
        e.setNombre(event.getNombre());
        e.setDescripcion(event.getDescripcion());
        e.setStartDate(event.getStartDate());
        return repo.save(e);
    }

    @Override
    public void delete(Long id) {
        Event e = findById(id);
        if (!"TENTATIVE".equals(e.getState())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo tentativos se borran");
        repo.delete(e);
    }

    @Override
    public Event addArtist(Long eventId, Long artistId) {
        // --- CORRECCIÓN ---
        // findById ya devuelve un Event o lanza una excepción, no necesitamos .orElseThrow()
        Event e = findById(eventId);
        // ------------------

        if (!("TENTATIVE".equals(e.getState()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden añadir artistas a eventos en estado TENTATIVE");
        }

        // Validar artista vía ArtistClient (asegúrate que ArtistClient llame a la ruta PÚBLICA)
        ArtistDTO a = artistClient.getById(artistId);
        if (a == null || !a.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artista no válido o inactivo");
        }

        e.getArtistIds().add(artistId);
        return repo.save(e);
    }

    @Override
    public Event removeArtist(Long eventId, Long artistId) {
        Event e = findById(eventId);
        if (!"TENTATIVE".equals(e.getState())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden quitar artistas de eventos en estado TENTATIVE");
        }

        e.getArtistIds().remove(artistId);
        return repo.save(e);
    }

    @Override
    public Event confirm(Long id) {
        Event e = findById(id);
        String old = e.getState();
        if (e.getStartDate().isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha debe ser futura");
        e.setState("CONFIRMED");
        Event saved = repo.save(e);
        notifyUsers(saved, old, "CONFIRMED");
        return saved;
    }

    @Override
    public Event reschedule(Long id, LocalDate date) {
        Event e = findById(id);
        String old = e.getState();
        if (!("CONFIRMED".equals(old) || "RESCHEDULED".equals(old))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        if (date.isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nueva fecha debe ser futura");
        e.setStartDate(date);
        e.setState("RESCHEDULED");
        Event saved = repo.save(e);
        notifyUsers(saved, old, "RESCHEDULED");
        return saved;
    }

    @Override
    public Event cancel(Long id) {
        Event e = findById(id);
        String old = e.getState();
        if (!("CONFIRMED".equals(old) || "RESCHEDULED".equals(old))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        e.setState("CANCELLED");
        Event saved = repo.save(e);
        notifyUsers(saved, old, "CANCELLED");
        return saved;
    }

    private void notifyUsers(Event event, String oldState, String newState) {
        EventStateChangedDTO dto = new EventStateChangedDTO(event.getId(), event.getNombre(), oldState, newState, event.getArtistIds());
        try {
            userClient.notifyByArtists(dto);
        } catch (Exception ex) {
            // log error (no detener la operación)
            System.err.println("No se pudo notificar usuarios: " + ex.getMessage());
        }
    }
}
