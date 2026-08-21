package com.jonathanspereira.condoflow.dashboard.dto;

import java.util.List;

public record DashboardStatsDTO(
    long totalCondominiums,
    long totalUsers,
    long totalOccurrences,
    long openOccurrences,
    long inProgressOccurrences,
    long resolvedOccurrences,
    double resolutionRate,
    List<CategoryStatDTO> categoryStats,
    List<StatusStatDTO> statusStats,
    List<CondominiumStatDTO> condominiumStats,
    List<MonthlyTrendDTO> monthlyTrends
) {
    public DashboardStatsDTO(long totalCondominiums, long totalUsers, long totalOccurrences) {
        this(
            totalCondominiums,
            totalUsers,
            totalOccurrences,
            0,
            0,
            0,
            0.0,
            List.of(),
            List.of(),
            List.of(),
            List.of()
        );
    }

    public record CategoryStatDTO(String category, String label, long count) {}
    public record StatusStatDTO(String status, String label, long count) {}
    public record CondominiumStatDTO(Long id, String name, long totalUsers, long totalOccurrences) {}
    public record MonthlyTrendDTO(String month, long total, long resolved) {}
}
