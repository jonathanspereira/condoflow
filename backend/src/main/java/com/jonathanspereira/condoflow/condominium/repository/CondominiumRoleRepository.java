package com.jonathanspereira.condoflow.condominium.repository;

import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CondominiumRoleRepository extends JpaRepository<CondominiumRole, Long> {
    List<CondominiumRole> findByUserId(String userId);
    Optional<CondominiumRole> findByCondominiumIdAndUserId(Long condominiumId, String userId);
    List<CondominiumRole> findByCondominiumId(Long condominiumId);
}