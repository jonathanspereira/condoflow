package com.jonathanspereira.condoflow.user.repository;

import com.jonathanspereira.condoflow.user.entity.Role;
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

    @Query("SELECT cr.user FROM CondominiumRole cr WHERE cr.condominium.id = :condominiumId AND cr.user.role = :role")
    List<User> findByCondominiumIdAndRole(@Param("condominiumId") Long condominiumId, @Param("role") Role role);

    List<User> findByRole(Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role != com.jonathanspereira.condoflow.user.entity.Role.SUPER_ADMIN AND (:condominiumId = -1L OR u.id IN (SELECT cr.user.id FROM CondominiumRole cr WHERE cr.condominium.id = :condominiumId))")
    long countFiltered(@Param("condominiumId") Long condominiumId);

    @Query("SELECT cr.condominium.id, cr.condominium.name, COUNT(DISTINCT cr.user) FROM CondominiumRole cr GROUP BY cr.condominium.id, cr.condominium.name")
    List<Object[]> countByCondominiumGrouped();
}