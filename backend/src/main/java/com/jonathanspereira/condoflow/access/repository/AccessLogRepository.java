package com.jonathanspereira.condoflow.access.repository;

import com.jonathanspereira.condoflow.access.entity.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    List<AccessLog> findByCondominiumIdOrderByEntryTimeDesc(Long condominiumId);

    List<AccessLog> findByAuthorizationIdOrderByEntryTimeDesc(Long authorizationId);

    Optional<AccessLog> findFirstByAuthorizationIdAndExitTimeIsNullOrderByEntryTimeDesc(Long authorizationId);
}
