package com.homebase.homebase_backend.request.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRequestDto {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be 200 characters or less")
    private String title;

    private String description;

    // Optional — defaults to MEDIUM if not provided
    private String priority;

    // Optional — defaults to OTHER if not provided
    private String category;
}