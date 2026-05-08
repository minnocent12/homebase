package com.homebase.homebase_backend.analytics;

import com.homebase.homebase_backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // GET /api/analytics/summary — MANAGER + ADMIN only; period: 7d | 30d | 12m
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<AnalyticsService.AnalyticsSummary> getSummary(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "7d") String period
    ) {
        return ResponseEntity.ok(analyticsService.getSummary(currentUser, period));
    }
}