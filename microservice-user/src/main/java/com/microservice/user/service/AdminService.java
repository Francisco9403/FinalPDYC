package com.microservice.user.service;

import java.util.List;

import com.microservice.user.dto.AdminDTO;
import com.microservice.user.entity.Admin;

public interface AdminService {
    List<Admin> getAll();
    void create(AdminDTO admin);
    void update(Long id,Admin admin);
    Admin getInstance(Long id);
    void delete(Long id);
    Admin findByUsername(String username);
}
