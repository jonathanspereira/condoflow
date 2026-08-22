package com.jonathanspereira.condoflow.notification.entity;

import com.jonathanspereira.condoflow.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tb_notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column
    private String protocol;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(User user, String title, String message, String protocol) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.protocol = protocol;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }
}
