package com.jonathanspereira.condoflow.log.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_system_logs")
@Data
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type; // e.g. "EMAIL", "SYSTEM"

    @Column(nullable = false, length = 100)
    private String action; // e.g. "FORGOT_PASSWORD", "NEW_OCCURRENCE"

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    private String status; // "SUCCESS", "ERROR"

    @Column(columnDefinition = "TEXT")
    private String details; // Error stack traces or additional context

    @Column(name = "target_who")
    private String target; // "QUEM" (Who was the target, e.g. email address)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
