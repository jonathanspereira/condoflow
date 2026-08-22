package com.jonathanspereira.condoflow.notification.service;

import com.jonathanspereira.condoflow.notification.dto.NotificationResponseDTO;
import com.jonathanspereira.condoflow.notification.entity.Notification;
import com.jonathanspereira.condoflow.notification.repository.NotificationRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(User recipient, String title, String message, String protocol) {
        if (recipient == null) return;
        Notification notification = new Notification(recipient, title, message, protocol);
        notificationRepository.save(notification);
    }

    public List<NotificationResponseDTO> getUserNotifications(String email) {
        User user = (User) userRepository.findByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String email) {
        User user = (User) userRepository.findByEmail(email);
        if (user == null) return 0;
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = (User) userRepository.findByEmail(email);
        if (user == null) return;
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void markAsRead(Long id, String email) {
        User user = (User) userRepository.findByEmail(email);
        if (user == null) return;
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada."));
        if (notification.getUser().getId().equals(user.getId())) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
