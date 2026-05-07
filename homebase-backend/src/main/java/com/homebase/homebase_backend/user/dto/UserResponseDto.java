package com.homebase.homebase_backend.user.dto;

import com.homebase.homebase_backend.user.User;
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
public class UserResponseDto {

    private UUID           id;
    private String         fullName;
    private String         email;
    private String         role;
    private UUID           teamId;
    private String         teamName;
    private String         teamCategory;  // null for organisational teams
    private OffsetDateTime createdAt;

    public static UserResponseDto from(User u) {
        return UserResponseDto.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .teamId(u.getTeam() != null ? u.getTeam().getId() : null)
                .teamName(u.getTeam() != null ? u.getTeam().getName() : null)
                .teamCategory(u.getTeam() != null && u.getTeam().getCategory() != null
                        ? u.getTeam().getCategory().name() : null)
                .createdAt(u.getCreatedAt())
                .build();
    }
}
