package com.homebase.homebase_backend.analytics;

import com.homebase.homebase_backend.request.Request;
import com.homebase.homebase_backend.request.RequestRepository;
import com.homebase.homebase_backend.request.RequestStatus;
import com.homebase.homebase_backend.user.User;
import com.homebase.homebase_backend.user.UserRole;
import org.springframework.data.jpa.domain.Specification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RequestRepository requestRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummary getSummary(User currentUser, String period) {
        List<Request> all;
        if (currentUser.getRole() == UserRole.MANAGER && currentUser.getTeam() != null) {
            final java.util.UUID teamId = currentUser.getTeam().getId();
            Specification<Request> teamSpec = (root, query, cb) ->
                    cb.equal(root.get("team").get("id"), teamId);
            all = requestRepository.findAll(teamSpec);
        } else {
            all = requestRepository.findAll();
        }

        // ── By category ──────────────────────────────────────
        Map<String, Long> byCategory = all.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCategory().name(),
                        Collectors.counting()
                ));

        List<ChartEntry> categoryData = byCategory.entrySet().stream()
                .map(e -> new ChartEntry(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toList());

        // ── By status ────────────────────────────────────────
        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus().name(),
                        Collectors.counting()
                ));

        List<ChartEntry> statusData = byStatus.entrySet().stream()
                .map(e -> new ChartEntry(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // ── By priority ──────────────────────────────────────
        Map<String, Long> byPriority = all.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getPriority().name(),
                        Collectors.counting()
                ));

        List<ChartEntry> priorityData = byPriority.entrySet().stream()
                .map(e -> new ChartEntry(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // ── Trend ────────────────────────────────────────────
        List<ChartEntry> trendData = buildTrend(all, period);

        // ── Avg resolution time (hours) ──────────────────────
        double avgResolutionHours = all.stream()
                .filter(r -> r.getStatus() == RequestStatus.RESOLVED)
                .mapToLong(r -> {
                    long diffMs = r.getUpdatedAt().toInstant().toEpochMilli()
                            - r.getCreatedAt().toInstant().toEpochMilli();
                    return diffMs / (1000 * 60 * 60);
                })
                .average()
                .orElse(0.0);

        return AnalyticsSummary.builder()
                .totalRequests(all.size())
                .byCategory(categoryData)
                .byStatus(statusData)
                .byPriority(priorityData)
                .trendData(trendData)
                .avgResolutionHours(Math.round(avgResolutionHours * 10.0) / 10.0)
                .build();
    }

    private List<ChartEntry> buildTrend(List<Request> requests, String period) {
        OffsetDateTime now = OffsetDateTime.now();
        List<ChartEntry> result = new ArrayList<>();

        if ("12m".equals(period)) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yy");
            for (int i = 11; i >= 0; i--) {
                OffsetDateTime start = now.minusMonths(i).toLocalDate()
                        .withDayOfMonth(1).atStartOfDay().atOffset(now.getOffset());
                OffsetDateTime end = start.plusMonths(1);
                String label = start.format(fmt);
                long count = requests.stream()
                        .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end))
                        .count();
                result.add(new ChartEntry(label, count));
            }
        } else {
            int days = "30d".equals(period) ? 30 : 7;
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
            for (int i = days - 1; i >= 0; i--) {
                OffsetDateTime start = now.minusDays(i).toLocalDate()
                        .atStartOfDay().atOffset(now.getOffset());
                OffsetDateTime end = start.plusDays(1);
                String label = start.format(fmt);
                long count = requests.stream()
                        .filter(r -> !r.getCreatedAt().isBefore(start) && r.getCreatedAt().isBefore(end))
                        .count();
                result.add(new ChartEntry(label, count));
            }
        }
        return result;
    }

    // ── Inner DTOs ───────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AnalyticsSummary {
        private int totalRequests;
        private List<ChartEntry> byCategory;
        private List<ChartEntry> byStatus;
        private List<ChartEntry> byPriority;
        private List<ChartEntry> trendData;
        private double avgResolutionHours;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChartEntry {
        private String name;
        private long value;
    }
}
