package com.jonathanspereira.condoflow.condominium.dto;

public record SindicoCondominiumDTO(
        Long id,
        String name,
        long urgentOccurrences,
        long openOccurrences,
        long resolvedThisMonth,
        boolean focusModeEnabled
) {}