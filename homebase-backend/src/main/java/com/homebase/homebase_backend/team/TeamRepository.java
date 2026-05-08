package com.homebase.homebase_backend.team;

import com.homebase.homebase_backend.request.RequestCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    Optional<Team> findByCategory(RequestCategory category);
    List<Team> findAllByOrderByCreatedAtDesc();
}
