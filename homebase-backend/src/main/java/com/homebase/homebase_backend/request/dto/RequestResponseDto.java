package com.homebase.homebase_backend.request.dto;

import com.homebase.homebase_backend.request.Request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponseDto {

    private UUID id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String category;

    // Flattened user info — no nested objects sent to frontend
    private UUID createdById;
    private String createdByName;
    private UUID assignedToId;
    private String assignedToName;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // ── Static factory method ─────────────────────────────
    public static RequestResponseDto from(Request r) {
        return RequestResponseDto.builder()
                .id(r.getId())
                .title(r.getTitle())
                .description(r.getDescription())
                .status(r.getStatus().name())
                .priority(r.getPriority().name())
                .category(r.getCategory().name())
                .createdById(r.getCreatedBy().getId())
                .createdByName(r.getCreatedBy().getFullName())
                .assignedToId(r.getAssignedTo() != null ? r.getAssignedTo().getId() : null)
                .assignedToName(r.getAssignedTo() != null ? r.getAssignedTo().getFullName() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}