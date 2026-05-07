package com.homebase.homebase_backend.user.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AssignTeamRequest {
    private UUID teamId; // null = remove user from their team
}
