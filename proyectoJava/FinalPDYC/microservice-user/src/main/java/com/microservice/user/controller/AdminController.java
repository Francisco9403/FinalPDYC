package com.microservice.user.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.microservice.user.dto.AdminDTO;
import com.microservice.user.entity.Admin;
import com.microservice.user.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ---------- Listar todos los admins ----------
    @GetMapping
    public ResponseEntity<List<Admin>> getAdmins(
            @RequestHeader("X-Auth-User") String username,
            @RequestHeader("X-Auth-Roles") String roles) {

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(adminService.getAll());
    }

    // ---------- Crear un admin ----------
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody AdminDTO dto,
            @RequestHeader("X-Auth-Roles") String roles) {

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        adminService.create(dto);
        return ResponseEntity.ok().build();
    }

    // ---------- Actualizar un admin ----------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Admin admin,
            @RequestHeader("X-Auth-Roles") String roles) {

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        adminService.update(id, admin);
        return ResponseEntity.ok().build();
    }

    // ---------- Obtener un admin por ID ----------
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getInstance(
            @PathVariable Long id,
            @RequestHeader("X-Auth-Roles") String roles) {

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(adminService.getInstance(id));
    }

    // ---------- Eliminar un admin ----------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader("X-Auth-Roles") String roles) {

        if (!roles.contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        adminService.delete(id);
        return ResponseEntity.ok().build();
    }
}
