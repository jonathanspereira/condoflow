package com.jonathanspereira.condoflow.condominium.service;

import com.jonathanspereira.condoflow.common.exception.BusinessException;
import com.jonathanspereira.condoflow.condominium.dto.SindicoCondominiumDTO;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumRole;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRoleRepository;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.user.dto.UserResponseDTO;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import com.jonathanspereira.condoflow.log.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CondominiumManagementService {

    private static final List<OccurrenceCategory> URGENT_CATEGORIES =
            List.of(OccurrenceCategory.SEGURANCA, OccurrenceCategory.MANUTENCAO);

    private static final List<OccurrenceStatus> CLOSED_STATUSES =
            List.of(OccurrenceStatus.RESOLVED);

    private final CondominiumRoleRepository condominiumRoleRepository;
    private final OccurrenceRepository occurrenceRepository;
    private final UserRepository userRepository;
    private final com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository condominiumRepository;
    private final com.jonathanspereira.condoflow.auth.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.jonathanspereira.condoflow.common.email.service.EmailService emailService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<SindicoCondominiumDTO> listMyCondominiums(String sindicoEmail) {
        User sindico = getUserByEmail(sindicoEmail);
        List<CondominiumRole> managements = condominiumRoleRepository.findByUserId(sindico.getId());

        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        return managements.stream()
                .map(m -> {
                    Long condoId = m.getCondominium().getId();

                    long urgent = occurrenceRepository.countByCondominiumIdAndCategoryInAndStatusNotIn(
                            condoId, URGENT_CATEGORIES, CLOSED_STATUSES);

                    long open = occurrenceRepository.countByCondominiumIdAndStatusNotIn(
                            condoId, CLOSED_STATUSES);

                    long resolvedThisMonth = occurrenceRepository.countByCondominiumIdAndStatusInAndCreatedAtBetween(
                            condoId, CLOSED_STATUSES, monthStart, monthEnd);

                    return new SindicoCondominiumDTO(
                            condoId,
                            m.getCondominium().getName(),
                            urgent,
                            open,
                            resolvedThisMonth,
                            m.isFocusModeEnabled()
                    );
                })
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public com.jonathanspereira.condoflow.condominium.entity.Condominium createAndLinkCondominium(String sindicoEmail, com.jonathanspereira.condoflow.condominium.dto.CondominiumRequestDTO dto) {
        User sindico = getUserByEmail(sindicoEmail);

        com.jonathanspereira.condoflow.condominium.entity.Condominium condo = new com.jonathanspereira.condoflow.condominium.entity.Condominium();
        condo.setName(dto.getName());
        condo.setCnpj(dto.getCnpj());
        condo.setStreet(dto.getStreet());
        condo.setNumber(dto.getNumber());
        condo.setZipCode(dto.getZipCode());
        condo.setNeighborhood(dto.getNeighborhood());
        condo.setCity(dto.getCity());
        condo.setState(dto.getState());
        condo.setPlan(com.jonathanspereira.condoflow.condominium.entity.PlanType.FREE);
        
        com.jonathanspereira.condoflow.condominium.entity.Condominium savedCondo = condominiumRepository.save(condo);

        CondominiumRole management = new CondominiumRole();
        management.setUser(sindico);
        management.setCondominium(savedCondo);
        management.setRole(com.jonathanspereira.condoflow.user.entity.Role.SINDICO);
        management.setActive(true);
        management.setFocusModeEnabled(false);
        
        condominiumRoleRepository.save(management);

        auditLogService.log("CONDOMINIO", "CREATE_CONDOMINIUM", sindicoEmail, "Condomínio criado: " + savedCondo.getName());

        return savedCondo;
    }

    public void setFocusMode(String sindicoEmail, Long condominiumId, boolean enabled) {
        User sindico = getUserByEmail(sindicoEmail);

        CondominiumRole management = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        management.setFocusModeEnabled(enabled);
        condominiumRoleRepository.save(management);
        
        auditLogService.log("CONDOMINIO", "FOCUS_MODE", sindicoEmail, "Modo foco " + (enabled ? "ativado" : "desativado") + " para condomínio ID: " + condominiumId);
    }

    public void setPlan(String sindicoEmail, Long condominiumId, com.jonathanspereira.condoflow.condominium.dto.PlanSelectionRequestDTO dto) {
        User sindico = getUserByEmail(sindicoEmail);

        CondominiumRole management = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        com.jonathanspereira.condoflow.condominium.entity.Condominium condo = management.getCondominium();
        condo.setPlan(dto.plan());
        if (dto.plan() != com.jonathanspereira.condoflow.condominium.entity.PlanType.FREE) {
            condo.setSubscriptionEndDate(java.time.LocalDate.now().plusMonths(1)); // example 1 month
        }
        condominiumRepository.save(condo);
        
        auditLogService.log("CONDOMINIO", "CHANGE_PLAN", sindicoEmail, "Plano do condomínio '" + condo.getName() + "' alterado para: " + dto.plan());
    }

    public void setFocusModeForAll(String sindicoEmail, boolean enabled) {
        User sindico = getUserByEmail(sindicoEmail);

        List<CondominiumRole> managements = condominiumRoleRepository.findByUserId(sindico.getId());
        managements.forEach(m -> m.setFocusModeEnabled(enabled));
        condominiumRoleRepository.saveAll(managements);
    }

    public List<UserResponseDTO> getUsersForCondominium(Long condominiumId) {
        return condominiumRoleRepository.findByCondominiumId(condominiumId)
                .stream()
                .map(m -> new UserResponseDTO(m.getUser()))
                .collect(Collectors.toList());
    }

    public void removeSindico(Long condominiumId, String sindicoId) {
        CondominiumRole management = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindicoId)
                .orElseThrow(() -> new RuntimeException("Vínculo não encontrado."));
        condominiumRoleRepository.delete(management);
    }

    @org.springframework.transaction.annotation.Transactional
    public void transferSindico(Long condominiumId, String currentSindicoEmail, com.jonathanspereira.condoflow.condominium.dto.TransferSindicoRequestDTO dto) {
        User currentSindico = getUserByEmail(currentSindicoEmail);

        CondominiumRole currentManagement = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, currentSindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        if (!currentManagement.isActive() || currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SINDICO) {
            throw new BusinessException("Você não tem permissão de síndico para transferir este condomínio.");
        }

        com.jonathanspereira.condoflow.condominium.entity.Condominium condominium = currentManagement.getCondominium();

        UserDetails existingDetails = userRepository.findByEmail(dto.email());
        User newSindico;
        boolean isNewUser = false;

        if (existingDetails != null) {
            newSindico = (User) existingDetails;
            newSindico.setRole(com.jonathanspereira.condoflow.user.entity.Role.SINDICO);
            userRepository.save(newSindico);
        } else {
            isNewUser = true;
            newSindico = new User();
            newSindico.setName(dto.name());
            newSindico.setEmail(dto.email());
            newSindico.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Senha aleatória inacessível
            newSindico.setRole(com.jonathanspereira.condoflow.user.entity.Role.SINDICO);
            newSindico = userRepository.save(newSindico);
        }

        final String newSindicoId = newSindico.getId();
        boolean alreadyLinked = condominiumRoleRepository.findByCondominiumId(condominiumId).stream()
                .anyMatch(m -> m.getUser().getId().equals(newSindicoId));

        if (!alreadyLinked) {
            CondominiumRole newManagement = new CondominiumRole();
            newManagement.setUser(newSindico);
            newManagement.setCondominium(condominium);
            newManagement.setRole(com.jonathanspereira.condoflow.user.entity.Role.SINDICO);
            newManagement.setActive(true);
            newManagement.setFocusModeEnabled(false);
            condominiumRoleRepository.save(newManagement);
        }

        // Criar token para primeiro acesso/redefinição de senha
        passwordResetTokenRepository.findByUser(newSindico).ifPresent(passwordResetTokenRepository::delete);
        String token = java.util.UUID.randomUUID().toString();
        com.jonathanspereira.condoflow.auth.entity.PasswordResetToken resetToken = new com.jonathanspereira.condoflow.auth.entity.PasswordResetToken(token, newSindico, LocalDateTime.now().plusHours(48));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendSindicoInviteEmail(newSindico.getEmail(), newSindico.getName(), token, condominium.getName());
        
        auditLogService.log("CONDOMINIO", "TRANSFER_SINDICO", dto.email(), "Transferência de síndico iniciada para condomínio: " + condominium.getName());
    }

    public UserResponseDTO updateSindico(Long condominiumId, String sindicoId, com.jonathanspereira.condoflow.user.dto.UserRequestDTO dto) {
        CondominiumRole management = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindicoId)
                .orElseThrow(() -> new RuntimeException("Vínculo não encontrado."));

        User sindico = management.getUser();

        if (dto.getEmail() != null && !dto.getEmail().isBlank() && !sindico.getEmail().equalsIgnoreCase(dto.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()) != null) {
                throw new BusinessException("Email já cadastrado no sistema.");
            }
            sindico.setEmail(dto.getEmail());
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            sindico.setName(dto.getName());
        }

        User updated = userRepository.save(sindico);
        return new UserResponseDTO(updated);
    }

    public List<UserResponseDTO> getConciergesForCondominium(Long condominiumId) {
        return condominiumRoleRepository.findByCondominiumId(condominiumId)
                .stream()
                .filter(m -> m.getRole() == com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE)
                .map(m -> new UserResponseDTO(m.getUser()))
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public UserResponseDTO addConcierge(Long condominiumId, String sindicoEmail, com.jonathanspereira.condoflow.user.dto.UserRequestDTO dto) {
        User sindico = getUserByEmail(sindicoEmail);

        CondominiumRole currentManagement = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        if (!currentManagement.isActive() || (currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SINDICO && currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SUPER_ADMIN)) {
            throw new BusinessException("Apenas o administrador pode cadastrar porteiros.");
        }

        com.jonathanspereira.condoflow.condominium.entity.Condominium condominium = currentManagement.getCondominium();

        UserDetails existingDetails = userRepository.findByEmail(dto.getEmail());
        User newConcierge;

        if (existingDetails != null) {
            newConcierge = (User) existingDetails;
            if (newConcierge.getRole() != com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE) {
                newConcierge.setRole(com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE);
                userRepository.save(newConcierge);
            }
        } else {
            newConcierge = new User();
            newConcierge.setName(dto.getName());
            newConcierge.setEmail(dto.getEmail());
            // DEFAULT PASSWORD "123456" WITH FORCE_PASSWORD_CHANGE = TRUE
            newConcierge.setPassword(passwordEncoder.encode("123456")); 
            newConcierge.setRole(com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE);
            newConcierge.setForcePasswordChange(true);
            newConcierge = userRepository.save(newConcierge);
        }

        final String newConciergeId = newConcierge.getId();
        boolean alreadyLinked = condominiumRoleRepository.findByCondominiumId(condominiumId).stream()
                .anyMatch(m -> m.getUser().getId().equals(newConciergeId) && m.getRole() == com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE);

        if (!alreadyLinked) {
            CondominiumRole newRole = new CondominiumRole();
            newRole.setUser(newConcierge);
            newRole.setCondominium(condominium);
            newRole.setRole(com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE);
            newRole.setActive(true);
            newRole.setFocusModeEnabled(false);
            condominiumRoleRepository.save(newRole);
        }

        auditLogService.log("CONCIERGE", "ADD_CONCIERGE", sindicoEmail, "Porteiro " + newConcierge.getEmail() + " adicionado ao condomínio: " + condominium.getName());
        return new UserResponseDTO(newConcierge);
    }

    public void removeConcierge(Long condominiumId, String sindicoEmail, String conciergeId) {
        User sindico = getUserByEmail(sindicoEmail);

        CondominiumRole currentManagement = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        if (!currentManagement.isActive() || (currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SINDICO && currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SUPER_ADMIN)) {
            throw new BusinessException("Apenas o administrador pode remover porteiros.");
        }

        CondominiumRole conciergeRole = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, conciergeId)
                .orElseThrow(() -> new RuntimeException("Vínculo não encontrado."));

        if (conciergeRole.getRole() != com.jonathanspereira.condoflow.user.entity.Role.CONCIERGE) {
            throw new BusinessException("Este usuário não é um porteiro deste condomínio.");
        }

        condominiumRoleRepository.delete(conciergeRole);
        auditLogService.log("CONCIERGE", "REMOVE_CONCIERGE", sindicoEmail, "Porteiro removido do condomínio ID: " + condominiumId);
    }

    public UserResponseDTO updateConcierge(Long condominiumId, String sindicoEmail, String conciergeId, com.jonathanspereira.condoflow.user.dto.UserRequestDTO dto) {
        User sindico = getUserByEmail(sindicoEmail);

        CondominiumRole currentManagement = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, sindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        if (!currentManagement.isActive() || (currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SINDICO && currentManagement.getRole() != com.jonathanspereira.condoflow.user.entity.Role.SUPER_ADMIN)) {
            throw new BusinessException("Apenas o administrador pode editar porteiros.");
        }

        CondominiumRole conciergeRole = condominiumRoleRepository
                .findByCondominiumIdAndUserId(condominiumId, conciergeId)
                .orElseThrow(() -> new RuntimeException("Vínculo não encontrado."));

        User concierge = conciergeRole.getUser();

        if (dto.getEmail() != null && !dto.getEmail().isBlank() && !concierge.getEmail().equalsIgnoreCase(dto.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()) != null) {
                throw new BusinessException("Email já cadastrado no sistema.");
            }
            concierge.setEmail(dto.getEmail());
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            concierge.setName(dto.getName());
        }

        User updated = userRepository.save(concierge);
        auditLogService.log("CONCIERGE", "UPDATE_CONCIERGE", sindicoEmail, "Porteiro atualizado no condomínio ID: " + condominiumId);
        return new UserResponseDTO(updated);
    }

    private User getUserByEmail(String email) {
        UserDetails details = userRepository.findByEmail(email);
        if (details == null) {
            throw new BusinessException("Usuário não encontrado.");
        }
        return (User) details;
    }
}