package com.jonathanspereira.condoflow.dashboard.dto;

import java.util.List;

public record SyndicDashboardDTO(
        long totalOccurrences,
        long openOccurrences,
        long resolvedOccurrences,
        List<CategoryStatDTO> occurrencesByCategory,
        List<StatusStatDTO> occurrencesByStatus
) {
    public record CategoryStatDTO(String name, long value) {}
    public record StatusStatDTO(String name, long value) {}
}
