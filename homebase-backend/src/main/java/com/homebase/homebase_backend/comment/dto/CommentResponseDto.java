package com.homebase.homebase_backend.comment.dto;

import com.homebase.homebase_backend.comment.Comment;
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
public class CommentResponseDto {

    private UUID id;
    private UUID requestId;
    private UUID userId;
    private String userName;
    private String userRole;
    private String body;
    private OffsetDateTime createdAt;

    // ── Static factory ────────────────────────────────────────
    public static CommentResponseDto from(Comment c) {
        return CommentResponseDto.builder()
                .id(c.getId())
                .requestId(c.getRequest().getId())
                .userId(c.getUser().getId())
                .userName(c.getUser().getFullName())
                .userRole(c.getUser().getRole().name())
                .body(c.getBody())
                .createdAt(c.getCreatedAt())
                .build();
    }
}