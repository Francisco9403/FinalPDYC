package com.microservice.user;

import com.microservice.user.util.PasswordEncoderUtil;
import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
public class MicroserviceUserApplication {

	public static void main(String[] args) {
		SpringApplication.run(MicroserviceUserApplication.class, args);
	}

	@Bean
	public PasswordEncoderUtil passwordEncoderUtil() {
		return new PasswordEncoderUtil();
	}
	@Bean
	public ModelMapper modelMapper() {
		return new ModelMapper();
	}


}
