package com.homebase.homebase_backend.request;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID> {

    // Filter by status
    Page<Request> findByStatus(RequestStatus status, Pageable pageable);

    // Filter by priority
    Page<Request> findByPriority(RequestPriority priority, Pageable pageable);

    // Filter by category
    Page<Request> findByCategory(RequestCategory category, Pageable pageable);

    // Filter by creator
    Page<Request> findByCreatedById(UUID userId, Pageable pageable);

    // Search by title or description (case-insensitive)
    @Query("SELECT r FROM Request r WHERE " +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Request> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Count by status (for dashboard cards)
    long countByStatus(RequestStatus status);
}