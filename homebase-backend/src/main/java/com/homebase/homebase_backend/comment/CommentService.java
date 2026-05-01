package com.homebase.homebase_backend.comment;

import com.homebase.homebase_backend.comment.dto.CommentResponseDto;
import com.homebase.homebase_backend.comment.dto.CreateCommentDto;
import com.homebase.homebase_backend.request.Request;
import com.homebase.homebase_backend.request.RequestRepository;
import com.homebase.homebase_backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final RequestRepository requestRepository;

    // ── Add comment ──────────────────────────────────────────
    @Transactional
    public CommentResponseDto addComment(UUID requestId, CreateCommentDto dto, User currentUser) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        Comment comment = Comment.builder()
                .request(request)
                .user(currentUser)
                .body(dto.getBody())
                .build();

        return CommentResponseDto.from(commentRepository.save(comment));
    }

    // ── Get comments for a request ───────────────────────────
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getComments(UUID requestId) {
        if (!requestRepository.existsById(requestId)) {
            throw new IllegalArgumentException("Request not found: " + requestId);
        }
        return commentRepository.findByRequestIdOrderByCreatedAtAsc(requestId)
                .stream()
                .map(CommentResponseDto::from)
                .collect(Collectors.toList());
    }
}