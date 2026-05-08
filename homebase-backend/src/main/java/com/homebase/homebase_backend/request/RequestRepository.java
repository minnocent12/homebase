package com.homebase.homebase_backend.request;

import com.homebase.homebase_backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID>, JpaSpecificationExecutor<Request> {

    long countByStatus(RequestStatus status);

    List<Request> findByCreatedByOrderByCreatedAtDesc(User user);

    long countByCreatedBy(User user);

    long countByAssignedTo(User user);

    List<Request> findByAssignedToOrderByCreatedAtDesc(User user);
}