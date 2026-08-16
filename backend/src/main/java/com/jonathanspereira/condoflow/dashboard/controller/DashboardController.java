package com.jonathanspereira.condoflow.dashboard.controller;

import com.jonathanspereira.condoflow.dashboard.dto.DashboardStatsDTO;
import com.jonathanspereira.condoflow.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getGlobalStats() {
        DashboardStatsDTO stats = dashboardService.getGlobalStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/syndic")
    public ResponseEntity<com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO> getSyndicStats(java.security.Principal principal) {
        com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO stats = dashboardService.getSyndicDashboard(principal.getName());
        return ResponseEntity.ok(stats);
    }
}
