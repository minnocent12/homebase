package com.homebase.homebase_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    // User info embedded so frontend doesn't need a separate /me call
    private UUID userId;
    private String fullName;
    private String email;
    private String role;
}