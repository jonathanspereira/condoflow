package com.jonathanspereira.condoflow.dashboard.service;

import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.dashboard.dto.DashboardStatsDTO;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CondominiumRepository condominiumRepository;
    private final UserRepository userRepository;
    private final OccurrenceRepository occurrenceRepository;

    public DashboardStatsDTO getGlobalStats() {
        long totalCondominiums = condominiumRepository.count();
        long totalUsers = userRepository.count();
        long totalOccurrences = occurrenceRepository.count();

        return new DashboardStatsDTO(totalCondominiums, totalUsers, totalOccurrences);
    }

    public com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO getSyndicDashboard(String email) {
        var user = userRepository.findByEmail(email);
        if (user == null || user.getCondominium() == null) {
            throw new IllegalArgumentException("User or condominium not found");
        }
        
        Long condominiumId = user.getCondominium().getId();
        
        java.util.List<Object[]> byStatus = occurrenceRepository.countByStatusGrouped(condominiumId);
        java.util.List<Object[]> byCategory = occurrenceRepository.countByCategoryGrouped(condominiumId);
        
        long total = 0;
        long open = 0;
        long resolved = 0;
        
        java.util.List<com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO.StatusStatDTO> statusStats = new java.util.ArrayList<>();
        for (Object[] row : byStatus) {
            com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus status = (com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus) row[0];
            long count = ((Number) row[1]).longValue();
            
            total += count;
            if (status == com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus.OPEN || status == com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus.IN_PROGRESS) {
                open += count;
            } else if (status == com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus.RESOLVED || status == com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus.CLOSED) {
                resolved += count;
            }
            
            statusStats.add(new com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO.StatusStatDTO(status.name(), count));
        }
        
        java.util.List<com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO.CategoryStatDTO> categoryStats = new java.util.ArrayList<>();
        for (Object[] row : byCategory) {
            com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory category = (com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory) row[0];
            long count = ((Number) row[1]).longValue();
            categoryStats.add(new com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO.CategoryStatDTO(category.name(), count));
        }
        
        return new com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO(total, open, resolved, categoryStats, statusStats);
    }
}
