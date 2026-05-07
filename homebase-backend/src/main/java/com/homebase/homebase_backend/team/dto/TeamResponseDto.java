package com.homebase.homebase_backend.team.dto;

import com.homebase.homebase_backend.team.Team;
import com.homebase.homebase_backend.user.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponseDto {

    private UUID id;
    private String name;
    private String description;
    private String category;
    private List<UserResponseDto> members;

    public static TeamResponseDto from(Team t, List<UserResponseDto> members) {
        return TeamResponseDto.builder()
                .id(t.getId())
                .name(t.getName())
                .description(t.getDescription())
                .category(t.getCategory() != null ? t.getCategory().name() : null)
                .members(members)
                .build();
    }
}
