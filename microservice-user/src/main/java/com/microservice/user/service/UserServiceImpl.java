package com.microservice.user.service;

import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserDTO;
import com.microservice.user.entity.User;
import com.microservice.user.repository.UserRepository;
import com.microservice.user.feign.ArtistClient;
import com.microservice.user.feign.EventClient;
import com.microservice.user.feign.dto.ArtistDTO;
import com.microservice.user.feign.dto.EventDTO;
import com.microservice.user.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repoUser;

    @Autowired
    private ArtistClient artistClient;

    @Autowired
    private EventClient eventClient;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.microservice.user.util.PasswordEncoderUtil passwordEncoder; // define below

    @Override
    public List<User> getAll() { return repoUser.findAll(); }

    @Override
    public void create(UserDTO dto) throws Exception {
        if (repoUser.existsByNombre(dto.getNombre())) throw new Exception("Nombre en uso");
        if (repoUser.existsByEmail(dto.getEmail())) throw new Exception("Email en uso");
        User u = new User();
        u.setNombre(dto.getNombre());
        u.setEmail(dto.getEmail());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setRol("ROLE_USER");
        repoUser.save(u);
    }

    @Override
    public void update(Long id, UserDTO dto) throws Exception {
        User u = repoUser.findById(id).orElseThrow();
        if (repoUser.existsByNombre(dto.getNombre())) throw new Exception("Nombre en uso");
        if (repoUser.existsByEmail(dto.getEmail())) throw new Exception("Email en uso");
        u.setNombre(dto.getNombre());
        u.setEmail(dto.getEmail());
        repoUser.save(u);
    }

    @Override
    public User getInstance(Long id) { return repoUser.findById(id).orElseThrow(); }

    @Override
    public void delete(Long id) { repoUser.delete(repoUser.findById(id).orElseThrow()); }

    @Override
    public User findByNombre(String nombre){
        return repoUser.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("el usuario: "+nombre+" no se encontro")); 
    }

    @Override
    public void seguirArtista(Long userId, Long artistId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        // validar existencia via ArtistClient
        if (artistClient.getByIdPublic(artistId) == null) throw new Exception("Artista no existe");
        u.getArtistasSeguidos().add(artistId);
        repoUser.save(u);
    }

        @Override
    public void dejarSeguirArtista(Long userId, Long artistId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        u.getArtistasSeguidos().remove(artistId);
        repoUser.save(u);
    }

    @Override
    public void seguirEvento(Long userId, Long eventId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        // validar evento y estado via eventClient
        var event = eventClient.getById(eventId);
        if (event == null) throw new Exception("Evento no existe");
        if ("TENTATIVE".equals(event.getState())) throw new Exception("No se puede seguir evento tentativo");
        u.getEventosFavoritos().add(eventId);
        repoUser.save(u);
    }

    @Override
    public void dejarSeguirEvento(Long userId, Long eventId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        u.getEventosFavoritos().remove(eventId);
        repoUser.save(u);
    }

    @Override
    public List<EventDTO> listaEventoVigente(Long userId) {
        LocalDate now = LocalDate.now();

        User user = repoUser.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getEventosFavoritos().stream()
                .map(eventId -> {
                    try {
                        return eventClient.getById(eventId); // llamado al microservicio de eventos
                    } catch (Exception ex) {
                        // si el evento no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                .filter(e -> e.getStartDate().isAfter(now)
                        && !("CANCELLED".equals(e.getState()) || "TENTATIVE".equals(e.getState())))
                .collect(Collectors.toList());
    }

    @Override
    public List<User> recipientsByArtists(EventStateChangedDTO dto) {
        Set<Long> artists = dto.getArtistIds() != null ? dto.getArtistIds() : new HashSet<>();
        List<User> seguidores = repoUser.findDistinctByArtistasSeguidosIn(artists);
        List<User> fanaticos = repoUser.findDistinctByEventosFavoritosContaining(dto.getEventId());
        Set<User> destinatarios = new HashSet<>();
        destinatarios.addAll(seguidores);
        destinatarios.addAll(fanaticos);
        return destinatarios.stream().collect(Collectors.toList());
    }

    @Override
    public void notifyByArtists(EventStateChangedDTO dto) {
        List<User> recipients = recipientsByArtists(dto);
        String message = String.format("El evento «%s» cambió de %s a %s.", dto.getEventName(), dto.getOldState(), dto.getNewState());
        recipients.forEach(u -> notificationService.sendNotification(u, message));
    }

    @Override
    public List<EventDTO> listaEventoProximosDeMisArtistas(Long userId) {
        LocalDate now = LocalDate.now();

        User user = repoUser.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getArtistasSeguidos().stream()             //El usuario trae los artistas que sigue
                .map(artistId -> {
                    try {
                        return artistClient.getByIdPublic(artistId); // llamado al microservicio de artista
                    } catch (Exception ex) {
                        // si el artista no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                
                .flatMap(artist -> artist.getEventsIds().stream())  //te trae los eventos en que participa un artista y 
                .map(eventId -> {                                   //verifica que NO esten ni tentativos o cancelados, que no hallan sucedido y los muestra
                    try {
                        return eventClient.getById(eventId); // llamado al microservicio de eventos
                    } catch (Exception ex) {
                        // si el evento no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                
                .filter(e -> e.getStartDate().isAfter(now)
                        && !("CANCELLED".equals(e.getState()) || "TENTATIVE".equals(e.getState())))
                .sorted((e1, e2) -> e1.getStartDate().compareTo(e2.getStartDate())) //ver si cumple el mostrar las fechas mas proximas
                .collect(Collectors.toList());
    }

    public List<ArtistDTO> listaArtista(Long userId){
        User user = repoUser.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getArtistasSeguidos().stream()             //El usuario trae los artistas que sigue
                .map(artistId -> {
                    try {
                        return artistClient.getByIdPublic(artistId); // llamado al microservicio de artista
                    } catch (Exception ex) {
                        // si el artista no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                .collect(Collectors.toList());
    }

    public List<ArtistDTO> getGeneroArtists(String genero){
        return artistClient.getAllPublic(genero);
    }

    @Override
    public List<EventDTO> getUpcomingEvents() {
        // Devuelve todos los eventos futuros que estén vigentes (NO cancelados ni tentativos).
        LocalDate now = LocalDate.now();
        List<EventDTO> all;
        try {
            // Traemos todos los eventos públicos desde el microservicio de eventos
            all = eventClient.getAllPublic();
        } catch (Exception ex) {
            return Collections.emptyList(); // si el servicio no responde, devolvemos lista vacía
        }
        return all.stream()
                .filter(Objects::nonNull) // eliminamos posibles nulos
                .filter(e -> e.getStartDate() != null && e.getStartDate().isAfter(now)) // que sean futuros
                .filter(e -> !"CANCELLED".equals(e.getState()) && !"TENTATIVE".equals(e.getState())) // que no estén cancelados ni tentativos
                .sorted(Comparator.comparing(EventDTO::getStartDate)) // ordenados por fecha más próxima
                .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getEventsByArtist(Long artistId) {
        // Devuelve todos los eventos en los que participa un artista específico.
        ArtistDTO artist;
        try {
            artist = artistClient.getByIdPublic(artistId); // buscamos el artista en el microservicio
        } catch (Exception ex) {
            return Collections.emptyList(); // si falla la llamada, devolvemos vacío
        }
        if (artist == null) return Collections.emptyList();

        return artist.getEventsIds().stream() // recorremos todos los eventos en los que participa el artista
                .map(eventId -> {
                    try {
                        return eventClient.getById(eventId); // traemos cada evento por su id
                    } catch (Exception ex) {
                        return null; // si el evento no existe o falla la llamada, lo ignoramos
                    }
                })
                .filter(Objects::nonNull) // eliminamos null
                .collect(Collectors.toList());
    }

    @Override
    public EventDTO getEventById(Long eventId) {
        // Devuelve el detalle de un evento específico por su ID.
        try {
            return eventClient.getById(eventId);
        } catch (Exception ex) {
            throw new RuntimeException("Evento no encontrado");
        }
    }

    @Override
    public boolean isTentativeEvent(Long eventId) {
        // Verifica si un evento está en estado "TENTATIVE".
        try {
            EventDTO e = eventClient.getById(eventId);
            return e != null && "TENTATIVE".equals(e.getState());
        } catch (Exception ex) {
            return false; // si no se puede obtener el evento, asumimos que no es tentativo
        }
    }



}
