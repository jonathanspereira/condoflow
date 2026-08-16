package com.jonathanspereira.condoflow.occurrence.repository;

import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccurrenceAttachmentRepository extends JpaRepository<OccurrenceAttachment, Long> {
}
