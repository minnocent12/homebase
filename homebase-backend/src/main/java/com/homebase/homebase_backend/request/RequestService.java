package com.homebase.homebase_backend.request;

import com.homebase.homebase_backend.request.dto.CreateRequestDto;
import com.homebase.homebase_backend.request.dto.RequestResponseDto;
import com.homebase.homebase_backend.request.dto.UpdateRequestDto;
import com.homebase.homebase_backend.user.User;
import com.homebase.homebase_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    // ── Create ───────────────────────────────────────────────
    @Transactional
    public RequestResponseDto create(CreateRequestDto dto, User currentUser) {
        Request request = Request.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(parsePriority(dto.getPriority()))
                .category(parseCategory(dto.getCategory()))
                .status(RequestStatus.OPEN)
                .createdBy(currentUser)
                .build();

        return RequestResponseDto.from(requestRepository.save(request));
    }

    // ── Get All (paginated + optional filters) ───────────────
    @Transactional(readOnly = true)
    public Page<RequestResponseDto> getAll(
            String status, String priority, String category,
            String keyword, Pageable pageable) {

        if (keyword != null && !keyword.isBlank()) {
            return requestRepository.searchByKeyword(keyword, pageable)
                    .map(RequestResponseDto::from);
        }
        if (status != null && !status.isBlank()) {
            return requestRepository.findByStatus(
                    RequestStatus.valueOf(status.toUpperCase()), pageable)
                    .map(RequestResponseDto::from);
        }
        if (priority != null && !priority.isBlank()) {
            return requestRepository.findByPriority(
                    RequestPriority.valueOf(priority.toUpperCase()), pageable)
                    .map(RequestResponseDto::from);
        }
        if (category != null && !category.isBlank()) {
            return requestRepository.findByCategory(
                    RequestCategory.valueOf(category.toUpperCase()), pageable)
                    .map(RequestResponseDto::from);
        }

        return requestRepository.findAll(pageable).map(RequestResponseDto::from);
    }

    // ── Get By ID ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RequestResponseDto getById(UUID id) {
        return RequestResponseDto.from(findOrThrow(id));
    }

    // ── Update ───────────────────────────────────────────────
    @Transactional
    public RequestResponseDto update(UUID id, UpdateRequestDto dto) {
        Request request = findOrThrow(id);

        if (dto.getTitle() != null)       request.setTitle(dto.getTitle());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription());
        if (dto.getStatus() != null)      request.setStatus(RequestStatus.valueOf(dto.getStatus().toUpperCase()));
        if (dto.getPriority() != null)    request.setPriority(RequestPriority.valueOf(dto.getPriority().toUpperCase()));
        if (dto.getCategory() != null)    request.setCategory(RequestCategory.valueOf(dto.getCategory().toUpperCase()));

        if (dto.getAssignedToId() != null) {
            User assignee = userRepository.findById(UUID.fromString(dto.getAssignedToId()))
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getAssignedToId()));
            request.setAssignedTo(assignee);
        }

        return RequestResponseDto.from(requestRepository.save(request));
    }

    // ── Dashboard summary counts ─────────────────────────────
    public DashboardSummary getSummary() {
        return DashboardSummary.builder()
                .open(requestRepository.countByStatus(RequestStatus.OPEN))
                .inProgress(requestRepository.countByStatus(RequestStatus.IN_PROGRESS))
                .resolved(requestRepository.countByStatus(RequestStatus.RESOLVED))
                .total(requestRepository.count())
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────
    private Request findOrThrow(UUID id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
    }

    private RequestPriority parsePriority(String val) {
        if (val == null) return RequestPriority.MEDIUM;
        try { return RequestPriority.valueOf(val.toUpperCase()); }
        catch (IllegalArgumentException e) { return RequestPriority.MEDIUM; }
    }

    private RequestCategory parseCategory(String val) {
        if (val == null) return RequestCategory.OTHER;
        try { return RequestCategory.valueOf(val.toUpperCase()); }
        catch (IllegalArgumentException e) { return RequestCategory.OTHER; }
    }

    // ── Inner DTO for dashboard ──────────────────────────────
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DashboardSummary {
        private long open;
        private long inProgress;
        private long resolved;
        private long total;
    }
}