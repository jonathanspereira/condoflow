package com.jonathanspereira.condoflow.occurrence.repository;

import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, String> {
    // Já vamos deixar pronto para a Issue #6 (Consulta Pública)
    Optional<Occurrence> findByProtocol(String protocol);
}