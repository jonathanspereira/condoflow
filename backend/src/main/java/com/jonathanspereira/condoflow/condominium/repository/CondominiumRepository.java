package com.jonathanspereira.condoflow.condominium.repository;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CondominiumRepository extends JpaRepository<Condominium, Long> {

}