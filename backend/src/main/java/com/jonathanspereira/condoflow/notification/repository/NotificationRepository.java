package com.jonathanspereira.condoflow.notification.repository;

import com.jonathanspereira.condoflow.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);
}
