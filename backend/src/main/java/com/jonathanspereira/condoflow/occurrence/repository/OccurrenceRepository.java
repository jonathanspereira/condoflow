package com.jonathanspereira.condoflow.occurrence.repository;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT o.status, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId GROUP BY o.status")
    List<Object[]> countByStatusGrouped(Long condominiumId);

    @Query("SELECT o.category, COUNT(o) FROM Occurrence o WHERE o.condominium.id = :condominiumId GROUP BY o.category")
    List<Object[]> countByCategoryGrouped(Long condominiumId);

    @Query("SELECT o.status, COUNT(o) FROM Occurrence o WHERE (:condominiumId = -1L OR (o.condominium IS NOT NULL AND o.condominium.id = :condominiumId)) AND o.createdAt >= :startDate GROUP BY o.status")
    List<Object[]> countByStatusFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT o.category, COUNT(o) FROM Occurrence o WHERE (:condominiumId = -1L OR (o.condominium IS NOT NULL AND o.condominium.id = :condominiumId)) AND o.createdAt >= :startDate GROUP BY o.category")
    List<Object[]> countByCategoryFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Occurrence o WHERE (:condominiumId = -1L OR (o.condominium IS NOT NULL AND o.condominium.id = :condominiumId)) AND o.createdAt >= :startDate")
    long countFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT o.condominium.id, o.condominium.name, COUNT(o) FROM Occurrence o WHERE o.condominium IS NOT NULL GROUP BY o.condominium.id, o.condominium.name")
    List<Object[]> countByCondominiumGrouped();

    @Query("SELECT YEAR(o.createdAt), MONTH(o.createdAt), o.status, COUNT(o) FROM Occurrence o WHERE (:condominiumId = -1L OR (o.condominium IS NOT NULL AND o.condominium.id = :condominiumId)) AND o.createdAt >= :startDate GROUP BY YEAR(o.createdAt), MONTH(o.createdAt), o.status")
    List<Object[]> countByMonthAndStatusFiltered(@Param("condominiumId") Long condominiumId, @Param("startDate") LocalDateTime startDate);
}
