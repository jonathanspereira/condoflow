package com.jonathanspereira.condoflow.occurrence.repository;

import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OccurrenceMessageRepository extends JpaRepository<OccurrenceMessage, Long> {
    List<OccurrenceMessage> findByOccurrenceIdOrderByCreatedAtAsc(Long occurrenceId);
}
