package com.homebase.homebase_backend.user;

import com.homebase.homebase_backend.team.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByTeamOrderByCreatedAtDesc(Team team);
}