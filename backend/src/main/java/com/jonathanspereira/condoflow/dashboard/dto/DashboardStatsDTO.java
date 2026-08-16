package com.jonathanspereira.condoflow.dashboard.dto;

public record DashboardStatsDTO(
    long totalCondominiums,
    long totalUsers,
    long totalOccurrences
) {}
