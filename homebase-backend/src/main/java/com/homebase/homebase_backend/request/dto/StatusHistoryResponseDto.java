package com.homebase.homebase_backend.request.dto;

import com.homebase.homebase_backend.request.StatusHistory;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class StatusHistoryResponseDto {

    private UUID id;
    private String oldStatus;
    private String newStatus;
    private String changedByName;
    private String changedByRole;
    private OffsetDateTime changedAt;

    public static StatusHistoryResponseDto from(StatusHistory sh) {
        return StatusHistoryResponseDto.builder()
                .id(sh.getId())
                .oldStatus(sh.getOldStatus())
                .newStatus(sh.getNewStatus())
                .changedByName(sh.getChangedBy().getFullName())
                .changedByRole(sh.getChangedBy().getRole().name())
                .changedAt(sh.getChangedAt())
                .build();
    }
}
