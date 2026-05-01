package com.homebase.homebase_backend.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentDto {

    @NotBlank(message = "Comment body cannot be empty")
    @Size(max = 1000, message = "Comment must be 1000 characters or less")
    private String body;
}