package com.jonathanspereira.condoflow.user.repository;

import com.jonathanspereira.condoflow.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    UserDetails findByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE (:condominiumId IS NULL OR u.condominium.id = :condominiumId)")
    long countFiltered(@Param("condominiumId") Long condominiumId);

    @Query("SELECT u.condominium.id, u.condominium.name, COUNT(u) FROM User u WHERE u.condominium IS NOT NULL GROUP BY u.condominium.id, u.condominium.name")
    List<Object[]> countByCondominiumGrouped();
}