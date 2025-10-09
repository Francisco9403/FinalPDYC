package com.microservice.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import com.microservice.user.entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin,Long> {
    Optional<Admin> findByUsername(@Param("username") String username); //Nota: se puede quitar @Param, solo es obligatorio cuando uso @Query
    Optional<Admin> findByEmail(String email);
    boolean existsByUsername(String username);
}
