package com.microservice.user.notification;

import com.microservice.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendNotification(User user, String message) {
        try {
            System.out.println("se entro al metodo sendNotification");
            // 1. Crear el objeto de mensaje simple
            SimpleMailMessage mailMessage = new SimpleMailMessage();

            // 2. Establecer los detalles del correo
            mailMessage.setFrom("riosjoaquin781@gmail.com"); // El remitente, tiene que coincidir con el configurado en application.yml
            mailMessage.setTo(user.getEmail());
            mailMessage.setSubject("Cambio de estado del un evento");
            mailMessage.setText(message); // El cuerpo del mensaje

            // 3. Enviar el correo
            mailSender.send(mailMessage);
            //Console.log("[EMAIL] Enviado a: " + user.getEmail() + " ▶ " + message);
            System.out.println("[EMAIL] Enviado a: " + user.getEmail() + " ▶ " + message);

        } catch (Exception e) {
            System.err.println("Error al enviar email a " + user.getEmail() + ": " + e.getMessage());
            // Aquí se podria agregar lógica para reintentar o registrar el error
        }
    }
}