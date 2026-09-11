package com.jonathanspereira.condoflow.log.repository;

import com.jonathanspereira.condoflow.log.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findByTypeOrderByCreatedAtDesc(String type);
    List<SystemLog> findAllByOrderByCreatedAtDesc();
}
