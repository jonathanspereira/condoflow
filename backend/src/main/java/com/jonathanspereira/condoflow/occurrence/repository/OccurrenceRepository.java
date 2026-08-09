package com.jonathanspereira.condoflow.occurrence.repository;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, Long> {

    Optional<Occurrence> findByProtocol(String protocol);

    List<Occurrence> findByReportedByIdOrderByCreatedAtDesc(String reportedById);
}