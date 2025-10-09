package com.microservice.user.notification;

import com.microservice.user.entity.User;
public interface NotificationService {
    void sendNotification(User user, String message);
}
