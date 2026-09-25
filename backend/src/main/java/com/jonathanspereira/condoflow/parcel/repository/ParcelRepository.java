package com.jonathanspereira.condoflow.parcel.repository;

import com.jonathanspereira.condoflow.parcel.entity.Parcel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    Page<Parcel> findByCondominiumIdOrderByReceivedAtDesc(Long condominiumId, Pageable pageable);
    
    Page<Parcel> findByUnitIdOrderByReceivedAtDesc(Long unitId, Pageable pageable);
    
    List<Parcel> findByDeliveryCodeAndCondominiumId(String deliveryCode, Long condominiumId);
    
    Optional<Parcel> findFirstByUnitIdAndStatusOrderByReceivedAtDesc(Long unitId, com.jonathanspereira.condoflow.parcel.entity.ParcelStatus status);
}
