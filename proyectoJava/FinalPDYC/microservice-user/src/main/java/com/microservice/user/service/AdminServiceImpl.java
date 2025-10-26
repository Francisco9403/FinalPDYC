package com.microservice.user.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.microservice.user.dto.AdminDTO;
import com.microservice.user.entity.Admin;
import com.microservice.user.repository.AdminRepository;
import com.microservice.user.util.PasswordEncoderUtil;

@Service
public class AdminServiceImpl implements AdminService{
    @Autowired
    private AdminRepository repository;
    @Autowired
    private PasswordEncoderUtil passwordEncoder;

    @Override
    public List<Admin> getAll(){
        return repository.findAll();
    }
    @Override
    public void create(AdminDTO dto){
        if (repository.existsByUsername(dto.getUsername())){
            throw new IllegalArgumentException("Nombre en uso");
        }
        Admin a = new Admin();
        a.setNombre(dto.getUsername());
        a.setPassword(passwordEncoder.encode(dto.getPassword()));
        a.setRol("ROLE_ADMIN");
        repository.save(a);
    } 
    @Override
    public void update(Long id, Admin admin){
        Admin adminBD =repository.findById(id).get();
        adminBD.setNombre(admin.getNombre());
        repository.save(adminBD);
    }
    @Override
    public Admin getInstance(Long id){
        return repository.findById(id).get();
    }
    @Override
    public void delete(Long id){
        Admin admin = repository.findById(id).get();
        repository.delete(admin);
    }

    public Admin findByUsername(String username){
        return repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));
    }
}
