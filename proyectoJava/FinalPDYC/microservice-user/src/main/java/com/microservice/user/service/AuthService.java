package com.microservice.user.service;

import com.microservice.user.dto.LoginRequestDTO;

public interface AuthService {

    public String login(LoginRequestDTO request); 
}
