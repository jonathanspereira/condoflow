package com.jonathanspereira.condoflow.access.service;

import com.jonathanspereira.condoflow.access.dto.AccessRequestDTO;
import com.jonathanspereira.condoflow.access.dto.AccessResponseDTO;
import com.jonathanspereira.condoflow.access.dto.PublicAccessCompletionDTO;
import com.jonathanspereira.condoflow.access.entity.AccessAuthorization;
import com.jonathanspereira.condoflow.access.entity.AccessLog;
import com.jonathanspereira.condoflow.access.entity.AccessStatus;
import com.jonathanspereira.condoflow.access.entity.AccessType;
import com.jonathanspereira.condoflow.access.repository.AccessAuthorizationRepository;
import com.jonathanspereira.condoflow.access.repository.AccessLogRepository;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AccessService {

    private final AccessAuthorizationRepository authorizationRepository;
    private final AccessLogRepository logRepository;
    private final CondominiumRepository condominiumRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccessResponseDTO createAuthorization(Long condominiumId, String residentEmail, AccessRequestDTO request) {


        User resident = (User) userRepository.findByEmail(residentEmail);
        if (resident == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resident not found");

        Unit unit = unitRepository.findFirstByOwnerId(resident.getId())
                .or(() -> unitRepository.findFirstByTenantId(resident.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unit not found for user"));

        Long finalCondoId = condominiumId != null ? condominiumId : unit.getCondominiumId();
        Condominium condominium = condominiumRepository.findById(finalCondoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Condominium not found"));

        AccessAuthorization auth = AccessAuthorization.builder()
                .condominium(condominium)
                .unit(unit)
                .resident(resident)
                .type(request.getType())
                .status(AccessStatus.AGUARDANDO_CADASTRO)
                .personName(request.getPersonName())
                .personPhone(request.getPersonPhone())
                .company(request.getCompany())
                .service(request.getService())
                .observation(request.getObservation())
                .authorizedDate(request.getAuthorizedDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .linkToken(UUID.randomUUID().toString())
                .linkExpiresAt(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")).plusMinutes(15))
                .build();

        if (request.getType() == AccessType.DELIVERY) {
            auth.setStatus(AccessStatus.CADASTRO_CONCLUIDO);
            auth.setAccessCode(UUID.randomUUID().toString());
            auth.setPin(generateUniquePin(condominium.getId()));
        }

        auth = authorizationRepository.save(auth);
        return toDTO(auth);
    }

    public AccessResponseDTO getPublicInfoByToken(String linkToken) {
        AccessAuthorization auth = authorizationRepository.findByLinkToken(linkToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link inválido ou não encontrado"));

        if (LocalDateTime.now(ZoneId.of("America/Sao_Paulo")).isAfter(auth.getLinkExpiresAt())) {
            if (auth.getStatus() == AccessStatus.AGUARDANDO_CADASTRO) {
                auth.setStatus(AccessStatus.LINK_EXPIRADO);
                authorizationRepository.save(auth);
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link expirado");
        }

        return toDTO(auth);
    }

    @Transactional
    public AccessResponseDTO completePublicRegistration(String linkToken, PublicAccessCompletionDTO dto) {
        AccessAuthorization auth = authorizationRepository.findByLinkToken(linkToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link inválido ou não encontrado"));

        if (LocalDateTime.now(ZoneId.of("America/Sao_Paulo")).isAfter(auth.getLinkExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link expirado");
        }

        if (auth.getStatus() != AccessStatus.AGUARDANDO_CADASTRO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cadastro já foi concluído ou cancelado");
        }

        auth.setPersonCpf(dto.getCpf());
        auth.setPersonPhotoUrl(dto.getPhotoBase64()); // No cenário ideal seria um URL do S3
        auth.setStatus(AccessStatus.CADASTRO_CONCLUIDO);
        
        // Gerar Credenciais
        auth.setAccessCode(UUID.randomUUID().toString());
        auth.setPin(generateUniquePin(auth.getCondominium().getId()));

        auth = authorizationRepository.save(auth);
        return toDTO(auth);
    }

    private String generateUniquePin(Long condominiumId) {
        Random random = new Random();
        String pin;
        do {
            pin = String.format("%04d", random.nextInt(10000));
        } while (authorizationRepository.findByPinAndCondominiumId(pin, condominiumId).isPresent());
        return pin;
    }

    public List<AccessResponseDTO> getMyAuthorizations(String residentEmail) {
        User resident = (User) userRepository.findByEmail(residentEmail);
        return authorizationRepository.findByResidentIdOrderByCreatedAtDesc(resident.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AccessResponseDTO> getCondominiumAuthorizations(Long condominiumId) {
        return authorizationRepository.findByCondominiumIdOrderByCreatedAtDesc(condominiumId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AccessResponseDTO validateAccess(Long condominiumId, String codeOrPin) {
        AccessAuthorization auth = authorizationRepository.findByAccessCodeAndCondominiumId(codeOrPin, condominiumId)
                .orElseGet(() -> authorizationRepository.findByPinAndCondominiumId(codeOrPin, condominiumId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Autorização não encontrada para o código informado.")));

        // Validação de horário
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
        if (now.toLocalDate().isBefore(auth.getAuthorizedDate()) || 
            (now.toLocalDate().isEqual(auth.getAuthorizedDate()) && now.toLocalTime().isBefore(auth.getStartTime()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Horário de acesso ainda não iniciado.");
        }

        if (now.toLocalDate().isAfter(auth.getAuthorizedDate()) || 
            (now.toLocalDate().isEqual(auth.getAuthorizedDate()) && now.toLocalTime().isAfter(auth.getEndTime()))) {
            if (auth.getStatus() != AccessStatus.CREDENCIAL_EXPIRADA && auth.getStatus() != AccessStatus.FINALIZADA && auth.getStatus() != AccessStatus.CANCELADA) {
                auth.setStatus(AccessStatus.CREDENCIAL_EXPIRADA);
                authorizationRepository.save(auth);
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Credencial expirada.");
        }

        if (auth.getStatus() == AccessStatus.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Autorização cancelada.");
        }

        return toDTO(auth);
    }

    @Transactional
    public void registerEntry(Long condominiumId, String conciergeEmail, String accessCode) {
        AccessAuthorization auth = authorizationRepository.findByAccessCodeAndCondominiumId(accessCode, condominiumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Autorização não encontrada"));

        User concierge = (User) userRepository.findByEmail(conciergeEmail);

        if (auth.getStatus() == AccessStatus.DENTRO_DO_CONDOMINIO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pessoa já está dentro do condomínio.");
        }

        auth.setStatus(AccessStatus.DENTRO_DO_CONDOMINIO);
        authorizationRepository.save(auth);

        AccessLog log = AccessLog.builder()
                .condominium(auth.getCondominium())
                .authorization(auth)
                .concierge(concierge)
                .entryTime(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")))
                .validationMethod("QR_CODE_OR_PIN")
                .build();
        
        logRepository.save(log);
    }

    @Transactional
    public void registerExit(Long condominiumId, String conciergeEmail, String accessCode) {
        AccessAuthorization auth = authorizationRepository.findByAccessCodeAndCondominiumId(accessCode, condominiumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Autorização não encontrada"));

        if (auth.getStatus() != AccessStatus.DENTRO_DO_CONDOMINIO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pessoa não está registrada como dentro do condomínio.");
        }

        auth.setStatus(AccessStatus.FINALIZADA);
        authorizationRepository.save(auth);

        AccessLog log = logRepository.findFirstByAuthorizationIdAndExitTimeIsNullOrderByEntryTimeDesc(auth.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Registro de entrada não encontrado."));

        log.setExitTime(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));
        logRepository.save(log);
    }

    @Transactional
    public void cancelAuthorization(Long id, String userEmail) {
        AccessAuthorization auth = authorizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Autorização não encontrada"));
        
        User user = (User) userRepository.findByEmail(userEmail);
        
        // Verifica se é o morador que criou ou um síndico do mesmo condomínio
        if (!auth.getResident().getId().equals(user.getId()) && !user.getRole().name().equals("SINDICO")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para cancelar.");
        }

        auth.setStatus(AccessStatus.CANCELADA);
        authorizationRepository.save(auth);
    }

    @Transactional
    public AccessResponseDTO renewLink(Long id, String userEmail) {
        AccessAuthorization auth = authorizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Autorização não encontrada"));
        
        User user = (User) userRepository.findByEmail(userEmail);
        
        if (!auth.getResident().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para revalidar.");
        }

        if (auth.getStatus() == AccessStatus.CANCELADA || auth.getStatus() == AccessStatus.FINALIZADA || auth.getStatus() == AccessStatus.DENTRO_DO_CONDOMINIO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível revalidar uma autorização cancelada, finalizada ou em andamento.");
        }

        // Renew expiration to 15 minutes from now
        auth.setLinkExpiresAt(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")).plusMinutes(15));
        
        // If it was expired, we reset to the original status before expiration
        if (auth.getStatus() == AccessStatus.LINK_EXPIRADO || auth.getStatus() == AccessStatus.CREDENCIAL_EXPIRADA) {
            if (auth.getPersonCpf() == null) {
                auth.setStatus(AccessStatus.AGUARDANDO_CADASTRO);
            } else {
                auth.setStatus(AccessStatus.CADASTRO_CONCLUIDO);
            }
        }
        
        authorizationRepository.save(auth);
        return toDTO(auth);
    }

    private AccessResponseDTO toDTO(AccessAuthorization auth) {
        AccessResponseDTO dto = AccessResponseDTO.builder()
                .id(auth.getId())
                .personName(auth.getPersonName())
                .personPhone(auth.getPersonPhone())
                .personCpf(auth.getPersonCpf())
                .personPhotoUrl(auth.getPersonPhotoUrl())
                .type(auth.getType())
                .status(auth.getStatus())
                .company(auth.getCompany())
                .service(auth.getService())
                .observation(auth.getObservation())
                .authorizedDate(auth.getAuthorizedDate())
                .startTime(auth.getStartTime())
                .endTime(auth.getEndTime())
                .linkToken(auth.getLinkToken())
                .linkExpiresAt(auth.getLinkExpiresAt())
                .accessCode(auth.getAccessCode())
                .pin(auth.getPin())
                .unitId(auth.getUnit() != null ? auth.getUnit().getId() : null)
                .unitName(auth.getUnit() != null ? auth.getUnit().getUnit() : null)
                .residentName(auth.getResident() != null ? auth.getResident().getName() : null)
                .createdAt(auth.getCreatedAt())
                .build();
                
        if (auth.getStatus() == AccessStatus.DENTRO_DO_CONDOMINIO || auth.getStatus() == AccessStatus.FINALIZADA) {
            logRepository.findFirstByAuthorizationIdAndExitTimeIsNullOrderByEntryTimeDesc(auth.getId())
                .ifPresentOrElse(log -> {
                    dto.setConciergeName(log.getConcierge() != null ? log.getConcierge().getName() : null);
                    dto.setEntryTime(log.getEntryTime());
                }, () -> {
                    // Fallback to the latest log if there's no open log (e.g., if finalized)
                    logRepository.findFirstByAuthorizationIdOrderByEntryTimeDesc(auth.getId())
                        .ifPresent(log -> {
                            dto.setConciergeName(log.getConcierge() != null ? log.getConcierge().getName() : null);
                            dto.setEntryTime(log.getEntryTime());
                        });
                });
        }
        
        return dto;
    }
}
