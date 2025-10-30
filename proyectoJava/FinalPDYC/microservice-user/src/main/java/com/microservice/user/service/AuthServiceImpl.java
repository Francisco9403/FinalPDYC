package com.microservice.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.microservice.user.dto.LoginRequestDTO;
import com.microservice.user.entity.BaseUser;
import com.microservice.user.repository.AdminRepository;
import com.microservice.user.repository.UserRepository;
import com.microservice.user.util.JwtTokenUtil;
import com.microservice.user.util.PasswordEncoderUtil;

@Service
public class AuthServiceImpl implements AuthService{

    @Autowired private UserRepository userRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private PasswordEncoderUtil passwordEncoder;
    @Autowired private JwtTokenUtil jwtTokenUtil;

    @Override
    public String login(LoginRequestDTO request) {
        BaseUser user = userRepository.findByEmail(request.getEmail())
                .map( u -> (BaseUser) u)
                .orElseGet(() -> adminRepository.findByEmail(request.getEmail()).orElse(null));

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        return jwtTokenUtil.generateToken(
            user.getId(),
            user.getNombre(),
            user.getRol() 
        );
    }
}

