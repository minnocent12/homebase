package com.homebase.homebase_backend.user.dto;

import lombok.Data;

@Data
public class UpdateUserDto {
    private String fullName;
    private String email;
    private String role;
    /** null = leave unchanged, "" = clear team, UUID string = assign team */
    private String teamId;
}
