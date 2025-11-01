package com.microservice.user.repository;

import com.microservice.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNombre(String nombre);
    Optional<User> findById(Long id);
    boolean existsByNombre(String nombre);
    boolean existsByEmail(String email);

    List<User> findDistinctByArtistasSeguidosIn(Set<Long> artistas);
    List<User> findDistinctByEventosFavoritosContaining(Long eventId);
}
