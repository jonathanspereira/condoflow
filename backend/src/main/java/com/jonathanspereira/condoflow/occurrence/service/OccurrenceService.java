package com.jonathanspereira.condoflow.occurrence.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.occurrence.dto.AnonymousOccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceUpdateDTO;
import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceMessage;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceMessageRepository;
import com.jonathanspereira.condoflow.occurrence.dto.MessageRequestDTO;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceAttachment;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceAttachmentRepository;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OccurrenceService {

    private final OccurrenceRepository occurrenceRepository;
    private final OccurrenceMessageRepository occurrenceMessageRepository;
    private final OccurrenceAttachmentRepository occurrenceAttachmentRepository;
    private final CondominiumRepository condominiumRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final com.jonathanspereira.condoflow.common.email.service.EmailService emailService;

    public OccurrenceResponseDTO create(String userEmail, OccurrenceRequestDTO dto) {
        User reporter = getUserByEmail(userEmail);

        Unit unit = null;
        if (dto.unitId() != null) {
            unit = unitRepository.findById(dto.unitId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidade informada não encontrada."));
        } else {
            unit = unitRepository.findAllByOwnerId(reporter.getId()).stream().findFirst()
                    .or(() -> unitRepository.findAllByTenantId(reporter.getId()).stream().findFirst())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Você não possui uma unidade vinculada para abrir um relato."));
        }

        Condominium condominium = condominiumRepository.findById(unit.getCondominiumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condomínio não encontrado."));

        Occurrence occurrence = new Occurrence();
        occurrence.setTitle(dto.title());
        occurrence.setDescription(dto.description());
        occurrence.setCategory(dto.category());
        occurrence.setCondominium(condominium);
        occurrence.setUnit(unit);
        occurrence.setReportedBy(reporter);
        occurrence.setStatus(OccurrenceStatus.OPEN);

        Occurrence saved = occurrenceRepository.save(occurrence);
        return new OccurrenceResponseDTO(saved);
    }

    public OccurrenceResponseDTO createAnonymous(AnonymousOccurrenceRequestDTO dto) {
        Condominium condominium = condominiumRepository.findById(dto.condominiumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Condomínio não encontrado com o ID informado."));

        Occurrence occurrence = new Occurrence();
        occurrence.setTitle(dto.title());
        occurrence.setDescription(dto.description());
        occurrence.setCategory(dto.category());
        occurrence.setCondominium(condominium);
        occurrence.setStatus(OccurrenceStatus.OPEN);
        // reportedBy fica null para ocorrências anônimas

        Occurrence saved = occurrenceRepository.save(occurrence);
        return new OccurrenceResponseDTO(saved);
    }

    public List<OccurrenceResponseDTO> findMine(String userEmail) {
        User reporter = getUserByEmail(userEmail);

        return occurrenceRepository.findByReportedByIdOrderByCreatedAtDesc(reporter.getId())
                .stream()
                .map(OccurrenceResponseDTO::new)
                .collect(Collectors.toList());
    }

    public OccurrenceResponseDTO findByProtocol(String protocol) {
        Occurrence occurrence = occurrenceRepository.findByProtocol(protocol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Ocorrência não encontrada para o protocolo informado."));

        return new OccurrenceResponseDTO(occurrence);
    }

    public List<OccurrenceResponseDTO> findByCondominium(Long condominiumId) {
        return occurrenceRepository.findByCondominiumIdOrderByCreatedAtDesc(condominiumId)
                .stream()
                .map(OccurrenceResponseDTO::new)
                .collect(Collectors.toList());
    }

    public OccurrenceResponseDTO update(Long id, OccurrenceUpdateDTO dto) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        if (dto.status() != null) {
            occurrence.setStatus(dto.status());
        }
        if (dto.response() != null) {
            occurrence.setResponse(dto.response());
        }

        Occurrence saved = occurrenceRepository.save(occurrence);

        String recipientEmail = null;
        String recipientName = null;

        if (saved.getReportedBy() != null && saved.getReportedBy().getEmail() != null) {
            recipientEmail = saved.getReportedBy().getEmail();
            recipientName = saved.getReportedBy().getName();
        } else if (saved.getUnit() != null) {
            if (saved.getUnit().isRented() && saved.getUnit().getTenant() != null && saved.getUnit().getTenant().getEmail() != null) {
                recipientEmail = saved.getUnit().getTenant().getEmail();
                recipientName = saved.getUnit().getTenant().getName();
            } else if (saved.getUnit().getOwner() != null && saved.getUnit().getOwner().getEmail() != null) {
                recipientEmail = saved.getUnit().getOwner().getEmail();
                recipientName = saved.getUnit().getOwner().getName();
            }
        }

        if (recipientEmail != null) {
            emailService.sendOccurrenceUpdateNotification(
                    recipientEmail,
                    recipientName,
                    saved.getProtocol(),
                    saved.getTitle(),
                    saved.getStatus() != null ? saved.getStatus().name() : "ATUALIZADO",
                    dto.response()
            );
        }

        return new OccurrenceResponseDTO(saved);
    }

    public OccurrenceResponseDTO addMessage(Long id, MessageRequestDTO dto, String userEmail) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        User sender = getUserByEmail(userEmail);

        OccurrenceMessage message = new OccurrenceMessage();
        message.setOccurrence(occurrence);
        message.setSender(sender);
        message.setContent(dto.content());

        OccurrenceMessage savedMessage = occurrenceMessageRepository.save(message);
        if (occurrence.getMessages() != null && !occurrence.getMessages().contains(savedMessage)) {
            occurrence.getMessages().add(savedMessage);
        }

        String recipientEmail = null;
        String recipientName = null;

        if (occurrence.getReportedBy() != null && occurrence.getReportedBy().getEmail() != null) {
            recipientEmail = occurrence.getReportedBy().getEmail();
            recipientName = occurrence.getReportedBy().getName();
        } else if (occurrence.getUnit() != null) {
            if (occurrence.getUnit().isRented() && occurrence.getUnit().getTenant() != null && occurrence.getUnit().getTenant().getEmail() != null) {
                recipientEmail = occurrence.getUnit().getTenant().getEmail();
                recipientName = occurrence.getUnit().getTenant().getName();
            } else if (occurrence.getUnit().getOwner() != null && occurrence.getUnit().getOwner().getEmail() != null) {
                recipientEmail = occurrence.getUnit().getOwner().getEmail();
                recipientName = occurrence.getUnit().getOwner().getName();
            }
        }

        if (recipientEmail != null && !userEmail.equalsIgnoreCase(recipientEmail)) {
            emailService.sendOccurrenceUpdateNotification(
                    recipientEmail,
                    recipientName,
                    occurrence.getProtocol(),
                    occurrence.getTitle(),
                    occurrence.getStatus() != null ? occurrence.getStatus().name() : "NOVA MENSAGEM",
                    dto.content()
            );
        }

        return new OccurrenceResponseDTO(occurrence);
    }

    public OccurrenceResponseDTO addAttachment(Long id, MultipartFile file, String userEmail) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio.");
        }

        try {
            OccurrenceAttachment attachment = new OccurrenceAttachment();
            attachment.setOccurrence(occurrence);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileType(file.getContentType());
            attachment.setFileData(file.getBytes());

            OccurrenceAttachment savedAttachment = occurrenceAttachmentRepository.save(attachment);
            if (occurrence.getAttachments() != null && !occurrence.getAttachments().contains(savedAttachment)) {
                occurrence.getAttachments().add(savedAttachment);
            }

            return new OccurrenceResponseDTO(occurrence);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao processar o arquivo.");
        }
    }

    public OccurrenceAttachment getAttachment(Long id, Long attachmentId) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));

        return occurrenceAttachmentRepository.findById(attachmentId)
                .filter(att -> att.getOccurrence().getId().equals(occurrence.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anexo não encontrado."));
    }

    private User getUserByEmail(String email) {
        UserDetails userDetails = userRepository.findByEmail(email);
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado.");
        }
        return (User) userDetails;
    }
}