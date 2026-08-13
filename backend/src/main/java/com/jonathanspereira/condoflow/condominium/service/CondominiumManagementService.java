package com.jonathanspereira.condoflow.condominium.service;

import com.jonathanspereira.condoflow.condominium.dto.SindicoCondominiumDTO;
import com.jonathanspereira.condoflow.condominium.entity.CondominiumManager;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumManagerRepository;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
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
            List.of(OccurrenceStatus.RESOLVED, OccurrenceStatus.CLOSED);

    private final CondominiumManagerRepository condominiumManagerRepository;
    private final OccurrenceRepository occurrenceRepository;
    private final UserRepository userRepository;

    public List<SindicoCondominiumDTO> listMyCondominiums(String sindicoEmail) {
        User sindico = getUserByEmail(sindicoEmail);
        List<CondominiumManager> managements = condominiumManagerRepository.findBySindicoId(sindico.getId());

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

    public void setFocusMode(String sindicoEmail, Long condominiumId, boolean enabled) {
        User sindico = getUserByEmail(sindicoEmail);

        CondominiumManager management = condominiumManagerRepository
                .findByCondominiumIdAndSindicoId(condominiumId, sindico.getId())
                .orElseThrow(() -> new RuntimeException("Você não administra este condomínio."));

        management.setFocusModeEnabled(enabled);
        condominiumManagerRepository.save(management);
    }

    public void setFocusModeForAll(String sindicoEmail, boolean enabled) {
        User sindico = getUserByEmail(sindicoEmail);

        List<CondominiumManager> managements = condominiumManagerRepository.findBySindicoId(sindico.getId());
        managements.forEach(m -> m.setFocusModeEnabled(enabled));
        condominiumManagerRepository.saveAll(managements);
    }

    private User getUserByEmail(String email) {
        UserDetails details = userRepository.findByEmail(email);
        if (details == null) {
            throw new RuntimeException("Usuário não encontrado.");
        }
        return (User) details;
    }
}