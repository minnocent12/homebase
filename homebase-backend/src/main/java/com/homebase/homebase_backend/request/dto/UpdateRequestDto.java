package com.homebase.homebase_backend.request.dto;

import lombok.Data;

@Data
public class UpdateRequestDto {

    // All fields optional — only update what's provided
    private String title;
    private String description;
    private String status;    // OPEN, IN_PROGRESS, RESOLVED
    private String priority;  // LOW, MEDIUM, HIGH, CRITICAL
    private String category;  // IT, HR, FACILITIES, SUPPLY, OTHER
    private String assignedToId; // UUID of user to assign to
}