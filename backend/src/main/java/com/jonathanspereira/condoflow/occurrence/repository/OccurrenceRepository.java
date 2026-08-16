package com.jonathanspereira.condoflow.occurrence.repository;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, Long> {

    Optional<Occurrence> findByProtocol(String protocol);

    List<Occurrence> findByReportedByIdOrderByCreatedAtDesc(String reportedById);

    List<Occurrence> findByCondominiumIdOrderByCreatedAtDesc(Long condominiumId);

    long countByCondominiumIdAndCategoryInAndStatusNotIn(
            Long condominiumId, List<OccurrenceCategory> categories, List<OccurrenceStatus> excludedStatuses);

    long countByCondominiumIdAndStatusNotIn(Long condominiumId, List<OccurrenceStatus> excludedStatuses);

    long countByCondominiumIdAndStatusInAndCreatedAtBetween(
            Long condominiumId, List<OccurrenceStatus> statuses, LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT o.status, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId GROUP BY o.status")
    List<Object[]> countByStatusGrouped(Long condominiumId);

    @org.springframework.data.jpa.repository.Query("SELECT o.category, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId GROUP BY o.category")
    List<Object[]> countByCategoryGrouped(Long condominiumId);
}