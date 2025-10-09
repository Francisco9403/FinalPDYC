package com.microservice.user.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.microservice.user.service.UserService;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private ArtistaService artistaService;
    @Autowired
    private EventoService eventoService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserAuthenticationService userAuthenticationService;
    @Autowired
    private ModelMapper modelMapper;

    @GetMapping("/artistas")
    public List<Artista> listarArtistasActivos(){
        List<Artista> artistas = artistaService.getAll(null);
        List<Artista> listAux = new ArrayList<Artista>();
        
        for (Artista art : artistas){
            if(art.isActive()){
                listAux.add(art);
            }
        }
        return listAux;
    }

    @GetMapping("/eventos")
    public List<Evento> listarEventosVigYprox(){
        LocalDate hoy = LocalDate.now();
        return eventoService.getAll(null).stream()  //La "e" es la variable que representa cada objeto Evento del stream
                .filter(e -> (e.getState() == EventoState.CONFIRMED || e.getState() == EventoState.RESCHEDULED) //Filtra los eventos con estado "confirmado" o "rerogramado"
                               && e.getStartDate().isAfter(hoy) )                         // Y que no halla sucedido todavia, osea fechas mayores a "hoy"
                .collect(Collectors.toList());
    }

    @GetMapping("/eventosDeArtista/{id}")
    public List<Evento> eventosDeArtista(@PathVariable Long id){
        LocalDate hoy = LocalDate.now();
        Artista art = artistaService.getById(id);

        return art.getEvents().stream()             //Hago un stream que luego paso a lista, con los eventos en estado confirmados o reprogramados
                .filter(e -> (e.getState() == EventoState.CONFIRMED || e.getState() == EventoState.RESCHEDULED)
                                && e.getStartDate().isAfter(hoy)) // y me aseguro que todavia no hallan pasado
                .collect(Collectors.toList());
    }

    @GetMapping("/evento/{id}")
    public Evento mostrarEvento(@PathVariable Long id){ //VER si esto devuelve todos sus datos
        Evento e = eventoService.getById(id);

        if (e.getState() == EventoState.TENTATIVE) {    //Consulte sobre la excepcion y me recomiendan usar ResponseStatusException
            throw new ResponseStatusException(          //Porque permite controlar el codigo de estado HTTP
                HttpStatus.FORBIDDEN, "No se puede acceder a información de eventos en estado TENTATIVE"
            );
        }
        return e;
    }

    @PostMapping("/registrarUsuario")
    public void registrarUsuario(@RequestBody UserAuthenticationRequestDTO userDTO) throws Exception{ //Registro un usuario (guardandolo en la BD)
        userService.create(userDTO);         
    }                                      

    @PostMapping(path = "/auth", produces = "application/json")
    public ResponseEntity<?> authentication(@RequestBody UserAuthenticationRequestDTO userDTO) { //AUTENTICO a un usuario (verfico que exista en la BD)
        try {
            User user = modelMapper.map(userDTO, User.class);
            String token = userAuthenticationService.authenticate(user);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("token", token);                           //De existir en la BD, devuelvo un token, con el que se verifica que esta registrado
                                                                            //Y puede acceder a URLs de solo registrados (Las de "UserResource")
            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
