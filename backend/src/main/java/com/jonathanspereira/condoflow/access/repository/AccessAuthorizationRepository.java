package com.jonathanspereira.condoflow.access.repository;

import com.jonathanspereira.condoflow.access.entity.AccessAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AccessAuthorizationRepository extends JpaRepository<AccessAuthorization, Long> {
    
    Optional<AccessAuthorization> findByLinkToken(String linkToken);

    Optional<AccessAuthorization> findByAccessCodeAndCondominiumId(String accessCode, Long condominiumId);
    
    Optional<AccessAuthorization> findByPinAndCondominiumId(String pin, Long condominiumId);

    List<AccessAuthorization> findByCondominiumIdOrderByCreatedAtDesc(Long condominiumId);

    List<AccessAuthorization> findByResidentIdOrderByCreatedAtDesc(String residentId);

    List<AccessAuthorization> findByUnitIdOrderByCreatedAtDesc(Long unitId);
}
