package com.homebase.homebase_backend.comment;

import com.homebase.homebase_backend.comment.dto.CommentResponseDto;
import com.homebase.homebase_backend.comment.dto.CreateCommentDto;
import com.homebase.homebase_backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests/{requestId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // POST /api/requests/{requestId}/comments
    @PostMapping
    public ResponseEntity<CommentResponseDto> addComment(
            @PathVariable UUID requestId,
            @Valid @RequestBody CreateCommentDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(requestId, dto, currentUser));
    }

    // GET /api/requests/{requestId}/comments
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable UUID requestId
    ) {
        return ResponseEntity.ok(commentService.getComments(requestId));
    }
}