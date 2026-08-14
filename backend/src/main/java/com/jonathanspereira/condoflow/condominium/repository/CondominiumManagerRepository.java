package com.jonathanspereira.condoflow.condominium.repository;

import com.jonathanspereira.condoflow.condominium.entity.CondominiumManager;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CondominiumManagerRepository extends JpaRepository<CondominiumManager, Long> {
    List<CondominiumManager> findBySindicoId(String sindicoId);
    Optional<CondominiumManager> findByCondominiumIdAndSindicoId(Long condominiumId, String sindicoId);
    List<CondominiumManager> findByCondominiumId(Long condominiumId);
}