package com.microservice.user.notification;

import com.microservice.user.entity.User;
import org.springframework.stereotype.Service;

@Service
public class LoggingNotificationService implements NotificationService {
    @Override
    public void sendNotification(User user, String message) {
        System.out.println("[NOTIF] Para: " + user.getEmail() + " ▶ " + message);
    }
}
