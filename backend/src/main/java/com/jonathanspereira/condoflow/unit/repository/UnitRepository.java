package com.jonathanspereira.condoflow.unit.repository;

import com.jonathanspereira.condoflow.unit.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    List<Unit> findByCondominiumId(Long condominiumId);

    Optional<Unit> findByOwnerId(String ownerId);
    Optional<Unit> findByTenantId(String tenantId);

    // NOVO — busca a unidade dentro do condomínio, ignorando maiúsc/minúsc
    Optional<Unit> findByCondominiumIdAndUnitIgnoreCase(Long condominiumId, String unit);
}