package com.homebase.homebase_backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfileDto {

    private UUID           id;
    private String         fullName;
    private String         email;
    private String         role;
    private UUID           teamId;
    private String         teamName;
    private String         teamCategory;
    private OffsetDateTime createdAt;
    private boolean        active;

    private long requestsCreated;
    private long requestsAssigned;
    private long commentsPosted;

    // Created-request breakdown
    private long openCount;
    private long inProgressCount;
    private long resolvedCount;

    // Assigned-request breakdown
    private long assignedOpenCount;
    private long assignedInProgressCount;
    private long assignedResolvedCount;

    private List<ChartEntry>    trendData;
    private List<ChartEntry>    assignedTrendData;
    private List<RecentComment> comments;
    private List<RecentRequest> submittedRequests;
    private List<RecentRequest> assignedRequests;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChartEntry {
        private String name;
        private long   value;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RecentComment {
        private UUID           id;
        private String         body;
        private String         requestTitle;
        private UUID           requestId;
        private OffsetDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RecentRequest {
        private UUID           id;
        private String         title;
        private String         status;
        private String         priority;
        private OffsetDateTime createdAt;
    }
}
