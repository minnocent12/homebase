package com.homebase.homebase_backend.comment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    // Fetch all comments for a request, oldest first (natural conversation order)
    List<Comment> findByRequestIdOrderByCreatedAtAsc(UUID requestId);

    // Count comments per request (useful for showing comment count in list)
    long countByRequestId(UUID requestId);
}