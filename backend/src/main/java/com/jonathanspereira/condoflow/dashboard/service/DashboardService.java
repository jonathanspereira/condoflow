package com.jonathanspereira.condoflow.dashboard.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.dashboard.dto.DashboardStatsDTO;
import com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CondominiumRepository condominiumRepository;
    private final UserRepository userRepository;
    private final OccurrenceRepository occurrenceRepository;

    private static final Map<OccurrenceCategory, String> CATEGORY_LABELS = Map.of(
            OccurrenceCategory.MANUTENCAO, "Manutenção",
            OccurrenceCategory.CONVIVENCIA, "Convivência",
            OccurrenceCategory.LIMPEZA, "Limpeza",
            OccurrenceCategory.SEGURANCA, "Segurança",
            OccurrenceCategory.OUTROS, "Outros"
    );

    private static final Map<OccurrenceStatus, String> STATUS_LABELS = Map.of(
            OccurrenceStatus.OPEN, "Aberto",
            OccurrenceStatus.IN_PROGRESS, "Em Andamento",
            OccurrenceStatus.RESOLVED, "Resolvido",
            OccurrenceStatus.CLOSED, "Concluído"
    );

    public DashboardStatsDTO getGlobalStats() {
        return getGlobalStatsFiltered(null, null);
    }

    public DashboardStatsDTO getGlobalStatsFiltered(Long condominiumId, Integer days) {
        Long searchCondoId = condominiumId != null ? condominiumId : -1L;
        
        long totalCondominiums = condominiumRepository.count();
        long totalUsers = userRepository.countFiltered(searchCondoId);

        LocalDateTime startDate = LocalDateTime.of(2000, 1, 1, 0, 0);
        if (days != null && days > 0) {
            startDate = LocalDateTime.now().minusDays(days);
        }

        long totalOccurrences = occurrenceRepository.countFiltered(searchCondoId, startDate);

        // Group by status
        List<Object[]> statusRows = occurrenceRepository.countByStatusFiltered(searchCondoId, startDate);
        long openCount = 0;
        long inProgressCount = 0;
        long resolvedCount = 0;

        List<DashboardStatsDTO.StatusStatDTO> statusStats = new ArrayList<>();
        if (statusRows != null) {
            for (Object[] row : statusRows) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    OccurrenceStatus status = (OccurrenceStatus) row[0];
                    long count = ((Number) row[1]).longValue();

                    if (status == OccurrenceStatus.OPEN) openCount += count;
                    else if (status == OccurrenceStatus.IN_PROGRESS) inProgressCount += count;
                    else if (status == OccurrenceStatus.RESOLVED || status == OccurrenceStatus.CLOSED) resolvedCount += count;

                    statusStats.add(new DashboardStatsDTO.StatusStatDTO(
                            status.name(),
                            STATUS_LABELS.getOrDefault(status, status.name()),
                            count
                    ));
                }
            }
        }

        // Group by category
        List<Object[]> categoryRows = occurrenceRepository.countByCategoryFiltered(searchCondoId, startDate);
        List<DashboardStatsDTO.CategoryStatDTO> categoryStats = new ArrayList<>();
        if (categoryRows != null) {
            for (Object[] row : categoryRows) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    OccurrenceCategory cat = (OccurrenceCategory) row[0];
                    long count = ((Number) row[1]).longValue();
                    categoryStats.add(new DashboardStatsDTO.CategoryStatDTO(
                            cat.name(),
                            CATEGORY_LABELS.getOrDefault(cat, cat.name()),
                            count
                    ));
                }
            }
        }

        // Condominium breakdown
        List<Condominium> allCondos = condominiumRepository.findAll();
        Map<Long, Long> usersByCondo = new HashMap<>();
        try {
            List<Object[]> userGrouped = userRepository.countByCondominiumGrouped();
            if (userGrouped != null) {
                for (Object[] row : userGrouped) {
                    if (row != null && row.length >= 3 && row[0] != null && row[2] != null) {
                        usersByCondo.put(((Number) row[0]).longValue(), ((Number) row[2]).longValue());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erro ao agrupar usuários por condomínio", e);
        }

        Map<Long, Long> occurrencesByCondo = new HashMap<>();
        try {
            List<Object[]> occurrenceGrouped = occurrenceRepository.countByCondominiumGrouped();
            if (occurrenceGrouped != null) {
                for (Object[] row : occurrenceGrouped) {
                    if (row != null && row.length >= 3 && row[0] != null && row[2] != null) {
                        occurrencesByCondo.put(((Number) row[0]).longValue(), ((Number) row[2]).longValue());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erro ao agrupar ocorrências por condomínio", e);
        }

        List<DashboardStatsDTO.CondominiumStatDTO> condoStats = allCondos.stream()
                .map(c -> new DashboardStatsDTO.CondominiumStatDTO(
                        c.getId(),
                        c.getName(),
                        usersByCondo.getOrDefault(c.getId(), 0L),
                        occurrencesByCondo.getOrDefault(c.getId(), 0L)
                ))
                .collect(Collectors.toList());

        // Calculate resolution rate
        double resolutionRate = totalOccurrences > 0
                ? Math.round(((double) resolvedCount / totalOccurrences) * 1000.0) / 10.0
                : 0.0;

        // Fetch actual monthly trend data
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime queryStartDate = startDate.isAfter(sixMonthsAgo) ? startDate : sixMonthsAgo;
        List<Object[]> trendRows = occurrenceRepository.countByMonthAndStatusFiltered(searchCondoId, queryStartDate);
        
        List<DashboardStatsDTO.MonthlyTrendDTO> monthlyTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthTime = now.minusMonths(i);
            String monthName = monthTime.getMonth().getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"));
            int targetYear = monthTime.getYear();
            int targetMonth = monthTime.getMonthValue();
            
            long monthTotal = 0;
            long monthResolved = 0;
            
            if (trendRows != null) {
                for (Object[] row : trendRows) {
                    if (row != null && row.length >= 4) {
                        int year = ((Number) row[0]).intValue();
                        int month = ((Number) row[1]).intValue();
                        if (year == targetYear && month == targetMonth) {
                            long count = ((Number) row[3]).longValue();
                            monthTotal += count;
                            OccurrenceStatus status = (OccurrenceStatus) row[2];
                            if (status == OccurrenceStatus.RESOLVED || status == OccurrenceStatus.CLOSED) {
                                monthResolved += count;
                            }
                        }
                    }
                }
            }
            monthlyTrends.add(new DashboardStatsDTO.MonthlyTrendDTO(monthName, monthTotal, monthResolved));
        }

        return new DashboardStatsDTO(
                totalCondominiums,
                totalUsers,
                totalOccurrences,
                openCount,
                inProgressCount,
                resolvedCount,
                resolutionRate,
                categoryStats,
                statusStats,
                condoStats,
                monthlyTrends
        );
    }

    public SyndicDashboardDTO getSyndicDashboard(String email) {
        org.springframework.security.core.userdetails.UserDetails userDetails = userRepository.findByEmail(email);
        if (!(userDetails instanceof User user)) {
            throw new IllegalArgumentException("User not found or invalid type");
        }

        if (user.getCondominium() == null) {
            throw new IllegalArgumentException("User condominium not found");
        }

        Long condominiumId = user.getCondominium().getId();

        List<Object[]> byStatus = occurrenceRepository.countByStatusGrouped(condominiumId);
        List<Object[]> byCategory = occurrenceRepository.countByCategoryGrouped(condominiumId);

        long total = 0;
        long open = 0;
        long resolved = 0;

        List<SyndicDashboardDTO.StatusStatDTO> statusStats = new ArrayList<>();
        if (byStatus != null) {
            for (Object[] row : byStatus) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    OccurrenceStatus status = (OccurrenceStatus) row[0];
                    long count = ((Number) row[1]).longValue();

                    total += count;
                    if (status == OccurrenceStatus.OPEN || status == OccurrenceStatus.IN_PROGRESS) {
                        open += count;
                    } else if (status == OccurrenceStatus.RESOLVED || status == OccurrenceStatus.CLOSED) {
                        resolved += count;
                    }

                    statusStats.add(new SyndicDashboardDTO.StatusStatDTO(status.name(), count));
                }
            }
        }

        List<SyndicDashboardDTO.CategoryStatDTO> categoryStats = new ArrayList<>();
        if (byCategory != null) {
            for (Object[] row : byCategory) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    OccurrenceCategory category = (OccurrenceCategory) row[0];
                    long count = ((Number) row[1]).longValue();
                    categoryStats.add(new SyndicDashboardDTO.CategoryStatDTO(category.name(), count));
                }
            }
        }

        return new SyndicDashboardDTO(total, open, resolved, categoryStats, statusStats);
    }
}
