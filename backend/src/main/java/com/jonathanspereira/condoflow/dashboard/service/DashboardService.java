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
}
