package com.homebase.homebase_backend.analytics;

import com.homebase.homebase_backend.request.Request;
import com.homebase.homebase_backend.request.RequestRepository;
import com.homebase.homebase_backend.request.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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
    public AnalyticsSummary getSummary() {
        List<Request> all = requestRepository.findAll();

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

        // ── Last 7 days trend ────────────────────────────────
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        OffsetDateTime now = OffsetDateTime.now();
        List<ChartEntry> trendData = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            OffsetDateTime dayStart = now.minusDays(i).toLocalDate().atStartOfDay()
                    .atOffset(now.getOffset());
            OffsetDateTime dayEnd = dayStart.plusDays(1);
            String label = dayStart.format(fmt);

            long count = all.stream()
                    .filter(r -> r.getCreatedAt().isAfter(dayStart)
                            && r.getCreatedAt().isBefore(dayEnd))
                    .count();

            trendData.add(new ChartEntry(label, count));
        }

        // ── Avg resolution time (hours) ──────────────────────
        double avgResolutionHours = all.stream()
                .filter(r -> r.getStatus() == RequestStatus.RESOLVED)
                .mapToLong(r -> {
                    long diffMs = r.getUpdatedAt().toInstant().toEpochMilli()
                            - r.getCreatedAt().toInstant().toEpochMilli();
                    return diffMs / (1000 * 60 * 60); // convert to hours
                })
                .average()
                .orElse(0.0);

        return AnalyticsSummary.builder()
                .totalRequests(all.size())
                .byCategory(categoryData)
                .byStatus(statusData)
                .byPriority(priorityData)
                .last7DaysTrend(trendData)
                .avgResolutionHours(Math.round(avgResolutionHours * 10.0) / 10.0)
                .build();
    }

    // ── Inner DTOs ───────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AnalyticsSummary {
        private int totalRequests;
        private List<ChartEntry> byCategory;
        private List<ChartEntry> byStatus;
        private List<ChartEntry> byPriority;
        private List<ChartEntry> last7DaysTrend;
        private double avgResolutionHours;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChartEntry {
        private String name;
        private long value;
    }
}