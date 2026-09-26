package com.jonathanspereira.condoflow.user.dto;

import lombok.Data;

@Data
public class UpdatePreferencesDTO {
    private boolean notifyOccurrences;
    private boolean notifyTenantAlerts;
}
