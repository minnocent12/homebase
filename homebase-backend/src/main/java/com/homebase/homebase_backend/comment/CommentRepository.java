package com.homebase.homebase_backend.comment;

import com.homebase.homebase_backend.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findByRequestIdOrderByCreatedAtAsc(UUID requestId);

    long countByRequestId(UUID requestId);

    @EntityGraph(attributePaths = {"request"})
    List<Comment> findByUserOrderByCreatedAtDesc(User user);

    long countByUser(User user);
}