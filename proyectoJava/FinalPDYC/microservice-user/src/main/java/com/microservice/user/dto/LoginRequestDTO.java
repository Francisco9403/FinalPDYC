package com.microservice.user.dto;

public class LoginRequestDTO {// REPRESENTA el JSON que manda el usuario hace Login 

    private String email;
    private String password;

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email = email;
    }
}
