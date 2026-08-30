package com.jonathanspereira.condoflow.dashboard.controller;

import com.jonathanspereira.condoflow.dashboard.dto.DashboardStatsDTO;
import com.jonathanspereira.condoflow.dashboard.dto.SyndicDashboardDTO;
import com.jonathanspereira.condoflow.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getGlobalStats(
            @RequestParam(required = false) Long condominiumId,
            @RequestParam(required = false) Integer days
    ) {
        DashboardStatsDTO stats = dashboardService.getGlobalStatsFiltered(condominiumId, days);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/syndic")
    public ResponseEntity<SyndicDashboardDTO> getSyndicStats(
            Principal principal,
            @RequestParam(required = false) Long condominiumId,
            @RequestParam(required = false) Integer days) {
        SyndicDashboardDTO stats = dashboardService.getSyndicDashboard(principal.getName(), condominiumId, days);
        return ResponseEntity.ok(stats);
    }
}
