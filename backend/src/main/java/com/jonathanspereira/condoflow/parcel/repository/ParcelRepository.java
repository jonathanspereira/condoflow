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
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Parcel p WHERE p.condominium.id = :condominiumId " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (cast(:startDate as timestamp) IS NULL OR p.receivedAt >= :startDate) " +
           "AND (cast(:endDate as timestamp) IS NULL OR p.receivedAt <= :endDate) " +
           "ORDER BY p.receivedAt DESC")
    Page<Parcel> findByCondominiumIdWithFilters(
            @org.springframework.data.repository.query.Param("condominiumId") Long condominiumId,
            @org.springframework.data.repository.query.Param("status") com.jonathanspereira.condoflow.parcel.entity.ParcelStatus status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Parcel p WHERE p.unit.id = :unitId " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (cast(:startDate as timestamp) IS NULL OR p.receivedAt >= :startDate) " +
           "AND (cast(:endDate as timestamp) IS NULL OR p.receivedAt <= :endDate) " +
           "ORDER BY p.receivedAt DESC")
    Page<Parcel> findByUnitIdWithFilters(
            @org.springframework.data.repository.query.Param("unitId") Long unitId,
            @org.springframework.data.repository.query.Param("status") com.jonathanspereira.condoflow.parcel.entity.ParcelStatus status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            Pageable pageable);

    Optional<Parcel> findFirstByUnitIdAndStatusOrderByReceivedAtDesc(Long unitId, com.jonathanspereira.condoflow.parcel.entity.ParcelStatus status);
}
